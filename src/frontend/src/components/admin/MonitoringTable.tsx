import { useState } from 'react';
import { useGetDailyMonitoringRows } from '../../hooks/useQueries';
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
import type { DailyMonitoringRow } from '../../backend';
import { Badge } from '@/components/ui/badge';
import { dashboardId } from '../../localization/dashboardId';

interface MonitoringTableProps {
  selectedDate: Date;
}

export default function MonitoringTable({ selectedDate }: MonitoringTableProps) {
  const { data: monitoringRows, isLoading } = useGetDailyMonitoringRows(selectedDate);
  const [selectedRow, setSelectedRow] = useState<DailyMonitoringRow | null>(null);

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{dashboardId.admin.monitoring.title}</CardTitle>
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

  // Sort: submitted reports by score (highest first), then not-submitted rows
  const sortedRows = [...(monitoringRows || [])].sort((a, b) => {
    const hasReportA = !!a.report;
    const hasReportB = !!b.report;

    // Both have reports: sort by score descending
    if (hasReportA && hasReportB) {
      const scoreA = Number(a.report!.totalScore);
      const scoreB = Number(b.report!.totalScore);
      if (scoreB !== scoreA) return scoreB - scoreA;
    }

    // One has report, one doesn't: submitted first
    if (hasReportA && !hasReportB) return -1;
    if (!hasReportA && hasReportB) return 1;

    // Both don't have reports: sort by school name
    return a.school.name.localeCompare(b.school.name);
  });

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{dashboardId.admin.monitoring.title}</CardTitle>
          <CardDescription>
            {dashboardId.admin.monitoring.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedRows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {dashboardId.admin.monitoring.noSchools}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{dashboardId.admin.monitoring.rank}</TableHead>
                    <TableHead>{dashboardId.admin.monitoring.schoolName}</TableHead>
                    <TableHead>{dashboardId.admin.monitoring.principalName}</TableHead>
                    <TableHead>{dashboardId.admin.monitoring.status}</TableHead>
                    <TableHead>{dashboardId.admin.monitoring.dailyProgress}</TableHead>
                    <TableHead>{dashboardId.admin.monitoring.score}</TableHead>
                    <TableHead className="text-right">{dashboardId.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRows.map((row, index) => {
                    const hasReport = !!row.report;
                    const score = hasReport ? Number(row.report!.totalScore) : 0;

                    return (
                      <TableRow key={row.principal.toString()}>
                        <TableCell className="font-medium">
                          {hasReport ? (
                            <Badge variant="outline" className="font-bold">
                              #{index + 1}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{row.school.name}</TableCell>
                        <TableCell>{row.school.principalName}</TableCell>
                        <TableCell>
                          {hasReport ? (
                            <SubmissionStatusBadge submitted={true} />
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              {dashboardId.admin.monitoring.notSubmitted}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {hasReport ? (
                            <DailyProgressIndicators report={row.report!} />
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {hasReport ? (
                            <ScoreBadge score={score} />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {hasReport ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRow(row)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {dashboardId.admin.monitoring.view}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRow && (
        <ReportDetailView
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </>
  );
}
