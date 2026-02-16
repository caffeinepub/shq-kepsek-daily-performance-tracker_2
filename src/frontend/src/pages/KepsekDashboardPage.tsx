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
import { getStartOfDayNanoseconds, parseDateInputSafe, formatDateForInput } from '../utils/dayKey';

export default function KepsekDashboardPage() {
  const { identity } = useInternetIdentity();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: school, isLoading: schoolLoading, error: schoolError, refetch: refetchSchool } = useGetCallerSchool();
  const { data: selectedReport, isLoading: reportLoading, error: reportError } = useGetReportForDate(selectedDate || new Date());
  const [isEditing, setIsEditing] = useState(false);

  const principalId = identity?.getPrincipal().toString();
  const selectedDayKey = selectedDate ? getStartOfDayNanoseconds(selectedDate) : BigInt(0);

  const handleCopyPrincipalId = () => {
    if (principalId) {
      navigator.clipboard.writeText(principalId);
      toast.success(dashboardId.kepsek.missingSchool.copiedToClipboard);
    }
  };

  const handleFormSuccess = () => {
    // Exit edit mode immediately - the cache has been updated via setQueryData
    setIsEditing(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Use timezone-safe parsing to avoid UTC-based day shifts
    const newDate = parseDateInputSafe(e.target.value);
    setSelectedDate(newDate);
    setIsEditing(false); // Exit edit mode when changing dates
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
                  {!selectedDate && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="report-date"
                  type="date"
                  value={selectedDate ? formatDateForInput(selectedDate) : ''}
                  onChange={handleDateChange}
                  className="mt-1.5"
                />
              </div>
            </div>
            
            {selectedDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>
                  {dashboardId.kepsek.dateSelector.selectedDateLabel}: <strong className="text-foreground">{formatDateDisplay(selectedDate)}</strong>
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Report Section - Only show if date is selected */}
      {selectedDate && (
        <Card key={selectedDayKey.toString()}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{dashboardId.kepsek.reportTitle}</CardTitle>
                <CardDescription>
                  {formatDateDisplay(selectedDate)}
                </CardDescription>
              </div>
              {selectedReport && !isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  {dashboardId.kepsek.editReport}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {reportLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">{dashboardId.common.loading}</p>
                </div>
              </div>
            ) : isEditing || !selectedReport ? (
              <DailyReportForm
                existingReport={selectedReport}
                selectedDate={selectedDate}
                selectedDayKey={selectedDayKey}
                onSuccess={handleFormSuccess}
              />
            ) : (
              <TodaySubmissionSummary 
                report={selectedReport} 
                selectedDate={selectedDate}
                onEdit={() => setIsEditing(true)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Prompt to select date if none selected */}
      {!selectedDate && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {dashboardId.kepsek.dateSelector.promptSelectDate}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
