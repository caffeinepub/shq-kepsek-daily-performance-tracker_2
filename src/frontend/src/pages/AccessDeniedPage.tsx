import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface AccessDeniedPageProps {
  message?: string;
}

export default function AccessDeniedPage({ message }: AccessDeniedPageProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src="/assets/generated/shq-kepsek-logo.dim_1024x256.png"
            alt="SHQ Kepsek Logo"
            className="h-16 mx-auto mb-4"
          />
        </div>

        <Card className="shadow-xl border-destructive/50">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <ShieldAlert className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-center text-destructive">Access Denied</CardTitle>
            <CardDescription className="text-center">
              {message || 'You do not have permission to access this application.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
