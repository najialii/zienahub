'use client';

import { useLocale } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, Award, Truck, Shield, Users, Star } from 'lucide-react';

export default function AboutPage() {
  const locale = useLocale();

  const features = [
    {
      icon: Heart,
      title: locale === 'ar' ? 'شغف بالجودة' : 'Passion for Quality',
      description: locale === 'ar' 
        ? 'نختار بعناية أجود المنتجات والزهور الطازجة لضمان رضاكم التام'
        : 'We carefully select the finest products and fresh flowers to ensure your complete satisfaction'
    },
    {
      icon: Award,
      title: locale === 'ar' ? 'خبرة واسعة' : 'Extensive Experience',
      description: locale === 'ar'
        ? 'أكثر من 10 سنوات من الخبرة في مجال الهدايا والزهور'
        : 'Over 10 years of experience in gifts and flowers industry'
    },
    {
      icon: Truck,
      title: locale === 'ar' ? 'توصيل سريع' : 'Fast Delivery',
      description: locale === 'ar'
        ? 'خدمة توصيل سريعة وموثوقة في جميع أنحاء المملكة'
        : 'Fast and reliable delivery service across the Kingdom'
    },
    {
      icon: Shield,
      title: locale === 'ar' ? 'ضمان الجودة' : 'Quality Guarantee',
      description: locale === 'ar'
        ? 'نضمن جودة منتجاتنا مع إمكانية الاستبدال أو الاسترداد'
        : 'We guarantee the quality of our products with exchange or refund options'
    }
  ];

  const stats = [
    { number: '50K+', label: locale === 'ar' ? 'عميل سعيد' : 'Happy Customers' },
    { number: '100K+', label: locale === 'ar' ? 'طلب مكتمل' : 'Orders Completed' },
    { number: '500+', label: locale === 'ar' ? 'منتج متنوع' : 'Products Available' },
    { number: '24/7', label: locale === 'ar' ? 'دعم العملاء' : 'Customer Support' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-black text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-2xl md:text-3xl font-light mb-3 tracking-tight">
                {locale === 'ar' ? 'من نحن' : 'About Zeina'}
              </h1>
              <p className="text-sm md:text-base text-neutral-300 leading-relaxed">
                {locale === 'ar'
                  ? 'نحن منصة إلكترونية رائدة متخصصة في تقديم أجمل الهدايا والزهور لجميع المناسبات الخاصة'
                  : 'We are a leading e-commerce platform specializing in beautiful gifts and flowers for all special occasions'}
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-light text-neutral-900 mb-4">
                  {locale === 'ar' ? 'قصتنا' : 'Our Story'}
                </h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {locale === 'ar'
                    ? 'بدأت رحلتنا في عام 2014 بحلم بسيط: جعل اللحظات الخاصة أكثر جمالاً وإشراقاً. من متجر صغير في الرياض إلى منصة إلكترونية تخدم جميع أنحاء المملكة العربية السعودية.'
                    : 'Our journey began in 2014 with a simple dream: to make special moments more beautiful and bright. From a small shop in Riyadh to an e-commerce platform serving all of Saudi Arabia.'}
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {locale === 'ar'
                    ? 'نؤمن بأن كل مناسبة تستحق لمسة خاصة، ولهذا نقدم مجموعة متنوعة من الهدايا المميزة والزهور الطازجة التي تعبر عن مشاعركم الصادقة.'
                    : 'We believe every occasion deserves a special touch, which is why we offer a diverse collection of unique gifts and fresh flowers that express your genuine feelings.'}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-neutral-600 text-xs">
                    {locale === 'ar' ? 'تقييم 4.9 من 5 نجوم' : '4.9 out of 5 stars rating'}
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="w-16 h-16 text-neutral-400 mx-auto mb-2" />
                    <p className="text-neutral-500 text-sm">
                      {locale === 'ar' ? 'صورة تعبر عن قصتنا' : 'Image representing our story'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-light text-neutral-900 mb-3">
                {locale === 'ar' ? 'لماذا نحن مميزون' : 'Why We\'re Special'}
              </h2>
              <p className="text-sm text-neutral-600 max-w-2xl mx-auto">
                {locale === 'ar'
                  ? 'نسعى دائماً لتقديم أفضل تجربة تسوق ممكنة من خلال الجودة العالية والخدمة المتميزة'
                  : 'We always strive to provide the best possible shopping experience through high quality and exceptional service'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-xs">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-neutral-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-light mb-3">
                {locale === 'ar' ? 'إنجازاتنا بالأرقام' : 'Our Achievements in Numbers'}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-light mb-1 text-white">
                    {stat.number}
                  </div>
                  <div className="text-neutral-300 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-xl md:text-2xl font-light text-neutral-900 mb-4">
                {locale === 'ar' ? 'رسالتنا' : 'Our Mission'}
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                {locale === 'ar'
                  ? 'نسعى لجعل كل لحظة خاصة أكثر جمالاً من خلال تقديم أجود الهدايا والزهور، مع خدمة عملاء استثنائية تفوق توقعاتكم في كل مرة.'
                  : 'We strive to make every special moment more beautiful by providing the finest gifts and flowers, with exceptional customer service that exceeds your expectations every time.'}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-600 text-xs">
                  {locale === 'ar' ? 'فريق من 50+ خبير' : 'Team of 50+ experts'}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}