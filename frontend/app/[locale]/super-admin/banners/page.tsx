'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import BannerFormModal from '@/components/BannerFormModal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Filter,
  Image as ImageIcon,
  Calendar,
  Link as LinkIcon,
  Palette,
  ArrowUpDown,
  LayoutDashboard
} from 'lucide-react';

interface Banner {
  id: number;
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  link_text_en?: string;
  link_text_ar?: string;
  type: string;
  position: string;
  sort_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  background_color?: string;
  text_color?: string;
  text_alignment: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function BannersPage() {
  const locale = useLocale() as 'en' | 'ar';
  const t = useTranslations('admin');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const bannerTypes = [
    { value: 'hero_slider', label: locale === 'en' ? 'Hero Slider' : 'شريط البطل' },
    { value: 'promotional', label: locale === 'en' ? 'Promotional' : 'ترويجي' },
    { value: 'category_banner', label: locale === 'en' ? 'Category Banner' : 'بانر الفئة' },
    { value: 'sidebar_banner', label: locale === 'en' ? 'Sidebar Banner' : 'بانر جانبي' },
    { value: 'footer_banner', label: locale === 'en' ? 'Footer Banner' : 'بانر التذييل' },
  ];

  const positions = [
    { value: 'top', label: locale === 'en' ? 'Top' : 'أعلى' },
    { value: 'middle', label: locale === 'en' ? 'Middle' : 'وسط' },
    { value: 'bottom', label: locale === 'en' ? 'Bottom' : 'أسفل' },
    { value: 'left', label: locale === 'en' ? 'Left' : 'يسار' },
    { value: 'right', label: locale === 'en' ? 'Right' : 'يمين' },
    { value: 'center', label: locale === 'en' ? 'Center' : 'وسط' },
  ];

  useEffect(() => {
    fetchBanners();
  }, [searchTerm, typeFilter, statusFilter]);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`${API_BASE_URL}/admin/banners?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setBanners(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBannerStatus = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/banners/${id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchBanners();
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
    }
  };

  const deleteBanner = async (id: number) => {
    if (!confirm(locale === 'en' ? 'Are you sure you want to delete this banner?' : 'هل أنت متأكد من حذف هذا البانر؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchBanners();
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const typeObj = bannerTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getPositionLabel = (position: string) => {
    const positionObj = positions.find(p => p.value === position);
    return positionObj ? positionObj.label : position;
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
            {locale === 'en' ? 'Banner Management' : 'إدارة البانرات'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'en' 
              ? 'Manage banners for sliders and different areas of your website'
              : 'إدارة البانرات للشرائح والمناطق المختلفة في موقعك'
            }
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {locale === 'en' ? 'Add Banner' : 'إضافة بانر'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={locale === 'en' ? 'Search banners...' : 'البحث في البانرات...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{locale === 'en' ? 'All Types' : 'جميع الأنواع'}</option>
            {bannerTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{locale === 'en' ? 'All Status' : 'جميع الحالات'}</option>
            <option value="active">{locale === 'en' ? 'Active' : 'نشط'}</option>
            <option value="inactive">{locale === 'en' ? 'Inactive' : 'غير نشط'}</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('');
              setStatusFilter('');
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {locale === 'en' ? 'Clear Filters' : 'مسح المرشحات'}
          </button>
        </div>
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {banners.length === 0 ? (
          <div className="p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {locale === 'en' ? 'No banners found' : 'لم يتم العثور على بانرات'}
            </h3>
            <p className="text-gray-600 mb-4">
              {locale === 'en' 
                ? 'Create your first banner to get started'
                : 'أنشئ أول بانر لك للبدء'
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {locale === 'en' ? 'Create Banner' : 'إنشاء بانر'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Banner' : 'البانر'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Type' : 'النوع'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Position' : 'الموضع'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Status' : 'الحالة'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Order' : 'الترتيب'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'en' ? 'Actions' : 'الإجراءات'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-24">
                          <img
                            className="h-16 w-24 object-cover rounded-lg"
                            src={banner.image_url?.startsWith('/') ? `http://localhost:8000${banner.image_url}` : banner.image_url}
                            alt={locale === 'ar' ? banner.title_ar : banner.title_en}
                            onError={(e) => {
                              e.currentTarget.src = `https://via.placeholder.com/96x64/f3f4f6/9ca3af?text=Banner`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {locale === 'ar' ? banner.title_ar : banner.title_en}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {locale === 'ar' ? banner.description_ar : banner.description_en}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getTypeLabel(banner.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getPositionLabel(banner.position)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        banner.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.is_active 
                          ? (locale === 'en' ? 'Active' : 'نشط')
                          : (locale === 'en' ? 'Inactive' : 'غير نشط')
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {banner.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleBannerStatus(banner.id)}
                          className={`p-2 rounded-lg ${
                            banner.is_active 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={banner.is_active 
                            ? (locale === 'en' ? 'Deactivate' : 'إلغاء التفعيل')
                            : (locale === 'en' ? 'Activate' : 'تفعيل')
                          }
                        >
                          {banner.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingBanner(banner)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title={locale === 'en' ? 'Edit' : 'تعديل'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBanner(banner.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title={locale === 'en' ? 'Delete' : 'حذف'}
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
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          {locale === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open(`/${locale}/admin/home-layout`, '_blank')}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-blue-900">
                {locale === 'en' ? 'Home Layout' : 'تخطيط الصفحة الرئيسية'}
              </div>
              <div className="text-sm text-blue-700">
                {locale === 'en' ? 'Manage home page sections and banner placement' : 'إدارة أقسام الصفحة الرئيسية وموضع البانرات'}
              </div>
            </div>
          </button>
          
          <button
            onClick={() => window.open(`/${locale}`, '_blank')}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Eye className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-blue-900">
                {locale === 'en' ? 'Preview Home Page' : 'معاينة الصفحة الرئيسية'}
              </div>
              <div className="text-sm text-blue-700">
                {locale === 'en' ? 'See how your banners look on the site' : 'شاهد كيف تبدو بانراتك على الموقع'}
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-blue-900">
                {locale === 'en' ? 'Create Banner' : 'إنشاء بانر'}
              </div>
              <div className="text-sm text-blue-700">
                {locale === 'en' ? 'Add a new promotional banner' : 'إضافة بانر ترويجي جديد'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Banner Placement Guide */}
      <div className="mt-6 bg-green-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-900 mb-3">
          {locale === 'en' ? 'Banner Placement Guide' : 'دليل موضع البانرات'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium text-green-800">
              {locale === 'en' ? 'Banner Types:' : 'أنواع البانرات:'}
            </div>
            <ul className="space-y-1 text-green-700">
              <li>• <strong>Hero Slider:</strong> {locale === 'en' ? 'Main carousel at top' : 'الشريط الرئيسي في الأعلى'}</li>
              <li>• <strong>Promotional:</strong> {locale === 'en' ? 'Special offers throughout page' : 'العروض الخاصة في الصفحة'}</li>
              <li>• <strong>Category Banner:</strong> {locale === 'en' ? 'Category-specific promotions' : 'ترويج خاص بالفئات'}</li>
              <li>• <strong>Sidebar Banner:</strong> {locale === 'en' ? 'Side promotional content' : 'محتوى ترويجي جانبي'}</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-green-800">
              {locale === 'en' ? 'Positions:' : 'المواضع:'}
            </div>
            <ul className="space-y-1 text-green-700">
              <li>• <strong>Top:</strong> {locale === 'en' ? 'Above product sections' : 'فوق أقسام المنتجات'}</li>
              <li>• <strong>Middle:</strong> {locale === 'en' ? 'Between product rows' : 'بين صفوف المنتجات'}</li>
              <li>• <strong>Bottom:</strong> {locale === 'en' ? 'At page bottom' : 'في أسفل الصفحة'}</li>
              <li>• <strong>Left/Right:</strong> {locale === 'en' ? 'Sidebar placement' : 'موضع جانبي'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <BannerFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchBanners}
          locale={locale}
        />
      )}

      {editingBanner && (
        <BannerFormModal
          isOpen={!!editingBanner}
          onClose={() => setEditingBanner(null)}
          onSuccess={fetchBanners}
          banner={editingBanner}
          locale={locale}
        />
      )}
    </div>
  );
}