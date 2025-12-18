import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { Navbar } from './components/Navbar'

// Auth Pages
import { Register } from './pages/auth/Register'
import { Login } from './pages/auth/Login'
import { UploadDocuments } from './pages/auth/UploadDocuments'
import { PendingReview } from './pages/auth/PendingReview'
import { AccountRejected } from './pages/auth/AccountRejected'
import { AccountSuspended } from './pages/auth/AccountSuspended'

// Main Pages
import { Home } from './pages/Home'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
          {/* Navbar يظهر في كل الصفحات */}
          <Navbar />
          
          <Routes>
            {/* الصفحة الرئيسية */}
            <Route path="/" element={<Home />} />
            
            {/* صفحات المصادقة */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/upload-documents" element={<UploadDocuments />} />
            <Route path="/pending-review" element={<PendingReview />} />
            <Route path="/account-rejected" element={<AccountRejected />} />
            <Route path="/account-suspended" element={<AccountSuspended />} />
            
            {/* صفحة البروفايل - مؤقتاً توجه للرئيسية */}
            <Route path="/profile" element={<Home />} />
          </Routes>
          
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff'
                }
              }
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
