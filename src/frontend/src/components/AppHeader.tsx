import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { type ReactNode } from 'react';

interface AppHeaderProps {
  children?: ReactNode;
}

export default function AppHeader({ children }: AppHeaderProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/shq-kepsek-icon.dim_512x512.png"
            alt="SHQ Icon"
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              SHQ Kepsek Tracker
            </h1>
            <p className="text-xs text-muted-foreground">Daily Performance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {children}
          <Button onClick={handleLogout} variant="ghost" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>
    </header>
  );
}
