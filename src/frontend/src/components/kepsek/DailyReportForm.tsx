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

interface DailyReportFormProps {
  existingReport?: DailyReport | null;
  onSuccess?: () => void;
}

export default function DailyReportForm({ existingReport, onSuccess }: DailyReportFormProps) {
  const [attendancePhoto, setAttendancePhoto] = useState<ExternalBlob | null>(
    existingReport?.attendancePhoto || null
  );
  const [arrivalTime, setArrivalTime] = useState(existingReport ? '07:00' : '');
  const [departureTime, setDepartureTime] = useState(existingReport ? '16:00' : '');
  
  const [classControlDone, setClassControlDone] = useState(!!existingReport?.classControlScore);
  const [classControlNotes, setClassControlNotes] = useState('');
  
  const [teacherControlDone, setTeacherControlDone] = useState(!!existingReport?.teacherControlScore);
  const [teacherControlNotes, setTeacherControlNotes] = useState('');
  
  const [waliSantriDone, setWaliSantriDone] = useState(!!existingReport?.waliSantriResponseScore);
  const [waliSantriNotes, setWaliSantriNotes] = useState('');
  
  const [programDone, setProgramDone] = useState(!!existingReport?.programProblemSolvingScore);
  const [programNotes, setProgramNotes] = useState('');

  const saveDailyReport = useSaveDailyReport();

  const calculateScore = () => {
    let total = 0;
    const scores = {
      attendance: 0,
      classControl: 0,
      teacherControl: 0,
      waliSantri: 0,
      program: 0,
    };

    // Attendance: 20 points if photo and times are provided
    if (attendancePhoto && arrivalTime && departureTime) {
      scores.attendance = 20;
      total += 20;
    }

    // Class Control: 20 points if checked
    if (classControlDone) {
      scores.classControl = 20;
      total += 20;
    }

    // Teacher Control: 20 points if checked
    if (teacherControlDone) {
      scores.teacherControl = 20;
      total += 20;
    }

    // Wali Santri Response: 20 points if checked
    if (waliSantriDone) {
      scores.waliSantri = 20;
      total += 20;
    }

    // Program & Problem Solving: 20 points if checked
    if (programDone) {
      scores.program = 20;
      total += 20;
    }

    return { total, ...scores };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!arrivalTime || !departureTime) {
      toast.error('Jam datang dan pulang harus diisi');
      return;
    }

    const scores = calculateScore();

    try {
      const report: DailyReport = {
        date: BigInt(new Date().setHours(0, 0, 0, 0)) * BigInt(1_000_000), // Normalize to midnight in nanoseconds
        attendanceScore: BigInt(scores.attendance),
        classControlScore: BigInt(scores.classControl),
        teacherControlScore: BigInt(scores.teacherControl),
        waliSantriResponseScore: BigInt(scores.waliSantri),
        programProblemSolvingScore: BigInt(scores.program),
        totalScore: BigInt(scores.total),
        attendancePhoto: attendancePhoto || undefined,
      };

      await saveDailyReport.mutateAsync(report);
      toast.success(`Laporan berhasil disimpan! Total skor: ${scores.total}/100`);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan laporan');
    }
  };

  const currentScore = calculateScore();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Attendance Section */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Absensi Kehadiran (20 Poin)
          </CardTitle>
          <CardDescription className="text-blue-50">
            Upload foto kehadiran dan catat jam datang/pulang
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <AttendancePhotoField value={attendancePhoto} onChange={setAttendancePhoto} />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrivalTime">Jam Datang *</Label>
              <Input
                id="arrivalTime"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureTime">Jam Pulang *</Label>
              <Input
                id="departureTime"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Control Section */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Kontrol Kelas (20 Poin)
          </CardTitle>
          <CardDescription className="text-green-50">
            Laporan monitoring kelas hari ini
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="classControl"
              checked={classControlDone}
              onCheckedChange={(checked) => setClassControlDone(checked as boolean)}
            />
            <Label htmlFor="classControl" className="font-medium cursor-pointer">
              Sudah melakukan kontrol kelas hari ini
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="classControlNotes">Catatan (Opsional)</Label>
            <Textarea
              id="classControlNotes"
              value={classControlNotes}
              onChange={(e) => setClassControlNotes(e.target.value)}
              placeholder="Catatan hasil kontrol kelas..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Teacher Control Section */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kontrol Guru (20 Poin)
          </CardTitle>
          <CardDescription className="text-purple-50">
            Laporan monitoring guru hari ini
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="teacherControl"
              checked={teacherControlDone}
              onCheckedChange={(checked) => setTeacherControlDone(checked as boolean)}
            />
            <Label htmlFor="teacherControl" className="font-medium cursor-pointer">
              Sudah melakukan kontrol guru hari ini
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacherControlNotes">Catatan (Opsional)</Label>
            <Textarea
              id="teacherControlNotes"
              value={teacherControlNotes}
              onChange={(e) => setTeacherControlNotes(e.target.value)}
              placeholder="Catatan hasil kontrol guru..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Wali Santri Response Section */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Respon Wali Santri (20 Poin)
          </CardTitle>
          <CardDescription className="text-orange-50">
            Laporan komunikasi dengan wali santri
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="waliSantri"
              checked={waliSantriDone}
              onCheckedChange={(checked) => setWaliSantriDone(checked as boolean)}
            />
            <Label htmlFor="waliSantri" className="font-medium cursor-pointer">
              Sudah merespon wali santri hari ini
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="waliSantriNotes">Catatan (Opsional)</Label>
            <Textarea
              id="waliSantriNotes"
              value={waliSantriNotes}
              onChange={(e) => setWaliSantriNotes(e.target.value)}
              placeholder="Catatan respon wali santri..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Program & Problem Solving Section */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Program Sekolah & Problem Solving (20 Poin)
          </CardTitle>
          <CardDescription className="text-teal-50">
            Laporan program dan penyelesaian masalah
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="program"
              checked={programDone}
              onCheckedChange={(checked) => setProgramDone(checked as boolean)}
            />
            <Label htmlFor="program" className="font-medium cursor-pointer">
              Program berjalan dan masalah tertangani hari ini
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="programNotes">Catatan (Opsional)</Label>
            <Textarea
              id="programNotes"
              value={programNotes}
              onChange={(e) => setProgramNotes(e.target.value)}
              placeholder="Catatan program dan problem solving..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Score Preview & Submit */}
      <Card className="shadow-lg border-2 border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Skor Saat Ini</p>
              <p className="text-4xl font-bold text-primary">{currentScore.total}/100</p>
            </div>
            <div className="text-right space-y-1 text-sm">
              <p className="text-muted-foreground">Kehadiran: {currentScore.attendance}/20</p>
              <p className="text-muted-foreground">Kontrol Kelas: {currentScore.classControl}/20</p>
              <p className="text-muted-foreground">Kontrol Guru: {currentScore.teacherControl}/20</p>
              <p className="text-muted-foreground">Wali Santri: {currentScore.waliSantri}/20</p>
              <p className="text-muted-foreground">Program: {currentScore.program}/20</p>
            </div>
          </div>
          <Button type="submit" className="w-full h-12 text-base" disabled={saveDailyReport.isPending}>
            {saveDailyReport.isPending ? 'Menyimpan...' : 'Simpan Laporan Harian'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
