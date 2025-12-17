import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Saudi cities list
export const SAUDI_CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر',
  'الظهران', 'الطائف', 'تبوك', 'بريدة', 'أبها', 'الأحساء', 'الباحة',
  'الجبيل', 'جازان', 'حائل', 'خميس مشيط', 'سكاكا', 'عرعر', 'القطيف',
  'نجران', 'ينبع', 'الهفوف', 'حفر الباطن', 'الخرج', 'القنفذة', 'رابغ',
  'عنيزة', 'المجمعة', 'الزلفي', 'شقراء', 'الدوادمي', 'وادي الدواسر',
  'بيشة', 'محايل عسير', 'النماص', 'صبيا', 'أبو عريش', 'الليث', 'ضباء',
  'تيماء', 'العلا', 'رفحاء', 'طريف', 'القريات', 'أخرى'
]

// Allowed email domains
export const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'hotmail.com', 'live.com', 'yahoo.com',
  'icloud.com', 'protonmail.com', 'aol.com', 'mail.com', 'zoho.com',
  'yandex.com', 'gmx.com'
]

// Validate email domain
export function validateEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return ALLOWED_EMAIL_DOMAINS.includes(domain)
}

// Validate Saudi phone number (9 digits starting with 5)
export function validateSaudiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return /^5\d{8}$/.test(cleaned)
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 9) {
    return `+966 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

// Calculate age from birth date
export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Validate age (18+)
export function validateAge(birthDate: Date): boolean {
  return calculateAge(birthDate) >= 18
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number
  label: 'ضعيفة' | 'متوسطة' | 'قوية'
  color: string
} {
  let score = 0
  
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  
  if (score <= 2) return { score, label: 'ضعيفة', color: 'bg-red-500' }
  if (score <= 4) return { score, label: 'متوسطة', color: 'bg-yellow-500' }
  return { score, label: 'قوية', color: 'bg-green-500' }
}

// Validate password (8+ chars, at least 1 letter and 1 number)
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('يجب أن تكون كلمة المرور 8 أحرف على الأقل')
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف واحد على الأقل')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('يجب أن تحتوي على رقم واحد على الأقل')
  }
  
  return { valid: errors.length === 0, errors }
}

// Format date to Arabic
export function formatDateArabic(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  
  return formatDateArabic(d)
}

// Member type labels
export const MEMBER_TYPE_LABELS = {
  player: 'لاعب',
  coach: 'مدرب',
  club: 'نادي/صالة',
  moderator: 'مشرف',
  super_admin: 'مشرف عام'
} as const

// Account status labels
export const ACCOUNT_STATUS_LABELS = {
  pending: 'في انتظار المراجعة',
  under_review: 'قيد المراجعة',
  returned: 'مُعاد بملاحظات',
  approved: 'مُوافق عليه',
  active: 'فعال',
  rejected: 'مرفوض',
  suspended: 'موقوف'
} as const

// Account status colors
export const ACCOUNT_STATUS_COLORS = {
  pending: 'badge-warning',
  under_review: 'badge-info',
  returned: 'badge-warning',
  approved: 'badge-success',
  active: 'badge-success',
  rejected: 'badge-danger',
  suspended: 'badge-danger'
} as const

// Marketplace categories
export const MARKETPLACE_CATEGORIES = [
  { id: 'tables', label: 'طاولات', icon: '🎱' },
  { id: 'cues', label: 'مضارب', icon: '🏏' },
  { id: 'shafts', label: 'شافتات', icon: '📍' },
  { id: 'accessories', label: 'إكسسوارات', icon: '🎯' }
]

// Product conditions
export const PRODUCT_CONDITIONS = [
  { id: 'new', label: 'جديد' },
  { id: 'used', label: 'مستعمل' }
]

// Game types
export const GAME_TYPES = [
  { id: 'billiards', label: 'بلياردو' },
  { id: 'snooker', label: 'سنوكر' }
]

// Play systems
export const PLAY_SYSTEMS = [
  { id: '8ball', label: '8 كرات' },
  { id: '9ball', label: '9 كرات' },
  { id: '10ball', label: '10 كرات' }
]

// Tournament systems
export const TOURNAMENT_SYSTEMS = [
  { id: 'single', label: 'وينر (Single Elimination)' },
  { id: 'double', label: 'لوزر (Double Elimination)' }
]

// Participation types
export const PARTICIPATION_TYPES = [
  { id: 'individual', label: 'فردي' },
  { id: 'team', label: 'فريق' }
]

// Participant counts
export const PARTICIPANT_COUNTS = [16, 32, 64, 128]

// Course levels
export const COURSE_LEVELS = [
  { id: 'beginner', label: 'مبتدئ' },
  { id: 'intermediate', label: 'متوسط' },
  { id: 'advanced', label: 'متقدم' }
]

// Club amenities
export const CLUB_AMENITIES = [
  { id: 'cafe', label: 'كافيه', icon: '☕' },
  { id: 'parking', label: 'مواقف', icon: '🅿️' },
  { id: 'wifi', label: 'واي فاي', icon: '📶' },
  { id: 'ac', label: 'تكييف', icon: '❄️' },
  { id: 'prayer_room', label: 'مصلى', icon: '🕌' },
  { id: 'smoking_area', label: 'منطقة تدخين', icon: '🚬' },
  { id: 'vip_rooms', label: 'غرف VIP', icon: '👑' },
  { id: 'tournaments', label: 'بطولات', icon: '🏆' }
]
