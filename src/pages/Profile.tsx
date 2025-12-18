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

      // حذف الصورة القديمة إن وجدت
      await supabase.storage.from('avatars').remove([fileName])

      // رفع الصورة الجديدة
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // الحصول على الرابط العام
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // تحديث الملف الشخصي
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
            {/* Avatar */}
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

            {/* Info */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">البيانات الشخصية</h2>

          <div className="space-y-4">
            {/* Name */}
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

            {/* Phone & City */}
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

            {/* Bio */}
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

            {/* Social Media */}
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

          {/* Submit Button */}
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
