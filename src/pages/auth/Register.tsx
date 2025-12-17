import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    member_type: 'player'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirm_password) {
      toast.error('كلمتا المرور غير متطابقتين')
      return
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            city: formData.city,
            member_type: formData.member_type
          }
        }
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        toast.success('تم التسجيل بنجاح!')
        navigate('/login')
      }
    } catch (err) {
      toast.error('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-6">تسجيل حساب جديد</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="first_name"
              placeholder="الاسم الأول"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            <input
              type="text"
              name="last_name"
              placeholder="الاسم الأخير"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={handleChange}
            required
            dir="ltr"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />

          <input
            type="tel"
            name="phone"
            placeholder="رقم الجوال"
            value={formData.phone}
            onChange={handleChange}
            required
            dir="ltr"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />

          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="">اختر المدينة</option>
            <option value="الرياض">الرياض</option>
            <option value="جدة">جدة</option>
            <option value="مكة">مكة المكرمة</option>
            <option value="المدينة">المدينة المنورة</option>
            <option value="الدمام">الدمام</option>
            <option value="الخبر">الخبر</option>
            <option value="أخرى">أخرى</option>
          </select>

          <select
            name="member_type"
            value={formData.member_type}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="player">لاعب</option>
            <option value="coach">مدرب</option>
            <option value="club">نادي/صالة</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="كلمة المرور"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />

          <input
            type="password"
            name="confirm_password"
            placeholder="تأكيد كلمة المرور"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
          </button>
        </form>

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
