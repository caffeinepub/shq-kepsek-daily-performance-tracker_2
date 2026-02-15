import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerRole } from './hooks/useQueries';
import { UserRole } from './backend';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import KepsekDashboardPage from './pages/KepsekDashboardPage';
import AdminKepsekManagementPage from './pages/AdminKepsekManagementPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

type View = 'dashboard' | 'management';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: role, isLoading: roleLoading } = useGetCallerRole();
  const [adminView, setAdminView] = useState<View>('dashboard');

  // Show loading state while initializing
  if (isInitializing || (identity && roleLoading)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Not authenticated - show login
  if (!identity) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LoginPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Authenticated but no role assigned
  if (!role || role === UserRole.guest) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AccessDeniedPage message="Your account has not been assigned a role yet. Please contact an administrator." />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Admin view
  if (role === UserRole.admin) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {adminView === 'dashboard' ? (
          <AdminDashboardPage onNavigateToManagement={() => setAdminView('management')} />
        ) : (
          <AdminKepsekManagementPage onNavigateToDashboard={() => setAdminView('dashboard')} />
        )}
        <Toaster />
      </ThemeProvider>
    );
  }

  // Kepsek view
  if (role === UserRole.user) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <KepsekDashboardPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Fallback
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AccessDeniedPage message="Unknown role. Please contact an administrator." />
      <Toaster />
    </ThemeProvider>
  );
}
