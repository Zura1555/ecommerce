import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { useCart, formatVND } from '~/lib/cart';
import { createSepayPayment } from '~/lib/sepay.server';
import { Money } from '~/components/global/Money';
import Button from '~/components/elements/Button';

export async function loader({ params, context }: LoaderFunctionArgs) {
  // Add any necessary validation or data fetching here
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const customerName = formData.get('name') as string;
  const customerEmail = formData.get('email') as string;
  const customerPhone = formData.get('phone') as string;
  const customerAddress = formData.get('address') as string;
  const cartData = formData.get('cart') as string;

  // Validate required fields
  if (!customerName || !customerEmail || !customerPhone || !cartData) {
    return json(
      { error: 'Vui lòng điền đầy đủ thông tin' },
      { status: 400 }
    );
  }

  try {
    const cart = JSON.parse(cartData);
    const total = cart.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order in Sanity (optional)
    // You can save order details to Sanity for order management
    // await context.sanity.create({
    //   _type: 'order',
    //   orderId,
    //   customer: { name: customerName, email: customerEmail, phone: customerPhone },
    //   items: cart,
    //   total,
    //   status: 'pending',
    //   createdAt: new Date().toISOString(),
    // });

    // Create Sepay payment
    const payment = await createSepayPayment({
      orderId,
      amount: total,
      customerName,
      customerEmail,
      customerPhone,
      description: `Đơn hàng AKVA - ${orderId}`,
    });

    if (!payment.success) {
      return json(
        { error: payment.error || 'Không thể tạo thanh toán' },
        { status: 500 }
      );
    }

    // Redirect to payment page or order confirmation
    if (payment.payment_url) {
      return redirect(payment.payment_url);
    }

    // Or return payment details for QR code display
    return json({
      success: true,
      orderId,
      payment,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return json(
      { error: 'Đã xảy ra lỗi khi xử lý đơn hàng' },
      { status: 500 }
    );
  }
}

export default function Checkout() {
  const cart = useCart();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Clear cart on successful order
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      cart.clearCart();
    }
  }, [actionData, cart]);

  const total = cart.getTotal();
  const itemCount = cart.getItemCount();

  if (cart.items.length === 0 && (!actionData || !('success' in actionData))) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
        <p className="mb-8">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
        <a href="/" className="text-blue-600 hover:underline">
          Tiếp tục mua sắm
        </a>
      </div>
    );
  }

  // Show payment details if payment was created
  if (actionData && 'success' in actionData && actionData.success) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Đặt hàng thành công!</h1>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-green-800 font-semibold mb-2">
            Mã đơn hàng: {actionData.orderId}
          </p>
          <p className="text-green-700">
            Đơn hàng của bạn đã được tạo thành công. Vui lòng thanh toán để hoàn tất đơn hàng.
          </p>
        </div>

        {actionData.payment?.qr_code && (
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Quét mã QR để thanh toán</h2>
            <img
              src={actionData.payment.qr_code}
              alt="QR Code"
              className="mx-auto max-w-xs"
            />
          </div>
        )}

        {actionData.payment?.bank_account && (
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Thông tin chuyển khoản</h2>
            <dl className="space-y-2">
              <div>
                <dt className="font-semibold">Ngân hàng:</dt>
                <dd>{actionData.payment.bank_account.bank_name}</dd>
              </div>
              <div>
                <dt className="font-semibold">Số tài khoản:</dt>
                <dd className="font-mono">{actionData.payment.bank_account.account_number}</dd>
              </div>
              <div>
                <dt className="font-semibold">Tên tài khoản:</dt>
                <dd>{actionData.payment.bank_account.account_name}</dd>
              </div>
              <div>
                <dt className="font-semibold">Số tiền:</dt>
                <dd className="text-xl font-bold text-red-600">
                  <Money amount={total} />
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Nội dung:</dt>
                <dd className="font-mono">{actionData.orderId}</dd>
              </div>
            </dl>
          </div>
        )}

        <a href="/" className="block text-center text-blue-600 hover:underline">
          Quay lại trang chủ
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          <h2 className="text-xl font-bold mb-4">Thông tin khách hàng</h2>

          {actionData && 'error' in actionData && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{actionData.error}</p>
            </div>
          )}

          <Form method="post" className="space-y-4">
            <input
              type="hidden"
              name="cart"
              value={JSON.stringify(cart.items)}
            />

            <div>
              <label htmlFor="name" className="block font-semibold mb-2">
                Họ và tên *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-semibold mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block font-semibold mb-2">
                Số điện thoại *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="address" className="block font-semibold mb-2">
                Địa chỉ giao hàng
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block font-semibold mb-2">
                Ghi chú đơn hàng
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </Button>
          </Form>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-bold mb-4">Đơn hàng của bạn</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <Money amount={item.price * item.quantity} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <Money amount={total} />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                ({itemCount} sản phẩm)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
