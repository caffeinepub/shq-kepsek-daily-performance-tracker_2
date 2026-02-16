import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetCallerSchool, useGetReportForDate } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import DailyReportForm from '../components/kepsek/DailyReportForm';
import TodaySubmissionSummary from '../components/kepsek/TodaySubmissionSummary';
import { AlertCircle, School, MapPin, User, Copy, CheckCircle2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { dashboardId } from '../localization/dashboardId';
import { getStartOfDayNanoseconds } from '../utils/dayKey';

export default function KepsekDashboardPage() {
  const { identity } = useInternetIdentity();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: school, isLoading: schoolLoading, error: schoolError, refetch: refetchSchool } = useGetCallerSchool();
  const { data: selectedReport, isLoading: reportLoading, error: reportError, refetch: refetchReport } = useGetReportForDate(selectedDate || new Date());
  const [isEditing, setIsEditing] = useState(false);

  const principalId = identity?.getPrincipal().toString();
  const selectedDayKey = selectedDate ? getStartOfDayNanoseconds(selectedDate) : BigInt(0);

  const handleCopyPrincipalId = () => {
    if (principalId) {
      navigator.clipboard.writeText(principalId);
      toast.success(dashboardId.kepsek.missingSchool.copiedToClipboard);
    }
  };

  const handleFormSuccess = async () => {
    // Wait for refetch to complete before exiting edit mode
    await refetchReport();
    setIsEditing(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    setIsEditing(false); // Exit edit mode when changing dates
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (schoolLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{dashboardId.common.loading}</p>
        </div>
      </div>
    );
  }

  if (schoolError) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <div className="font-semibold mb-2">{dashboardId.kepsek.error.loadingProfile}</div>
            <p className="text-sm mb-4">{dashboardId.kepsek.error.loadingDescription}</p>
            <Button onClick={() => refetchSchool()} variant="outline" size="sm">
              {dashboardId.kepsek.error.retryLoading}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              {dashboardId.kepsek.missingSchool.title}
            </CardTitle>
            <CardDescription>{dashboardId.kepsek.missingSchool.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {dashboardId.kepsek.missingSchool.instruction}
            </p>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">{dashboardId.kepsek.missingSchool.yourPrincipalId}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background p-2 rounded text-xs break-all">
                  {principalId}
                </code>
                <Button
                  onClick={handleCopyPrincipalId}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {dashboardId.kepsek.missingSchool.copyPrincipalId}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {dashboardId.kepsek.missingSchool.shareInstruction}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* School Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>{dashboardId.kepsek.profileTitle}</CardTitle>
          <CardDescription>{dashboardId.kepsek.profileSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <School className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">{dashboardId.kepsek.schoolName}</p>
                <p className="font-medium">{school.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">{dashboardId.kepsek.region}</p>
                <p className="font-medium">{school.region}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">{dashboardId.kepsek.principalName}</p>
                <p className="font-medium">{school.principalName}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Selector Card - Required before attendance */}
      <Card className={!selectedDate ? 'border-2 border-blue-500 shadow-lg' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {dashboardId.kepsek.dateSelector.title}
          </CardTitle>
          <CardDescription>
            {!selectedDate 
              ? dashboardId.kepsek.dateSelector.requiredDescription 
              : dashboardId.kepsek.dateSelector.description
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full">
                <Label htmlFor="report-date" className="flex items-center gap-2">
                  {dashboardId.kepsek.dateSelector.selectDate}
                  {!selectedDate && (
                    <span className="text-xs text-red-600 font-semibold">
                      ({dashboardId.common.required})
                    </span>
                  )}
                </Label>
                <Input
                  id="report-date"
                  type="date"
                  value={selectedDate ? formatDateForInput(selectedDate) : ''}
                  onChange={handleDateChange}
                  className="mt-1.5"
                  placeholder="Pilih tanggal"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date())}
                className="w-full sm:w-auto"
              >
                {dashboardId.kepsek.dateSelector.today}
              </Button>
            </div>
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                {dashboardId.kepsek.dateSelector.viewing} <span className="font-medium">{formatDateDisplay(selectedDate)}</span>
              </p>
            )}
            {!selectedDate && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  {dashboardId.kepsek.dateSelector.pleaseSelectDate}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Only show report section if date is selected */}
      {selectedDate && (
        <>
          {/* Report Error */}
          {reportError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {dashboardId.kepsek.error.loadingReport}
              </AlertDescription>
            </Alert>
          )}

          {/* Selected Date's Report Status */}
          {reportLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedReport && !isEditing ? (
            <TodaySubmissionSummary
              report={selectedReport}
              selectedDate={selectedDate}
              onEdit={() => setIsEditing(true)}
            />
          ) : (
            <>
              {selectedReport && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    {dashboardId.kepsek.submission.editingExisting}
                  </AlertDescription>
                </Alert>
              )}
              {!selectedReport && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    {dashboardId.kepsek.submission.notSubmittedForDate}
                  </AlertDescription>
                </Alert>
              )}
              <DailyReportForm
                existingReport={selectedReport}
                selectedDate={selectedDate}
                selectedDayKey={selectedDayKey}
                onSuccess={handleFormSuccess}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
