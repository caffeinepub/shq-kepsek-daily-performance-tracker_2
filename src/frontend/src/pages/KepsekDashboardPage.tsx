import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { useGetCallerSchool, useGetTodayReport } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { School, MapPin, User, CheckCircle2, AlertCircle, Copy, Info, RefreshCw } from 'lucide-react';
import DailyReportForm from '../components/kepsek/DailyReportForm';
import TodaySubmissionSummary from '../components/kepsek/TodaySubmissionSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { dashboardId } from '../localization/dashboardId';

export default function KepsekDashboardPage() {
  const { data: school, isLoading: schoolLoading, error: schoolError, refetch: refetchSchool } = useGetCallerSchool();
  const { data: todayReport, isLoading: reportLoading, error: reportError, refetch: refetchReport } = useGetTodayReport();
  const { identity } = useInternetIdentity();
  const [showForm, setShowForm] = useState(false);

  const hasSubmittedToday = !!todayReport;
  const principalId = identity?.getPrincipal().toString() || '';

  const handleCopyPrincipalId = () => {
    if (principalId) {
      navigator.clipboard.writeText(principalId);
      toast.success(dashboardId.kepsek.missingSchool.copiedToClipboard);
    }
  };

  // Handle school data error
  if (schoolError && !schoolLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader />
        
        <main className="container mx-auto px-4 py-6 max-w-2xl">
          <Card className="shadow-xl border-red-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl">{dashboardId.kepsek.error.loadingProfile}</CardTitle>
              <CardDescription>
                {dashboardId.kepsek.error.loadingDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {schoolError instanceof Error ? schoolError.message : 'Gagal memuat profil sekolah'}
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => refetchSchool()} 
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {dashboardId.kepsek.error.retryLoading}
              </Button>
            </CardContent>
          </Card>
        </main>

        <footer className="mt-12 py-6 border-t bg-white/50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              {dashboardId.footer.builtWith}{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
            <p className="mt-1">{dashboardId.footer.copyright(new Date().getFullYear())}</p>
          </div>
        </footer>
      </div>
    );
  }

  // Show missing school state if no school registered
  if (!schoolLoading && !school) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader />
        
        <main className="container mx-auto px-4 py-6 max-w-2xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Info className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">{dashboardId.kepsek.missingSchool.title}</CardTitle>
              <CardDescription>
                {dashboardId.kepsek.missingSchool.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {dashboardId.kepsek.missingSchool.instruction}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">{dashboardId.kepsek.missingSchool.yourPrincipalId}</label>
                <div className="flex gap-2">
                  <Input
                    value={principalId}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopyPrincipalId}
                    variant="outline"
                    size="icon"
                    title={dashboardId.kepsek.missingSchool.copyPrincipalId}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardId.kepsek.missingSchool.shareInstruction}
                </p>
              </div>
            </CardContent>
          </Card>
        </main>

        <footer className="mt-12 py-6 border-t bg-white/50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              {dashboardId.footer.builtWith}{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
            <p className="mt-1">{dashboardId.footer.copyright(new Date().getFullYear())}</p>
          </div>
        </footer>
      </div>
    );
  }

  // Handle report loading error (non-blocking)
  const reportHasError = reportError && !reportLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">{dashboardId.kepsek.profileTitle}</CardTitle>
            <CardDescription className="text-blue-50">
              {dashboardId.kepsek.profileSubtitle}
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
                    <p className="text-sm text-muted-foreground">{dashboardId.kepsek.schoolName}</p>
                    <p className="font-semibold">{school.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">{dashboardId.kepsek.region}</p>
                    <p className="font-semibold">{school.region}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">{dashboardId.kepsek.principalName}</p>
                    <p className="font-semibold">{school.principalName}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Report Error Alert (non-blocking) */}
        {reportHasError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{dashboardId.kepsek.error.loadingReport}</span>
              <Button 
                onClick={() => refetchReport()} 
                variant="outline" 
                size="sm"
                className="ml-4"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {dashboardId.common.retry}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Submission Status */}
        {!reportHasError && hasSubmittedToday ? (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {dashboardId.kepsek.submission.submitted}
            </AlertDescription>
          </Alert>
        ) : !reportHasError ? (
          <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              {dashboardId.kepsek.submission.notSubmitted}
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Today's Report Summary or Form */}
        {!reportHasError && hasSubmittedToday && !showForm ? (
          <TodaySubmissionSummary report={todayReport} onEdit={() => setShowForm(true)} />
        ) : !reportHasError ? (
          <DailyReportForm existingReport={todayReport} onSuccess={() => setShowForm(false)} />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            {dashboardId.footer.builtWith}{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1">{dashboardId.footer.copyright(new Date().getFullYear())}</p>
        </div>
      </footer>
    </div>
  );
}
