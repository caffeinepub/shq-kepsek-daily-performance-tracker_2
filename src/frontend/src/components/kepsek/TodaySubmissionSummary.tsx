import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryScoreBadge, ScoreBadge } from '../StatusPills';
import type { DailyReport } from '../../backend';
import { CheckCircle2, Edit } from 'lucide-react';

interface TodaySubmissionSummaryProps {
  report: DailyReport;
  onEdit: () => void;
}

export default function TodaySubmissionSummary({ report, onEdit }: TodaySubmissionSummaryProps) {
  return (
    <Card className="shadow-lg border-2 border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              Laporan Hari Ini
            </CardTitle>
            <CardDescription className="text-green-50">
              Anda sudah mengisi laporan untuk hari ini
            </CardDescription>
          </div>
          <ScoreBadge score={Number(report.totalScore)} className="text-lg px-4 py-2" />
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Attendance Photo */}
        {report.attendancePhoto && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Foto Kehadiran:</p>
            <img
              src={report.attendancePhoto.getDirectURL()}
              alt="Attendance"
              className="w-full h-48 object-cover rounded-lg border"
            />
          </div>
        )}

        {/* Score Breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-semibold mb-3">Rincian Skor:</p>
          <CategoryScoreBadge
            score={Number(report.attendanceScore)}
            maxScore={20}
            label="Kehadiran"
          />
          <CategoryScoreBadge
            score={Number(report.classControlScore)}
            maxScore={20}
            label="Kontrol Kelas"
          />
          <CategoryScoreBadge
            score={Number(report.teacherControlScore)}
            maxScore={20}
            label="Kontrol Guru"
          />
          <CategoryScoreBadge
            score={Number(report.waliSantriResponseScore)}
            maxScore={20}
            label="Respon Wali Santri"
          />
          <CategoryScoreBadge
            score={Number(report.programProblemSolvingScore)}
            maxScore={20}
            label="Program & Problem Solving"
          />
        </div>

        <Button onClick={onEdit} variant="outline" className="w-full mt-4">
          <Edit className="h-4 w-4 mr-2" />
          Edit Laporan
        </Button>
      </CardContent>
    </Card>
  );
}
