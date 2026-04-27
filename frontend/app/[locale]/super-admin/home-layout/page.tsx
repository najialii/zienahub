'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical,
  Image as ImageIcon,
  Grid,
  Layout,
  ArrowUp,
  ArrowDown,
  Settings
} from 'lucide-react';

interface HomeSection {
  id: number;
  name: string;
  type: string;
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  settings: any;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Banner {
  id: number;
  title_en: string;
  title_ar: string;
  image_url: string;
  type: string;
  position: string;
  is_active: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function HomeLayoutPage() {
  const locale = useLocale() as 'en' | 'ar';
  const t = useTranslations('admin');
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);

  const [formData, setFormData] = useState<Partial<HomeSection>>({
    name: '',
    type: 'banner',
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    settings: {},
    is_active: true,
    sort_order: 0,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sectionTypes = [
    { value: 'hero_slider', label: locale === 'en' ? 'Hero Slider' : 'شريط البطل', icon: Layout },
    { value: 'banner', label: locale === 'en' ? 'Banner Section' : 'قسم البانر', icon: ImageIcon },
    { value: 'product_row', label: locale === 'en' ? 'Product Row' : 'صف المنتجات', icon: Grid },
    { value: 'featured_tags', label: locale === 'en' ? 'Featured Tags' : 'العلامات المميزة', icon: Grid },
    { value: 'category_scroll', label: locale === 'en' ? 'Category Scroll' : 'التمرير للفئات', icon: Layout },
    { value: 'tenant_carousel', label: locale === 'en' ? 'Partners Carousel' : 'دوامة الشركاء', icon: Grid },
    { value: 'featured_subcategories', label: locale === 'en' ? 'Featured Subcategories' : 'الفئات الفرعية المميزة', icon: Grid },
    { value: 'custom', label: locale === 'en' ? 'Custom Section' : 'قسم مخصص', icon: Settings },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingSection) {
      setFormData(editingSection);
    } else if (showAddSection) {
      setFormData({
        name: '',
        type: 'banner',
        title_en: '',
        title_ar: '',
        description_en: '',
        description_ar: '',
        settings: {},
        is_active: true,
        sort_order: sections.length > 0 ? Math.max(...sections.map(s => s.sort_order)) + 1 : 0,
      });
    }
    setFormError('');
  }, [editingSection, showAddSection, sections]);

  const handleSave = async () => {
    try {
      setFormError('');
      setIsSubmitting(true);
      const token = localStorage.getItem('auth_token');
      
      const url = editingSection 
        ? `${API_BASE_URL}/admin/home-sections/${editingSection.id}`
        : `${API_BASE_URL}/admin/home-sections`;
        
      const response = await fetch(url, {
        method: editingSection ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0] as string[];
          throw new Error(firstError[0] || 'Validation error');
        }
        throw new Error(errorData.message || 'Failed to save section');
      }
      
      setShowAddSection(false);
      setEditingSection(null);
      fetchData();
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };

      // Fetch home sections
      const sectionsResponse = await fetch(`${API_BASE_URL}/admin/home-sections`, { headers });
      if (sectionsResponse.ok) {
        const sectionsResult = await sectionsResponse.json();
        setSections(sectionsResult.data || []);
      }

      // Fetch banners
      const bannersResponse = await fetch(`${API_BASE_URL}/admin/banners`, { headers });
      if (bannersResponse.ok) {
        const bannersResult = await bannersResponse.json();
        setBanners(bannersResult.data || []);
      }

      // Fetch tags
      const tagsResponse = await fetch(`${API_BASE_URL}/tags`, { headers });
      if (tagsResponse.ok) {
        const tagsResult = await tagsResponse.json();
        setTags(tagsResult.success && tagsResult.data ? tagsResult.data : []);
      }

      // Fetch subcategories
      const subcategoriesResponse = await fetch(`${API_BASE_URL}/admin/subcategories`, { headers });
      if (subcategoriesResponse.ok) {
        const subcategoriesResult = await subcategoriesResponse.json();
        setSubcategories(subcategoriesResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSectionStatus = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/home-sections/${id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error toggling section status:', error);
    }
  };

  const deleteSection = async (id: number) => {
    if (!confirm(locale === 'en' ? 'Are you sure you want to delete this section?' : 'هل أنت متأكد من حذف هذا القسم؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/home-sections/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const moveSectionUp = async (section: HomeSection) => {
    const currentIndex = sections.findIndex(s => s.id === section.id);
    if (currentIndex <= 0) return;

    const newSections = [...sections];
    const temp = newSections[currentIndex - 1].sort_order;
    newSections[currentIndex - 1].sort_order = newSections[currentIndex].sort_order;
    newSections[currentIndex].sort_order = temp;

    await updateSortOrder(newSections);
  };

  const moveSectionDown = async (section: HomeSection) => {
    const currentIndex = sections.findIndex(s => s.id === section.id);
    if (currentIndex >= sections.length - 1) return;

    const newSections = [...sections];
    const temp = newSections[currentIndex + 1].sort_order;
    newSections[currentIndex + 1].sort_order = newSections[currentIndex].sort_order;
    newSections[currentIndex].sort_order = temp;

    await updateSortOrder(newSections);
  };

  const updateSortOrder = async (updatedSections: HomeSection[]) => {
    try {
      const token = localStorage.getItem('auth_token');
      const sectionsData = updatedSections.map(section => ({
        id: section.id,
        sort_order: section.sort_order
      }));

      const response = await fetch(`${API_BASE_URL}/admin/home-sections/update-sort-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections: sectionsData }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating sort order:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeObj = sectionTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : Settings;
  };

  const getTypeLabel = (type: string) => {
    const typeObj = sectionTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getBannersForSection = (section: HomeSection) => {
    if (section.type !== 'banner') return [];
    
    const bannerType = section.settings?.banner_type;
    const position = section.settings?.position;
    
    return banners.filter(banner => {
      if (bannerType && banner.type !== bannerType) return false;
      if (position && banner.position !== position) return false;
      return banner.is_active;
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === 'en' ? 'Home Page Layout' : 'تخطيط الصفحة الرئيسية'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'en' 
              ? 'Customize the layout and content of your home page'
              : 'تخصيص تخطيط ومحتوى صفحتك الرئيسية'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open('/en/admin/banners', '_blank')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            {locale === 'en' ? 'Manage Banners' : 'إدارة البانرات'}
          </button>
          <button
            onClick={() => setShowAddSection(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {locale === 'en' ? 'Add Section' : 'إضافة قسم'}
          </button>
        </div>
      </div>

      {/* Home Sections */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {locale === 'en' ? 'Home Page Sections' : 'أقسام الصفحة الرئيسية'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {locale === 'en' 
              ? 'Drag to reorder sections or use the arrow buttons'
              : 'اسحب لإعادة ترتيب الأقسام أو استخدم أزرار الأسهم'
            }
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="p-8 text-center">
            <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {locale === 'en' ? 'No sections found' : 'لم يتم العثور على أقسام'}
            </h3>
            <p className="text-gray-600 mb-4">
              {locale === 'en' 
                ? 'Create your first section to start building your home page'
                : 'أنشئ أول قسم لك لبدء بناء صفحتك الرئيسية'
              }
            </p>
            <button
              onClick={() => setShowAddSection(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {locale === 'en' ? 'Create Section' : 'إنشاء قسم'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sections.map((section, index) => {
              const IconComponent = getTypeIcon(section.type);
              const sectionBanners = getBannersForSection(section);
              
              return (
                <div key={section.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => moveSectionUp(section)}
                          disabled={index === 0}
                          className={`p-1 rounded ${
                            index === 0 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveSectionDown(section)}
                          disabled={index === sections.length - 1}
                          className={`p-1 rounded ${
                            index === sections.length - 1 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {locale === 'ar' ? section.title_ar : section.title_en}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{getTypeLabel(section.type)}</span>
                            <span>•</span>
                            <span>
                              {locale === 'en' ? 'Order' : 'الترتيب'}: {section.sort_order}
                            </span>
                            {section.type === 'banner' && sectionBanners.length > 0 && (
                              <>
                                <span>•</span>
                                <span>
                                  {sectionBanners.length} {locale === 'en' ? 'banners' : 'بانر'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        section.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {section.is_active 
                          ? (locale === 'en' ? 'Active' : 'نشط')
                          : (locale === 'en' ? 'Inactive' : 'غير نشط')
                        }
                      </span>

                      <button
                        onClick={() => toggleSectionStatus(section.id)}
                        className={`p-2 rounded-lg ${
                          section.is_active 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={section.is_active 
                          ? (locale === 'en' ? 'Deactivate' : 'إلغاء التفعيل')
                          : (locale === 'en' ? 'Activate' : 'تفعيل')
                        }
                      >
                        {section.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => setEditingSection(section)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title={locale === 'en' ? 'Edit' : 'تعديل'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title={locale === 'en' ? 'Delete' : 'حذف'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Show banners for banner sections */}
                  {section.type === 'banner' && sectionBanners.length > 0 && (
                    <div className="mt-3 ml-12">
                      <div className="text-xs text-gray-500 mb-2">
                        {locale === 'en' ? 'Active Banners:' : 'البانرات النشطة:'}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sectionBanners.map(banner => (
                          <div key={banner.id} className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                            <img
                              src={banner.image_url?.startsWith('/') ? `http://localhost:8000${banner.image_url}` : banner.image_url}
                              alt={locale === 'ar' ? banner.title_ar : banner.title_en}
                              className="w-8 h-6 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = `https://via.placeholder.com/32x24/f3f4f6/9ca3af?text=B`;
                              }}
                            />
                            <span className="text-xs text-gray-700">
                              {locale === 'ar' ? banner.title_ar : banner.title_en}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show settings preview */}
                  {section.settings && Object.keys(section.settings).length > 0 && (
                    <div className="mt-3 ml-12">
                      <div className="text-xs text-gray-500 mb-1">
                        {locale === 'en' ? 'Settings:' : 'الإعدادات:'}
                      </div>
                      <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 font-mono">
                        {JSON.stringify(section.settings, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          {locale === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open('/en/admin/banners', '_blank')}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-blue-900">
                {locale === 'en' ? 'Manage Banners' : 'إدارة البانرات'}
              </div>
              <div className="text-sm text-blue-700">
                {locale === 'en' ? 'Create and edit promotional banners' : 'إنشاء وتعديل البانرات الترويجية'}
              </div>
            </div>
          </button>
          
          <button
            onClick={() => window.open('/en', '_blank')}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Eye className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-blue-900">
                {locale === 'en' ? 'Preview Home Page' : 'معاينة الصفحة الرئيسية'}
              </div>
              <div className="text-sm text-blue-700">
                {locale === 'en' ? 'See how your changes look' : 'شاهد كيف تبدو تغييراتك'}
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setShowAddSection(true)}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-blue-900">
                {locale === 'en' ? 'Add New Section' : 'إضافة قسم جديد'}
              </div>
              <div className="text-sm text-blue-700">
                {locale === 'en' ? 'Create a custom section' : 'إنشاء قسم مخصص'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Add/Edit Section Modal */}
      {(showAddSection || editingSection) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSection 
                  ? (locale === 'en' ? 'Edit Home Section' : 'تعديل قسم الصفحة الرئيسية')
                  : (locale === 'en' ? 'Add Home Section' : 'إضافة قسم جديد')
                }
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'en' ? 'Internal Name (Unique)' : 'الاسم الداخلي (فريد)'}
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., top_banner_1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'en' ? 'Section Type' : 'نوع القسم'}
                  </label>
                  <select
                    value={formData.type || 'banner'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value, settings: {} })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sectionTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'en' ? 'Title (English)' : 'العنوان (إنجليزي)'}
                  </label>
                  <input
                    type="text"
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'en' ? 'Title (Arabic)' : 'العنوان (عربي)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.title_ar || ''}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      {locale === 'en' ? 'Active Status' : 'حالة التفعيل'}
                    </label>
                  </div>
                </div>

                {/* Dynamic settings based on type */}
                {formData.type === 'banner' && (
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg space-y-4 shadow-inner">
                    <h4 className="font-medium text-gray-900 border-b pb-2">
                      {locale === 'en' ? 'Banner Settings' : 'إعدادات البانر'}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {locale === 'en' ? 'Banner Layout' : 'تخطيط البانر'}
                        </label>
                        <select
                          value={formData.settings?.layout || 'grid'}
                          onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, layout: e.target.value } })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="grid">Grid Layout</option>
                          <option value="slider">Slider / Carousel</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {locale === 'en' ? 'Banner Tag / Type' : 'علامة البانر / النوع'}
                        </label>
                        <select
                          value={formData.settings?.banner_type || 'promotional'}
                          onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, banner_type: e.target.value } })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="promotional">Promotional</option>
                          <option value="category_banner">Category</option>
                          <option value="hero_slider">Hero</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {locale === 'en' ? 'Columns (if Grid)' : 'الأعمدة (إذا كان شبكة)'}
                        </label>
                        <select
                          value={formData.settings?.columns || 2}
                          onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, columns: parseInt(e.target.value) } })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={1}>1 Column</option>
                          <option value={2}>2 Columns</option>
                          <option value={3}>3 Columns</option>
                          <option value={4}>4 Columns</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.type === 'product_row' && (
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg space-y-4 shadow-inner">
                    <h4 className="font-medium text-gray-900 border-b pb-2">
                      {locale === 'en' ? 'Product Row Settings' : 'إعدادات صف المنتجات'}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {locale === 'en' ? 'Filter Type' : 'نوع التصفية'}
                        </label>
                        <select
                          value={formData.settings?.filter_type || 'subcategory'}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            settings: { 
                              ...formData.settings, 
                              filter_type: e.target.value,
                              filter_value: '' // Reset filter value when type changes
                            } 
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="subcategory">{locale === 'en' ? 'Subcategory' : 'الفئة الفرعية'}</option>
                          <option value="tag">{locale === 'en' ? 'Tag' : 'العلامة'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {formData.settings?.filter_type === 'tag' 
                            ? (locale === 'en' ? 'Select Tag' : 'اختر العلامة')
                            : (locale === 'en' ? 'Select Subcategory' : 'اختر الفئة الفرعية')
                          }
                        </label>
                        {formData.settings?.filter_type === 'tag' ? (
                          <select
                            value={formData.settings?.filter_value || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              settings: { ...formData.settings, filter_value: e.target.value } 
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">{locale === 'en' ? 'Select a tag' : 'اختر علامة'}</option>
                            {tags.map((tag) => (
                              <option key={tag.id} value={tag.id}>
                                {locale === 'ar' ? tag.name_ar : tag.name_en}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={formData.settings?.filter_value || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              settings: { ...formData.settings, filter_value: e.target.value } 
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">{locale === 'en' ? 'Select a subcategory' : 'اختر فئة فرعية'}</option>
                            {subcategories.map((subcat: any) => (
                              <option key={subcat.id} value={subcat.id}>
                                {locale === 'ar' ? subcat.name_ar : subcat.name_en}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {locale === 'en' ? 'Product Count' : 'عدد المنتجات'}
                        </label>
                        <input
                          type="number"
                          value={formData.settings?.product_count || 8}
                          onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, product_count: parseInt(e.target.value) } })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddSection(false);
                  setEditingSection(null);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                {locale === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  editingSection 
                    ? (locale === 'en' ? 'Save Changes' : 'حفظ التغييرات')
                    : (locale === 'en' ? 'Create Section' : 'إنشاء القسم')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}