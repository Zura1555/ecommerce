import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { defaultButtonStyles } from '~/components/elements/Button';
import { Label } from '~/components/global/Label';
import SpinnerIcon from '~/components/icons/Spinner';
import { useCart, type CartItem } from '~/lib/cart';

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    slug?: string;
    image?: string;
    sku?: string;
    inventoryQuantity?: number;
  };
  variantId?: string;
  quantity?: number;
  children?: React.ReactNode;
  buttonClassName?: string;
  disabled?: boolean;
  onAddComplete?: () => void;
}

/**
 * Add to Cart Button for Sanity + Sepay ecommerce
 * Replaces Shopify's CartForm AddToCart
 */
export default function AddToCartButtonNew({
  product,
  variantId,
  quantity = 1,
  children = <Label _key="cart.addToCart" />,
  buttonClassName,
  disabled = false,
  onAddComplete,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    setIsAdding(true);

    try {
      // Prepare cart item
      const cartItem: Omit<CartItem, 'quantity'> & { quantity?: number } = {
        id: variantId || product.id,
        productId: product.id,
        title: product.title,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.image,
        slug: product.slug,
        sku: product.sku,
        quantity: quantity,
        maxQuantity: product.inventoryQuantity,
      };

      // Add to cart
      addItem(cartItem);

      // Optional callback
      onAddComplete?.();

      // Simulate async operation for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = product.inventoryQuantity !== undefined && product.inventoryQuantity <= 0;
  const isDisabled = disabled || isAdding || isOutOfStock;

  return (
    <button
      className={twMerge(defaultButtonStyles(), buttonClassName)}
      onClick={handleAddToCart}
      disabled={isDisabled}
      type="button"
    >
      {isAdding ? (
        <SpinnerIcon width={24} height={24} />
      ) : isOutOfStock ? (
        'Hết hàng'
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Simple link-style add to cart button
 */
export function AddToCartLink({
  product,
  variantId,
  quantity = 1,
  children = <Label _key="cart.addToCart" />,
  buttonClassName,
  disabled = false,
  loadingContent,
}: AddToCartButtonProps & { loadingContent?: React.ReactNode }) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const handleClick = async () => {
    setIsAdding(true);

    try {
      addItem({
        id: variantId || product.id,
        productId: product.id,
        title: product.title,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.image,
        slug: product.slug,
        sku: product.sku,
        quantity: quantity,
        maxQuantity: product.inventoryQuantity,
      });

      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      className={buttonClassName}
      onClick={handleClick}
      disabled={disabled || isAdding}
      type="button"
    >
      {isAdding && loadingContent ? loadingContent : children}
    </button>
  );
}
