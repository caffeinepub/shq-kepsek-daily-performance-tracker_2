import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSaveSchool } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface KepsekProfileFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function KepsekProfileForm({ onSuccess, onCancel }: KepsekProfileFormProps) {
  const [schoolName, setSchoolName] = useState('');
  const [region, setRegion] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [active, setActive] = useState(true);
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
        active,
      });
      toast.success('Profil sekolah berhasil disimpan!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan profil');
    }
  };

  return (
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

      <div className="flex items-center justify-between">
        <Label htmlFor="active">Status Aktif</Label>
        <Switch id="active" checked={active} onCheckedChange={setActive} />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button type="submit" disabled={saveSchool.isPending} className="flex-1">
          {saveSchool.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
