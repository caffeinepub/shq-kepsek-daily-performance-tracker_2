import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoryScoreBadge, ScoreBadge } from '../StatusPills';
import type { RankedDailyReport } from '../../backend';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReportDetailViewProps {
  report: RankedDailyReport;
  onClose: () => void;
}

export default function ReportDetailView({ report, onClose }: ReportDetailViewProps) {
  const { dailyReport, kepsek } = report;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detail Laporan Harian</span>
            <ScoreBadge score={Number(dailyReport.totalScore)} className="text-lg" />
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Principal: {kepsek.toString()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Attendance Photo */}
            {dailyReport.attendancePhoto && (
              <div>
                <p className="text-sm font-semibold mb-2">Foto Kehadiran:</p>
                <img
                  src={dailyReport.attendancePhoto.getDirectURL()}
                  alt="Attendance"
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>
            )}

            {/* Score Breakdown */}
            <div className="space-y-2">
              <p className="text-sm font-semibold mb-3">Rincian Skor:</p>
              <CategoryScoreBadge
                score={Number(dailyReport.attendanceScore)}
                maxScore={20}
                label="Kehadiran + Foto"
              />
              <CategoryScoreBadge
                score={Number(dailyReport.classControlScore)}
                maxScore={20}
                label="Kontrol Kelas"
              />
              <CategoryScoreBadge
                score={Number(dailyReport.teacherControlScore)}
                maxScore={20}
                label="Kontrol Guru"
              />
              <CategoryScoreBadge
                score={Number(dailyReport.waliSantriResponseScore)}
                maxScore={20}
                label="Respon Wali Santri"
              />
              <CategoryScoreBadge
                score={Number(dailyReport.programProblemSolvingScore)}
                maxScore={20}
                label="Program & Problem Solving"
              />
            </div>

            {/* Date Info */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Tanggal: {new Date(Number(dailyReport.date) / 1_000_000).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
