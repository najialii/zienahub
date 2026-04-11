'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Clock, Truck, Gift, Sparkles } from 'lucide-react';

export default function SameDayDelivery() {
  const locale = useLocale();

  const features = [
    {
      icon: Clock,
      title: locale === 'en' ? 'Same Day Delivery' : 'التوصيل في نفس اليوم',
      description: locale === 'en' ? 'Order before 2 PM for same-day delivery' : 'اطلب قبل الساعة 2 ظهراً للتوصيل في نفس اليوم',
      color: 'bg-emerald-600',
    },
    {
      icon: Truck,
      title: locale === 'en' ? 'Free Delivery' : 'توصيل مجاني',
      description: locale === 'en' ? 'On orders over 200 SAR' : 'للطلبات فوق 200 ريال',
      color: 'bg-blue-600',
    },
    {
      icon: Gift,
      title: locale === 'en' ? 'Gift Wrapping' : 'تغليف الهدايا',
      description: locale === 'en' ? 'Complimentary luxury gift wrapping' : 'تغليف فاخر مجاني للهدايا',
      color: 'bg-purple-600',
    },
    {
      icon: Sparkles,
      title: locale === 'en' ? 'Fresh Guarantee' : 'ضمان النضارة',
      description: locale === 'en' ? '100% fresh flowers or your money back' : 'ورود طازجة 100% أو استرداد أموالك',
      color: 'bg-pink-600',
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            {locale === 'en' ? 'Why Choose Zeina?' : 'لماذا تختار Zeina?'}
          </h2>
          <p className="text-neutral-600 text-lg">
            {locale === 'en' ? 'Premium service for every occasion' : 'خدمة مميزة لكل مناسبة'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white border-2 border-black p-6 hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-16 h-16 ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
