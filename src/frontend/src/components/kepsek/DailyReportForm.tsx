import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useSaveDailyReport } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { DailyReport } from '../../backend';
import AttendancePhotoField from './AttendancePhotoField';
import { ExternalBlob } from '../../backend';
import { Clock, ClipboardCheck, Users, MessageSquare, Target, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { dashboardId } from '../../localization/dashboardId';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DailyReportFormProps {
  existingReport?: DailyReport | null;
  selectedDate: Date;
  selectedDayKey: bigint;
  onSuccess?: () => void;
}

/**
 * Converts a time string (HH:MM) to nanoseconds timestamp.
 * Uses the provided baseDate (day key) to ensure the time is anchored to the correct calendar day.
 * 
 * CRITICAL: Always use selectedDayKey as baseDate to ensure saves overwrite the correct day's report.
 */
function timeToNanoseconds(timeString: string, baseDate: bigint): bigint {
  if (!timeString) return BigInt(0);
  const [hours, minutes] = timeString.split(':').map(Number);
  const millisInDay = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
  return baseDate + BigInt(millisInDay) * BigInt(1_000_000);
}

/**
 * Converts a nanoseconds timestamp to a time string (HH:MM).
 * Extracts only the time portion, ignoring the date.
 */
function nanosecondsToTime(nanos: bigint): string {
  if (nanos === BigInt(0)) return '';
  const milliseconds = Number(nanos / BigInt(1_000_000));
  const date = new Date(milliseconds);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function DailyReportForm({ existingReport, selectedDate, selectedDayKey, onSuccess }: DailyReportFormProps) {
  const [attendancePhoto, setAttendancePhoto] = useState<ExternalBlob | null>(null);
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [catatanPresensi, setCatatanPresensi] = useState('');
  const [classControlChecked, setClassControlChecked] = useState(false);
  const [catatanAmatanKelas, setCatatanAmatanKelas] = useState('');
  const [teacherControlChecked, setTeacherControlChecked] = useState(false);
  const [catatanMonitoringGuru, setCatatanMonitoringGuru] = useState('');
  const [waliSantriChecked, setWaliSantriChecked] = useState(false);
  const [catatanWaliSantri, setCatatanWaliSantri] = useState('');
  const [programSolvingChecked, setProgramSolvingChecked] = useState(false);
  const [catatanPermasalahanProgram, setCatatanPermasalahanProgram] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastError, setLastError] = useState<string | null>(null);

  const saveMutation = useSaveDailyReport();

  // Sync form state with existingReport when it changes
  // Use selectedDayKey as dependency to force reset when date changes
  useEffect(() => {
    if (existingReport) {
      setAttendancePhoto(existingReport.attendancePhoto || null);
      setArrivalTime(nanosecondsToTime(existingReport.date));
      setDepartureTime(nanosecondsToTime(existingReport.departureTime));
      setCatatanPresensi(existingReport.catatanPresensi || '');
      setClassControlChecked(Number(existingReport.classControlScore) > 0);
      setCatatanAmatanKelas(existingReport.catatanAmatanKelas || '');
      setTeacherControlChecked(Number(existingReport.teacherControlScore) > 0);
      setCatatanMonitoringGuru(existingReport.catatanMonitoringGuru || '');
      setWaliSantriChecked(Number(existingReport.waliSantriResponseScore) > 0);
      setCatatanWaliSantri(existingReport.catatanWaliSantri || '');
      setProgramSolvingChecked(Number(existingReport.programProblemSolvingScore) > 0);
      setCatatanPermasalahanProgram(existingReport.catatanPermasalahanProgram || '');
    } else {
      // Reset form for new report
      setAttendancePhoto(null);
      setArrivalTime('');
      setDepartureTime('');
      setCatatanPresensi('');
      setClassControlChecked(false);
      setCatatanAmatanKelas('');
      setTeacherControlChecked(false);
      setCatatanMonitoringGuru('');
      setWaliSantriChecked(false);
      setCatatanWaliSantri('');
      setProgramSolvingChecked(false);
      setCatatanPermasalahanProgram('');
    }
    // Reset save status when date changes
    setSaveStatus('idle');
    setLastError(null);
  }, [existingReport, selectedDayKey]);

  const calculateScore = () => {
    let score = 0;
    if (attendancePhoto && arrivalTime && departureTime) score += 20;
    if (classControlChecked) score += 20;
    if (teacherControlChecked) score += 20;
    if (waliSantriChecked) score += 20;
    if (programSolvingChecked) score += 20;
    return score;
  };

  const currentScore = calculateScore();

  // Autosave function
  const performAutosave = async () => {
    // Skip autosave if required fields are missing
    if (!attendancePhoto || !arrivalTime || !departureTime) {
      return;
    }

    setSaveStatus('saving');
    setLastError(null);

    const report: DailyReport = {
      date: timeToNanoseconds(arrivalTime, selectedDayKey),
      attendanceScore: BigInt(attendancePhoto && arrivalTime && departureTime ? 20 : 0),
      departureTime: timeToNanoseconds(departureTime, selectedDayKey),
      catatanPresensi: catatanPresensi,
      classControlScore: BigInt(classControlChecked ? 20 : 0),
      catatanAmatanKelas: catatanAmatanKelas,
      teacherControlScore: BigInt(teacherControlChecked ? 20 : 0),
      catatanMonitoringGuru: catatanMonitoringGuru,
      waliSantriResponseScore: BigInt(waliSantriChecked ? 20 : 0),
      catatanWaliSantri: catatanWaliSantri,
      programProblemSolvingScore: BigInt(programSolvingChecked ? 20 : 0),
      catatanPermasalahanProgram: catatanPermasalahanProgram,
      totalScore: BigInt(currentScore),
      attendancePhoto: attendancePhoto,
    };

    try {
      await saveMutation.mutateAsync({ report, dateKey: selectedDayKey });
      setSaveStatus('saved');
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
      console.error('Autosave error:', error);
      setSaveStatus('error');
      setLastError(error.message || 'Failed to save report');
    }
  };

  // Debounced autosave - triggers 1.5 seconds after last change
  // Cancel pending saves when selectedDayKey changes (date switch)
  const debouncedAutosave = useDebouncedCallback(
    performAutosave,
    1500,
    [selectedDayKey]
  );

  // Trigger autosave on any field change
  useEffect(() => {
    debouncedAutosave();
  }, [
    attendancePhoto,
    arrivalTime,
    departureTime,
    catatanPresensi,
    classControlChecked,
    catatanAmatanKelas,
    teacherControlChecked,
    catatanMonitoringGuru,
    waliSantriChecked,
    catatanWaliSantri,
    programSolvingChecked,
    catatanPermasalahanProgram,
  ]);

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!attendancePhoto) {
      toast.error(dashboardId.kepsek.form.validation.uploadPhoto);
      return;
    }

    if (!arrivalTime) {
      toast.error(dashboardId.kepsek.form.validation.enterArrival);
      return;
    }

    if (!departureTime) {
      toast.error(dashboardId.kepsek.form.validation.enterDeparture);
      return;
    }

    await performAutosave();
    
    if (saveStatus !== 'error') {
      toast.success(dashboardId.kepsek.form.successSave);
      if (onSuccess) {
        await onSuccess();
      }
    }
  };

  const handleRetry = () => {
    performAutosave();
  };

  return (
    <form onSubmit={handleManualSave} className="space-y-6">
      {/* Save Status Indicator */}
      {saveStatus !== 'idle' && (
        <Alert variant={saveStatus === 'error' ? 'destructive' : 'default'} className="border-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <>
                  <Save className="h-4 w-4 animate-pulse" />
                  <AlertDescription>Saving...</AlertDescription>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">Saved successfully</AlertDescription>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Save failed: {lastError || 'Unknown error'}
                  </AlertDescription>
                </>
              )}
            </div>
            {saveStatus === 'error' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={saveMutation.isPending}
              >
                Retry
              </Button>
            )}
          </div>
        </Alert>
      )}

      {/* Score Display */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-2">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">{dashboardId.kepsek.form.currentScore}</p>
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
              {currentScore}
              <span className="text-2xl text-muted-foreground ml-2">{dashboardId.kepsek.form.outOf}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            {dashboardId.kepsek.form.attendance.title}
          </CardTitle>
          <CardDescription>{dashboardId.kepsek.form.attendance.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AttendancePhotoField value={attendancePhoto} onChange={setAttendancePhoto} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="arrival-time">{dashboardId.kepsek.form.attendance.arrivalTime} *</Label>
              <Input
                id="arrival-time"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="departure-time">{dashboardId.kepsek.form.attendance.departureTime} *</Label>
              <Input
                id="departure-time"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="catatan-presensi">{dashboardId.kepsek.form.attendance.notes}</Label>
            <Textarea
              id="catatan-presensi"
              value={catatanPresensi}
              onChange={(e) => setCatatanPresensi(e.target.value)}
              placeholder={dashboardId.kepsek.form.attendance.placeholder}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Class Control Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-green-600" />
            {dashboardId.kepsek.form.classControl.title}
          </CardTitle>
          <CardDescription>{dashboardId.kepsek.form.classControl.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="class-control"
              checked={classControlChecked}
              onCheckedChange={(checked) => setClassControlChecked(checked === true)}
            />
            <Label htmlFor="class-control" className="cursor-pointer">
              {dashboardId.kepsek.form.classControl.checkbox}
            </Label>
          </div>

          <div>
            <Label htmlFor="catatan-kelas">{dashboardId.kepsek.form.classControl.notes}</Label>
            <Textarea
              id="catatan-kelas"
              value={catatanAmatanKelas}
              onChange={(e) => setCatatanAmatanKelas(e.target.value)}
              placeholder={dashboardId.kepsek.form.classControl.placeholder}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Teacher Control Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {dashboardId.kepsek.form.teacherControl.title}
          </CardTitle>
          <CardDescription>{dashboardId.kepsek.form.teacherControl.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="teacher-control"
              checked={teacherControlChecked}
              onCheckedChange={(checked) => setTeacherControlChecked(checked === true)}
            />
            <Label htmlFor="teacher-control" className="cursor-pointer">
              {dashboardId.kepsek.form.teacherControl.checkbox}
            </Label>
          </div>

          <div>
            <Label htmlFor="catatan-guru">{dashboardId.kepsek.form.teacherControl.notes}</Label>
            <Textarea
              id="catatan-guru"
              value={catatanMonitoringGuru}
              onChange={(e) => setCatatanMonitoringGuru(e.target.value)}
              placeholder={dashboardId.kepsek.form.teacherControl.placeholder}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Wali Santri Response Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-600" />
            {dashboardId.kepsek.form.parentResponse.title}
          </CardTitle>
          <CardDescription>{dashboardId.kepsek.form.parentResponse.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wali-santri"
              checked={waliSantriChecked}
              onCheckedChange={(checked) => setWaliSantriChecked(checked === true)}
            />
            <Label htmlFor="wali-santri" className="cursor-pointer">
              {dashboardId.kepsek.form.parentResponse.checkbox}
            </Label>
          </div>

          <div>
            <Label htmlFor="catatan-wali">{dashboardId.kepsek.form.parentResponse.notes}</Label>
            <Textarea
              id="catatan-wali"
              value={catatanWaliSantri}
              onChange={(e) => setCatatanWaliSantri(e.target.value)}
              placeholder={dashboardId.kepsek.form.parentResponse.placeholder}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Program & Problem Solving Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            {dashboardId.kepsek.form.programSolving.title}
          </CardTitle>
          <CardDescription>{dashboardId.kepsek.form.programSolving.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="program-solving"
              checked={programSolvingChecked}
              onCheckedChange={(checked) => setProgramSolvingChecked(checked === true)}
            />
            <Label htmlFor="program-solving" className="cursor-pointer">
              {dashboardId.kepsek.form.programSolving.checkbox}
            </Label>
          </div>

          <div>
            <Label htmlFor="catatan-program">{dashboardId.kepsek.form.programSolving.notes}</Label>
            <Textarea
              id="catatan-program"
              value={catatanPermasalahanProgram}
              onChange={(e) => setCatatanPermasalahanProgram(e.target.value)}
              placeholder={dashboardId.kepsek.form.programSolving.placeholder}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={saveMutation.isPending}
          className="min-w-[200px]"
        >
          {saveMutation.isPending ? dashboardId.common.saving : (existingReport ? dashboardId.kepsek.form.submitUpdate : dashboardId.kepsek.form.submitNew)}
        </Button>
      </div>
    </form>
  );
}
