'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Price from '@/components/Price';
import { useUserStore } from '@/lib/userStore';

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: Array<{
    id: number;
    product: {
      id: number;
      name: string;
      image_url: string;
    };
    quantity: number;
  }>;
}

export default function OrdersPage() {
  const locale = useLocale() as 'en' | 'ar';
  const router = useRouter();
  const { isLoggedIn } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push(`/${locale}/login`);
      return;
    }
    fetchOrders();
  }, [isLoggedIn, locale, router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  const getStatusText = (status: string) => {
    if (locale === 'en') {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
    const statusMap: Record<string, string> = {
      delivered: 'تم التوصيل',
      processing: 'قيد المعالجة',
      pending: 'قيد الانتظار',
      cancelled: 'ملغي',
    };
    return statusMap[status] || status;
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* <Header /> */}
      
      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <Link
            href={`/${locale}/account`}
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-black transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">
              {locale === 'en' ? 'Back to Account' : 'العودة إلى الحساب'}
            </span>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              {locale === 'en' ? 'My Orders' : 'طلباتي'}
            </h1>
            <p className="text-neutral-600 text-lg">
              {locale === 'en' ? 'Track and manage your orders' : 'تتبع وإدارة طلباتك'}
            </p>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-neutral-100 border border-neutral-200 p-6 animate-pulse h-32" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-neutral-50 border border-neutral-200">
              <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {locale === 'en' ? 'No orders yet' : 'لا توجد طلبات بعد'}
              </h3>
              <p className="text-neutral-600 mb-6">
                {locale === 'en' ? 'Start shopping to see your orders here' : 'ابدأ التسوق لرؤية طلباتك هنا'}
              </p>
              <Link
                href={`/${locale}/products`}
                className="inline-block px-8 py-3 bg-black text-white font-medium hover:bg-neutral-800 transition-colors"
              >
                {locale === 'en' ? 'Start Shopping' : 'ابدأ التسوق'}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const firstItemImage = order.items?.[0]?.product?.image_url || 'https://via.placeholder.com/200x200/f3f4f6/000000/?text=Order';
                const itemCount = order.items?.length || 0;
                
                return (
                  <Link
                    key={order.id}
                    href={`/${locale}/account/orders/${order.order_number}`}
                    className="block bg-white border border-neutral-200 hover:border-neutral-400 transition-all group"
                  >
                    <div className="p-4 md:p-6">
                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 bg-neutral-100 flex-shrink-0 overflow-hidden">
                            <img
                              src={firstItemImage}
                              alt="Order"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/200x200/f3f4f6/000000/?text=Order';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-lg mb-1">{order.order_number}</div>
                            <div className="text-sm text-neutral-600 mb-2">{formatDate(order.created_at)}</div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span>{getStatusText(order.status)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                          <div>
                            <div className="text-xs text-neutral-600 mb-1">
                              {locale === 'en' ? `${itemCount} items` : `${itemCount} عناصر`}
                            </div>
                            <Price amount={order.total_amount} className="text-xl font-bold" />
                          </div>
                          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:flex items-center gap-6">
                        <div className="w-24 h-24 bg-neutral-100 flex-shrink-0 overflow-hidden">
                          <img
                            src={firstItemImage}
                            alt="Order"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/200x200/f3f4f6/000000/?text=Order';
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 grid grid-cols-4 gap-6 items-center">
                          <div>
                            <div className="font-semibold text-lg mb-1">{order.order_number}</div>
                            <div className="text-sm text-neutral-600">{formatDate(order.created_at)}</div>
                          </div>
                          
                          <div className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border w-fit ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span>{getStatusText(order.status)}</span>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xs text-neutral-600 mb-1">
                              {locale === 'en' ? 'Items' : 'العناصر'}
                            </div>
                            <div className="font-semibold">{itemCount}</div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Price amount={order.total_amount} className="text-xl font-bold" />
                            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
