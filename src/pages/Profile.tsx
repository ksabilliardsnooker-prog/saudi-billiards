import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function Profile() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Email change states
  const [showEmailChange, setShowEmailChange] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    club_name: '',
    phone: '',
    city: '',
    bio: '',
    social_twitter: '',
    social_instagram: '',
    social_snapchat: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        club_name: profile.club_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        bio: profile.bio || '',
        social_twitter: profile.social_twitter || '',
        social_instagram: profile.social_instagram || '',
        social_snapchat: profile.social_snapchat || ''
      })
    }
  }, [user, profile, navigate])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      await supabase.storage.from('avatars').remove([fileName])

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      await refreshProfile()
      toast.success('تم تحديث الصورة بنجاح')
    } catch (error) {
      toast.error('حدث خطأ في رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          club_name: formData.club_name,
          phone: formData.phone,
          city: formData.city,
          bio: formData.bio,
          social_twitter: formData.social_twitter,
          social_instagram: formData.social_instagram,
          social_snapchat: formData.social_snapchat
        })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      toast.success('تم حفظ البيانات بنجاح')
    } catch (error) {
      toast.error('حدث خطأ في حفظ البيانات')
    } finally {
      setLoading(false)
    }
  }

  // Send OTP for email change
  const sendEmailOtp = async () => {
    if (!newEmail) {
      toast.error('أدخل البريد الإلكتروني الجديد')
      return
    }

    if (newEmail === profile?.email) {
      toast.error('البريد الجديد مطابق للبريد الحالي')
      return
    }

    setEmailLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('تم إرسال رمز التحقق إلى البريد الجديد')
      setEmailOtpSent(true)
      setCountdown(60)
    } catch (error) {
      toast.error('حدث خطأ في إرسال الرمز')
    } finally {
      setEmailLoading(false)
    }
  }

  // Verify OTP and change email
  const verifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      toast.error('رمز التحقق يجب أن يكون 6 أرقام')
      return
    }

    setEmailLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: newEmail,
        token: emailOtp,
        type: 'email_change'
      })

      if (error) {
        toast.error('رمز التحقق غير صحيح')
        return
      }

      // Update email in users table
      await supabase
        .from('users')
        .update({ email: newEmail })
        .eq('id', user?.id)

      toast.success('تم تغيير البريد الإلكتروني بنجاح')
      setShowEmailChange(false)
      setNewEmail('')
      setEmailOtp('')
      setEmailOtpSent(false)
      await refreshProfile()
    } catch (error) {
      toast.error('حدث خطأ في تغيير البريد')
    } finally {
      setEmailLoading(false)
    }
  }

  const cancelEmailChange = () => {
    setShowEmailChange(false)
    setNewEmail('')
    setEmailOtp('')
    setEmailOtpSent(false)
    setCountdown(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const cities = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران', 'الطائف', 'تبوك', 'بريدة', 'أبها', 'خميس مشيط', 'حائل', 'نجران', 'جازان', 'ينبع', 'الجبيل', 'الأحساء', 'القطيف', 'أخرى']

  const getMemberTypeLabel = () => {
    switch (profile?.member_type) {
      case 'player': return 'لاعب'
      case 'coach': return 'مدرب'
      case 'club': return 'نادي/صالة'
      default: return ''
    }
  }

  const getStatusLabel = () => {
    switch (profile?.account_status) {
      case 'active': return { text: 'فعّال', color: 'bg-green-500' }
      case 'pending': return { text: 'في انتظار التفعيل', color: 'bg-yellow-500' }
      case 'under_review': return { text: 'قيد المراجعة', color: 'bg-blue-500' }
      case 'suspended': return { text: 'موقوف', color: 'bg-red-500' }
      default: return { text: '', color: '' }
    }
  }

  const isClub = profile?.member_type === 'club'

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {isClub ? '🏢' : '👤'}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700">
                {uploading ? (
                  <span className="text-xs">⏳</span>
                ) : (
                  <span className="text-sm">📷</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {isClub ? profile?.club_name : `${profile?.first_name} ${profile?.last_name}`}
              </h1>
              <p className="text-gray-400">{profile?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                  {getMemberTypeLabel()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm text-white ${getStatusLabel().color}`}>
                  {getStatusLabel().text}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Change Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">البريد الإلكتروني</h2>
            {!showEmailChange && (
              <button
                onClick={() => setShowEmailChange(true)}
                className="text-green-400 hover:text-green-300 text-sm"
              >
                تغيير البريد
              </button>
            )}
          </div>

          {!showEmailChange ? (
            <p className="text-gray-300" dir="ltr">{profile?.email}</p>
          ) : (
            <div className="space-y-4">
              {!emailOtpSent ? (
                <>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">البريد الإلكتروني الجديد</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="example@email.com"
                      dir="ltr"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={cancelEmailChange}
                      className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={sendEmailOtp}
                      disabled={emailLoading}
                      className="flex-1 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                    >
                      {emailLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-300 text-sm">تم إرسال رمز التحقق إلى:</p>
                    <p className="text-white font-bold" dir="ltr">{newEmail}</p>
                    {countdown > 0 && (
                      <p className="text-yellow-400 mt-2">
                        ⏱️ الرمز صالح لمدة: {formatTime(countdown)}
                      </p>
                    )}
                    {countdown === 0 && emailOtpSent && (
                      <p className="text-red-400 mt-2">
                        ⚠️ انتهت صلاحية الرمز
                      </p>
                    )}
                  </div>

                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl tracking-widest"
                    dir="ltr"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={cancelEmailChange}
                      className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={verifyEmailOtp}
                      disabled={emailLoading || emailOtp.length !== 6 || countdown === 0}
                      className="flex-1 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                    >
                      {emailLoading ? 'جاري التحقق...' : 'تأكيد'}
                    </button>
                  </div>

                  {countdown === 0 && (
                    <button
                      onClick={sendEmailOtp}
                      disabled={emailLoading}
                      className="w-full p-3 text-green-400 hover:text-green-300"
                    >
                      إعادة إرسال الرمز
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">البيانات الشخصية</h2>

          <div className="space-y-4">
            {isClub ? (
              <div>
                <label className="block text-gray-400 text-sm mb-2">اسم النادي/الصالة</label>
                <input
                  type="text"
                  name="club_name"
                  value={formData.club_name}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الاسم الأول</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الاسم الأخير</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">رقم الجوال</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  dir="ltr"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">المدينة</label>
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
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">نبذة عنك</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder={isClub ? 'اكتب نبذة عن النادي...' : 'اكتب نبذة عنك...'}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">حسابات التواصل الاجتماعي</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8">𝕏</span>
                  <input
                    type="text"
                    name="social_twitter"
                    value={formData.social_twitter}
                    onChange={handleChange}
                    placeholder="اسم المستخدم في X"
                    dir="ltr"
                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8">📷</span>
                  <input
                    type="text"
                    name="social_instagram"
                    value={formData.social_instagram}
                    onChange={handleChange}
                    placeholder="اسم المستخدم في Instagram"
                    dir="ltr"
                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8">👻</span>
                  <input
                    type="text"
                    name="social_snapchat"
                    value={formData.social_snapchat}
                    onChange={handleChange}
                    placeholder="اسم المستخدم في Snapchat"
                    dir="ltr"
                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </form>
      </div>
    </div>
  )
}
