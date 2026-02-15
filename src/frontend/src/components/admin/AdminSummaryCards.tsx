import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetActiveSchoolsCount, useGetTodayReports } from '../../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { School, ClipboardCheck } from 'lucide-react';

interface AdminSummaryCardsProps {
  selectedDate: Date;
}

export default function AdminSummaryCards({ selectedDate }: AdminSummaryCardsProps) {
  const { data: activeSchoolsCount, isLoading: countLoading } = useGetActiveSchoolsCount();
  const { data: todayReports, isLoading: reportsLoading } = useGetTodayReports();

  const submissionsCount = todayReports?.length || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sekolah Aktif</CardTitle>
          <School className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          {countLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div className="text-3xl font-bold text-blue-600">
              {Number(activeSchoolsCount || 0)}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Total sekolah terdaftar dan aktif
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Laporan Hari Ini</CardTitle>
          <ClipboardCheck className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div className="text-3xl font-bold text-green-600">
              {submissionsCount}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Kepsek yang sudah mengisi form
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
