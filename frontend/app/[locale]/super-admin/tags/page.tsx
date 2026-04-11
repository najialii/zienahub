'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye,
  ToggleLeft,
  ToggleRight,
  Hash,
  Tag as TagIcon,
  Star,
  Palette,
  Users,
  TrendingUp,
  CheckSquare,
  Square
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Tag {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  description_en?: string;
  description_ar?: string;
  type: string;
  color: string;
  icon?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

interface TagFormData {
  name_en: string;
  name_ar: string;
  slug?: string;
  description_en?: string;
  description_ar?: string;
  type: string;
  color: string;
  icon?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
}

const tagTypes = {
  occasion: 'Occasion',
  giftee: 'Giftee',
  style: 'Style',
  season: 'Season',
  age_group: 'Age Group',
  other: 'Other'
};

export default function AdminTagsPage() {
  const locale = useLocale() as 'en' | 'ar';
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const [formData, setFormData] = useState<TagFormData>({
    name_en: '',
    name_ar: '',
    slug: '',
    description_en: '',
    description_ar: '',
    type: 'other',
    color: '#3B82F6',
    icon: '',
    image_url: '',
    sort_order: 0,
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchTags();
  }, [searchTerm, filterType, filterStatus]);

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(`${API_BASE_URL}/admin/tags?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Tags API response:', result);
        setTags(result.data || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch tags:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token');
      const url = editingTag 
        ? `${API_BASE_URL}/admin/tags/${editingTag.id}`
        : `${API_BASE_URL}/admin/tags`;
      
      const method = editingTag ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log("dfdfdfdfd",formData)
      if (response.ok) {
        fetchTags();
        resetForm();
        setShowAddModal(false);
      } else {
        console.error('Failed to save tag:', response.status);
      }
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name_en: tag.name_en,
      name_ar: tag.name_ar,
      slug: tag.slug,
      description_en: tag.description_en || '',
      description_ar: tag.description_ar || '',
      type: tag.type,
      color: tag.color,
      icon: tag.icon || '',
      image_url: tag.image_url || '',
      sort_order: tag.sort_order,
      is_active: tag.is_active,
      is_featured: tag.is_featured,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (tagId: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchTags();
      } else {
        console.error('Failed to delete tag:', response.status);
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleToggleStatus = async (tag: Tag) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/tags/${tag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...tag,
          is_active: !tag.is_active
        }),
      });

      if (response.ok) {
        fetchTags();
      }
    } catch (error) {
      console.error('Error toggling tag status:', error);
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedTags.length === 0) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/tags/bulk-update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tag_ids: selectedTags,
          is_active: isActive,
        }),
      });

      if (response.ok) {
        fetchTags();
        setSelectedTags([]);
      }
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ar: '',
      slug: '',
      description_en: '',
      description_ar: '',
      type: 'other',
      color: '#3B82F6',
      icon: '',
      image_url: '',
      sort_order: 0,
      is_active: true,
      is_featured: false,
    });
    setEditingTag(null);
  };

  const toggleTagSelection = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleAllTags = () => {
    if (selectedTags.length === tags.length) {
      setSelectedTags([]);
    } else {
      setSelectedTags(tags.map(tag => tag.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Tag Management</h1>
            <p className="text-neutral-600 mt-1">Manage product tags and categories</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Tag
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Tags</p>
                <p className="text-2xl font-bold text-neutral-900">{tags.length}</p>
              </div>
              <TagIcon className="w-8 h-8 text-neutral-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Active Tags</p>
                <p className="text-2xl font-bold text-green-600">{tags.filter(t => t.is_active).length}</p>
              </div>
              <ToggleRight className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Featured Tags</p>
                <p className="text-2xl font-bold text-yellow-600">{tags.filter(t => t.is_featured).length}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Tag Types</p>
                <p className="text-2xl font-bold text-blue-600">{new Set(tags.map(t => t.type)).size}</p>
              </div>
              <Filter className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">All Types</option>
              {Object.entries(tagTypes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {selectedTags.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate(true)}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Activate ({selectedTags.length})
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate(false)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Deactivate ({selectedTags.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tags Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    <button
                      onClick={toggleAllTags}
                      className="flex items-center"
                    >
                      {selectedTags.length === tags.length && tags.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Tag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleTagSelection(tag.id)}
                        className="flex items-center"
                      >
                        {selectedTags.includes(tag.id) ? (
                          <CheckSquare className="w-4 h-4 text-black" />
                        ) : (
                          <Square className="w-4 h-4 text-neutral-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3 border border-neutral-200"
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900 flex items-center">
                            {tag.icon && <span className="mr-2">{tag.icon}</span>}
                            {locale === 'ar' ? tag.name_ar : tag.name_en}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {locale === 'ar' ? tag.name_en : tag.name_ar}
                          </div>
                          <div className="text-xs text-neutral-400">{tag.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-800">
                        {tagTypes[tag.type as keyof typeof tagTypes]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {tag.products_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(tag)}
                          className="flex items-center"
                        >
                          {tag.is_active ? (
                            <ToggleRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-neutral-400" />
                          )}
                        </button>
                        {tag.is_featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="text-neutral-600 hover:text-black transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="text-neutral-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {tags.length === 0 && (
            <div className="text-center py-12">
              <TagIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No tags found</h3>
              <p className="text-neutral-600 mb-4">Get started by creating your first tag.</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Add New Tag
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">
                {editingTag ? 'Edit Tag' : 'Add New Tag'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Name (English)</label>
                    <input
                      type="text"
                      required
                      value={formData.name_en}
                      onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Name (Arabic)</label>
                    <input
                      type="text"
                      required
                      value={formData.name_ar}
                      onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Leave empty to auto-generate"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      {Object.entries(tagTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full h-10 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Icon (Emoji)</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="🎁"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Description (English)</label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Description (Arabic)</label>
                    <textarea
                      value={formData.description_ar}
                      onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="mr-2 rounded border-neutral-300 text-black focus:ring-black"
                    />
                    <span className="text-sm font-medium text-neutral-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                      className="mr-2 rounded border-neutral-300 text-black focus:ring-black"
                    />
                    <span className="text-sm font-medium text-neutral-700">Featured</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    {editingTag ? 'Update' : 'Create'} Tag
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}