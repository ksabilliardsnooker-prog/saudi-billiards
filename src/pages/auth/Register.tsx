import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  Button, Input, Select, Card, CardHeader, CardTitle, 
  CardDescription, CardContent, PasswordStrength 
} from '../../components/ui'
import { 
  SAUDI_CITIES, validateEmailDomain, validateSaudiPhone, 
  validateAge, validatePassword 
} from '../../lib/utils'
import type { MemberType } from '../../types'
import toast from 'react-hot-toast'
import { User, GraduationCap, Building2, ArrowRight, ArrowLeft, Check } from 'lucide-react'

type Step = 1 | 2 | 3

interface FormData {
  member_type: MemberType
  first_name: string
  last_name: string
  club_name: string
  email: string
  phone: string
  city: string
  birth_date: string
  password: string
  confirm_password: string
  terms_accepted: boolean
}

const initialFormData: FormData = {
  member_type: 'player',
  first_name: '',
  last_name: '',
  club_name: '',
  email: '',
  phone: '',
  city: '',
  birth_date: '',
  password: '',
  confirm_password: '',
  terms_accepted: false
}

export function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signUp } = useAuth()
  
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Set member type from URL params
  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'coach' || type === 'club') {
      setFormData(prev => ({ ...prev, member_type: type }))
    }
  }, [searchParams])

  const memberTypes = [
    { 
      id: 'player' as MemberType, 
      label: 'لاعب', 
      description: 'شارك في البطولات وتصفح الدورات',
      icon: User 
    },
    { 
      id: 'coach' as MemberType, 
      label: 'مدرب', 
      description: 'أنشئ دورات تدريبية واستقبل المتدربين',
      icon: GraduationCap 
    },
    { 
      id: 'club' as MemberType, 
      label: 'نادي/صالة', 
      description: 'نظم البطولات وأدر صالتك',
      icon: Building2 
    }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep1 = () => {
    return !!formData.member_type
  }

  const validateStep2 = async () => {
    const newErrors: Record<string, string> = {}

    // For club: validate club_name
    if (formData.member_type === 'club') {
      if (!formData.club_name.trim()) {
        newErrors.club_name = 'اسم النادي مطلوب'
      }
    } else {
      // For player/coach: validate first_name, last_name, birth_date
      if (!formData.first_name.trim()) {
        newErrors.first_name = 'الاسم الأول مطلوب'
      }
      if (!formData.last_name.trim()) {
        newErrors.last_name = 'الاسم الأخير مطلوب'
      }
      if (!formData.birth_date) {
        newErrors.birth_date = 'تاريخ الميلاد مطلوب'
      } else if (!validateAge(new Date(formData.birth_date))) {
        newErrors.birth_date = 'يجب أن يكون عمرك 18 سنة على الأقل'
      }
    }

    // Common validations
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    } else if (!validateEmailDomain(formData.email)) {
      newErrors.email = 'نطاق البريد غير مدعوم'
    }

    if (!formData.phone) {
      newErrors.phone = 'رقم الجوال مطلوب'
    } else if (!validateSaudiPhone(formData.phone)) {
      newErrors.phone = 'رقم الجوال يجب أن يكون 9 أرقام ويبدأ بـ 5'
    }

    if (!formData.city) {
      newErrors.city = 'المدينة مطلوبة'
    }

    // Check for duplicate email/phone if no errors so far
    if (!newErrors.email) {
      const { data: emailExists } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email)
        .single()
      
      if (emailExists) {
        newErrors.email = 'البريد الإلكتروني مستخدم مسبقاً'
      }
    }

    if (!newErrors.phone) {
      const { data: phoneExists } = await supabase
        .from('users')
        .select('id')
        .eq('phone', formData.phone)
        .single()
      
      if (phoneExists) {
        newErrors.phone = 'رقم الجوال مستخدم مسبقاً'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0]
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'كلمتا المرور غير متطابقتين'
    }

    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'يجب الموافقة على الشروط والأحكام'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2) {
      setLoading(true)
      const isValid = await validateStep2()
      setLoading(false)
      if (isValid) setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep3()) return

    setLoading(true)

    try {
      // Create auth user
      const { error } = await signUp(formData.email, formData.password, {
        member_type: formData.member_type,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        club_name: formData.club_name || null,
        phone: formData.phone,
        city: formData.city,
        birth_date: formData.birth_date || null
      })

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('البريد الإلكتروني مستخدم مسبقاً')
        } else {
          toast.error('حدث خطأ في التسجيل')
        }
        return
      }

      toast.success('تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني')
      navigate('/verify-otp', { state: { email: formData.email } })
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                step >= s 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-dark-800 text-dark-500'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 mx-1 rounded transition-colors ${
                  step > s ? 'bg-primary-600' : 'bg-dark-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {step === 1 && 'اختر نوع الحساب'}
              {step === 2 && 'البيانات الأساسية'}
              {step === 3 && 'كلمة المرور'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'حدد نوع العضوية المناسب لك'}
              {step === 2 && 'أدخل معلوماتك الشخصية'}
              {step === 3 && 'أنشئ كلمة مرور قوية'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Choose Type */}
              {step === 1 && (
                <div className="space-y-4">
                  {memberTypes.map((type) => (
                    <label
                      key={type.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.member_type === type.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-700 hover:border-dark-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="member_type"
                        value={type.id}
                        checked={formData.member_type === type.id}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        formData.member_type === type.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-800 text-dark-400'
                      }`}>
                        <type.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{type.label}</p>
                        <p className="text-sm text-dark-400">{type.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        formData.member_type === type.id
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-dark-600'
                      }`}>
                        {formData.member_type === type.id && (
                          <Check className="w-full h-full text-white p-0.5" />
                        )}
                      </div>
                    </label>
                  ))}

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full mt-6"
                  >
                    التالي
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Basic Info */}
              {step === 2 && (
                <div className="space-y-4">
                  {formData.member_type === 'club' ? (
                    <Input
                      label="اسم النادي أو الصالة"
                      name="club_name"
                      value={formData.club_name}
                      onChange={handleChange}
                      error={errors.club_name}
                      placeholder="مثال: صالة النخيل للبلياردو"
                    />
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="الاسم الأول"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          error={errors.first_name}
                          placeholder="محمد"
                        />
                        <Input
                          label="الاسم الأخير"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          error={errors.last_name}
                          placeholder="العبدالله"
                        />
                      </div>
                      <Input
                        label="تاريخ الميلاد"
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                        error={errors.birth_date}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      />
                    </>
                  )}

                  <Input
                    label="البريد الإلكتروني"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="example@gmail.com"
                    dir="ltr"
                  />

                  <Input
                    label="رقم الجوال"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="5XXXXXXXX"
                    dir="ltr"
                    hint="9 أرقام تبدأ بـ 5"
                  />

                  <Select
                    label="المدينة"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    error={errors.city}
                    placeholder="اختر المدينة"
                    options={SAUDI_CITIES.map(city => ({ value: city, label: city }))}
                  />

                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      <ArrowRight className="w-4 h-4" />
                      السابق
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      loading={loading}
                      className="flex-1"
                    >
                      التالي
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Password */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Input
                      label="كلمة المرور"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      placeholder="••••••••"
                    />
                    <PasswordStrength password={formData.password} />
                  </div>

                  <Input
                    label="تأكيد كلمة المرور"
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    error={errors.confirm_password}
                    placeholder="••••••••"
                  />

                  <div className="bg-dark-800/50 rounded-lg p-4">
                    <p className="text-sm text-dark-400 mb-2">متطلبات كلمة المرور:</p>
                    <ul className="text-sm space-y-1">
                      <li className={formData.password.length >= 8 ? 'text-green-400' : 'text-dark-500'}>
                        ✓ 8 أحرف على الأقل
                      </li>
                      <li className={/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-dark-500'}>
                        ✓ حرف كبير واحد على الأقل
                      </li>
                      <li className={/[a-z]/.test(formData.password) ? 'text-green-400' : 'text-dark-500'}>
                        ✓ حرف صغير واحد على الأقل
                      </li>
                      <li className={/[0-9]/.test(formData.password) ? 'text-green-400' : 'text-dark-500'}>
                        ✓ رقم واحد على الأقل
                      </li>
                    </ul>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleChange}
                      className="w-5 h-5 mt-0.5 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-300">
                      أوافق على{' '}
                      <Link to="/terms" className="text-primary-400 hover:underline">
                        الشروط والأحكام
                      </Link>
                      {' '}و{' '}
                      <Link to="/privacy" className="text-primary-400 hover:underline">
                        سياسة الخصوصية
                      </Link>
                    </span>
                  </label>
                  {errors.terms_accepted && (
                    <p className="error-text">{errors.terms_accepted}</p>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      <ArrowRight className="w-4 h-4" />
                      السابق
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                      className="flex-1"
                    >
                      إنشاء الحساب
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-dark-400">
                لديك حساب بالفعل؟{' '}
                <Link
                  to="/login"
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
