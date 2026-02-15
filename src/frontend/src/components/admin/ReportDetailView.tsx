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

function formatTime(nanos: bigint): string {
  if (nanos === BigInt(0)) return 'Not provided';
  const totalMs = Number(nanos / BigInt(1_000_000));
  const date = new Date(totalMs);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function ReportDetailView({ report, onClose }: ReportDetailViewProps) {
  const { dailyReport, kepsek } = report;

  // Helper to safely get attendance photo URL
  const getAttendancePhotoUrl = (): string | null => {
    try {
      if (!dailyReport.attendancePhoto) return null;
      if (typeof dailyReport.attendancePhoto === 'object' && 'getDirectURL' in dailyReport.attendancePhoto) {
        return dailyReport.attendancePhoto.getDirectURL();
      }
      return null;
    } catch {
      return null;
    }
  };

  const photoUrl = getAttendancePhotoUrl();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Daily Report Details</span>
            <ScoreBadge score={Number(dailyReport.totalScore)} className="text-lg" />
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Principal: {kepsek.toString()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Attendance Photo */}
            {photoUrl && (
              <div>
                <p className="text-sm font-semibold mb-2">Attendance Photo:</p>
                <img
                  src={photoUrl}
                  alt="Attendance"
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>
            )}

            {/* Time Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Arrival Time</p>
                <p className="text-sm font-semibold">{formatTime(dailyReport.date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Departure Time</p>
                <p className="text-sm font-semibold">{formatTime(dailyReport.departureTime)}</p>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-2">
              <p className="text-sm font-semibold mb-3">Score Breakdown:</p>
              <CategoryScoreBadge
                score={Number(dailyReport.attendanceScore)}
                maxScore={20}
                label="Attendance + Photo"
              />
              <CategoryScoreBadge
                score={Number(dailyReport.classControlScore)}
                maxScore={20}
                label="Class Control"
              />
              <CategoryScoreBadge
                score={Number(dailyReport.teacherControlScore)}
                maxScore={20}
                label="Teacher Control"
              />
              <CategoryScoreBadge
                score={Number(dailyReport.waliSantriResponseScore)}
                maxScore={20}
                label="Parent Response"
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
                Date: {new Date(Number(dailyReport.date) / 1_000_000).toLocaleDateString('en-US')}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
