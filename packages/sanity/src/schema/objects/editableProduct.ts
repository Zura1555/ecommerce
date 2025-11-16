import {defineField} from 'sanity'

export default defineField({
  name: 'editableProduct',
  title: 'Product Information',
  type: 'object',
  options: {
    collapsed: false,
    collapsible: true,
  },
  fieldsets: [
    {
      name: 'status',
      title: 'Status',
    },
    {
      name: 'pricing',
      title: 'Pricing (VND)',
      options: {
        columns: 2,
      },
    },
    {
      name: 'organization',
      title: 'Organization',
      options: {
        columns: 2,
      },
    },
    {
      name: 'inventory',
      title: 'Inventory',
    },
  ],
  fields: [
    // Product status
    defineField({
      fieldset: 'status',
      name: 'status',
      title: 'Product status',
      type: 'string',
      initialValue: 'active',
      options: {
        layout: 'dropdown',
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Draft', value: 'draft'},
          {title: 'Archived', value: 'archived'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    // Title
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'string',
      description: 'Title displayed on product page and cart',
      validation: (rule) => rule.required().min(3).max(200),
    }),
    // Slug
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version of the title',
      options: {
        source: 'store.title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    // Price
    defineField({
      fieldset: 'pricing',
      name: 'price',
      title: 'Price (VND)',
      type: 'number',
      description: 'Regular price in Vietnamese Dong',
      validation: (rule) => rule.required().min(0),
    }),
    // Compare at price (for sales)
    defineField({
      fieldset: 'pricing',
      name: 'compareAtPrice',
      title: 'Compare at Price (VND)',
      type: 'number',
      description: 'Original price for showing discounts (optional)',
      validation: (rule) => rule.min(0),
    }),
    // SKU
    defineField({
      fieldset: 'organization',
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Stock Keeping Unit',
    }),
    // Product Type
    defineField({
      fieldset: 'organization',
      name: 'productType',
      title: 'Product type',
      type: 'string',
      description: 'Category or type of product',
    }),
    // Vendor/Brand
    defineField({
      fieldset: 'organization',
      name: 'vendor',
      title: 'Vendor/Brand',
      type: 'string',
    }),
    // Tags
    defineField({
      fieldset: 'organization',
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    // Inventory quantity
    defineField({
      fieldset: 'inventory',
      name: 'inventoryQuantity',
      title: 'Stock Quantity',
      type: 'number',
      description: 'Number of items in stock',
      initialValue: 0,
      validation: (rule) => rule.required().min(0),
    }),
    // Track inventory
    defineField({
      fieldset: 'inventory',
      name: 'trackInventory',
      title: 'Track inventory',
      type: 'boolean',
      description: 'Enable stock tracking for this product',
      initialValue: true,
    }),
    // Product Images
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
              description: 'Important for SEO and accessibility',
            },
          ],
        },
      ],
      options: {
        layout: 'grid',
      },
    }),
    // Preview Image URL (for backward compatibility)
    defineField({
      name: 'previewImageUrl',
      title: 'Preview Image URL',
      type: 'string',
      description: 'Image displayed in cart and checkout (generated from first image)',
      readOnly: true,
      hidden: true,
    }),
    // Short description
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Brief description for product cards and previews',
      validation: (rule) => rule.max(200),
    }),
    // Weight (for shipping)
    defineField({
      name: 'weight',
      title: 'Weight (grams)',
      type: 'number',
      description: 'Product weight for shipping calculation',
    }),
    // Dimensions
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'object',
      options: {
        columns: 3,
      },
      fields: [
        {
          name: 'length',
          type: 'number',
          title: 'Length (cm)',
        },
        {
          name: 'width',
          type: 'number',
          title: 'Width (cm)',
        },
        {
          name: 'height',
          type: 'number',
          title: 'Height (cm)',
        },
      ],
    }),
    // Created/Updated timestamps
    defineField({
      fieldset: 'status',
      name: 'createdAt',
      title: 'Created at',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      fieldset: 'status',
      name: 'updatedAt',
      title: 'Updated at',
      type: 'datetime',
      readOnly: true,
    }),
  ],
})
