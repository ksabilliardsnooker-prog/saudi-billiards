import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const checkEmailExists = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, account_status, member_type')
      .eq('email', email)
      .single()
    
    return data
  }

  const sendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!email) {
      toast.error('أدخل البريد الإلكتروني')
      return
    }

    setLoading(true)
    try {
      const user = await checkEmailExists()
      
      if (!user) {
        toast.error('البريد الإلكتروني غير مسجل. سجل حساب جديد')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('تم إرسال رمز الدخول إلى بريدك الإلكتروني')
      setOtpSent(true)
      setCountdown(60)
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

    if (countdown === 0) {
      toast.error('انتهت صلاحية الرمز، أعد الإرسال')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      })

      if (error) {
        toast.error('رمز التحقق غير صحيح')
        return
      }

      const user = await checkEmailExists()
      
      if (!user) {
        navigate('/')
        return
      }

      toast.success('تم تسجيل الدخول بنجاح!')

      if (user.member_type === 'player') {
        navigate('/')
      } else {
        switch (user.account_status) {
          case 'pending':
            navigate('/upload-documents')
            break
          case 'under_review':
            navigate('/pending-review')
            break
          case 'returned':
            navigate('/upload-documents')
            break
          case 'approved':
          case 'active':
            navigate('/')
            break
          case 'rejected':
            navigate('/account-rejected')
            break
          case 'suspended':
            navigate('/account-suspended')
            break
          default:
            navigate('/')
        }
      }
    } catch (err) {
      toast.error('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setOtpSent(false)
    setOtp('')
    setCountdown(0)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-8">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎱</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {otpSent ? 'أدخل رمز الدخول' : 'تسجيل الدخول'}
          </h1>
          <p className="text-gray-400 mt-2">
            {otpSent ? 'تم إرسال رمز إلى بريدك الإلكتروني' : 'أدخل بريدك الإلكتروني للدخول'}
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                dir="ltr"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رمز الدخول'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div className="text-center p-4 bg-gray-700 rounded-lg mb-4">
              <p className="text-gray-300 text-sm">تم الإرسال إلى:</p>
              <p className="text-white font-bold" dir="ltr">{email}</p>
            </div>

            {/* Countdown Timer */}
            <div className="text-center mb-4">
              {countdown > 0 ? (
                <p className="text-yellow-400 text-lg">
                  ⏱️ صلاحية الرمز: {formatTime(countdown)}
                </p>
              ) : (
                <p className="text-red-400">
                  ⚠️ انتهت صلاحية الرمز
                </p>
              )}
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
              disabled={loading || otp.length !== 6 || countdown === 0}
              className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'دخول'}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full p-3 text-gray-400 hover:text-white"
            >
              ← رجوع
            </button>

            {countdown === 0 && (
              <button
                type="button"
                onClick={() => sendOtp()}
                disabled={loading}
                className="w-full p-3 text-green-400 hover:text-green-300"
              >
                إعادة إرسال الرمز
              </button>
            )}
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-center text-gray-400">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-green-400 hover:underline">
              سجل الآن
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
