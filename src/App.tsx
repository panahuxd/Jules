import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import AddExpense from '@/pages/AddExpense';
import MonthlyReport from '@/pages/MonthlyReport';
import Admin from '@/pages/Admin';
import Account from '@/pages/account/Account';
import MobileLayout from '@/components/layout/MobileLayout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return currentUser ? <Navigate to="/" replace /> : <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mrexpenser-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MobileLayout />}>
                <Route path="/" element={<AddExpense />} />
                <Route path="/report" element={<MonthlyReport />} />
                <Route path="/account" element={<Account />} />
              </Route>
              {/* Admin route without mobile navigation */}
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </Router>
        <Toaster position="top-center" dir="rtl" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;