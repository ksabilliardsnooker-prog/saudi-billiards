import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function PendingReview() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [verification, setVerification] = useState<any>(null)

  useEffect(() => {
    loadData()
    
    // تحقق كل 30 ثانية من تغيير الحالة
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      navigate('/login')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (userData) {
      setUser(userData)
      
      // جلب طلب التحقق
      const { data: verificationData } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', authUser.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single()

      if (verificationData) {
        setVerification(verificationData)
      }
    }
  }

  const checkStatus = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: userData } = await supabase
      .from('users')
      .select('account_status')
      .eq('id', authUser.id)
      .single()

    if (userData) {
      switch (userData.account_status) {
        case 'approved':
        case 'active':
          navigate('/profile')
          break
        case 'returned':
          navigate('/upload-documents')
          break
        case 'rejected':
          navigate('/account-rejected')
          break
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-lg bg-gray-800 rounded-xl p-8">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-4xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold text-white">جاري مراجعة طلبك</h1>
          <p className="text-gray-400 mt-2">
            تم استلام وثائقك وجاري مراجعتها من قبل فريق الإدارة
          </p>
        </div>

        {/* مدة المراجعة */}
        <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">مدة المراجعة المتوقعة:</span>
            <span className="text-green-400 font-bold">24-48 ساعة</span>
          </div>
        </div>

        {/* خطوات الحالة */}
        <div className="space-y-4 mb-8">
          {/* تم إنشاء الحساب */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 text-right">
              <p className="font-medium text-gray-200">تم إنشاء الحساب</p>
              <p className="text-sm text-gray-500">تم التسجيل والتحقق من البريد</p>
            </div>
          </div>

          {/* تم رفع الوثائق */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 text-right">
              <p className="font-medium text-gray-200">تم رفع الوثائق</p>
              <p className="text-sm text-gray-500">
                {verification?.submitted_at && formatDate(verification.submitted_at)}
              </p>
            </div>
          </div>

          {/* قيد المراجعة */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 text-right">
              <p className="font-medium text-yellow-400">قيد المراجعة</p>
              <p className="text-sm text-gray-500">جاري مراجعة الوثائق من قبل الإدارة</p>
            </div>
          </div>

          {/* تفعيل الحساب */}
          <div className="flex items-center gap-4 opacity-50">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 text-right">
              <p className="font-medium text-gray-400">تفعيل الحساب</p>
              <p className="text-sm text-gray-600">سيتم تفعيل حسابك بعد الموافقة</p>
            </div>
          </div>
        </div>

        {/* معلومات */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-blue-400 text-sm">
            💡 سيصلك إشعار على بريدك الإلكتروني عند اكتمال المراجعة. يمكنك أيضاً متابعة حالة طلبك من هذه الصفحة.
          </p>
        </div>

        {/* معلومات الاتصال */}
        <div className="text-center text-gray-500 text-sm mb-6">
          <p>للاستفسارات تواصل معنا:</p>
          <p className="text-gray-400" dir="ltr">support@saudibilliards.com</p>
        </div>

        {/* زر تسجيل الخروج */}
        <button
          onClick={handleLogout}
          className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  )
}
