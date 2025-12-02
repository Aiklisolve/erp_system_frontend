import { FormEvent, useState, useEffect } from 'react';
import type { Product, ProductStatus, ProductType, StockStatus, TaxStatus, ShippingClass } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Product>;
  onSubmit: (values: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate product code/SKU
function generateProductCode(): string {
  const prefix = 'PROD';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function ProductForm({ initial, onSubmit, onCancel }: Props) {
  const [productCode, setProductCode] = useState(initial?.product_code ?? initial?.sku ?? generateProductCode());
  const [sku, setSku] = useState(initial?.sku ?? initial?.product_code ?? generateProductCode());
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [shortDescription, setShortDescription] = useState(initial?.short_description ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  
  const [category, setCategory] = useState(initial?.category ?? '');
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [manufacturer, setManufacturer] = useState(initial?.manufacturer ?? '');
  
  const [productType, setProductType] = useState<ProductType>(initial?.product_type ?? 'SIMPLE');
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? 'ACTIVE');
  const [stockStatus, setStockStatus] = useState<StockStatus>(initial?.stock_status ?? 'IN_STOCK');
  
  const [price, setPrice] = useState<number | ''>(initial?.price ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>(initial?.compare_at_price ?? '');
  const [costPrice, setCostPrice] = useState<number | ''>(initial?.cost_price ?? '');
  const [salePrice, setSalePrice] = useState<number | ''>(initial?.sale_price ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  
  const [stock, setStock] = useState<number | ''>(initial?.stock ?? initial?.stock_quantity ?? '');
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(initial?.low_stock_threshold ?? '');
  const [manageStock, setManageStock] = useState(initial?.manage_stock ?? true);
  const [stockLocation, setStockLocation] = useState(initial?.stock_location ?? '');
  
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '');
  const [galleryImages, setGalleryImages] = useState(initial?.gallery_images?.join(', ') ?? '');
  const [videoUrl, setVideoUrl] = useState(initial?.video_url ?? '');
  
  const [weight, setWeight] = useState<number | ''>(initial?.weight ?? '');
  const [length, setLength] = useState<number | ''>(initial?.length ?? '');
  const [width, setWidth] = useState<number | ''>(initial?.width ?? '');
  const [height, setHeight] = useState<number | ''>(initial?.height ?? '');
  const [shippingClass, setShippingClass] = useState<ShippingClass | ''>(initial?.shipping_class ?? '');
  const [shippingCost, setShippingCost] = useState<number | ''>(initial?.shipping_cost ?? '');
  const [freeShipping, setFreeShipping] = useState(initial?.free_shipping ?? false);
  
  const [taxStatus, setTaxStatus] = useState<TaxStatus>(initial?.tax_status ?? 'TAXABLE');
  const [taxClass, setTaxClass] = useState(initial?.tax_class ?? '');
  
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? '');
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? '');
  const [metaKeywords, setMetaKeywords] = useState(initial?.meta_keywords ?? '');
  
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [onSale, setOnSale] = useState(initial?.on_sale ?? false);
  const [saleStartDate, setSaleStartDate] = useState(initial?.sale_start_date ?? '');
  const [saleEndDate, setSaleEndDate] = useState(initial?.sale_end_date ?? '');
  
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(initial?.internal_notes ?? '');

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !initial?.slug) {
      setSlug(generateSlug(name));
    }
  }, [name, initial?.slug]);

  // Auto-generate meta title from name
  useEffect(() => {
    if (name && !metaTitle) {
      setMetaTitle(name);
    }
  }, [name, metaTitle]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || price === '' || stock === '') return;
    
    onSubmit({
      product_code: productCode,
      sku: sku || productCode,
      name,
      slug: slug || generateSlug(name),
      short_description: shortDescription || undefined,
      description: description || undefined,
      category: category || undefined,
      subcategory: subcategory || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
      brand: brand || undefined,
      manufacturer: manufacturer || undefined,
      product_type: productType,
      status,
      stock_status: stockStatus,
      price: Number(price),
      compare_at_price: Number(compareAtPrice) || undefined,
      cost_price: Number(costPrice) || undefined,
      sale_price: Number(salePrice) || undefined,
      currency: currency || undefined,
      stock: Number(stock),
      stock_quantity: Number(stock),
      low_stock_threshold: Number(lowStockThreshold) || undefined,
      manage_stock: manageStock,
      stock_location: stockLocation || undefined,
      image_url: imageUrl || undefined,
      gallery_images: galleryImages ? galleryImages.split(',').map(img => img.trim()).filter(img => img) : undefined,
      video_url: videoUrl || undefined,
      weight: Number(weight) || undefined,
      length: Number(length) || undefined,
      width: Number(width) || undefined,
      height: Number(height) || undefined,
      shipping_class: shippingClass || undefined,
      shipping_cost: Number(shippingCost) || undefined,
      free_shipping: freeShipping,
      tax_status: taxStatus,
      tax_class: taxClass || undefined,
      meta_title: metaTitle || undefined,
      meta_description: metaDescription || undefined,
      meta_keywords: metaKeywords || undefined,
      featured,
      on_sale: onSale,
      sale_start_date: saleStartDate || undefined,
      sale_end_date: saleEndDate || undefined,
      notes: notes || undefined,
      internal_notes: internalNotes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Product Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Product Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Product Code/SKU"
            value={productCode}
            onChange={(e) => {
              setProductCode(e.target.value);
              if (!sku) setSku(e.target.value);
            }}
            placeholder="Auto-generated"
          />
          <Input
            label="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Stock Keeping Unit"
          />
          <Input
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            required
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-friendly-name"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea
            label="Short Description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief product description"
            rows={2}
          />
          <Textarea
            label="Full Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed product description"
            rows={4}
          />
        </div>
      </div>

      {/* Categorization */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Categorization</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Main category"
          />
          <Input
            label="Subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="Subcategory"
          />
          <Input
            label="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Brand name"
          />
          <Input
            label="Manufacturer"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            placeholder="Manufacturer name"
          />
        </div>
        <Input
          label="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3 (comma-separated)"
        />
      </div>

      {/* Product Type & Status */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Product Type & Status</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Product Type"
            value={productType}
            onChange={(e) => setProductType(e.target.value as ProductType)}
            required
          >
            <option value="SIMPLE">Simple</option>
            <option value="VARIABLE">Variable</option>
            <option value="BUNDLE">Bundle</option>
            <option value="DIGITAL">Digital</option>
            <option value="SERVICE">Service</option>
          </Select>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="DISCONTINUED">Discontinued</option>
            <option value="DRAFT">Draft</option>
          </Select>
          <Select
            label="Stock Status"
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value as StockStatus)}
            required
          >
            <option value="IN_STOCK">In Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="BACKORDER">Backorder</option>
            <option value="ON_DEMAND">On Demand</option>
          </Select>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Pricing</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
            required
          />
          <Input
            label="Compare At Price"
            type="number"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Original price"
            min={0}
            step="0.01"
          />
          <Input
            label="Cost Price"
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Cost of goods"
            min={0}
            step="0.01"
          />
          <Input
            label="Sale Price"
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Discounted price"
            min={0}
            step="0.01"
          />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </Select>
        </div>
      </div>

      {/* Inventory */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Inventory</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Stock Quantity"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
            required
          />
          <Input
            label="Low Stock Threshold"
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="5"
            min={0}
          />
          <Input
            label="Stock Location"
            value={stockLocation}
            onChange={(e) => setStockLocation(e.target.value)}
            placeholder="Warehouse location"
          />
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="manageStock"
              checked={manageStock}
              onChange={(e) => setManageStock(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="manageStock" className="text-[11px] font-semibold text-slate-800">
              Manage Stock
            </label>
          </div>
        </div>
      </div>

      {/* Images & Media */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Images & Media</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Primary Image URL"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <Input
            label="Video URL"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
          />
        </div>
        <Input
          label="Gallery Images"
          value={galleryImages}
          onChange={(e) => setGalleryImages(e.target.value)}
          placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg (comma-separated)"
        />
      </div>

      {/* Shipping */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Shipping</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Weight (kg)"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Length (cm)"
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Width (cm)"
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Height (cm)"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Shipping Class"
            value={shippingClass}
            onChange={(e) => setShippingClass(e.target.value as ShippingClass)}
          >
            <option value="">Select class</option>
            <option value="STANDARD">Standard</option>
            <option value="EXPRESS">Express</option>
            <option value="OVERNIGHT">Overnight</option>
            <option value="FREIGHT">Freight</option>
            <option value="DIGITAL">Digital</option>
            <option value="NONE">None</option>
          </Select>
          <Input
            label="Shipping Cost"
            type="number"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="freeShipping"
              checked={freeShipping}
              onChange={(e) => setFreeShipping(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="freeShipping" className="text-[11px] font-semibold text-slate-800">
              Free Shipping
            </label>
          </div>
        </div>
      </div>

      {/* Tax */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Tax</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Tax Status"
            value={taxStatus}
            onChange={(e) => setTaxStatus(e.target.value as TaxStatus)}
            required
          >
            <option value="TAXABLE">Taxable</option>
            <option value="SHIPPING_ONLY">Shipping Only</option>
            <option value="NONE">None</option>
          </Select>
          <Input
            label="Tax Class"
            value={taxClass}
            onChange={(e) => setTaxClass(e.target.value)}
            placeholder="Tax class name"
          />
        </div>
      </div>

      {/* SEO */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">SEO</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Meta Title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="SEO title"
          />
          <Input
            label="Meta Keywords"
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
            placeholder="keyword1, keyword2"
          />
        </div>
        <Textarea
          label="Meta Description"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="SEO description"
          rows={2}
        />
      </div>

      {/* Sales & Marketing */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Sales & Marketing</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="featured" className="text-[11px] font-semibold text-slate-800">
              Featured Product
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="onSale"
              checked={onSale}
              onChange={(e) => setOnSale(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="onSale" className="text-[11px] font-semibold text-slate-800">
              On Sale
            </label>
          </div>
          <Input
            label="Sale Start Date"
            type="date"
            value={saleStartDate}
            onChange={(e) => setSaleStartDate(e.target.value)}
          />
          <Input
            label="Sale End Date"
            type="date"
            value={saleEndDate}
            onChange={(e) => setSaleEndDate(e.target.value)}
            min={saleStartDate}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Product notes"
          rows={3}
        />
        <Textarea
          label="Internal Notes"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Internal notes (not visible to customers)"
          rows={3}
        />
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
