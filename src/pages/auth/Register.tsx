import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

type MemberType = 'player' | 'coach' | 'club'
type Step = 1 | 2 | 3

export function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    member_type: 'player' as MemberType,
    first_name: '',
    last_name: '',
    club_name: '',
    birth_date: '',
    email: '',
    phone: '',
    city: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const checkDuplicate = async () => {
    const { data: emailExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', formData.email)
      .single()
    
    if (emailExists) {
      toast.error('البريد الإلكتروني مسجل مسبقاً')
      return false
    }

    const { data: phoneExists } = await supabase
      .from('users')
      .select('id')
      .eq('phone', formData.phone)
      .single()
    
    if (phoneExists) {
      toast.error('رقم الجوال مسجل مسبقاً')
      return false
    }

    return true
  }

  const validateStep2 = async () => {
    if (formData.member_type === 'club') {
      if (!formData.club_name) {
        toast.error('اسم النادي مطلوب')
        return false
      }
    } else {
      if (!formData.first_name || !formData.last_name) {
        toast.error('الاسم الأول والأخير مطلوبين')
        return false
      }
      if (!formData.birth_date) {
        toast.error('تاريخ الميلاد مطلوب')
        return false
      }
      const age = new Date().getFullYear() - new Date(formData.birth_date).getFullYear()
      if (age < 18) {
        toast.error('يجب أن يكون عمرك 18 سنة على الأقل')
        return false
      }
    }
    if (!formData.email) {
      toast.error('البريد الإلكتروني مطلوب')
      return false
    }
    if (!formData.phone || formData.phone.length !== 9 || !formData.phone.startsWith('5')) {
      toast.error('رقم الجوال يجب أن يكون 9 أرقام ويبدأ بـ 5')
      return false
    }
    if (!formData.city) {
      toast.error('المدينة مطلوبة')
      return false
    }

    setLoading(true)
    const isUnique = await checkDuplicate()
    setLoading(false)
    
    return isUnique
  }

  const handleNext = async () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      const isValid = await validateStep2()
      if (isValid) setStep(3)
    }
  }

  const handleBack = () => {
    if (otpSent) {
      setOtpSent(false)
    } else {
      setStep((step - 1) as Step)
    }
  }

  const sendOtp = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          data: {
            member_type: formData.member_type,
            first_name: formData.member_type !== 'club' ? formData.first_name : null,
            last_name: formData.member_type !== 'club' ? formData.last_name : null,
            club_name: formData.member_type === 'club' ? formData.club_name : null,
            birth_date: formData.member_type !== 'club' ? formData.birth_date : null,
            phone: formData.phone,
            city: formData.city
          }
        }
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني')
      setOtpSent(true)
    } catch (err) {
      toast.error('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('رمز التحقق يجب أن يكون 6 أرقام')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otp,
        type: 'email'
      })

      if (error) {
        toast.error('رمز التحقق غير صحيح')
        return
      }

      toast.success('تم التسجيل بنجاح!')
      
      // توجيه حسب نوع العضوية
      if (formData.member_type === 'player') {
        navigate('/profile')
      } else {
        navigate('/upload-documents')
      }
    } catch (err) {
      toast.error('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const cities = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران', 'الطائف', 'تبوك', 'بريدة', 'أبها', 'خميس مشيط', 'حائل', 'نجران', 'جازان', 'ينبع', 'الجبيل', 'الأحساء', 'القطيف', 'أخرى']

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-8">
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-8 h-1 mx-1 ${step > s ? 'bg-green-600' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-6">
          {step === 1 && 'اختر نوع الحساب'}
          {step === 2 && 'البيانات الأساسية'}
          {step === 3 && (otpSent ? 'أدخل رمز التحقق' : 'تأكيد البريد الإلكتروني')}
        </h1>

        {/* Step 1: Choose Type */}
        {step === 1 && (
          <div className="space-y-4">
            {[
              { id: 'player', label: 'لاعب', desc: 'شارك في البطولات والدورات', icon: '🎱' },
              { id: 'coach', label: 'مدرب', desc: 'أنشئ دورات تدريبية', icon: '👨‍🏫' },
              { id: 'club', label: 'نادي/صالة', desc: 'نظم البطولات والعروض', icon: '🏢' }
            ].map((type) => (
              <label
                key={type.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer ${
                  formData.member_type === type.id
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="member_type"
                  value={type.id}
                  checked={formData.member_type === type.id}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  formData.member_type === type.id ? 'bg-green-600' : 'bg-gray-700'
                }`}>
                  {type.icon}
                </div>
                <div>
                  <p className="font-bold text-white">{type.label}</p>
                  <p className="text-sm text-gray-400">{type.desc}</p>
                </div>
              </label>
            ))}

            <button
              type="button"
              onClick={handleNext}
              className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium mt-6"
            >
              التالي ←
            </button>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <div className="space-y-4">
            {formData.member_type === 'club' ? (
              <input
                type="text"
                name="club_name"
                placeholder="اسم النادي أو الصالة"
                value={formData.club_name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="first_name"
                    placeholder="الاسم الأول"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    name="last_name"
                    placeholder="الاسم الأخير"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">تاريخ الميلاد</label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              dir="ltr"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />

            <input
              type="tel"
              name="phone"
              placeholder="رقم الجوال (5XXXXXXXX)"
              value={formData.phone}
              onChange={handleChange}
              maxLength={9}
              dir="ltr"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />

            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">اختر المدينة</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
              >
                → السابق
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex-1 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'جاري التحقق...' : 'التالي ←'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: OTP */}
        {step === 3 && (
          <div className="space-y-4">
            {!otpSent ? (
              <>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-300 mb-2">سيتم إرسال رمز تحقق إلى:</p>
                  <p className="text-white font-bold" dir="ltr">{formData.email}</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                  >
                    → السابق
                  </button>
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={loading}
                    className="flex-1 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'جاري الإرسال...' : 'إرسال الرمز'}
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={verifyOtp}>
                <div className="text-center mb-4">
                  <p className="text-gray-400">أدخل الرمز المرسل إلى</p>
                  <p className="text-white font-bold" dir="ltr">{formData.email}</p>
                </div>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl tracking-widest"
                  dir="ltr"
                />

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium mt-4 disabled:opacity-50"
                >
                  {loading ? 'جاري التحقق...' : 'تأكيد'}
                </button>

                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full p-3 text-gray-400 hover:text-white mt-2"
                >
                  ← رجوع
                </button>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full p-3 text-green-400 hover:text-green-300 mt-2"
                >
                  إعادة إرسال الرمز
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-center text-gray-400 mt-6">
          لديك حساب؟{' '}
          <Link to="/login" className="text-green-400 hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
