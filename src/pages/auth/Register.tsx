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
  const [formData, setFormData] = useState({
    member_type: 'player' as MemberType,
    first_name: '',
    last_name: '',
    club_name: '',
    birth_date: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirm_password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateStep2 = () => {
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
    if (!formData.phone || formData.phone.length !== 9) {
      toast.error('رقم الجوال يجب أن يكون 9 أرقام')
      return false
    }
    if (!formData.city) {
      toast.error('المدينة مطلوبة')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return false
    }
    if (formData.password !== formData.confirm_password) {
      toast.error('كلمتا المرور غير متطابقتين')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 2 && !validateStep2()) return
    setStep((step + 1) as Step)
  }

  const handleBack = () => {
    setStep((step - 1) as Step)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
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

      if (data.user) {
        toast.success('تم التسجيل بنجاح! تحقق من بريدك الإلكتروني')
        navigate('/login')
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
          {step === 3 && 'كلمة المرور'}
        </h1>

        <form onSubmit={handleSubmit}>
          
          {/* Step 1: Choose Type */}
          {step === 1 && (
            <div className="space-y-4">
              {[
                { id: 'player', label: 'لاعب', desc: 'شارك في البطولات والدورات' },
                { id: 'coach', label: 'مدرب', desc: 'أنشئ دورات تدريبية' },
                { id: 'club', label: 'نادي/صالة', desc: 'نظم البطولات والعروض' }
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
                    {type.id === 'player' && '🎱'}
                    {type.id === 'coach' && '👨‍🏫'}
                    {type.id === 'club' && '🏢'}
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
                className="w-full p-3
