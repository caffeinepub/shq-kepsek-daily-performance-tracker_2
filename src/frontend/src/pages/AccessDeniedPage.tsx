import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Copy, RefreshCw } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';

interface AccessDeniedPageProps {
  message?: string;
}

export default function AccessDeniedPage({ message }: AccessDeniedPageProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [isRetrying, setIsRetrying] = useState(false);

  const principalId = identity?.getPrincipal().toString() || '';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleCopyPrincipalId = () => {
    if (principalId) {
      navigator.clipboard.writeText(principalId);
      toast.success('Principal ID copied to clipboard');
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Invalidate and refetch the caller role query
      await queryClient.invalidateQueries({ queryKey: ['callerRole'] });
      await queryClient.refetchQueries({ queryKey: ['callerRole'] });
      toast.success('Role check refreshed');
    } catch (error) {
      toast.error('Failed to refresh role. Please try again.');
    } finally {
      setIsRetrying(false);
    }
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
            {principalId && (
              <div className="space-y-2">
                <Label htmlFor="principalId">Your Principal ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="principalId"
                    value={principalId}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPrincipalId}
                    title="Copy Principal ID"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this Principal ID with an administrator to get access. Once they register your school profile, click Retry below.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleRetry}
                variant="default"
                className="w-full"
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </>
                )}
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
