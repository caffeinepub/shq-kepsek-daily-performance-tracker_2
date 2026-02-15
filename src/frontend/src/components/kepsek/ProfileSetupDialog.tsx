import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveSchool } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { School } from 'lucide-react';

export default function ProfileSetupDialog() {
  const [schoolName, setSchoolName] = useState('');
  const [region, setRegion] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const saveSchool = useSaveSchool();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolName.trim() || !region.trim() || !principalName.trim()) {
      toast.error('Semua field harus diisi');
      return;
    }

    try {
      await saveSchool.mutateAsync({
        name: schoolName.trim(),
        region: region.trim(),
        principalName: principalName.trim(),
        active: true,
      });
      toast.success('Profil sekolah berhasil disimpan!');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan profil');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <School className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Setup Profil Sekolah</CardTitle>
          <CardDescription>
            Lengkapi informasi sekolah Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName">Nama Sekolah *</Label>
              <Input
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Contoh: SMA Negeri 1 Jakarta"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Wilayah Sekolah *</Label>
              <Input
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Contoh: Jakarta Pusat"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="principalName">Nama Kepala Sekolah *</Label>
              <Input
                id="principalName"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                placeholder="Contoh: Dr. Ahmad Suryadi, M.Pd"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={saveSchool.isPending}>
              {saveSchool.isPending ? 'Menyimpan...' : 'Simpan Profil'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
