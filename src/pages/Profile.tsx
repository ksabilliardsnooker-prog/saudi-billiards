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
  const [form, setForm] = useState({
    first_name: '', last_name: '', club_name: '', phone: '', city: '', bio: '',
    social_twitter: '', social_instagram: '', social_snapchat: ''
  })

  const cities = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران', 'الطائف', 'تبوك', 'بريدة', 'أبها', 'خميس مشيط', 'حائل', 'نجران', 'جازان', 'ينبع', 'الجبيل', 'الأحساء', 'القطيف', 'أخرى']

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (profile) {
      setForm({
        first_name: profile.first_name || '', last_name: profile.last_name || '',
        club_name: profile.club_name || '', phone: profile.phone || '',
        city: profile.city || '', bio: profile.bio || '',
        social_twitter: profile.social_twitter || '', social_instagram: profile.social_instagram || '',
        social_snapchat: profile.social_snapchat || ''
      })
    }
  }, [user, profile, navigate])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const path = `${user.id}/avatar.${file.name.split('.').pop()}`
    await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id)
    await refreshProfile()
    toast.success('تم تحديث الصورة')
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    await supabase.from('users').update(form).eq('id', user.id)
    await refreshProfile()
    toast.success('تم الحفظ')
    setLoading(false)
  }

  const isClub = profile?.member_type === 'club'
  const status = profile?.account_status === 'active' ? { t: 'فعّال', c: 'bg-green-500' } : { t: 'معلق', c: 'bg-yellow-500' }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden">
                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">{isClub ? '🏢' : '👤'}</div>}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center cursor-pointer">
                {uploading ? '⏳' : '📷'}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{isClub ? profile?.club_name : `${profile?.first_name} ${profile?.last_name}`}</h1>
              <p className="text-gray-400">{profile?.email}</p>
              <span className={`px-3 py-1 rounded-full text-sm text-white ${status.c}`}>{status.t}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-4">
          {isClub ? (
            <input name="club_name" value={form.club_name} onChange={e => setForm({...form, club_name: e.target.value})} placeholder="اسم النادي" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <input name="first_name" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} placeholder="الاسم الأول" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              <input name="last_name" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} placeholder="الاسم الأخير" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <input name="phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="الجوال" dir="ltr" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            <select name="city" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
              <option value="">المدينة</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea name="bio" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="نبذة" rows={3} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          <button type="submit" disabled={loading} className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </form>
      </div>
    </div>
  )
}
