import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DailyReport } from '../../backend';
import { CheckCircle2, Edit, Clock, Image as ImageIcon } from 'lucide-react';
import { dashboardId } from '../../localization/dashboardId';

interface TodaySubmissionSummaryProps {
  report: DailyReport;
  selectedDate: Date;
  onEdit: () => void;
}

function nanosecondsToTime(nanos: bigint): string {
  if (nanos === BigInt(0)) return dashboardId.common.notProvided;
  const milliseconds = Number(nanos / BigInt(1_000_000));
  const date = new Date(milliseconds);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function TodaySubmissionSummary({ report, selectedDate, onEdit }: TodaySubmissionSummaryProps) {
  const arrivalTime = nanosecondsToTime(report.date);
  const departureTime = nanosecondsToTime(report.departureTime);

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {dashboardId.kepsek.summary.title}
            </CardTitle>
            <CardDescription>
              {formatDateDisplay(selectedDate)}
            </CardDescription>
          </div>
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            {dashboardId.kepsek.summary.editReport}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attendance Photo */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            {dashboardId.kepsek.summary.attendancePhoto}
          </h3>
          {report.attendancePhoto ? (
            <img
              src={report.attendancePhoto.getDirectURL()}
              alt="Attendance"
              className="w-full max-w-md rounded-lg border"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{dashboardId.common.noPhoto}</p>
          )}
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">{dashboardId.admin.reportDetail.arrivalTime}</p>
              <p className="font-medium">{arrivalTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">{dashboardId.admin.reportDetail.departureTime}</p>
              <p className="font-medium">{departureTime}</p>
            </div>
          </div>
        </div>

        {/* Attendance Notes */}
        {report.catatanPresensi && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="text-sm font-medium mb-2">{dashboardId.kepsek.form.attendance.notes}</h4>
            <p className="text-sm whitespace-pre-wrap">{report.catatanPresensi}</p>
          </div>
        )}

        {/* Score Breakdown */}
        <div>
          <h3 className="text-sm font-medium mb-3">{dashboardId.kepsek.summary.scoreBreakdown}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">{dashboardId.kepsek.summary.categories.attendance}</span>
              <Badge variant={Number(report.attendanceScore) > 0 ? 'default' : 'secondary'}>
                {Number(report.attendanceScore)} {dashboardId.common.points}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">{dashboardId.kepsek.summary.categories.classControl}</span>
              <Badge variant={Number(report.classControlScore) > 0 ? 'default' : 'secondary'}>
                {Number(report.classControlScore)} {dashboardId.common.points}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">{dashboardId.kepsek.summary.categories.teacherControl}</span>
              <Badge variant={Number(report.teacherControlScore) > 0 ? 'default' : 'secondary'}>
                {Number(report.teacherControlScore)} {dashboardId.common.points}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">{dashboardId.kepsek.summary.categories.parentResponse}</span>
              <Badge variant={Number(report.waliSantriResponseScore) > 0 ? 'default' : 'secondary'}>
                {Number(report.waliSantriResponseScore)} {dashboardId.common.points}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg md:col-span-2">
              <span className="text-sm">{dashboardId.kepsek.summary.categories.programSolving}</span>
              <Badge variant={Number(report.programProblemSolvingScore) > 0 ? 'default' : 'secondary'}>
                {Number(report.programProblemSolvingScore)} {dashboardId.common.points}
              </Badge>
            </div>
          </div>
        </div>

        {/* Additional Notes Sections */}
        {report.catatanAmatanKelas && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <h4 className="text-sm font-medium mb-2">{dashboardId.kepsek.form.classControl.notes}</h4>
            <p className="text-sm whitespace-pre-wrap">{report.catatanAmatanKelas}</p>
          </div>
        )}

        {report.catatanMonitoringGuru && (
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <h4 className="text-sm font-medium mb-2">{dashboardId.kepsek.form.teacherControl.notes}</h4>
            <p className="text-sm whitespace-pre-wrap">{report.catatanMonitoringGuru}</p>
          </div>
        )}

        {report.catatanWaliSantri && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <h4 className="text-sm font-medium mb-2">{dashboardId.kepsek.form.parentResponse.notes}</h4>
            <p className="text-sm whitespace-pre-wrap">{report.catatanWaliSantri}</p>
          </div>
        )}

        {report.catatanPermasalahanProgram && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <h4 className="text-sm font-medium mb-2">{dashboardId.kepsek.form.programSolving.notes}</h4>
            <p className="text-sm whitespace-pre-wrap">{report.catatanPermasalahanProgram}</p>
          </div>
        )}

        {/* Total Score */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total Skor:</span>
            <Badge className="text-lg px-4 py-2" variant="default">
              {Number(report.totalScore)} / 100 {dashboardId.common.points}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
