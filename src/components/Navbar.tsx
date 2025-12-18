import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MEMBER_TYPE_LABELS } from '../lib/utils'
import { 
  Menu, X, User, LogOut, Settings, ShoppingBag, 
  Trophy, GraduationCap, Building2, Newspaper, ChevronDown
} from 'lucide-react'
import { Button } from './ui'

export function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setProfileMenuOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navLinks = [
    { href: '/marketplace', label: 'السوق', icon: ShoppingBag },
    { href: '/tournaments', label: 'البطولات', icon: Trophy },
    { href: '/courses', label: 'الدورات', icon: GraduationCap },
    { href: '/clubs', label: 'النوادي', icon: Building2 },
    { href: '/news', label: 'الأخبار', icon: Newspaper },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 glass border-b border-dark-800">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎱</span>
            </div>
            <span className="font-bold text-lg hidden sm:block">بلياردو السعودية</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {profile ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-white">
                      {profile.club_name || `${profile.first_name} ${profile.last_name}`}
                    </p>
                    <p className="text-xs text-dark-400">
                      {MEMBER_TYPE_LABELS[profile.member_type]}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-dark-900 border border-dark-800 rounded-xl shadow-xl overflow-hidden animate-slide-down">
                    <div className="p-4 border-b border-dark-800">
                      <p className="font-medium text-white">
                        {profile.club_name || `${profile.first_name} ${profile.last_name}`}
                      </p>
                      <p className="text-sm text-dark-400">{profile.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
                        <User className="w-4 h-4" />
                        <span>الملف الشخصي</span>
                      </Link>
                      
                      <Link to="/add" className="flex items-center gap-3 px-4 py-2.5 text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
                        <ShoppingBag className="w-4 h-4" />
                        <span>إضافة إعلان</span>
                      </Link>

                      {(profile.member_type === 'super_admin' || profile.member_type === 'moderator') && (
                        <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
                          <Settings className="w-4 h-4" />
                          <span>لوحة التحكم</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-dark-800 py-2">
                      <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-dark-800 transition-colors w-full">
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">دخول</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">تسجيل</Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-dark-800 animate-slide-down">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
