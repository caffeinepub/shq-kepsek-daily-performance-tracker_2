import { useState } from 'react';
import { useGetTodayReports } from '../../hooks/useQueries';
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
import type { RankedDailyReport } from '../../backend';
import { Principal } from '@dfinity/principal';

interface MonitoringTableProps {
  selectedDate: Date;
}

export default function MonitoringTable({ selectedDate }: MonitoringTableProps) {
  const { data: reports, isLoading } = useGetTodayReports();
  const [selectedReport, setSelectedReport] = useState<RankedDailyReport | null>(null);

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Monitoring Kepsek</CardTitle>
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
          <CardTitle>Monitoring Kepsek</CardTitle>
          <CardDescription>
            Daftar kepala sekolah dan skor harian mereka (diurutkan berdasarkan skor tertinggi)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada laporan untuk hari ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Principal ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Skor</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedReports.map((report, index) => (
                    <TableRow key={report.kepsek.toString()}>
                      <TableCell className="font-bold text-lg">#{index + 1}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {report.kepsek.toString().slice(0, 20)}...
                      </TableCell>
                      <TableCell>
                        <SubmissionStatusBadge submitted={true} />
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
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
