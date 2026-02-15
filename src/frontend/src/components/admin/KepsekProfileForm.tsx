import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSaveSchoolForPrincipal } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

interface KepsekProfileFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function KepsekProfileForm({ onSuccess, onCancel }: KepsekProfileFormProps) {
  const [principalId, setPrincipalId] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [region, setRegion] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [active, setActive] = useState(true);
  const saveSchoolForPrincipal = useSaveSchoolForPrincipal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!principalId.trim() || !schoolName.trim() || !region.trim() || !principalName.trim()) {
      toast.error('All fields are required');
      return;
    }

    // Validate Principal ID
    let principal: Principal;
    try {
      principal = Principal.fromText(principalId.trim());
    } catch (error) {
      toast.error('Invalid Principal ID format');
      return;
    }

    try {
      await saveSchoolForPrincipal.mutateAsync({
        principal,
        school: {
          name: schoolName.trim(),
          region: region.trim(),
          principalName: principalName.trim(),
          active,
        },
      });
      toast.success('School profile registered successfully! Kepsek access has been granted.');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save school profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="principalId">Principal ID *</Label>
        <Input
          id="principalId"
          value={principalId}
          onChange={(e) => setPrincipalId(e.target.value)}
          placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
          required
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          The Principal ID of the user who will be granted Kepsek access. They can find this on their Access Denied screen after logging in.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="schoolName">School Name *</Label>
        <Input
          id="schoolName"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          placeholder="e.g., SMA Negeri 1 Jakarta"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Region *</Label>
        <Input
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="e.g., Jakarta Pusat"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="principalName">Principal Name *</Label>
        <Input
          id="principalName"
          value={principalName}
          onChange={(e) => setPrincipalName(e.target.value)}
          placeholder="e.g., Dr. Ahmad Suryadi, M.Pd"
          required
        />
        <p className="text-xs text-muted-foreground">
          The full name of the school principal
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="active">Active Status</Label>
          <p className="text-xs text-muted-foreground">
            Enable to allow this Kepsek to submit reports
          </p>
        </div>
        <Switch id="active" checked={active} onCheckedChange={setActive} />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={saveSchoolForPrincipal.isPending} className="flex-1">
          {saveSchoolForPrincipal.isPending ? 'Registering...' : 'Register & Grant Access'}
        </Button>
      </div>
    </form>
  );
}
