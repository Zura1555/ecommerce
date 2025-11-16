import { Link } from '~/components/Link';
import { useCart } from '~/lib/cart';
import { Money } from '~/components/global/Money';
import Button from '~/components/elements/Button';
import { useState } from 'react';

/**
 * Cart Page
 * Displays cart items and allows checkout
 */
export default function CartPage() {
  const cart = useCart();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    setUpdatingId(id);
    cart.updateQuantity(id, quantity);
    // Simulate async operation
    setTimeout(() => setUpdatingId(null), 300);
  };

  const handleRemove = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      cart.removeItem(id);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-8">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Link to="/">
            <Button>Tiếp tục mua sắm</Button>
          </Link>
        </div>
      </div>
    );
  }

  const total = cart.getTotal();
  const itemCount = cart.getItemCount();

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 border rounded-lg bg-white"
              >
                {/* Product Image */}
                {item.image && (
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {item.slug ? (
                      <Link to={`/products/${item.slug}`}>{item.title}</Link>
                    ) : (
                      item.title
                    )}
                  </h3>

                  {item.sku && (
                    <p className="text-sm text-gray-600 mb-2">
                      SKU: {item.sku}
                    </p>
                  )}

                  <div className="flex items-center gap-4">
                    {/* Price */}
                    <div>
                      <Money amount={item.price} className="font-bold" />
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <div className="text-sm text-gray-500 line-through">
                          <Money amount={item.compareAtPrice} />
                        </div>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={updatingId === item.id}
                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={
                          updatingId === item.id ||
                          (item.maxQuantity !== undefined &&
                            item.quantity >= item.maxQuantity)
                        }
                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm ml-auto"
                    >
                      Xóa
                    </button>
                  </div>

                  {/* Stock Warning */}
                  {item.maxQuantity !== undefined &&
                    item.quantity >= item.maxQuantity && (
                      <p className="text-sm text-orange-600 mt-2">
                        Chỉ còn {item.maxQuantity} sản phẩm
                      </p>
                    )}
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <Money
                    amount={item.price * item.quantity}
                    className="font-bold text-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <Money amount={total} />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Số lượng:</span>
                <span>{itemCount} sản phẩm</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>Tính khi thanh toán</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <Money amount={total} className="text-red-600" />
              </div>
            </div>

            <Link to="/checkout">
              <Button className="w-full mb-3">Thanh toán</Button>
            </Link>

            <Link to="/">
              <button className="w-full text-center text-blue-600 hover:underline text-sm">
                Tiếp tục mua sắm
              </button>
            </Link>

            {/* Payment Methods Info */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-2">
                Phương thức thanh toán:
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Chuyển khoản
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  VietQR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
