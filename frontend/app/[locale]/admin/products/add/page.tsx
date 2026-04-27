'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import SARSymbol from '@/components/SARSymbol';

interface Subcategory {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
}

export default function AddProductPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(true);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    subcategory_id: '',
    price: '',
    comparePrice: '',
    stock: '',
    sku: '',
    status: 'active',
    featured: false,
    brand: '',
    size: '',
    how_to_use: '',
    how_to_use_ar: '',
    ingredients: '',
    ingredients_ar: '',
    benefits: '',
    benefits_ar: '',
  });

  // Load subcategories on component mount
  useEffect(() => {
    // For now, use hardcoded subcategories based on the seeder data
    const hardcodedSubcategories: Subcategory[] = [
      { id: 1, name: 'Roses', category: { id: 1, name: 'Flowers' } },
      { id: 2, name: 'Tulips', category: { id: 1, name: 'Flowers' } },
      { id: 3, name: 'Orchids', category: { id: 1, name: 'Flowers' } },
      { id: 4, name: 'Birthday Gifts', category: { id: 2, name: 'Gift Boxes' } },
      { id: 5, name: 'Wedding Gifts', category: { id: 2, name: 'Gift Boxes' } },
      { id: 6, name: 'Corporate Gifts', category: { id: 2, name: 'Gift Boxes' } },
      { id: 7, name: 'Dark Chocolate', category: { id: 3, name: 'Chocolates' } },
      { id: 8, name: 'Milk Chocolate', category: { id: 3, name: 'Chocolates' } },
      { id: 9, name: 'Assorted Chocolates', category: { id: 3, name: 'Chocolates' } },
      { id: 10, name: "Men's Perfumes", category: { id: 4, name: 'Perfumes' } },
      { id: 11, name: "Women's Perfumes", category: { id: 4, name: 'Perfumes' } },
      { id: 12, name: 'Unisex Perfumes', category: { id: 4, name: 'Perfumes' } },
      { id: 13, name: 'Jewelry', category: { id: 5, name: 'Accessories' } },
      { id: 14, name: 'Home Decor', category: { id: 5, name: 'Accessories' } },
    ];
    
    console.log('Setting hardcoded subcategories:', hardcodedSubcategories);
    setSubcategories(hardcodedSubcategories);
    setLoadingSubcategories(false);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Import adminApi
      const { adminApi } = await import('@/lib/adminApi');
      
      // Generate slug from name with timestamp to ensure uniqueness
      const baseSlug = formData.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
      const slug = `${baseSlug}-${Date.now()}`;
      
      // Generate SKU if not provided
      const sku = formData.sku || `PROD-${Date.now()}`;
      
      // Validate required fields
      if (!formData.name.trim()) {
        alert('Product name is required');
        return;
      }
      if (!formData.description.trim()) {
        alert('Product description is required');
        return;
      }
      if (!formData.price || parseFloat(formData.price) < 0) {
        alert('Valid price is required');
        return;
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        alert('Valid stock quantity is required');
        return;
      }
      if (!formData.subcategory_id) {
        alert('Please select a subcategory');
        return;
      }

      // Validate that subcategory_id is a valid number
      const subcategoryId = parseInt(formData.subcategory_id);
      if (isNaN(subcategoryId) || subcategoryId <= 0) {
        alert('Please select a valid subcategory');
        return;
      }

      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        name_ar: formData.nameAr.trim() || undefined,
        slug: slug,
        description: formData.description.trim(),
        description_ar: formData.descriptionAr.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        size: formData.size.trim() || undefined,
        how_to_use: formData.how_to_use.trim() || undefined,
        how_to_use_ar: formData.how_to_use_ar.trim() || undefined,
        ingredients: formData.ingredients.trim() || undefined,
        ingredients_ar: formData.ingredients_ar.trim() || undefined,
        benefits: formData.benefits.trim() || undefined,
        benefits_ar: formData.benefits_ar.trim() || undefined,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock),
        status: formData.status as 'active' | 'draft' | 'out-of-stock',
        sku: sku,
        subcategory_id: subcategoryId,
        ...(imageFile && { image: imageFile }),
        ...(galleryFiles.length > 0 && { gallery_images: galleryFiles }),
      };
      
      console.log('Form data before submission:', formData);
      console.log('Subcategory ID from form:', formData.subcategory_id);
      console.log('Parsed subcategory ID:', subcategoryId);
      console.log('Product data to be sent:', productData);
      
      await adminApi.createProduct(productData);
      
      alert('Product added successfully!');
      router.push(`/${locale}/admin/products`);
    } catch (error) {
      console.error('Error adding product:', error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check if it's a validation error with detailed errors
        if ('errors' in error && error.errors) {
          const errors = error.errors as Record<string, string[]>;
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          errorMessage = `Validation failed:\n${errorMessages}`;
        }
      }
      
      alert('Failed to add product: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin/products`}
          className="p-2 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-black">Add New Product</h1>
          <p className="text-neutral-600 mt-1">Create a new product listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 border border-neutral-200">
            <h2 className="text-xl font-bold text-black mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  placeholder="Luxury Rose Bouquet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Product Name (Arabic)
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  placeholder="باقة ورد فاخرة"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description (English) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  placeholder="Describe your product..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description (Arabic)
                </label>
                <textarea
                  rows={4}
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  placeholder="وصف المنتج..."
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    placeholder="E.g., Maybelline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Size / Volume</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    placeholder="E.g., 30ml"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Extended Details */}
          <div className="bg-white p-6 border border-neutral-200">
            <h2 className="text-xl font-bold text-black mb-4">Rich Detailed Metadata</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">How To Use (English)</label>
                  <textarea rows={3} value={formData.how_to_use} onChange={(e) => setFormData({ ...formData, how_to_use: e.target.value })} className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black" placeholder="Step 1: ..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">How To Use (Arabic)</label>
                  <textarea rows={3} value={formData.how_to_use_ar} onChange={(e) => setFormData({ ...formData, how_to_use_ar: e.target.value })} className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black" dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Benefits (English)</label>
                  <textarea rows={3} value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black" placeholder="Provides 12hr coverage..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Benefits (Arabic)</label>
                  <textarea rows={3} value={formData.benefits_ar} onChange={(e) => setFormData({ ...formData, benefits_ar: e.target.value })} className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black" dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Ingredients (English)</label>
                  <textarea rows={3} value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })} className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black" placeholder="Aqua, Glycerin..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Ingredients (Arabic)</label>
                  <textarea rows={3} value={formData.ingredients_ar} onChange={(e) => setFormData({ ...formData, ingredients_ar: e.target.value })} className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black" dir="rtl" />
                </div>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white p-6 border border-neutral-200">
            <h2 className="text-xl font-bold text-black mb-4">Product Images</h2>
            
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="border-2 border-dashed border-neutral-300 p-8 text-center">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                  <p className="text-sm text-neutral-600 mb-2">
                    Click to upload product image
                  </p>
                  <p className="text-xs text-neutral-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-64 object-cover border border-neutral-200 rounded"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Gallery Image Upload */}
              <div className="pt-4 border-t border-neutral-200">
                <label className="block text-sm font-medium text-black mb-2">Gallery Images (Optional)</label>
                <div className="border-2 border-dashed border-neutral-300 p-8 text-center">
                  <input
                    type="file"
                    id="gallery_images"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                  <label htmlFor="gallery_images" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                    <p className="text-sm text-neutral-600">Select multiple images</p>
                  </label>
                </div>
              </div>

              {/* Gallery Previews */}
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {galleryPreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img src={preview} alt={`Gallery ${idx}`} className="w-full h-24 object-cover border border-neutral-200 rounded" />
                      <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 p-1 bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 border border-neutral-200">
            <h2 className="text-xl font-bold text-black mb-4">Pricing</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2 flex items-center gap-1">
                  Price <SARSymbol className="w-4 h-4" /> *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  placeholder="450.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2 flex items-center gap-1">
                  Compare at Price <SARSymbol className="w-4 h-4" />
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  placeholder="600.00"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white p-6 border border-neutral-200">
            <h2 className="text-xl font-bold text-black mb-4">Inventory</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  SKU (Optional)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  placeholder="PROD-001 (auto-generated if empty)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  placeholder="25"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white p-6 border border-neutral-200">
            <h2 className="text-xl font-bold text-black mb-4">Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Product Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm font-medium text-black">
                  Featured Product
                </label>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white p-6 border border-neutral-200">
            <h2 className="text-xl font-bold text-black mb-4">Organization</h2>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Subcategory *
              </label>
              {loadingSubcategories ? (
                <div className="w-full px-4 py-2 border border-neutral-300 text-neutral-500">
                  Loading subcategories...
                </div>
              ) : (
                <select
                  required
                  value={formData.subcategory_id}
                  onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.category.name} - {subcategory.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Actions - Sticky */}
          <div className="sticky top-24 bg-white p-6 border border-neutral-200 shadow-lg">
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
              <Link
                href={`/${locale}/admin/products`}
                className="block w-full text-center px-6 py-3 border border-neutral-300 hover:bg-neutral-50 transition-colors font-medium"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
