'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Calendar, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Price from '@/components/Price';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: string;
  product: {
    id: number;
    name: string;
    image_url?: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  total_amount: string;
  status: string;
  created_at: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const locale = useLocale() as 'en' | 'ar';
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        
        const headers: HeadersInit = {
          'Accept': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
          headers,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error('Failed to fetch order');
        }

        setOrder(data.data);
      } catch (err) {
        console.error('Order fetch error:', err);
        setError(locale === 'en' ? 'Failed to load order details' : 'فشل تحميل تفاصيل الطلب');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {/* <Header /> */}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mb-4"></div>
            <p className="text-neutral-600">{locale === 'en' ? 'Loading order...' : 'جاري تحميل الطلب...'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push(`/${locale}/account/orders`)}
              className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
            >
              {locale === 'en' ? 'Back to Orders' : 'العودة إلى الطلبات'}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { en: string; ar: string; color: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      processing: { en: 'Processing', ar: 'قيد المعالجة', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      shipped: { en: 'Shipped', ar: 'تم الشحن', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      delivered: { en: 'Delivered', ar: 'تم التوصيل', color: 'bg-green-50 text-green-700 border-green-200' },
      cancelled: { en: 'Cancelled', ar: 'ملغي', color: 'bg-red-50 text-red-700 border-red-200' },
    };
    
    const statusInfo = statusMap[status] || statusMap.pending;
    return {
      label: locale === 'en' ? statusInfo.en : statusInfo.ar,
      color: statusInfo.color,
    };
  };

  const statusDisplay = getStatusDisplay(order.status);
  const subtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price_at_purchase) * item.quantity), 0);
  const shipping = 10.00;
  const total = parseFloat(order.total_amount);

  // Mock tracking data (not yet in database)
  const tracking = {
    number: 'TRK-' + order.order_number.slice(-6),
    carrier: 'Express Delivery',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', { month: 'short', day: 'numeric', year: 'numeric' }),
  };

  const timeline = [
    {
      status: order.status,
      title: statusDisplay.label,
      description: locale === 'en' ? 'Current status' : 'الحالة الحالية',
      date: new Date(order.created_at).toLocaleString(locale === 'en' ? 'en-US' : 'ar-SA'),
      completed: true,
    },
  ];

  // Mock order data for parts not yet in API
  const mockOrder = {
    id: orderId,
    orderNumber: orderId,
    date: 'November 20, 2024',
    status: 'delivered',
    total: 89.99,
    subtotal: 79.99,
    shipping: 10.00,
    tax: 0,
    items: [
      {
        id: 1,
        name: 'Red Roses Bouquet',
        quantity: 2,
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop',
      },
      {
        id: 2,
        name: 'Belgian Dark Chocolate Box',
        quantity: 1,
        price: 20.01,
        image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=200&h=200&fit=crop',
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main Street',
      city: 'Riyadh',
      postalCode: '12345',
      country: 'Saudi Arabia',
      phone: '+966 50 123 4567',
    },
    tracking: {
      number: 'TRK-' + orderId.slice(-6),
      carrier: 'Express Delivery',
      estimatedDelivery: 'Nov 22, 2024',
    },
    timeline: [
      {
        status: 'delivered',
        title: locale === 'en' ? 'Delivered' : 'تم التوصيل',
        description: locale === 'en' ? 'Package delivered successfully' : 'تم تسليم الطرد بنجاح',
        date: 'Nov 20, 2024 - 2:30 PM',
        completed: true,
      },
      {
        status: 'in_transit',
        title: locale === 'en' ? 'Out for Delivery' : 'في طريقه للتوصيل',
        description: locale === 'en' ? 'Package is out for delivery' : 'الطرد في طريقه للتوصيل',
        date: 'Nov 20, 2024 - 9:00 AM',
        completed: true,
      },
      {
        status: 'shipped',
        title: locale === 'en' ? 'Shipped' : 'تم الشحن',
        description: locale === 'en' ? 'Package shipped from warehouse' : 'تم شحن الطرد من المستودع',
        date: 'Nov 19, 2024 - 3:45 PM',
        completed: true,
      },
      {
        status: 'processing',
        title: locale === 'en' ? 'Processing' : 'قيد المعالجة',
        description: locale === 'en' ? 'Order is being prepared' : 'يتم تجهيز الطلب',
        date: 'Nov 18, 2024 - 10:15 AM',
        completed: true,
      },
      {
        status: 'confirmed',
        title: locale === 'en' ? 'Order Confirmed' : 'تم تأكيد الطلب',
        description: locale === 'en' ? 'Your order has been confirmed' : 'تم تأكيد طلبك',
        date: 'Nov 18, 2024 - 10:00 AM',
        completed: true,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <Link
            href={`/${locale}/account/orders`}
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-black transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">
              {locale === 'en' ? 'Back to Orders' : 'العودة إلى الطلبات'}
            </span>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                  {locale === 'en' ? 'Order Details' : 'تفاصيل الطلب'}
                </h1>
                <p className="text-neutral-600">
                  {locale === 'en' ? `Order #${order.order_number}` : `طلب #${order.order_number}`}
                </p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 border font-medium ${statusDisplay.color}`}>
                <CheckCircle className="w-5 h-5" />
                <span>{statusDisplay.label}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Tracking */}
              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {locale === 'en' ? 'Order Tracking' : 'تتبع الطلب'}
                </h2>

                {/* Tracking Timeline */}
                <div className="relative">
                  {timeline.map((step: any, index: number) => (
                    <div key={index} className="relative pb-8 last:pb-0">
                      {/* Connector Line */}
                      {index < timeline.length - 1 && (
                        <div className={`absolute left-[15px] top-[32px] w-0.5 h-full ${
                          step.completed ? 'bg-black' : 'bg-neutral-200'
                        }`} />
                      )}
                      
                      {/* Timeline Item */}
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className={`relative z-10 w-8 h-8 flex items-center justify-center border-2 ${
                          step.completed 
                            ? 'bg-black border-black' 
                            : 'bg-white border-neutral-300'
                        }`}>
                          {step.completed && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pt-0.5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                            <h3 className={`font-semibold ${
                              step.completed ? 'text-black' : 'text-neutral-400'
                            }`}>
                              {step.title}
                            </h3>
                            <span className={`text-sm ${
                              step.completed ? 'text-neutral-600' : 'text-neutral-400'
                            }`}>
                              {step.date}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            step.completed ? 'text-neutral-600' : 'text-neutral-400'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking Number */}
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-50 p-4">
                    <div>
                      <div className="text-sm text-neutral-600 mb-1">
                        {locale === 'en' ? 'Tracking Number' : 'رقم التتبع'}
                      </div>
                      <div className="font-mono font-semibold">{tracking.number}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-600 mb-1">
                        {locale === 'en' ? 'Carrier' : 'شركة الشحن'}
                      </div>
                      <div className="font-semibold">{tracking.carrier}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {locale === 'en' ? 'Order Items' : 'عناصر الطلب'}
                </h2>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0">
                      <div className="w-20 h-20 bg-neutral-100 flex-shrink-0 overflow-hidden">
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{item.product?.name || 'Product'}</h3>
                        <p className="text-sm text-neutral-600 mb-2">
                          {locale === 'en' ? 'Quantity' : 'الكمية'}: {item.quantity}
                        </p>
                        <Price amount={item.price_at_purchase} className="font-semibold" />
                      </div>
                      
                      <div className="text-right">
                        <Price amount={parseFloat(item.price_at_purchase) * item.quantity} className="font-bold" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Order Summary */}
              <div className="bg-white border border-neutral-200 p-6 sticky top-24">
                <h2 className="text-lg font-bold mb-4">
                  {locale === 'en' ? 'Order Summary' : 'ملخص الطلب'}
                </h2>

                <div className="space-y-3 mb-4 pb-4 border-b border-neutral-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">
                      {locale === 'en' ? 'Subtotal' : 'المجموع الفرعي'}
                    </span>
                    <Price amount={subtotal} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">
                      {locale === 'en' ? 'Shipping' : 'الشحن'}
                    </span>
                    <Price amount={shipping} />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg">
                    {locale === 'en' ? 'Total' : 'المجموع'}
                  </span>
                  <Price amount={total} className="text-2xl font-bold" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-neutral-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-neutral-600 mb-1">
                        {locale === 'en' ? 'Order Date' : 'تاريخ الطلب'}
                      </div>
                      <div className="font-medium">{new Date(order.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-sm">
                    <CreditCard className="w-4 h-4 text-neutral-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-neutral-600 mb-1">
                        {locale === 'en' ? 'Payment Method' : 'طريقة الدفع'}
                      </div>
                      <div className="font-medium">
                        {locale === 'en' ? 'Credit Card' : 'بطاقة ائتمان'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {locale === 'en' ? 'Shipping Address' : 'عنوان الشحن'}
                </h2>

                <div className="text-sm space-y-1">
                  <div className="font-semibold">{order.shipping_name}</div>
                  <div className="text-neutral-600">{order.shipping_address}</div>
                  <div className="text-neutral-600">
                    {order.shipping_city}, {order.shipping_postal_code}
                  </div>
                  <div className="text-neutral-600">{order.shipping_country}</div>
                  <div className="text-neutral-600 pt-2">{order.shipping_phone}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button className="w-full py-3 bg-black text-white font-medium hover:bg-neutral-800 transition-colors">
                  {locale === 'en' ? 'Download Invoice' : 'تحميل الفاتورة'}
                </button>
                <button className="w-full py-3 border border-neutral-300 font-medium hover:bg-neutral-50 transition-colors">
                  {locale === 'en' ? 'Contact Support' : 'اتصل بالدعم'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
