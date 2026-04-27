'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CreditCard, MapPin, User, Mail, Phone, Check, Tag, X, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Price from '@/components/Price';
import BasicMapPicker from '@/components/BasicMapPicker';
import { useCartStore } from '@/lib/cartStore';
import { useUserStore } from '@/lib/userStore';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

export default function CheckoutPage() {
  const locale = useLocale() as 'en' | 'ar';
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { profile, isLoggedIn } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [useProfileData, setUseProfileData] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<any>(null);
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [autoAppliedPromo, setAutoAppliedPromo] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    // Gift fields
    isGift: false,
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    giftMessage: '',
    senderName: '',
  });

  // Load profile data when checkbox is checked
  useEffect(() => {
    if (useProfileData && profile) {
      // Parse name into firstName and lastName if needed
      let firstName = profile.firstName || '';
      let lastName = profile.lastName || '';
      
      // If we only have a single name field (from Google OAuth), split it
      if (!firstName && !lastName && profile.name) {
        const nameParts = profile.name.trim().split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      setFormData(prev => ({
        ...prev,
        firstName: firstName,
        lastName: lastName,
        email: profile.email || '',
        phone: profile.phone || '',
        street: profile.address?.street || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        postalCode: profile.address?.postalCode || '',
      }));
    }
  }, [useProfileData, profile]);

  // Calculate subtotal
  const subtotal = getTotalPrice();

  // Auto-apply promo codes on load
  useEffect(() => {
    checkAutoApplyPromoCodes();
  }, [subtotal]);

  const checkAutoApplyPromoCodes = async () => {
    if (subtotal <= 0) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promo-codes/auto-apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtotal: subtotal,
          items: items.map(item => ({
            product_id: item.productId || (item as any).id,
            quantity: item.quantity,
            price: item.price
          })),
          user_id: profile?.id,
          user_email: formData.email || profile?.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && !appliedPromoCode) {
          setAutoAppliedPromo(data.data.promo_code);
          setDiscount(data.data.discount_amount);
        }
      }
    } catch (error) {
      console.error('Auto-apply promo code error:', error);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setPromoCodeLoading(true);
    setPromoCodeError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promo-codes/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          subtotal: subtotal,
          items: items.map(item => ({
            product_id: item.productId || (item as any).id,
            quantity: item.quantity,
            price: item.price
          })),
          user_id: profile?.id,
          user_email: formData.email || profile?.email
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppliedPromoCode(data.data.promo_code);
        setDiscount(data.data.discount_amount);
        setAutoAppliedPromo(null); // Remove auto-applied if manual code is applied
        setPromoCode('');
      } else {
        setPromoCodeError(data.message || (locale === 'en' ? 'Invalid promo code' : 'رمز ترويجي غير صالح'));
      }
    } catch (error) {
      setPromoCodeError(locale === 'en' ? 'Failed to apply promo code' : 'فشل في تطبيق الرمز الترويجي');
    } finally {
      setPromoCodeLoading(false);
    }
  };



  const removePromoCode = () => {
    setAppliedPromoCode(null);
    setAutoAppliedPromo(null);
    setDiscount(0);
    setPromoCode('');
    setPromoCodeError('');
    // Re-check for auto-apply codes
    checkAutoApplyPromoCodes();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocationSelect = (location: Location) => {
    setFormData(prev => ({
      ...prev,
      street: location.address,
    }));
  };

  const shipping = 10.00;
  const tax = subtotal * 0.1;
  const totalBeforeDiscount = subtotal + shipping + tax;
  const grandTotal = Math.max(0, totalBeforeDiscount - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Show immediate feedback
    const processingToast = document.createElement('div');
    processingToast.className = 'fixed top-4 right-4 bg-primary text-white px-6 py-3 z-50 animate-slide-in-right';
    processingToast.textContent = locale === 'en' ? 'Processing your order...' : 'جاري معالجة طلبك...';
    document.body.appendChild(processingToast);

    try {
      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
          !formData.street || !formData.city || !formData.postalCode) {
        alert(locale === 'en' ? 'Please fill in all required fields' : 'يرجى ملء جميع الحقول المطلوبة');
        setIsProcessing(false);
        return;
      }

      // Prepare order data
      const activePromo = appliedPromoCode || autoAppliedPromo;
      const orderPayload = {
        items: items.map(item => {
          // Ensure product_id is set (handle both productId and id fields)
          const productId = item.productId || (item as any).id;
          if (!productId) {
            console.error('Item missing productId:', item);
          }
          return {
            product_id: productId,
            quantity: item.quantity,
            price: item.price,
          };
        }),
        total: grandTotal,
        subtotal: subtotal,
        discount_amount: discount,
        promo_code: activePromo?.code || null,
        shipping_name: `${formData.firstName} ${formData.lastName}`,
        shipping_email: formData.email,
        shipping_phone: formData.phone,
        shipping_address: formData.street,
        shipping_city: formData.city,
        shipping_postal_code: formData.postalCode,
        shipping_country: 'Saudi Arabia',
      };

      console.log('Submitting order:', orderPayload);
      console.log('Cart items:', items);

      // Submit order to backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      console.log('API URL:', apiUrl);
      
      // Get auth token if user is logged in
      const token = localStorage.getItem('auth_token');
      console.log('🔑 Auth token found:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      console.log('👤 User logged in:', isLoggedIn);
      console.log('👤 User profile:', profile);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Authorization header added');
      } else {
        console.log('⚠️ No token - placing order as guest');
      }
      
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Order creation failed:', errorData);
        console.error('Validation errors:', errorData.errors);
        
        // Show specific validation errors
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Order created successfully:', result);
      
      // Remove processing toast
      const toasts = document.querySelectorAll('.fixed.top-4.right-4');
      toasts.forEach(toast => toast.remove());
      
      // Clear cart immediately for faster UX
      clearCart();
      
      // Redirect immediately with order data in URL
      const orderData = encodeURIComponent(JSON.stringify({
        orderNumber: result.order.order_number,
        total: grandTotal,
        items: items.length,
      }));
      
      router.push(`/${locale}/order-confirmation?data=${orderData}`);
    } catch (error) {
      console.error('Order submission error:', error);
      
      // Remove processing toast
      const toasts = document.querySelectorAll('.fixed.top-4.right-4');
      toasts.forEach(toast => toast.remove());
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(
        locale === 'en' 
          ? `Failed to place order: ${errorMessage}\n\nPlease check the browser console for details.` 
          : `فشل تقديم الطلب: ${errorMessage}\n\nيرجى التحقق من وحدة تحكم المتصفح للحصول على التفاصيل.`
      );
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Header /> */}
        <main className="flex-1 py-20 bg-neutral-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">
              {locale === 'en' ? 'Your cart is empty' : 'سلتك فارغة'}
            </h1>
            <p className="text-neutral-600 mb-8">
              {locale === 'en' 
                ? 'Add some items to your cart before checking out'
                : 'أضف بعض العناصر إلى سلتك قبل الدفع'}
            </p>
            <a
              href={`/${locale}/products`}
              className="inline-block px-8 py-4 bg-primary text-white hover:bg-primary-dark transition-colors font-medium"
            >
              {locale === 'en' ? 'Shop Now' : 'تسوق الآن'}
            </a>
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
          <h1 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight">
            {locale === 'en' ? 'Checkout' : 'الدفع'}
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Demo Profile Setup (for testing) */}
                {!isLoggedIn && (
                  <div className="bg-neutral-100 border border-neutral-300 p-4">
                    <p className="text-sm text-neutral-600 mb-3">
                      {locale === 'en' 
                        ? 'Demo: Click below to load sample profile data' 
                        : 'تجريبي: انقر أدناه لتحميل بيانات الملف الشخصي النموذجية'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const demoProfile = {
                          firstName: 'John',
                          lastName: 'Doe',
                          email: 'john.doe@example.com',
                          phone: '+1 (555) 123-4567',
                          address: {
                            street: '123 Main Street',
                            city: 'New York',
                            state: 'NY',
                            postalCode: '10001',
                            country: 'USA',
                          },
                        };
                        useUserStore.getState().login(demoProfile);
                      }}
                      className="px-4 py-2 bg-secondary text-white hover:bg-secondary-dark transition-colors text-sm font-medium"
                    >
                      {locale === 'en' ? 'Load Demo Profile' : 'تحميل الملف التجريبي'}
                    </button>
                  </div>
                )}

                {/* Use Profile Data Option */}
                {isLoggedIn && profile && (
                  <div className="bg-primary/5 border border-primary/20 p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useProfileData}
                        onChange={(e) => setUseProfileData(e.target.checked)}
                        className="w-5 h-5 text-primary border-neutral-300 focus:ring-primary"
                      />
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" />
                        <span className="font-medium">
                          {locale === 'en' 
                            ? 'Use my saved profile information' 
                            : 'استخدام معلومات ملفي الشخصي المحفوظة'}
                        </span>
                      </div>
                    </label>
                    <p className="text-sm text-neutral-600 mt-2 ml-8">
                      {locale === 'en'
                        ? `${profile.name || `${profile.firstName} ${profile.lastName}`.trim()} • ${profile.email}`
                        : `${profile.name || `${profile.firstName} ${profile.lastName}`.trim()} • ${profile.email}`}
                    </p>
                  </div>
                )}

                {/* Contact Information */}
                <div className="bg-white border border-neutral-200 p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <User className="w-6 h-6" />
                    {locale === 'en' ? 'Contact Information' : 'معلومات الاتصال'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {locale === 'en' ? 'First Name' : 'الاسم الأول'}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {locale === 'en' ? 'Last Name' : 'اسم العائلة'}
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        {locale === 'en' ? 'Email' : 'البريد الإلكتروني'}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        {locale === 'en' ? 'Phone' : 'الهاتف'}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white border border-neutral-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <MapPin className="w-6 h-6" />
                      {locale === 'en' ? 'Shipping Address' : 'عنوان الشحن'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(!showMapPicker)}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      <MapPin className="w-4 h-4" />
                      {showMapPicker 
                        ? (locale === 'en' ? 'Hide Map' : 'إخفاء الخريطة')
                        : (locale === 'en' ? 'Use Map' : 'استخدم الخريطة')
                      }
                    </button>
                  </div>

                  {/* OpenStreetMap Picker */}
                  {showMapPicker && (
                    <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <h3 className="text-lg font-medium mb-4 text-neutral-900">
                        {locale === 'en' ? 'Select Delivery Location' : 'اختر موقع التوصيل'}
                      </h3>
                      <div className="relative z-0">
                        <BasicMapPicker
                          onLocationSelect={handleLocationSelect}
                          locale={locale}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {locale === 'en' ? 'Street Address' : 'عنوان الشارع'}
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {locale === 'en' ? 'City' : 'المدينة'}
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {locale === 'en' ? 'State/Province' : 'الولاية/المحافظة'}
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {locale === 'en' ? 'Postal Code' : 'الرمز البريدي'}
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white border border-neutral-200 p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="w-6 h-6" />
                    {locale === 'en' ? 'Payment Information' : 'معلومات الدفع'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {locale === 'en' ? 'Card Number' : 'رقم البطاقة'}
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        required
                        className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {locale === 'en' ? 'Expiry Date' : 'تاريخ الانتهاء'}
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          required
                          className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {locale === 'en' ? 'CVV' : 'رمز الأمان'}
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          required
                          className="w-full px-4 py-3 border border-neutral-300 focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-neutral-200 p-6 sticky top-24">
                  <h2 className="text-2xl font-bold mb-6">
                    {locale === 'en' ? 'Order Summary' : 'ملخص الطلب'}
                  </h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-sm text-neutral-600">
                            {item.quantity} × <Price amount={item.price} className="inline" />
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Section */}
                  <div className="border-t pt-4 mb-4">
                    {!appliedPromoCode && !autoAppliedPromo ? (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium">
                          {locale === 'en' ? 'Promo Code' : 'الرمز الترويجي'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            placeholder={locale === 'en' ? 'Enter promo code' : 'أدخل الرمز الترويجي'}
                            className="flex-1 px-3 py-2 border border-neutral-300 focus:border-primary focus:outline-none transition-colors text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                          />
                          <button
                            type="button"
                            onClick={applyPromoCode}
                            disabled={promoCodeLoading || !promoCode.trim()}
                            className="px-4 py-2 bg-primary text-white hover:bg-primary-dark transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                          >
                            {promoCodeLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Tag className="w-4 h-4" />
                            )}
                            {locale === 'en' ? 'Apply' : 'تطبيق'}
                          </button>
                        </div>
                        {promoCodeError && (
                          <p className="text-red-600 text-sm">{promoCodeError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              {(appliedPromoCode || autoAppliedPromo)?.code}
                            </span>
                            {autoAppliedPromo && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {locale === 'en' ? 'Auto Applied' : 'تطبيق تلقائي'}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={removePromoCode}
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          {(appliedPromoCode || autoAppliedPromo)?.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between text-neutral-600">
                      <span>{locale === 'en' ? 'Subtotal' : 'المجموع الفرعي'}</span>
                      <Price amount={subtotal} />
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>{locale === 'en' ? 'Shipping' : 'الشحن'}</span>
                      <Price amount={shipping} />
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>{locale === 'en' ? 'Tax' : 'الضريبة'}</span>
                      <Price amount={tax} />
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {locale === 'en' ? 'Discount' : 'الخصم'}
                        </span>
                        <span>-<Price amount={discount} /></span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between text-2xl font-bold">
                      <span>{locale === 'en' ? 'Total' : 'المجموع'}</span>
                      <Price amount={grandTotal} className="text-2xl font-bold" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-6 py-4 bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                  >
                    {isProcessing
                      ? (locale === 'en' ? 'Processing...' : 'جاري المعالجة...')
                      : (locale === 'en' ? 'Place Order' : 'تأكيد الطلب')}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
