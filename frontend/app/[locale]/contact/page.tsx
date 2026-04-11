'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Headphones } from 'lucide-react';

export default function ContactPage() {
  const locale = useLocale();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert(locale === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: locale === 'ar' ? 'اتصل بنا' : 'Call Us',
      details: ['+966 11 234 5678', '+966 50 123 4567'],
      description: locale === 'ar' ? 'متاح 24/7 لخدمتكم' : 'Available 24/7 to serve you'
    },
    {
      icon: Mail,
      title: locale === 'ar' ? 'راسلنا' : 'Email Us',
      details: ['info@zeina.sa', 'support@zeina.sa'],
      description: locale === 'ar' ? 'نرد خلال ساعتين' : 'We reply within 2 hours'
    },
    {
      icon: MapPin,
      title: locale === 'ar' ? 'زورنا' : 'Visit Us',
      details: [locale === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'],
      description: locale === 'ar' ? 'شارع الملك فهد، حي العليا' : 'King Fahd Road, Al Olaya District'
    },
    {
      icon: Clock,
      title: locale === 'ar' ? 'ساعات العمل' : 'Working Hours',
      details: [locale === 'ar' ? 'السبت - الخميس: 9:00 - 22:00' : 'Sat - Thu: 9:00 AM - 10:00 PM'],
      description: locale === 'ar' ? 'الجمعة: 14:00 - 22:00' : 'Friday: 2:00 PM - 10:00 PM'
    }
  ];

  const supportChannels = [
    {
      icon: MessageCircle,
      title: locale === 'ar' ? 'الدردشة المباشرة' : 'Live Chat',
      description: locale === 'ar' ? 'تحدث معنا مباشرة' : 'Chat with us directly',
      action: locale === 'ar' ? 'ابدأ المحادثة' : 'Start Chat',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: Phone,
      title: locale === 'ar' ? 'اتصال مباشر' : 'Direct Call',
      description: locale === 'ar' ? 'اتصل بنا الآن' : 'Call us now',
      action: locale === 'ar' ? 'اتصل الآن' : 'Call Now',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Headphones,
      title: locale === 'ar' ? 'الدعم الفني' : 'Technical Support',
      description: locale === 'ar' ? 'مساعدة تقنية متخصصة' : 'Specialized technical help',
      action: locale === 'ar' ? 'احصل على المساعدة' : 'Get Help',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
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
                {locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
              </h1>
              <p className="text-sm md:text-base text-neutral-300 leading-relaxed">
                {locale === 'ar'
                  ? 'نحن هنا لمساعدتك في أي وقت. تواصل معنا وسنكون سعداء بخدمتك'
                  : 'We\'re here to help you anytime. Contact us and we\'ll be happy to serve you'}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-neutral-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-3">
                    {info.title}
                  </h3>
                  <div className="space-y-1 mb-3">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-neutral-700 font-medium text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                  <p className="text-neutral-600 text-xs">
                    {info.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Support Channels */}
        <section className="py-12 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-light text-neutral-900 mb-6">
                  {locale === 'ar' ? 'أرسل لنا رسالة' : 'Send us a Message'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        {locale === 'ar' ? 'الاسم' : 'Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 transition-colors"
                        placeholder={locale === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 transition-colors"
                        placeholder={locale === 'ar' ? '+966 5X XXX XXXX' : '+966 5X XXX XXXX'}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 transition-colors"
                      placeholder={locale === 'ar' ? 'your@email.com' : 'your@email.com'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {locale === 'ar' ? 'الموضوع' : 'Subject'}
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 transition-colors"
                    >
                      <option value="">
                        {locale === 'ar' ? 'اختر الموضوع' : 'Select Subject'}
                      </option>
                      <option value="general">
                        {locale === 'ar' ? 'استفسار عام' : 'General Inquiry'}
                      </option>
                      <option value="order">
                        {locale === 'ar' ? 'استفسار عن طلب' : 'Order Inquiry'}
                      </option>
                      <option value="complaint">
                        {locale === 'ar' ? 'شكوى' : 'Complaint'}
                      </option>
                      <option value="suggestion">
                        {locale === 'ar' ? 'اقتراح' : 'Suggestion'}
                      </option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {locale === 'ar' ? 'الرسالة' : 'Message'}
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                      placeholder={locale === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-neutral-900 text-white py-4 px-6 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {locale === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {locale === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Support Channels */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-light text-neutral-900 mb-6">
                    {locale === 'ar' ? 'طرق التواصل السريع' : 'Quick Contact Methods'}
                  </h2>
                  <p className="text-neutral-600 text-sm mb-6">
                    {locale === 'ar'
                      ? 'اختر الطريقة الأنسب للتواصل معنا والحصول على المساعدة الفورية'
                      : 'Choose the most convenient way to contact us and get immediate assistance'}
                  </p>
                </div>

                <div className="space-y-4">
                  {supportChannels.map((channel, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${channel.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <channel.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-neutral-900 mb-1">
                            {channel.title}
                          </h3>
                          <p className="text-neutral-600 mb-3 text-sm">
                            {channel.description}
                          </p>
                          <button className={`${channel.color} text-white px-4 py-1.5 rounded text-xs font-medium`}>
                            {channel.action}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FAQ Link */}
                <div className="bg-gradient-to-r from-neutral-900 to-neutral-700 text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">
                    {locale === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
                  </h3>
                  <p className="text-neutral-300 mb-4 text-sm">
                    {locale === 'ar'
                      ? 'ربما تجد إجابة سؤالك في قسم الأسئلة الشائعة'
                      : 'You might find the answer to your question in our FAQ section'}
                  </p>
                  <button className="bg-white text-neutral-900 px-4 py-2 rounded text-sm hover:bg-neutral-100 transition-colors font-medium">
                    {locale === 'ar' ? 'تصفح الأسئلة الشائعة' : 'Browse FAQ'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}