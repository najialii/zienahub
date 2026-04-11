'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  MessageCircle, 
  User, 
  CheckCircle, 
  XCircle,
  Send,
  Truck,
  Package,
  Clock,
  Users
} from 'lucide-react';

interface DeliveryPerson {
  id: number;
  name: string;
  phone: string;
  telegram_chat_id: string | null;
  telegram_username: string | null;
  is_active: boolean;
  notes: string | null;
  pending_orders_count: number;
  created_at: string;
}

interface DeliveryStats {
  total_personnel: number;
  active_personnel: number;
  assigned_orders: number;
  delivered_today: number;
  pending_assignments: number;
}

export default function DeliveryManagementPage() {
  const locale = useLocale() as 'en' | 'ar';
  const [personnel, setPersonnel] = useState<DeliveryPerson[]>([]);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<DeliveryPerson | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    telegram_chat_id: '',
    telegram_username: '',
    notes: ''
  });

  useEffect(() => {
    fetchPersonnel();
    fetchStats();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delivery-personnel`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPersonnel(data.data);
      }
    } catch (error) {
      console.error('Error fetching personnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delivery/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token');
      const url = editingPerson 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/delivery-personnel/${editingPerson.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/delivery-personnel`;
      
      const method = editingPerson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchPersonnel();
        fetchStats();
        resetForm();
        setShowAddModal(false);
        setEditingPerson(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to save delivery person');
      }
    } catch (error) {
      console.error('Error saving delivery person:', error);
      alert('Failed to save delivery person');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(locale === 'en' ? 'Are you sure you want to delete this delivery person?' : 'هل أنت متأكد من حذف هذا الشخص؟')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delivery-personnel/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchPersonnel();
        fetchStats();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete delivery person');
      }
    } catch (error) {
      console.error('Error deleting delivery person:', error);
      alert('Failed to delete delivery person');
    }
  };

  const testTelegram = async (person: DeliveryPerson) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delivery-personnel/${person.id}/test-telegram`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error testing Telegram:', error);
      alert('Failed to test Telegram connection');
    }
  };

  const getChatId = async (person: DeliveryPerson) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delivery-personnel/${person.id}/get-chat-id`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.chat_id) {
        // Update the person with the found chat ID using the simpler endpoint
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delivery-personnel/${person.id}/update-chat-id`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            telegram_chat_id: String(data.chat_id),
            telegram_username: data.username || null
          })
        });

        if (updateResponse.ok) {
          fetchPersonnel(); // Refresh the list
          alert(locale === 'en' 
            ? `Chat ID found and updated: ${data.chat_id}` 
            : `تم العثور على معرف المحادثة وتحديثه: ${data.chat_id}`
          );
        } else {
          const errorData = await updateResponse.json();
          console.error('Update error:', errorData);
          alert(locale === 'en' 
            ? `Failed to update chat ID: ${errorData.message || 'Unknown error'}` 
            : `فشل في تحديث معرف المحادثة: ${errorData.message || 'خطأ غير معروف'}`
          );
        }
      } else {
        alert(data.message || (locale === 'en' 
          ? 'No chat ID found. Ask the delivery person to send /start to the bot first.' 
          : 'لم يتم العثور على معرف المحادثة. اطلب من المندوب إرسال /start للبوت أولاً.'
        ));
      }
    } catch (error) {
      console.error('Error getting chat ID:', error);
      alert(locale === 'en' ? 'Failed to get chat ID' : 'فشل في الحصول على معرف المحادثة');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      telegram_chat_id: '',
      telegram_username: '',
      notes: ''
    });
  };

  const openEditModal = (person: DeliveryPerson) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      phone: person.phone,
      telegram_chat_id: person.telegram_chat_id || '',
      telegram_username: person.telegram_username || '',
      notes: person.notes || ''
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-neutral-600">
            {locale === 'en' ? 'Loading delivery personnel...' : 'جاري تحميل موظفي التوصيل...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">
            {locale === 'en' ? 'Delivery Personnel' : 'موظفو التوصيل'}
          </h1>
          <p className="text-neutral-600 mt-1">
            {locale === 'en' ? 'Manage delivery staff and assignments' : 'إدارة موظفي التوصيل والمهام'}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingPerson(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {locale === 'en' ? 'Add Personnel' : 'إضافة موظف'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 border border-neutral-200">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-neutral-600">
                  {locale === 'en' ? 'Total Personnel' : 'إجمالي الموظفين'}
                </p>
                <p className="text-2xl font-bold">{stats.total_personnel}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-neutral-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-neutral-600">
                  {locale === 'en' ? 'Active Personnel' : 'الموظفين النشطين'}
                </p>
                <p className="text-2xl font-bold">{stats.active_personnel}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-neutral-200">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-neutral-600">
                  {locale === 'en' ? 'Assigned Orders' : 'الطلبات المعينة'}
                </p>
                <p className="text-2xl font-bold">{stats.assigned_orders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-neutral-200">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-neutral-600">
                  {locale === 'en' ? 'Delivered Today' : 'تم التوصيل اليوم'}
                </p>
                <p className="text-2xl font-bold">{stats.delivered_today}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-neutral-200">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-neutral-600">
                  {locale === 'en' ? 'Pending Assignments' : 'في انتظار التعيين'}
                </p>
                <p className="text-2xl font-bold">{stats.pending_assignments}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personnel List */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  {locale === 'en' ? 'Name' : 'الاسم'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  {locale === 'en' ? 'Phone' : 'الهاتف'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  {locale === 'en' ? 'Telegram' : 'تليجرام'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  {locale === 'en' ? 'Status' : 'الحالة'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  {locale === 'en' ? 'Pending Orders' : 'الطلبات المعلقة'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  {locale === 'en' ? 'Actions' : 'الإجراءات'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {personnel.map((person) => (
                <tr key={person.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <User className="w-8 h-8 text-neutral-400" />
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-neutral-600">
                          {locale === 'en' ? 'ID:' : 'المعرف:'} {person.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      <span>{person.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-neutral-400" />
                      {person.telegram_chat_id ? (
                        <div>
                          <p className="text-sm">{person.telegram_username || 'Connected'}</p>
                          <p className="text-xs text-neutral-500">{person.telegram_chat_id}</p>
                        </div>
                      ) : (
                        <span className="text-neutral-500 text-sm">
                          {locale === 'en' ? 'Not connected' : 'غير متصل'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      person.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {person.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          {locale === 'en' ? 'Active' : 'نشط'}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          {locale === 'en' ? 'Inactive' : 'غير نشط'}
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      <Package className="w-3 h-3" />
                      {person.pending_orders_count}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(person)}
                        className="p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                        title={locale === 'en' ? 'Edit' : 'تعديل'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {!person.telegram_chat_id && (
                        <button
                          onClick={() => getChatId(person)}
                          className="p-2 text-purple-600 hover:bg-purple-50 transition-colors"
                          title={locale === 'en' ? 'Get Chat ID' : 'الحصول على معرف المحادثة'}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {person.telegram_chat_id && (
                        <button
                          onClick={() => testTelegram(person)}
                          className="p-2 text-green-600 hover:bg-green-50 transition-colors"
                          title={locale === 'en' ? 'Test Telegram' : 'اختبار تليجرام'}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(person.id)}
                        className="p-2 text-red-600 hover:bg-red-50 transition-colors"
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
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingPerson 
                  ? (locale === 'en' ? 'Edit Delivery Person' : 'تعديل موصل')
                  : (locale === 'en' ? 'Add Delivery Person' : 'إضافة موصل')
                }
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'en' ? 'Name' : 'الاسم'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'en' ? 'Phone' : 'الهاتف'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'en' ? 'Telegram Chat ID' : 'معرف محادثة تليجرام'}
                  </label>
                  <input
                    type="text"
                    value={formData.telegram_chat_id}
                    onChange={(e) => setFormData({...formData, telegram_chat_id: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    placeholder={locale === 'en' ? 'e.g., 123456789' : 'مثال: 123456789'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'en' ? 'Telegram Username' : 'اسم المستخدم في تليجرام'}
                  </label>
                  <input
                    type="text"
                    value={formData.telegram_username}
                    onChange={(e) => setFormData({...formData, telegram_username: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    placeholder={locale === 'en' ? 'e.g., @username' : 'مثال: @username'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {locale === 'en' ? 'Notes' : 'ملاحظات'}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    rows={3}
                    placeholder={locale === 'en' ? 'Optional notes...' : 'ملاحظات اختيارية...'}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-black text-white hover:bg-neutral-800 transition-colors"
                  >
                    {editingPerson 
                      ? (locale === 'en' ? 'Update' : 'تحديث')
                      : (locale === 'en' ? 'Add' : 'إضافة')
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingPerson(null);
                      resetForm();
                    }}
                    className="flex-1 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    {locale === 'en' ? 'Cancel' : 'إلغاء'}
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