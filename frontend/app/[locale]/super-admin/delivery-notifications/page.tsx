'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Package,
  MessageCircle,
  RefreshCw
} from 'lucide-react';

interface DeliveryNotification {
  id: number;
  order: {
    id: number;
    order_number: string;
    total_amount: number;
    shipping_name: string;
  };
  delivery_person: {
    id: number;
    name: string;
    phone: string;
  };
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  sent_at: string;
  expires_at: string;
  responded_at?: string;
  decline_reason?: string;
}

export default function DeliveryNotificationsPage() {
  const locale = useLocale() as 'en' | 'ar';
  const [notifications, setNotifications] = useState<DeliveryNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = filter === 'all' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/delivery-notifications`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/delivery-notifications?status=${filter}`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: locale === 'en' ? 'Pending' : 'في الانتظار',
      accepted: locale === 'en' ? 'Accepted' : 'مقبول',
      declined: locale === 'en' ? 'Declined' : 'مرفوض',
      expired: locale === 'en' ? 'Expired' : 'منتهي الصلاحية'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-neutral-600">
            {locale === 'en' ? 'Loading notifications...' : 'جاري تحميل الإشعارات...'}
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
            {locale === 'en' ? 'Delivery Notifications' : 'إشعارات التوصيل'}
          </h1>
          <p className="text-neutral-600 mt-1">
            {locale === 'en' ? 'Track delivery assignment responses' : 'تتبع ردود تعيين التوصيل'}
          </p>
        </div>
        <button
          onClick={fetchNotifications}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {locale === 'en' ? 'Refresh' : 'تحديث'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: locale === 'en' ? 'All' : 'الكل' },
          { key: 'pending', label: locale === 'en' ? 'Pending' : 'في الانتظار' },
          { key: 'accepted', label: locale === 'en' ? 'Accepted' : 'مقبول' },
          { key: 'declined', label: locale === 'en' ? 'Declined' : 'مرفوض' },
          { key: 'expired', label: locale === 'en' ? 'Expired' : 'منتهي الصلاحية' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
            <p>{locale === 'en' ? 'No notifications found' : 'لا توجد إشعارات'}</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-6 hover:bg-neutral-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(notification.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {getStatusText(notification.status)}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {locale === 'en' ? 'ID:' : 'المعرف:'} {notification.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-neutral-400" />
                        <div>
                          <p className="font-medium">{notification.order.order_number}</p>
                          <p className="text-sm text-neutral-600">
                            {notification.order.total_amount} {locale === 'en' ? 'SAR' : 'ريال'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-neutral-400" />
                        <div>
                          <p className="font-medium">{notification.delivery_person.name}</p>
                          <p className="text-sm text-neutral-600">{notification.delivery_person.phone}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-neutral-600">
                          {locale === 'en' ? 'Customer:' : 'العميل:'} {notification.order.shipping_name}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {locale === 'en' ? 'Sent:' : 'أرسل:'} {new Date(notification.sent_at).toLocaleString()}
                        </p>
                        {notification.responded_at && (
                          <p className="text-sm text-neutral-600">
                            {locale === 'en' ? 'Responded:' : 'رد:'} {new Date(notification.responded_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {notification.decline_reason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-700">
                          <strong>{locale === 'en' ? 'Decline Reason:' : 'سبب الرفض:'}</strong> {notification.decline_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}