import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoryScoreBadge, ScoreBadge } from '../StatusPills';
import { getOptionalBlobUrl } from '../../utils/candidOption';
import type { DailyMonitoringRow } from '../../backend';
import { ScrollArea } from '@/components/ui/scroll-area';
import { dashboardId } from '../../localization/dashboardId';

interface ReportDetailViewProps {
  row: DailyMonitoringRow;
  onClose: () => void;
}

function formatTime(nanos: bigint): string {
  if (nanos === BigInt(0)) return dashboardId.common.notProvided;
  try {
    const totalMs = Number(nanos / BigInt(1_000_000));
    const date = new Date(totalMs);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return dashboardId.common.notProvided;
  }
}

export default function ReportDetailView({ row, onClose }: ReportDetailViewProps) {
  // Only render if report exists
  if (!row.report) {
    return null;
  }

  const { report, principal, school } = row;

  // Safely get attendance photo URL using the utility
  const photoUrl = getOptionalBlobUrl(report.attendancePhoto);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{dashboardId.admin.reportDetail.title}</span>
            <ScoreBadge score={Number(report.totalScore)} className="text-lg" />
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-1">
              <div className="font-semibold text-foreground">{school.name}</div>
              <div className="text-sm">{school.principalName}</div>
              <div className="font-mono text-xs">{principal.toString()}</div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Attendance Photo */}
            {photoUrl ? (
              <div>
                <p className="text-sm font-semibold mb-2">{dashboardId.admin.reportDetail.attendancePhoto}</p>
                <img
                  src={photoUrl}
                  alt="Attendance"
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold mb-2">{dashboardId.admin.reportDetail.attendancePhoto}</p>
                <div className="w-full h-32 flex items-center justify-center bg-muted/50 rounded-lg border border-dashed">
                  <p className="text-xs text-muted-foreground">{dashboardId.admin.reportDetail.noPhoto}</p>
                </div>
              </div>
            )}

            {/* Time Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{dashboardId.admin.reportDetail.arrivalTime}</p>
                <p className="text-sm font-semibold">{formatTime(report.date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{dashboardId.admin.reportDetail.departureTime}</p>
                <p className="text-sm font-semibold">{formatTime(report.departureTime)}</p>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-2">
              <p className="text-sm font-semibold mb-3">{dashboardId.admin.reportDetail.scoreBreakdown}</p>
              <CategoryScoreBadge
                score={Number(report.attendanceScore)}
                maxScore={20}
                label={dashboardId.admin.reportDetail.categories.attendance}
              />
              <CategoryScoreBadge
                score={Number(report.classControlScore)}
                maxScore={20}
                label={dashboardId.admin.reportDetail.categories.classControl}
              />
              <CategoryScoreBadge
                score={Number(report.teacherControlScore)}
                maxScore={20}
                label={dashboardId.admin.reportDetail.categories.teacherControl}
              />
              <CategoryScoreBadge
                score={Number(report.waliSantriResponseScore)}
                maxScore={20}
                label={dashboardId.admin.reportDetail.categories.parentResponse}
              />
              <CategoryScoreBadge
                score={Number(report.programProblemSolvingScore)}
                maxScore={20}
                label={dashboardId.admin.reportDetail.categories.programSolving}
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
