import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export function UploadDocuments() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [documents, setDocuments] = useState<string[]>([])
  const [returnNotes, setReturnNotes] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    setLoading(true)
    try {
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
        
        // جلب طلب التحقق إن وجد
        const { data: verificationData } = await supabase
          .from('verification_requests')
          .select('*')
          .eq('user_id', authUser.id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .single()

        if (verificationData) {
          setDocuments(verificationData.documents || [])
          if (verificationData.status === 'returned') {
            setReturnNotes(verificationData.return_notes)
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file)

        if (uploadError) {
          toast.error(`خطأ في رفع ${file.name}`)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      setDocuments([...documents, ...uploadedUrls])
      toast.success('تم رفع الملفات بنجاح')
    } catch (err) {
      toast.error('حدث خطأ في الرفع')
    } finally {
      setUploading(false)
    }
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const submitDocuments = async () => {
    if (documents.length === 0) {
      toast.error('يرجى رفع الوثائق المطلوبة')
      return
    }

    setLoading(true)
    try {
      // إنشاء أو تحديث طلب التحقق
      const { data: existingRequest } = await supabase
        .from('verification_requests')
        .select('id, resubmit_count')
        .eq('user_id', user.id)
        .single()

      if (existingRequest) {
        // تحديث الطلب الموجود
        await supabase
          .from('verification_requests')
          .update({
            documents: documents,
            status: 'pending',
            resubmitted_at: new Date().toISOString(),
            resubmit_count: (existingRequest.resubmit_count || 0) + 1,
            return_notes: null,
            return_reason: null
          })
          .eq('id', existingRequest.id)
      } else {
        // إنشاء طلب جديد
        await supabase
          .from('verification_requests')
          .insert({
            user_id: user.id,
            member_type: user.member_type,
            documents: documents,
            status: 'pending'
          })
      }

      // تحديث حالة المستخدم
      await supabase
        .from('users')
        .update({ account_status: 'under_review' })
        .eq('id', user.id)

      toast.success('تم إرسال الوثائق للمراجعة')
      navigate('/pending-review')
    } catch (err) {
      toast.error('حدث خطأ في الإرسال')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">جاري التحميل...</div>
      </div>
    )
  }

  const isCoach = user?.member_type === 'coach'
  const isClub = user?.member_type === 'club'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-lg bg-gray-800 rounded-xl p-8">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📄</span>
          </div>
          <h1 className="text-2xl font-bold text-white">رفع الوثائق</h1>
          <p className="text-gray-400 mt-2">
            {isCoach && 'لتفعيل حسابك كمدرب، يرجى رفع الوثائق المطلوبة'}
            {isClub && 'لتفعيل حساب النادي، يرجى رفع الوثائق المطلوبة'}
          </p>
        </div>

        {/* ملاحظات الإرجاع */}
        {returnNotes && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 font-bold mb-2">⚠️ ملاحظات المراجع:</p>
            <p className="text-yellow-200">{returnNotes}</p>
          </div>
        )}

        {/* الوثائق المطلوبة */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <p className="text-white font-bold mb-3">الوثائق المطلوبة:</p>
          <ul className="space-y-2 text-gray-300">
            {isCoach && (
              <>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  صورة الهوية الوطنية أو الإقامة
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  شهادات التدريب (إن وجدت)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  صورة شخصية واضحة
                </li>
              </>
            )}
            {isClub && (
              <>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  السجل التجاري أو رخصة العمل
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  صور للنادي/الصالة
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  هوية المسؤول
                </li>
              </>
            )}
          </ul>
        </div>

        {/* الوثائق المرفوعة */}
        {documents.length > 0 && (
          <div className="mb-6">
            <p className="text-white font-bold mb-3">الوثائق المرفوعة ({documents.length}):</p>
            <div className="grid grid-cols-3 gap-3">
              {documents.map((doc, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                    {doc.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img src={doc} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">📄</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeDocument(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* زر الرفع */}
        <div className="mb-6">
          <label className="block">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors">
              {uploading ? (
                <p className="text-gray-400">جاري الرفع...</p>
              ) : (
                <>
                  <span className="text-4xl mb-2 block">📤</span>
                  <p className="text-gray-300">اضغط لاختيار الملفات</p>
                  <p className="text-gray-500 text-sm mt-1">PNG, JPG, PDF - حد أقصى 5MB</p>
                </>
              )}
            </div>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* زر الإرسال */}
        <button
          onClick={submitDocuments}
          disabled={loading || documents.length === 0}
          className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'جاري الإرسال...' : 'إرسال للمراجعة'}
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          مدة المراجعة المتوقعة: 24-48 ساعة
        </p>
      </div>
    </div>
  )
}
