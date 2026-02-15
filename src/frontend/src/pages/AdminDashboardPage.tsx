import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import AdminSummaryCards from '../components/admin/AdminSummaryCards';
import MonitoringTable from '../components/admin/MonitoringTable';
import AnalyticsSection from '../components/admin/AnalyticsSection';
import ActiveSchoolsSection from '../components/admin/ActiveSchoolsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigateToManagement: () => void;
}

export default function AdminDashboardPage({ onNavigateToManagement }: AdminDashboardPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader>
        <Button onClick={onNavigateToManagement} variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Kelola Kepsek
        </Button>
      </AppHeader>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Direktur
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoring performa harian kepala sekolah
          </p>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <Label htmlFor="date-select" className="text-sm font-medium mb-2 block">
            Select date
          </Label>
          <Input
            id="date-select"
            type="date"
            value={formatDateForInput(selectedDate)}
            onChange={handleDateChange}
            className="max-w-xs"
          />
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
            Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1">© {new Date().getFullYear()} SHQ Kepsek Tracker</p>
        </div>
      </footer>
    </div>
  );
}
