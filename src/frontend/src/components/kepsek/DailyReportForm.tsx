import { useState } from 'react';
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
import { Clock, ClipboardCheck, Users, MessageSquare, Target } from 'lucide-react';
import { getTodayKey } from '../../utils/dayKey';
import { dashboardId } from '../../localization/dashboardId';

interface DailyReportFormProps {
  existingReport?: DailyReport | null;
  onSuccess?: () => void;
}

function timeToNanoseconds(timeString: string, baseDate: bigint): bigint {
  if (!timeString) return BigInt(0);
  const [hours, minutes] = timeString.split(':').map(Number);
  const millisInDay = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
  return baseDate + BigInt(millisInDay) * BigInt(1_000_000);
}

function nanosecondsToTime(nanos: bigint): string {
  if (nanos === BigInt(0)) return '';
  const totalMs = Number(nanos / BigInt(1_000_000));
  const date = new Date(totalMs);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function DailyReportForm({ existingReport, onSuccess }: DailyReportFormProps) {
  const [attendancePhoto, setAttendancePhoto] = useState<ExternalBlob | null>(
    existingReport?.attendancePhoto || null
  );
  const [arrivalTime, setArrivalTime] = useState(
    existingReport?.date ? nanosecondsToTime(existingReport.date) : '07:00'
  );
  const [departureTime, setDepartureTime] = useState(
    existingReport?.departureTime ? nanosecondsToTime(existingReport.departureTime) : '16:00'
  );
  
  const [classControlDone, setClassControlDone] = useState(!!existingReport?.classControlScore);
  const [classControlNotes, setClassControlNotes] = useState('');
  
  const [teacherControlDone, setTeacherControlDone] = useState(!!existingReport?.teacherControlScore);
  const [teacherControlNotes, setTeacherControlNotes] = useState('');
  
  const [waliSantriResponseDone, setWaliSantriResponseDone] = useState(!!existingReport?.waliSantriResponseScore);
  const [waliSantriResponseNotes, setWaliSantriResponseNotes] = useState('');
  
  const [programProblemSolvingDone, setProgramProblemSolvingDone] = useState(!!existingReport?.programProblemSolvingScore);
  const [programProblemSolvingNotes, setProgramProblemSolvingNotes] = useState('');

  const saveMutation = useSaveDailyReport();

  const calculateScore = () => {
    let total = 0;
    if (attendancePhoto && arrivalTime) total += 20;
    if (classControlDone) total += 20;
    if (teacherControlDone) total += 20;
    if (waliSantriResponseDone) total += 20;
    if (programProblemSolvingDone) total += 20;
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    const todayKey = getTodayKey();
    const arrivalNanos = timeToNanoseconds(arrivalTime, todayKey);
    const departureNanos = timeToNanoseconds(departureTime, todayKey);

    const report: DailyReport = {
      date: arrivalNanos,
      departureTime: departureNanos,
      attendanceScore: BigInt(attendancePhoto && arrivalTime ? 20 : 0),
      classControlScore: BigInt(classControlDone ? 20 : 0),
      teacherControlScore: BigInt(teacherControlDone ? 20 : 0),
      waliSantriResponseScore: BigInt(waliSantriResponseDone ? 20 : 0),
      programProblemSolvingScore: BigInt(programProblemSolvingDone ? 20 : 0),
      totalScore: BigInt(calculateScore()),
      attendancePhoto,
    };

    try {
      await saveMutation.mutateAsync(report);
      toast.success(dashboardId.kepsek.form.successSave);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || dashboardId.kepsek.form.errorSave);
    }
  };

  const currentScore = calculateScore();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Score Display */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 border-2">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">{dashboardId.kepsek.form.currentScore}</p>
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
              {currentScore}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{dashboardId.kepsek.form.outOf}</p>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            {dashboardId.kepsek.form.attendance.title}
          </CardTitle>
          <CardDescription>{dashboardId.kepsek.form.attendance.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AttendancePhotoField
            value={attendancePhoto}
            onChange={setAttendancePhoto}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="arrival-time">{dashboardId.kepsek.form.attendance.arrivalTime}</Label>
              <Input
                id="arrival-time"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="departure-time">{dashboardId.kepsek.form.attendance.departureTime}</Label>
              <Input
                id="departure-time"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Class Control */}
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
              checked={classControlDone}
              onCheckedChange={(checked) => setClassControlDone(checked as boolean)}
            />
            <Label htmlFor="class-control" className="cursor-pointer">
              {dashboardId.kepsek.form.classControl.checkbox}
            </Label>
          </div>
          {classControlDone && (
            <div>
              <Label htmlFor="class-control-notes">{dashboardId.kepsek.form.classControl.notes}</Label>
              <Textarea
                id="class-control-notes"
                value={classControlNotes}
                onChange={(e) => setClassControlNotes(e.target.value)}
                placeholder={dashboardId.kepsek.form.classControl.placeholder}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Teacher Control */}
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
              checked={teacherControlDone}
              onCheckedChange={(checked) => setTeacherControlDone(checked as boolean)}
            />
            <Label htmlFor="teacher-control" className="cursor-pointer">
              {dashboardId.kepsek.form.teacherControl.checkbox}
            </Label>
          </div>
          {teacherControlDone && (
            <div>
              <Label htmlFor="teacher-control-notes">{dashboardId.kepsek.form.teacherControl.notes}</Label>
              <Textarea
                id="teacher-control-notes"
                value={teacherControlNotes}
                onChange={(e) => setTeacherControlNotes(e.target.value)}
                placeholder={dashboardId.kepsek.form.teacherControl.placeholder}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Wali Santri Response */}
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
              id="wali-santri-response"
              checked={waliSantriResponseDone}
              onCheckedChange={(checked) => setWaliSantriResponseDone(checked as boolean)}
            />
            <Label htmlFor="wali-santri-response" className="cursor-pointer">
              {dashboardId.kepsek.form.parentResponse.checkbox}
            </Label>
          </div>
          {waliSantriResponseDone && (
            <div>
              <Label htmlFor="wali-santri-response-notes">{dashboardId.kepsek.form.parentResponse.notes}</Label>
              <Textarea
                id="wali-santri-response-notes"
                value={waliSantriResponseNotes}
                onChange={(e) => setWaliSantriResponseNotes(e.target.value)}
                placeholder={dashboardId.kepsek.form.parentResponse.placeholder}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Program & Problem Solving */}
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
              id="program-problem-solving"
              checked={programProblemSolvingDone}
              onCheckedChange={(checked) => setProgramProblemSolvingDone(checked as boolean)}
            />
            <Label htmlFor="program-problem-solving" className="cursor-pointer">
              {dashboardId.kepsek.form.programSolving.checkbox}
            </Label>
          </div>
          {programProblemSolvingDone && (
            <div>
              <Label htmlFor="program-problem-solving-notes">{dashboardId.kepsek.form.programSolving.notes}</Label>
              <Textarea
                id="program-problem-solving-notes"
                value={programProblemSolvingNotes}
                onChange={(e) => setProgramProblemSolvingNotes(e.target.value)}
                placeholder={dashboardId.kepsek.form.programSolving.placeholder}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={saveMutation.isPending}
      >
        {saveMutation.isPending ? dashboardId.common.saving : existingReport ? dashboardId.kepsek.form.submitUpdate : dashboardId.kepsek.form.submitNew}
      </Button>
    </form>
  );
}
