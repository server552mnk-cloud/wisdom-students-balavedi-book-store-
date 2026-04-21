"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Book } from '@/data/books';

interface CheckoutModalProps {
  book: Book;
  onClose: () => void;
}

export default function CheckoutModal({ book, onClose }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    place: '',
    district: '',
    state: '',
    pincode: '',
    mobileNumber: '',
    whatsappNumber: '',
  });
  const [isWhatsappSame, setIsWhatsappSame] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
      // If whatsapp is same as mobile and mobile is changing, update whatsapp too
      ...(isWhatsappSame && id === 'mobileNumber' ? { whatsappNumber: value } : {})
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsWhatsappSame(e.target.checked);
    if (e.target.checked) {
      setFormData((prev) => ({ ...prev, whatsappNumber: prev.mobileNumber }));
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobileNumber) {
      toast.error('Please fill in required details');
      return;
    }

    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      // Create order via backend
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: book.price,
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Book Store',
        description: `Purchase of ${book.title}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          const logToast = toast.loading('Logging order details...');
          
          try {
            const logRes = await fetch('/api/confirm-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'order',
                ...formData,
                bookTitle: book.title,
                amount: book.price,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                timestamp: new Date().toISOString()
              }),
            });

            if (!logRes.ok) throw new Error('Failed to log order');
            
            toast.success('Order Confirmed!', { id: logToast });
            onClose();
          } catch (error) {
            console.error(error);
            toast.error('Payment successful, but failed to log order.', { id: logToast });
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.mobileNumber,
        },
        theme: {
          color: '#1a1c2e', 
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      paymentObject.open();

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-[#f3f4f6] rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-gray-800 placeholder-gray-400";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto pt-20 pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 relative my-auto">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout Details</h2>
            <p className="text-gray-500 mt-2 font-medium">Please provide your details to complete the order.</p>
          </div>

          <div className="mb-8 p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-center md:items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={book.image} alt={book.title} className="w-16 h-20 object-cover rounded-xl shadow-sm" />
            <div className="text-center md:text-left">
              <h3 className="font-bold text-gray-900 text-lg">{book.title}</h3>
              <p className="text-indigo-600 font-extrabold text-xl mt-1">₹{book.price}</p>
            </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label htmlFor="fullName" className={labelClasses}>FULL NAME *</label>
              <input id="fullName" type="text" required value={formData.fullName} onChange={handleChange} className={inputClasses} placeholder="Enter your full name" />
            </div>

            <div>
              <label htmlFor="address" className={labelClasses}>ADDRESS *</label>
              <textarea id="address" required rows={3} value={formData.address} onChange={handleChange} className={`${inputClasses} resize-none`} placeholder="Enter your address" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="place" className={labelClasses}>PLACE *</label>
                <input id="place" type="text" required value={formData.place} onChange={handleChange} className={inputClasses} placeholder="Your place" />
              </div>
              <div>
                <label htmlFor="district" className={labelClasses}>DISTRICT *</label>
                <input id="district" type="text" required value={formData.district} onChange={handleChange} className={inputClasses} placeholder="Your district" />
              </div>
              <div>
                <label htmlFor="state" className={labelClasses}>STATE *</label>
                <input id="state" type="text" required value={formData.state} onChange={handleChange} className={inputClasses} placeholder="Your state" />
              </div>
              <div>
                <label htmlFor="pincode" className={labelClasses}>PIN CODE *</label>
                <input id="pincode" type="text" required value={formData.pincode} onChange={handleChange} className={inputClasses} placeholder="Your pin code" />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label htmlFor="mobileNumber" className={labelClasses}>MOBILE NUMBER *</label>
              <input id="mobileNumber" type="tel" required value={formData.mobileNumber} onChange={handleChange} className={inputClasses} placeholder="10-digit mobile number" />
            </div>

            <div>
              <label htmlFor="whatsappNumber" className={labelClasses}>WHATSAPP NUMBER *</label>
              <input id="whatsappNumber" type="tel" required value={formData.whatsappNumber} onChange={handleChange} disabled={isWhatsappSame} className={`${inputClasses} ${isWhatsappSame ? 'opacity-60 cursor-not-allowed bg-gray-200' : ''}`} placeholder="10-digit WhatsApp number" />
            </div>

            <div className="flex items-center gap-3 pt-1 pb-4">
              <input 
                type="checkbox" 
                id="sameAsMobile" 
                checked={isWhatsappSame} 
                onChange={handleCheckboxChange}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
              />
              <label htmlFor="sameAsMobile" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                WhatsApp number is the same as phone number
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-6 bg-[#1a1c2e] hover:bg-black text-white font-bold text-lg rounded-2xl shadow-xl shadow-[#1a1c2e]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-6"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                `Pay ₹${book.price}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
