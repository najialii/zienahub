  'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  ToggleLeft,
  ToggleRight,
  Tag as TagIcon,
  Star,
  TrendingUp,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagFormData, Tag } from '../../../../lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const tagTypes = {
  skin_type: 'Skin Type',
  concern: 'Skin Concern',
  ingredient: 'Key Ingredient',
  finish: 'Look & Finish',
  routine: 'Routine Step',
  promotion: 'Offers & Sales',
  brand_deal: 'Brand Exclusive',
  occasion: 'Occasion',
  other: 'Other'
};

export default function AdminTagsPage() {
  const locale = useLocale() as 'en' | 'ar';
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    starts_at: '',
    ends_at: '',
    discount_percentage: 0,
    sort_order: 0,
    is_active: true,
    is_featured: false,
  });

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterType && filterType !== 'all') params.append('type', filterType);
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`${API_BASE_URL}/admin/tags?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (response.ok) {
        const result = await response.json();
        setTags(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchTags();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTags();
  }, [searchTerm, filterType, filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

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
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTags();
        resetForm();
        setShowAddModal(false);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to save tag');
      }
    } catch (error) {
      setErrorMessage('Network error occurred');
    } finally {
      setSaving(false);
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
      discount_percentage: tag.discount_percentage,
      starts_at: tag.starts_at,
      ends_at: tag.ends_at,
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
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchTags();
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleToggleStatus = async (tag: Tag) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_BASE_URL}/admin/tags/${tag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...tag, is_active: !tag.is_active }),
      });
      await fetchTags();
    } catch (error) {
      console.error('Error toggling tag status:', error);
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
      starts_at: '',
      ends_at: '',
      discount_percentage: 0,
      is_active: true,
      is_featured: false,
    });
    setEditingTag(null);
    setErrorMessage('');
  };

  const columns = React.useMemo(() => [
    {
      header: 'Tag',
      cell: (tag: Tag) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border"
            style={{ borderLeft: `4px solid ${tag.color}`, backgroundColor: `${tag.color}10` }}
          >
            {tag.icon || <TagIcon className="w-4 h-4" style={{ color: tag.color }} />}
          </div>
          <div>
            <div className="font-medium">{locale === 'ar' ? tag.name_ar : tag.name_en}</div>
            <div className="text-xs text-muted-foreground font-mono">{tag.slug}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (tag: Tag) => (
        <Badge variant="secondary" className="capitalize">
          {tagTypes[tag.type as keyof typeof tagTypes] || tag.type}
        </Badge>
      ),
    },
    {
      header: 'Products',
      cell: (tag: Tag) => (
        <span className="text-sm">{tag.products_count || 0}</span>
      ),
    },
    {
      header: 'Status',
      cell: (tag: Tag) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleToggleStatus(tag)}>
            {tag.is_active ? (
              <ToggleRight className="w-5 h-5 text-green-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          {tag.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
        </div>
      ),
    },
    {
      header: <div className="text-right">Actions</div>,
      cell: (tag: Tag) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(tag)}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(tag.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ], [locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tag Management</h1>
          <p className="text-muted-foreground mt-1">Manage product tags, categories, and promotions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowAddModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tag
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Tags</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{tags.length}</p>
            </div>
            <div className="bg-blue-200 dark:bg-blue-800 p-3 rounded-lg">
              <TagIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Tags</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{tags.filter(t => t.is_active).length}</p>
            </div>
            <div className="bg-green-200 dark:bg-green-800 p-3 rounded-lg">
              <ToggleRight className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Featured</p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">{tags.filter(t => t.is_featured).length}</p>
            </div>
            <div className="bg-yellow-200 dark:bg-yellow-800 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 rounded-xl p-6 border border-pink-200 dark:border-pink-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Active Promos</p>
              <p className="text-3xl font-bold text-pink-900 dark:text-pink-100 mt-2">
                {tags.filter(t => (t.type === 'promotion' || t.type === 'brand_deal') && t.is_active).length}
              </p>
            </div>
            <div className="bg-pink-200 dark:bg-pink-800 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-pink-600 dark:text-pink-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border shadow-sm p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(tagTypes).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={tags}
          emptyMessage="No tags found"
        />
      </div>

      {/* Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <TagIcon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">
                  {editingTag ? 'Edit Tag' : 'Create New Tag'}
                </h3>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name (English)</label>
                    <Input
                      required
                      value={formData.name_en}
                      onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                      placeholder="e.g., Anti-Aging"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name (Arabic)</label>
                    <Input
                      required
                      value={formData.name_ar}
                      onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                      placeholder="e.g., مضاد للشيخوخة"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(tagTypes).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="h-10 cursor-pointer"
                    />
                  </div>
                </div>

                {(formData.type === 'promotion' || formData.type === 'brand_deal') && (
                  <div className="bg-pink-50 dark:bg-pink-950/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800 space-y-4">
                    <div className="flex items-center gap-2 text-pink-700 dark:text-pink-400 font-semibold text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Promotion Settings
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1">Discount %</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.discount_percentage}
                          onChange={(e) => setFormData({...formData, discount_percentage: parseInt(e.target.value) || 0})}
                          placeholder="20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Starts At</label>
                        <Input
                          type="date"
                          value={formData.starts_at || ''}
                          onChange={(e) => setFormData({...formData, starts_at: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Ends At</label>
                        <Input
                          type="date"
                          value={formData.ends_at || ''}
                          onChange={(e) => setFormData({...formData, ends_at: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      placeholder="auto-generated"
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Icon</label>
                    <Input
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      placeholder="✨"
                      className="text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sort Order</label>
                    <Input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium">Featured</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingTag ? 'Update Tag' : 'Create Tag'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
