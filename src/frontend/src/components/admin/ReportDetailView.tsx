import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { DailyReport } from '../../backend';
import { Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { dashboardId } from '../../localization/dashboardId';

interface ReportDetailViewProps {
  report: DailyReport | null;
  schoolName: string;
  principalName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTime(nanos: bigint): string {
  if (nanos === BigInt(0)) return dashboardId.common.notProvided;
  const totalMs = Number(nanos / BigInt(1_000_000));
  const date = new Date(totalMs);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function ReportDetailView({
  report,
  schoolName,
  principalName,
  open,
  onOpenChange,
}: ReportDetailViewProps) {
  if (!report) return null;

  const categories = [
    {
      name: dashboardId.admin.reportDetail.categories.attendance,
      score: Number(report.attendanceScore),
      note: report.catatanPresensi,
    },
    {
      name: dashboardId.admin.reportDetail.categories.classControl,
      score: Number(report.classControlScore),
      note: report.catatanAmatanKelas,
    },
    {
      name: dashboardId.admin.reportDetail.categories.teacherControl,
      score: Number(report.teacherControlScore),
      note: report.catatanMonitoringGuru,
    },
    {
      name: dashboardId.admin.reportDetail.categories.parentResponse,
      score: Number(report.waliSantriResponseScore),
      note: report.catatanWaliSantri,
    },
    {
      name: dashboardId.admin.reportDetail.categories.programSolving,
      score: Number(report.programProblemSolvingScore),
      note: report.catatanPermasalahanProgram,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dashboardId.admin.reportDetail.title}</DialogTitle>
          <DialogDescription>
            {schoolName} - {principalName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Attendance Photo */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {dashboardId.admin.reportDetail.attendancePhoto}
            </h3>
            {report.attendancePhoto ? (
              <img
                src={report.attendancePhoto.getDirectURL()}
                alt="Attendance"
                className="w-full max-w-md rounded-lg border"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{dashboardId.admin.reportDetail.noPhoto}</p>
            )}
          </div>

          <Separator />

          {/* Time Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{dashboardId.admin.reportDetail.arrivalTime}</p>
              <p className="text-lg font-semibold">{formatTime(report.date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{dashboardId.admin.reportDetail.departureTime}</p>
              <p className="text-lg font-semibold">{formatTime(report.departureTime)}</p>
            </div>
          </div>

          <Separator />

          {/* Score Breakdown */}
          <div>
            <h3 className="font-semibold mb-3">{dashboardId.admin.reportDetail.scoreBreakdown}</h3>
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <Badge variant={category.score > 0 ? 'default' : 'secondary'}>
                      {category.score > 0 ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {category.score} {dashboardId.common.points || 'poin'}
                    </Badge>
                  </div>
                  {category.note && category.note.trim() !== '' && (
                    <div className="ml-4 p-3 bg-muted rounded-md">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{category.note}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total Score */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Skor</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Number(report.totalScore)} / 100
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
