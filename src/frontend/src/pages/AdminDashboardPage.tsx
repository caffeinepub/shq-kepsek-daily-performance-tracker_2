import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import AdminSummaryCards from '../components/admin/AdminSummaryCards';
import MonitoringTable from '../components/admin/MonitoringTable';
import AnalyticsSection from '../components/admin/AnalyticsSection';
import ActiveSchoolsSection from '../components/admin/ActiveSchoolsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Download } from 'lucide-react';
import { dashboardId } from '../localization/dashboardId';
import { useGetDailyMonitoringRows } from '../hooks/useQueries';
import { downloadReportsAsCSV } from '../utils/reportDownload';
import { toast } from 'sonner';

interface AdminDashboardPageProps {
  onNavigateToManagement: () => void;
}

export default function AdminDashboardPage({ onNavigateToManagement }: AdminDashboardPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: monitoringRows, isLoading: downloadLoading } = useGetDailyMonitoringRows(selectedDate);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    }
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDownloadReport = () => {
    if (!monitoringRows || monitoringRows.length === 0) {
      toast.error(dashboardId.admin.download.noData);
      return;
    }

    try {
      downloadReportsAsCSV(monitoringRows, selectedDate);
      toast.success(dashboardId.admin.download.success);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(dashboardId.admin.download.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader>
        <Button onClick={onNavigateToManagement} variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          {dashboardId.admin.manageKepsek}
        </Button>
      </AppHeader>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {dashboardId.admin.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {dashboardId.admin.subtitle}
          </p>
        </div>

        {/* Date Selector with Download Button */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full sm:max-w-xs">
            <Label htmlFor="date-select" className="text-sm font-medium mb-2 block">
              {dashboardId.admin.selectDate}
            </Label>
            <Input
              id="date-select"
              type="date"
              value={formatDateForInput(selectedDate)}
              onChange={handleDateChange}
            />
          </div>
          <Button
            onClick={handleDownloadReport}
            disabled={downloadLoading || !monitoringRows || monitoringRows.length === 0}
            variant="default"
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {dashboardId.admin.download.button}
          </Button>
        </div>

        {/* Summary Cards */}
        <AdminSummaryCards selectedDate={selectedDate} />

        {/* Analytics Charts */}
        <AnalyticsSection />

        {/* Active Schools Section */}
        <div className="mb-6">
          <ActiveSchoolsSection />
        </div>

        {/* Monitoring Table */}
        <MonitoringTable selectedDate={selectedDate} />
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            {dashboardId.footer.builtWith}{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1">{dashboardId.footer.copyright(new Date().getFullYear())}</p>
        </div>
      </footer>
    </div>
  );
}
