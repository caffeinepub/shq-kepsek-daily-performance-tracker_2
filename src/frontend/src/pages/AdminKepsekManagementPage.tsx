import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UserPlus } from 'lucide-react';
import KepsekProfileForm from '../components/admin/KepsekProfileForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface AdminKepsekManagementPageProps {
  onNavigateToDashboard: () => void;
}

export default function AdminKepsekManagementPage({ onNavigateToDashboard }: AdminKepsekManagementPageProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader>
        <Button onClick={onNavigateToDashboard} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dashboard
        </Button>
      </AppHeader>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kelola Kepala Sekolah
          </h1>
          <p className="text-muted-foreground mt-1">
            Daftarkan dan kelola profil kepala sekolah
          </p>
        </div>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Untuk mendaftarkan Kepsek baru: Minta mereka login terlebih dahulu dengan Internet Identity, 
            kemudian assign role "user" melalui backend, lalu mereka dapat mengisi profil sekolah mereka.
          </AlertDescription>
        </Alert>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Profil Sekolah Anda</CardTitle>
            <CardDescription>
              Sebagai admin, Anda juga dapat mendaftarkan profil sekolah
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showForm ? (
              <Button onClick={() => setShowForm(true)} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Daftarkan Profil Sekolah
              </Button>
            ) : (
              <KepsekProfileForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
