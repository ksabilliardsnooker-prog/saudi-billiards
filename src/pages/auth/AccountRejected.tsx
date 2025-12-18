import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function AccountRejected() {
  const navigate = useNavigate()
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      navigate('/login')
      return
    }

    // جلب سبب الرفض
    const { data: verificationData } = await supabase
      .from('verification_requests')
      .select('rejection_reason')
      .eq('user_id', authUser.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()

    if (verificationData?.rejection_reason) {
      setRejectionReason(verificationData.rejection_reason)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@saudibilliards.com?subject=استفسار عن رفض الحساب'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-lg bg-gray-800 rounded-xl p-8">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-white">تم رفض الطلب</h1>
          <p className="text-gray-400 mt-2">
            نأسف، لم يتم قبول طلب التسجيل الخاص بك
          </p>
        </div>

        {/* سبب الرفض */}
        {rejectionReason && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400 font-bold mb-2">سبب الرفض:</p>
            <p className="text-red-200">{rejectionReason}</p>
          </div>
        )}

        {/* معلومات */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <p className="text-gray-300 text-sm leading-relaxed">
            إذا كنت تعتقد أن هناك خطأ في القرار أو لديك استفسارات، يمكنك التواصل مع فريق الدعم وسنكون سعداء بمساعدتك.
          </p>
        </div>

        {/* أزرار */}
        <div className="space-y-3">
          <button
            onClick={handleContactSupport}
            className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            📧 تواصل مع الدعم
          </button>

          <button
            onClick={handleLogout}
            className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
          >
            تسجيل الخروج
          </button>
        </div>

        {/* معلومات الاتصال */}
        <div className="text-center text-gray-500 text-sm mt-6">
          <p>البريد الإلكتروني:</p>
          <p className="text-gray-400" dir="ltr">support@saudibilliards.com</p>
        </div>
      </div>
    </div>
  )
}
