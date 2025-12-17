import { Link } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { 
  Trophy, GraduationCap, ShoppingBag, Building2, 
  Users, MapPin, ArrowLeft, Star
} from 'lucide-react'

export function Home() {
  const features = [
    {
      icon: Trophy,
      title: 'البطولات',
      description: 'شارك في بطولات البلياردو والسنوكر في جميع أنحاء المملكة',
      href: '/tournaments',
      color: 'bg-yellow-500/20 text-yellow-400'
    },
    {
      icon: GraduationCap,
      title: 'الدورات التدريبية',
      description: 'تعلم من أفضل المدربين المعتمدين وطور مهاراتك',
      href: '/courses',
      color: 'bg-blue-500/20 text-blue-400'
    },
    {
      icon: ShoppingBag,
      title: 'السوق',
      description: 'اشترِ وبع معدات البلياردو والسنوكر بسهولة',
      href: '/marketplace',
      color: 'bg-green-500/20 text-green-400'
    },
    {
      icon: Building2,
      title: 'النوادي',
      description: 'اكتشف أقرب النوادي والصالات إليك على الخريطة',
      href: '/clubs',
      color: 'bg-purple-500/20 text-purple-400'
    }
  ]

  const stats = [
    { label: 'لاعب مسجل', value: '1,234+', icon: Users },
    { label: 'نادي وصالة', value: '56+', icon: Building2 },
    { label: 'بطولة منظمة', value: '89+', icon: Trophy },
    { label: 'مدينة', value: '46', icon: MapPin }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-600/20 to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="container-custom relative">
          <div className="py-20 md:py-32 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 rounded-full text-primary-400 text-sm mb-6">
              <Star className="w-4 h-4" />
              <span>المنصة الأولى للبلياردو والسنوكر في السعودية</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              مجتمع البلياردو والسنوكر
              <br />
              <span className="text-gradient">السعودي</span>
            </h1>
            
            <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-8">
              انضم لأكبر مجتمع للاعبي البلياردو والسنوكر في المملكة. 
              شارك في البطولات، تدرب مع أفضل المدربين، واكتشف النوادي القريبة منك.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  انضم الآن مجاناً
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/tournaments">
                <Button variant="outline" size="lg">
                  تصفح البطولات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-dark-800 bg-dark-900/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-500/20 rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-primary-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-dark-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              كل ما تحتاجه في مكان واحد
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              منصة متكاملة تجمع بين اللاعبين والمدربين والنوادي لتطوير رياضة البلياردو والسنوكر
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link key={feature.href} to={feature.href}>
                <Card hover className="h-full group">
                  <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-dark-400">{feature.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-b from-primary-600/10 to-transparent">
        <div className="container-custom">
          <Card className="text-center py-12 px-6 bg-gradient-to-r from-primary-600/20 to-primary-700/20 border-primary-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">
              هل أنت نادي أو مدرب؟
            </h2>
            <p className="text-dark-300 max-w-xl mx-auto mb-6">
              انضم لمنصتنا وابدأ في استقبال الحجوزات وتنظيم البطولات والدورات التدريبية
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register?type=club">
                <Button variant="primary">
                  تسجيل كنادي
                </Button>
              </Link>
              <Link to="/register?type=coach">
                <Button variant="outline">
                  تسجيل كمدرب
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎱</span>
                </div>
                <span className="font-bold text-lg">بلياردو السعودية</span>
              </div>
              <p className="text-dark-400 text-sm">
                المنصة الأولى لمجتمع البلياردو والسنوكر في المملكة العربية السعودية
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">روابط سريعة</h4>
              <div className="flex flex-col gap-2">
                <Link to="/tournaments" className="text-dark-400 hover:text-white transition-colors">البطولات</Link>
                <Link to="/courses" className="text-dark-400 hover:text-white transition-colors">الدورات</Link>
                <Link to="/marketplace" className="text-dark-400 hover:text-white transition-colors">السوق</Link>
                <Link to="/clubs" className="text-dark-400 hover:text-white transition-colors">النوادي</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">الدعم</h4>
              <div className="flex flex-col gap-2">
                <Link to="/terms" className="text-dark-400 hover:text-white transition-colors">الشروط والأحكام</Link>
                <Link to="/privacy" className="text-dark-400 hover:text-white transition-colors">سياسة الخصوصية</Link>
                <Link to="/contact" className="text-dark-400 hover:text-white transition-colors">تواصل معنا</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">تابعنا</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
                  𝕏
                </a>
                <a href="#" className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
                  📷
                </a>
                <a href="#" className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
                  👻
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-800 pt-8 text-center text-dark-500 text-sm">
            <p>© {new Date().getFullYear()} بلياردو السعودية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
