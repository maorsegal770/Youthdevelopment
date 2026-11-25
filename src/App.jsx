import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Children from '@/pages/Children';
import Initiatives from '@/pages/Initiatives';
import Challenges from '@/pages/Challenges';
import Conversations from '@/pages/Conversations';
import Podcast from '@/pages/Podcast';
import Projects from '@/pages/Projects';
import Tours from '@/pages/Tours';
import BirthLayout from '@/birth/BirthLayout';
import BirthLanding from '@/pages/birth/Landing';
import BirthRegister from '@/pages/birth/BirthRegister';
import BirthLogin from '@/pages/birth/BirthLogin';
import BirthLessons from '@/pages/birth/Lessons';
import BirthPaymentSuccess from '@/pages/birth/PaymentSuccess';
import BirthLeads from '@/pages/birth/Leads';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Birth-prep site: public landing + members area (access checked per page) */}
      <Route path="/birth" element={<BirthLayout />}>
        <Route index element={<BirthLanding />} />
        <Route path="register" element={<BirthRegister />} />
        <Route path="login" element={<BirthLogin />} />
        <Route path="lessons" element={<BirthLessons />} />
        <Route path="payment-success" element={<BirthPaymentSuccess />} />
        <Route path="leads" element={<BirthLeads />} />
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/children" element={<Children />} />
          <Route path="/initiatives" element={<Initiatives />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tours" element={<Tours />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App