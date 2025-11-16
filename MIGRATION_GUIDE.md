# Migration Guide: Shopify → Sanity + Sepay

This guide explains the changes made to migrate from Shopify to a custom ecommerce solution using Sanity CMS and Sepay payment gateway for the Vietnam market.

## 🎯 What Changed

### Architecture Before:
```
Shopify (Products + Cart + Checkout) → Hydrogen → Sanity (Content)
```

### Architecture After:
```
Sanity (Products + Content) → Remix + Zustand → Sepay (Payments)
```

---

## ✅ Completed Changes

### 1. **Editable Product Schema in Sanity**

**Files Created/Modified:**
- `/packages/sanity/src/schema/objects/editableProduct.ts` (NEW)
- `/packages/sanity/src/schema/documents/product.tsx` (MODIFIED)
- `/packages/sanity/src/schema/index.ts` (MODIFIED)

**What Changed:**
- Removed `readOnly: true` from product schemas
- Added editable fields:
  - `price` (VND)
  - `compareAtPrice` (for sales)
  - `inventoryQuantity`
  - `sku`
  - `images` (Sanity images)
  - `shortDescription`
  - `weight`, `dimensions`

**Action Required:**
1. Go to Sanity Studio (http://localhost:3333)
2. Update existing products with prices in VND
3. Add product images
4. Set inventory quantities

---

### 2. **Cart System (Zustand)**

**Files Created:**
- `/apps/storefront/app/lib/cart.ts` (NEW)

**Features:**
- LocalStorage persistence
- Add/remove items
- Update quantities
- Inventory tracking
- VND currency formatting

**No Action Required** - Works automatically!

---

### 3. **Money Component**

**Files Created:**
- `/apps/storefront/app/components/global/Money.tsx` (NEW)

**Replaces:** `@shopify/hydrogen-react` Money component

**Usage:**
```tsx
import { Money } from '~/components/global/Money';

<Money amount={100000} /> // → 100.000 ₫
```

---

### 4. **New Add to Cart Button**

**Files Created:**
- `/apps/storefront/app/components/product/buttons/AddToCartButtonNew.tsx` (NEW)

**Replaces:** Shopify's `CartForm` component

**Usage:**
```tsx
import AddToCartButtonNew from '~/components/product/buttons/AddToCartButtonNew';

<AddToCartButtonNew
  product={{
    id: product.store.id,
    title: product.store.title,
    price: product.store.price,
    image: product.store.images[0],
    inventoryQuantity: product.store.inventoryQuantity,
  }}
/>
```

**Action Required:**
- Replace old `AddToCartButton` imports with `AddToCartButtonNew` in product pages

---

### 5. **Checkout Flow**

**Files Created:**
- `/apps/storefront/app/routes/_store.($lang).checkout.tsx` (NEW)
- `/apps/storefront/app/lib/sepay.server.ts` (NEW)

**Features:**
- Customer information form
- Order summary
- Sepay payment integration
- QR code payment support

**Action Required:**
1. Sign up at https://my.sepay.vn
2. Get API credentials
3. Add to `.env`:
   ```bash
   SEPAY_API_KEY=your_api_key
   SEPAY_SECRET_KEY=your_secret_key
   SEPAY_SANDBOX=true
   ```

---

### 6. **Sepay Webhook**

**Files Created:**
- `/apps/storefront/app/routes/api.sepay.webhook.tsx` (NEW)

**Purpose:**
- Receives payment notifications from Sepay
- Updates order status automatically
- Verifies webhook signatures

**Action Required:**
1. Configure webhook URL in Sepay dashboard:
   ```
   https://yourdomain.com/api/sepay/webhook
   ```

---

### 7. **Cart Page**

**Files Created:**
- `/apps/storefront/app/routes/_store.($lang).cart-new.tsx` (NEW)

**Features:**
- View cart items
- Update quantities
- Remove items
- Checkout button

**Action Required:**
- Update navigation links to point to `/cart-new`

---

## 🚀 Next Steps

### Step 1: Set Up Sepay Account

1. Visit https://my.sepay.vn
2. Register for an account
3. Complete KYC verification
4. Get your API credentials from dashboard
5. Add credentials to `.env` file

### Step 2: Update Product Data

1. Start Sanity Studio:
   ```bash
   cd /home/user/ecommerce
   npm run dev
   ```

2. Open http://localhost:3333

3. For each product:
   - Add price in VND
   - Upload product images
   - Set inventory quantity
   - Add SKU if needed

### Step 3: Update Components

Replace Shopify components with new ones:

**Product Pages:**
```tsx
// OLD
import AddToCartButton from '~/components/product/buttons/AddToCartButton';

// NEW
import AddToCartButtonNew from '~/components/product/buttons/AddToCartButtonNew';
```

**Money Formatting:**
```tsx
// OLD
import { Money } from '@shopify/hydrogen-react';

// NEW
import { Money } from '~/components/global/Money';
```

### Step 4: Test the Flow

1. **Add products to cart:**
   - Navigate to product page
   - Click "Add to Cart"
   - Check cart page

2. **Checkout:**
   - Go to `/cart-new`
   - Click "Thanh toán"
   - Fill in customer information
   - Submit order

3. **Payment (Sandbox):**
   - View generated QR code or bank transfer details
   - Test payment notification (webhook)

### Step 5: Create Order Schema in Sanity

Add order management to Sanity Studio:

```bash
# Create order schema
# /packages/sanity/src/schema/documents/order.ts
```

**Suggested fields:**
- `orderId` (string)
- `customer` (object: name, email, phone, address)
- `items` (array of products)
- `total` (number)
- `paymentStatus` (string: pending, paid, failed, expired)
- `status` (string: pending, processing, shipped, delivered, cancelled)
- `createdAt` (datetime)

---

## 📝 Environment Variables

Update your `.env` file:

```bash
# Copy template
cp .env.template .env

# Add Sepay credentials
SEPAY_API_KEY=your_api_key_here
SEPAY_SECRET_KEY=your_secret_key_here
SEPAY_SANDBOX=true

# Keep existing Sanity config
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_token
```

---

## 🔄 Migration Checklist

- [x] Created editable product schema
- [x] Installed Zustand for cart management
- [x] Created Money component for VND
- [x] Created new AddToCartButton
- [x] Built checkout page
- [x] Integrated Sepay payment
- [x] Created webhook handler
- [x] Created cart page
- [ ] **Sign up for Sepay account**
- [ ] **Add Sepay credentials to .env**
- [ ] **Update product data in Sanity**
- [ ] **Replace old Shopify components**
- [ ] **Create order schema in Sanity**
- [ ] **Test complete purchase flow**
- [ ] **Configure Sepay webhook URL**
- [ ] **Remove Shopify dependencies (optional)**

---

## 🗑️ What Can Be Removed (Later)

Once everything is working, you can remove:

### Shopify Dependencies:
```bash
npm uninstall @shopify/hydrogen @shopify/remix-oxygen @shopify/cli-hydrogen
```

### Unused Files:
- `/apps/storefront/app/components/product/buttons/AddToCartButton.tsx` (old)
- `/apps/storefront/app/components/cart/Cart.tsx` (old Shopify cart)
- Shopify query files in `/apps/storefront/app/queries/shopify/`

⚠️ **Warning:** Don't remove these until you've migrated all components!

---

## 💰 Cost Savings

**Before (Shopify):**
- Shopify Basic: $29/month
- Transaction fees: 2.9% + $0.30

**After (Sanity + Sepay):**
- Sanity Free tier: $0/month (or $99 for growth)
- Sepay transaction fees: ~1-2% (check Sepay pricing)
- Hosting (Vercel): $0-20/month
- **Total: ~$0-100/month**

**Estimated savings: ~$200-300/year** 🎉

---

## 🆘 Troubleshooting

### Cart not persisting
- Check browser localStorage is enabled
- Clear cache and reload

### Checkout fails
- Verify Sepay credentials are correct
- Check SEPAY_SANDBOX=true for testing
- View console logs for errors

### Webhook not working
- Ensure webhook URL is publicly accessible
- Check Sepay dashboard for webhook logs
- Verify signature verification logic

### Products not showing
- Ensure products have `status: 'active'`
- Check that price and inventory are set
- Verify Sanity queries are correct

---

## 📚 Resources

- **Sepay Docs:** https://docs.sepay.vn
- **Sanity Docs:** https://www.sanity.io/docs
- **Zustand Docs:** https://docs.pmnd.rs/zustand
- **Remix Docs:** https://remix.run/docs

---

## 🎉 What's Next?

After completing the migration:

1. **Add email notifications** (order confirmation, shipping updates)
2. **Integrate shipping** (Giao Hàng Nhanh, Giao Hàng Tiết Kiệm)
3. **Add analytics** (Google Analytics, Facebook Pixel)
4. **Improve SEO** (structured data, meta tags)
5. **Add reviews/ratings** system
6. **Build admin dashboard** in Sanity Studio

Good luck with your migration! 🚀
