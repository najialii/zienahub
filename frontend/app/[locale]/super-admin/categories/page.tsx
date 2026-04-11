'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Edit, Trash2, Package, Loader2, X, Save, AlertCircle, ChevronDown, ChevronRight, Folder, FolderOpen, Star } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  description_ar?: string;
  image_url?: string;
  products_count?: number;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  description_ar?: string;
  category_id: number;
  is_featured?: boolean;
  featured_sort_order?: number;
  category?: {
    id: number;
    name: string;
    name_ar: string;
  };
  products_count?: number;
}

export default function CategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories');
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    slug: '',
    description_en: '',
    description_ar: '',
    image_url: '',
  });

  const [subcategoryFormData, setSubcategoryFormData] = useState({
    category_id: 0,
    name_en: '',
    name_ar: '',
    slug: '',
    description_en: '',
    description_ar: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'category' | 'subcategory', id: number} | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }

      const categoriesResponse = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });


      console.log("asadasdsfadsfd",categoriesResponse)
      const subcategoriesResponse = await fetch(`${API_BASE_URL}/admin/subcategories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
      }

      if (subcategoriesResponse.ok) {
        const subcategoriesData = await subcategoriesResponse.json();
        if (subcategoriesData.success) {
          setSubcategories(subcategoriesData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategorySubcategories = (categoryId: number) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name_en: '',
      name_ar: '',
      slug: '',
      description_en: '',
      description_ar: '',
      image_url: '',
    });
    setShowModal(true);
  };

  const handleAddSubcategory = (categoryId?: number) => {
    setEditingSubcategory(null);
    setSubcategoryFormData({
      category_id: categoryId || 0,
      name_en: '',
      name_ar: '',
      slug: '',
      description_en: '',
      description_ar: '',
    });
    setShowSubcategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name_en: category.name,
      name_ar: category.name_ar || '',
      slug: category.slug,
      description_en: category.description || '',
      description_ar: category.description_ar || '',
      image_url: category.image_url || '',
    });
    setShowModal(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryFormData({
      category_id: subcategory.category_id,
      name_en: subcategory.name || '',
      name_ar: subcategory.name_ar || '',
      slug: subcategory.slug,
      description_en: subcategory.description || '',
      description_ar: subcategory.description_ar || '',
    });
    setShowSubcategoryModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      const token = localStorage.getItem('auth_token');

      const url = editingCategory
        ? `${API_BASE_URL}/admin/categories/${editingCategory.id}`
        : `${API_BASE_URL}/admin/categories`;

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save category');
      }

      setSuccessMessage(editingCategory ? 'Category updated successfully' : 'Category created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubcategory = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      const token = localStorage.getItem('auth_token');

      const url = editingSubcategory
        ? `${API_BASE_URL}/admin/subcategories/${editingSubcategory.id}`
        : `${API_BASE_URL}/admin/subcategories`;

      const response = await fetch(url, {
        method: editingSubcategory ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subcategoryFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save subcategory');
      }

      setSuccessMessage(editingSubcategory ? 'Subcategory updated successfully' : 'Subcategory created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowSubcategoryModal(false);
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save subcategory');
    } finally {
      setSaving(false);
    }
  };

  const toggleSubcategoryFeatured = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/subcategories/${id}/toggle-featured`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchData();
        setSuccessMessage('Subcategory featured status updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error toggling subcategory featured status:', error);
      setErrorMessage('Failed to update featured status');
    }
  };

  const handleDelete = async (type: 'category' | 'subcategory', id: number) => {
    try {
      setDeleting(true);
      setErrorMessage('');
      const token = localStorage.getItem('auth_token');

      const url = type === 'category' 
        ? `${API_BASE_URL}/admin/categories/${id}`
        : `${API_BASE_URL}/admin/subcategories/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to delete ${type}`);
      }

      setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || `Failed to delete ${type}`);
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-black animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Categories & Subcategories</h1>
          <p className="text-neutral-600 mt-1">Organize your products into categories and subcategories</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAddCategory}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
          <button 
            onClick={() => handleAddSubcategory()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Subcategory
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-green-900">Success</h3>
            <p className="text-sm text-green-700 mt-1">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-red-600 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Tree View
          </button>
          <button
            onClick={() => setActiveTab('subcategories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subcategories'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            All Subcategories ({subcategories.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'categories' ? (
        /* Tree View */
        <div className="bg-white border border-neutral-200">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600">No categories found</p>
              <button 
                onClick={handleAddCategory}
                className="mt-4 text-black underline hover:no-underline"
              >
                Create your first category
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {categories.map((category) => {
                const categorySubcategories = getCategorySubcategories(category.id);
                const isExpanded = expandedCategories.has(category.id);
                
                return (
                  <div key={category.id}>
                    {/* Category Row */}
                    <div className="p-4 hover:bg-neutral-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-1 hover:bg-neutral-200 rounded"
                          >
                            {categorySubcategories.length > 0 ? (
                              isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </button>
                          
                          <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                            {category.image_url ? (
                              <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                            ) : (
                              <FolderOpen className="w-5 h-5" />
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-black">{category.name}</h3>
                            <p className="text-sm text-neutral-500">
                              /{category.slug} • {categorySubcategories.length} subcategories • {category.products_count || 0} products
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddSubcategory(category.id)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            Add Subcategory
                          </button>
                          <button 
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-neutral-600 hover:bg-neutral-200 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm({type: 'category', id: category.id})}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Subcategories */}
                    {isExpanded && categorySubcategories.length > 0 && (
                      <div className="bg-neutral-50 border-t border-neutral-200">
                        {categorySubcategories.map((subcategory) => (
                          <div key={subcategory.id} className="pl-12 pr-4 py-3 border-b border-neutral-200 last:border-b-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Folder className="w-4 h-4 text-neutral-400" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-neutral-900">{subcategory.name}</h4>
                                    {subcategory.is_featured && (
                                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    )}
                                  </div>
                                  <p className="text-sm text-neutral-500">
                                    /{subcategory.slug} • {subcategory.products_count || 0} products
                                    {subcategory.is_featured && (
                                      <span className="ml-2 text-yellow-600">• Featured</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSubcategoryFeatured(subcategory.id)}
                                  className={`p-1 rounded transition-colors ${
                                    subcategory.is_featured
                                      ? 'text-yellow-600 hover:bg-yellow-100'
                                      : 'text-neutral-400 hover:bg-neutral-200'
                                  }`}
                                  title={subcategory.is_featured 
                                    ? (locale === 'en' ? 'Remove from featured' : 'إزالة من المميز')
                                    : (locale === 'en' ? 'Add to featured' : 'إضافة للمميز')
                                  }
                                >
                                  <Star className={`w-3 h-3 ${subcategory.is_featured ? 'fill-current' : ''}`} />
                                </button>
                                <button 
                                  onClick={() => handleEditSubcategory(subcategory)}
                                  className="p-1 text-neutral-600 hover:bg-neutral-200 rounded"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => setDeleteConfirm({type: 'subcategory', id: subcategory.id})}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* All Subcategories View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Folder className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600">No subcategories found</p>
              <button 
                onClick={() => handleAddSubcategory()}
                className="mt-4 text-black underline hover:no-underline"
              >
                Create your first subcategory
              </button>
            </div>
          ) : (
            subcategories.map((subcategory) => (
              <div key={subcategory.id} className="bg-white p-6 border border-neutral-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center relative">
                    <Folder className="w-6 h-6" />
                    {subcategory.is_featured && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="w-2 h-2 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {subcategory.category?.name || 'No Category'}
                    </span>
                    {subcategory.is_featured && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-black">{subcategory.name}</h3>
                  <button
                    onClick={() => toggleSubcategoryFeatured(subcategory.id)}
                    className={`p-1 rounded transition-colors ${
                      subcategory.is_featured
                        ? 'text-yellow-600 hover:bg-yellow-100'
                        : 'text-neutral-400 hover:bg-neutral-200'
                    }`}
                    title={subcategory.is_featured 
                      ? (locale === 'en' ? 'Remove from featured' : 'إزالة من المميز')
                      : (locale === 'en' ? 'Add to featured' : 'إضافة للمميز')
                    }
                  >
                    <Star className={`w-4 h-4 ${subcategory.is_featured ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <p className="text-sm text-neutral-500 mb-2">/{subcategory.slug}</p>
                <p className="text-sm text-neutral-600 mb-4">{subcategory.products_count || 0} products</p>
                {subcategory.description && (
                  <p className="text-sm text-neutral-600 mb-6 line-clamp-2">{subcategory.description}</p>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditSubcategory(subcategory)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm({type: 'subcategory', id: subcategory.id})}
                    className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 transition-colors text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    placeholder="e.g., Flowers"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Name (Arabic) *
                  </label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    placeholder="e.g., زهور"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Slug (URL-friendly name)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  placeholder="e.g., flowers (auto-generated if empty)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description (English)
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black resize-none"
                  placeholder="Category description in English"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description (Arabic)
                </label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black resize-none"
                  placeholder="Category description in Arabic"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="px-6 py-2 border border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={saving || !formData.name_en || !formData.name_ar}
                className="flex items-center gap-2 px-6 py-2 bg-black text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black">
                {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </h3>
              <button onClick={() => setShowSubcategoryModal(false)} className="p-2 hover:bg-neutral-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Category *
                </label>
                <select
                  value={subcategoryFormData.category_id}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, category_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                >
                  <option value={0}>Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={subcategoryFormData.name_en}
                    onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name_en: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    placeholder="e.g., Red Roses"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Name (Arabic) *
                  </label>
                  <input
                    type="text"
                    value={subcategoryFormData.name_ar}
                    onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    placeholder="e.g., ورود حمراء"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Slug (URL-friendly name)
                </label>
                <input
                  type="text"
                  value={subcategoryFormData.slug}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  placeholder="e.g., red-roses (auto-generated if empty)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description (English)
                </label>
                <textarea
                  value={subcategoryFormData.description_en}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description_en: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black resize-none"
                  placeholder="Subcategory description in English"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description (Arabic)
                </label>
                <textarea
                  value={subcategoryFormData.description_ar}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description_ar: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black resize-none"
                  placeholder="Subcategory description in Arabic"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowSubcategoryModal(false)}
                disabled={saving}
                className="px-6 py-2 border border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubcategory}
                disabled={saving || !subcategoryFormData.name_en || !subcategoryFormData.name_ar || !subcategoryFormData.category_id}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : (editingSubcategory ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-black mb-4">
              Delete {deleteConfirm.type === 'category' ? 'Category' : 'Subcategory'}
            </h3>
            <p className="text-neutral-600 mb-6">
              Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
