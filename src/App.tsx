import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { Navbar } from './components/Navbar'

import { Register } from './pages/auth/Register'
import { Login } from './pages/auth/Login'
import { UploadDocuments } from './pages/auth/UploadDocuments'
import { PendingReview } from './pages/auth/PendingReview'
import { AccountRejected } from './pages/auth/AccountRejected'
import { AccountSuspended } from './pages/auth/AccountSuspended'

import { Home } from './pages/Home'
import { Profile } from './pages/Profile'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/upload-documents" element={<UploadDocuments />} />
            <Route path="/pending-review" element={<PendingReview />} />
            <Route path="/account-rejected" element={<AccountRejected />} />
            <Route path="/account-suspended" element={<AccountSuspended />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Toaster position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
