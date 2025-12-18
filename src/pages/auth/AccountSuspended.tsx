import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function AccountSuspended() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@saudibilliards.com?subject=استفسار عن إيقاف الحساب'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-lg bg-gray-800 rounded-xl p-8">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-white">الحساب موقوف</h1>
          <p className="text-gray-400 mt-2">
            تم إيقاف حسابك مؤقتاً
          </p>
        </div>

        {/* معلومات */}
        <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-4 mb-6">
          <p className="text-orange-200 text-sm leading-relaxed">
            تم إيقاف حسابك بسبب مخالفة شروط الاستخدام. إذا كنت تعتقد أن هناك خطأ، يرجى التواصل مع فريق الدعم.
          </p>
        </div>

        {/* الأسباب المحتملة */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <p className="text-white font-bold mb-3">الأسباب المحتملة للإيقاف:</p>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              مخالفة شروط الاستخدام
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              سلوك غير لائق أو إساءة
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              نشر محتوى مخالف
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              شكاوى متعددة من المستخدمين
            </li>
          </ul>
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
          <p>للاستفسارات:</p>
          <p className="text-gray-400" dir="ltr">support@saudibilliards.com</p>
        </div>
      </div>
    </div>
  )
}
