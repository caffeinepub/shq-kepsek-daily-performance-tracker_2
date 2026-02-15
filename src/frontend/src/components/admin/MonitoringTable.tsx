import { useState } from 'react';
import { useGetReportsForDate } from '../../hooks/useQueries';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreBadge, SubmissionStatusBadge } from '../StatusPills';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import ReportDetailView from './ReportDetailView';
import DailyProgressIndicators from './DailyProgressIndicators';
import type { RankedDailyReport } from '../../backend';

interface MonitoringTableProps {
  selectedDate: Date;
}

export default function MonitoringTable({ selectedDate }: MonitoringTableProps) {
  const { data: reports, isLoading } = useGetReportsForDate(selectedDate);
  const [selectedReport, setSelectedReport] = useState<RankedDailyReport | null>(null);

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Principal Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedReports = [...(reports || [])].sort((a, b) => {
    const scoreA = Number(a.dailyReport.totalScore);
    const scoreB = Number(b.dailyReport.totalScore);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.kepsek.toString().localeCompare(b.kepsek.toString());
  });

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Principal Monitoring</CardTitle>
          <CardDescription>
            List of school principals and their daily scores (sorted by highest score)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports available for this date
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Principal ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Daily Progress</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedReports.map((report, index) => {
                    try {
                      return (
                        <TableRow key={report.kepsek.toString()}>
                          <TableCell className="font-bold text-lg">#{index + 1}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {report.kepsek.toString().slice(0, 20)}...
                          </TableCell>
                          <TableCell>
                            <SubmissionStatusBadge submitted={true} />
                          </TableCell>
                          <TableCell>
                            {report.dailyReport ? (
                              <DailyProgressIndicators report={report.dailyReport} />
                            ) : (
                              <span className="text-xs text-muted-foreground">No data</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <ScoreBadge score={Number(report.dailyReport.totalScore)} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    } catch (error) {
                      console.error('Error rendering report row:', error);
                      return (
                        <TableRow key={report.kepsek.toString()}>
                          <TableCell colSpan={6} className="text-center text-xs text-muted-foreground">
                            Error displaying report for {report.kepsek.toString().slice(0, 20)}...
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedReport && (
        <ReportDetailView
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </>
  );
}
