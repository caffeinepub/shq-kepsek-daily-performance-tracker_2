import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { useGetCallerSchool, useGetTodayReport } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { School, MapPin, User, CheckCircle2, AlertCircle } from 'lucide-react';
import DailyReportForm from '../components/kepsek/DailyReportForm';
import TodaySubmissionSummary from '../components/kepsek/TodaySubmissionSummary';
import ProfileSetupDialog from '../components/kepsek/ProfileSetupDialog';

export default function KepsekDashboardPage() {
  const { data: school, isLoading: schoolLoading } = useGetCallerSchool();
  const { data: todayReport, isLoading: reportLoading } = useGetTodayReport();
  const [showForm, setShowForm] = useState(false);

  const hasSubmittedToday = !!todayReport;

  // Show profile setup if no school registered
  if (!schoolLoading && !school) {
    return (
      <>
        <AppHeader />
        <ProfileSetupDialog />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Profile Kepala Sekolah</CardTitle>
            <CardDescription className="text-blue-50">
              Informasi sekolah dan kepala sekolah
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {schoolLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ) : school ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <School className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Sekolah</p>
                    <p className="font-semibold">{school.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Wilayah</p>
                    <p className="font-semibold">{school.region}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Kepala Sekolah</p>
                    <p className="font-semibold">{school.principalName}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Submission Status */}
        {hasSubmittedToday ? (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Anda sudah mengisi laporan hari ini. Terima kasih!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              Anda belum mengisi laporan hari ini. Silakan isi form di bawah.
            </AlertDescription>
          </Alert>
        )}

        {/* Today's Report Summary or Form */}
        {hasSubmittedToday && !showForm ? (
          <TodaySubmissionSummary report={todayReport} onEdit={() => setShowForm(true)} />
        ) : (
          <DailyReportForm existingReport={todayReport} onSuccess={() => setShowForm(false)} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1">© {new Date().getFullYear()} SHQ Kepsek Tracker</p>
        </div>
      </footer>
    </div>
  );
}
