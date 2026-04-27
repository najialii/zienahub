'use client';

import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Price from '@/components/Price';

function OrderConfirmationContent() {
  const locale = useLocale() as 'en' | 'ar';
  const searchParams = useSearchParams();
  const [orderInfo, setOrderInfo] = useState<{
    orderNumber: string;
    total?: number;
    items?: number;
  } | null>(null);

  useEffect(() => {
    // Get order data from URL params
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam));
        setOrderInfo(decoded);
      } catch (e) {
        console.error('Failed to parse order data:', e);
        setOrderInfo({ orderNumber: `BLC-${Date.now().toString().slice(-8)}` });
      }
    } else {
      // Fallback order number
      setOrderInfo({ orderNumber: `BLC-${Date.now().toString().slice(-8)}` });
    }
  }, [searchParams]);

  if (!orderInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Header /> */}
        <main className="flex-1 py-20 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white border border-neutral-200 p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-neutral-600">
                  {locale === 'en' ? 'Loading order details...' : 'جاري تحميل تفاصيل الطلب...'}
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      
      <main className="flex-1 py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Success Message */}
            <div className="bg-white border border-neutral-200 p-8 text-center mb-8 animate-fadeIn">
              <CheckCircle className="w-20 h-20 text-success mx-auto mb-4 animate-scaleIn" />
              <h1 className="text-4xl font-bold mb-4">
                {locale === 'en' ? 'Order Confirmed!' : 'تم تأكيد الطلب!'}
              </h1>
              <p className="text-xl text-neutral-600 mb-6">
                {locale === 'en' 
                  ? 'Thank you for your purchase'
                  : 'شكراً لك على الشراء'}
              </p>
              <div className="bg-neutral-50 p-4 inline-block">
                <p className="text-sm text-neutral-600 mb-1">
                  {locale === 'en' ? 'Order Number' : 'رقم الطلب'}
                </p>
                <p className="text-2xl font-bold">{orderInfo.orderNumber}</p>
              </div>
              {orderInfo.total && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600 mb-1">
                    {locale === 'en' ? 'Total Amount' : 'المبلغ الإجمالي'}
                  </p>
                  <Price amount={orderInfo.total} className="text-2xl font-bold" />
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="bg-white border border-neutral-200 p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {locale === 'en' ? 'What happens next?' : 'ماذا يحدث بعد ذلك؟'}
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {locale === 'en' ? 'Order Confirmation Email' : 'بريد تأكيد الطلب'}
                    </h3>
                    <p className="text-neutral-600">
                      {locale === 'en'
                        ? 'You will receive an order confirmation email with details of your order.'
                        : 'ستتلقى بريداً إلكترونياً لتأكيد الطلب مع تفاصيل طلبك.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {locale === 'en' ? 'Order Processing' : 'معالجة الطلب'}
                    </h3>
                    <p className="text-neutral-600">
                      {locale === 'en'
                        ? 'We are preparing your order for shipment. You will receive a tracking number once shipped.'
                        : 'نحن نقوم بتجهيز طلبك للشحن. ستتلقى رقم تتبع بمجرد الشحن.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {locale === 'en' ? 'Delivery' : 'التوصيل'}
                    </h3>
                    <p className="text-neutral-600">
                      {locale === 'en'
                        ? 'Your order will be delivered within 3-5 business days.'
                        : 'سيتم توصيل طلبك خلال 3-5 أيام عمل.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${locale}/account/orders`}
                className="flex-1 py-4 bg-primary text-white text-center font-medium hover:bg-primary-dark transition-colors"
              >
                {locale === 'en' ? 'View Order Details' : 'عرض تفاصيل الطلب'}
              </Link>
              <Link
                href={`/${locale}/products`}
                className="flex-1 py-4 border border-neutral-300 text-center font-medium hover:bg-neutral-50 transition-colors"
              >
                {locale === 'en' ? 'Continue Shopping' : 'متابعة التسوق'}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-20 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white border border-neutral-200 p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
