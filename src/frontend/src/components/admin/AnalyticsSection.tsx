import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetReportsForDate } from '../../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';

interface TrendDataPoint {
  date: string;
  avgScore: number;
}

interface CompletionDataPoint {
  name: string;
  value: number;
  count: number;
}

export default function AnalyticsSection() {
  const { data: todayReports, isLoading } = useGetReportsForDate(new Date());

  // Calculate aggregate completion percentages
  const completionData = useMemo((): CompletionDataPoint[] | null => {
    if (!todayReports || todayReports.length === 0) return null;

    const total = todayReports.length;
    let classControlComplete = 0;
    let teacherControlComplete = 0;
    let programComplete = 0;

    todayReports.forEach((report) => {
      if (Number(report.dailyReport.classControlScore) === 20) classControlComplete++;
      if (Number(report.dailyReport.teacherControlScore) === 20) teacherControlComplete++;
      if (Number(report.dailyReport.programProblemSolvingScore) === 20) programComplete++;
    });

    return [
      {
        name: 'Kontrol Kelas',
        value: Math.round((classControlComplete / total) * 100),
        count: classControlComplete,
      },
      {
        name: 'Kontrol Guru',
        value: Math.round((teacherControlComplete / total) * 100),
        count: teacherControlComplete,
      },
      {
        name: 'Program Berjalan',
        value: Math.round((programComplete / total) * 100),
        count: programComplete,
      },
    ];
  }, [todayReports]);

  // Mock trend data (last 7 days) - in real app, would fetch from backend
  const trendData = useMemo((): TrendDataPoint[] => {
    const days: TrendDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
        avgScore: i === 0 && todayReports ? 
          Math.round(todayReports.reduce((sum, r) => sum + Number(r.dailyReport.totalScore), 0) / todayReports.length) :
          Math.floor(Math.random() * 30) + 60, // Mock data for previous days
      });
    }
    return days;
  }, [todayReports]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 mb-6">
      {/* Trend Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tren Performa 7 Hari Terakhir</CardTitle>
          <CardDescription>Rata-rata skor harian seluruh sekolah</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Rata-rata Skor"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Completion Pie Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Persentase Penyelesaian Hari Ini</CardTitle>
          <CardDescription>Kategori yang diselesaikan dari total laporan</CardDescription>
        </CardHeader>
        <CardContent>
          {!completionData || completionData.every(d => d.value === 0) ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Belum ada data untuk hari ini
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: any) => [
                  `${value}% (${props.payload.count} dari ${todayReports?.length || 0})`,
                  name
                ]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
