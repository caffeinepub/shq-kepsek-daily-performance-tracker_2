import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSaveSchoolForPrincipal } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { School, SchoolSummary } from '../../backend';
import { Principal } from '@dfinity/principal';
import { dashboardId } from '../../localization/dashboardId';

interface EditSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolSummary: SchoolSummary | null;
}

export default function EditSchoolDialog({ open, onOpenChange, schoolSummary }: EditSchoolDialogProps) {
  const [schoolName, setSchoolName] = useState('');
  const [region, setRegion] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [active, setActive] = useState(true);
  const updateSchool = useSaveSchoolForPrincipal();

  // Prefill form when schoolSummary changes
  useEffect(() => {
    if (schoolSummary) {
      setSchoolName(schoolSummary.school.name);
      setRegion(schoolSummary.school.region);
      setPrincipalName(schoolSummary.school.principalName);
      setActive(schoolSummary.school.active);
    }
  }, [schoolSummary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolSummary) return;

    if (!schoolName.trim() || !region.trim() || !principalName.trim()) {
      toast.error(dashboardId.admin.editDialog.allFieldsRequired);
      return;
    }

    const updatedSchool: School = {
      name: schoolName.trim(),
      region: region.trim(),
      principalName: principalName.trim(),
      active,
    };

    try {
      await updateSchool.mutateAsync({
        principal: schoolSummary.principal,
        school: updatedSchool,
      });
      toast.success(dashboardId.admin.editDialog.successUpdate);
      onOpenChange(false);
    } catch (error: any) {
      if (error.message && error.message.includes('Unauthorized')) {
        toast.error(dashboardId.admin.editDialog.errorPermission);
      } else {
        toast.error(error.message || dashboardId.admin.editDialog.errorGeneral);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dashboardId.admin.editDialog.title}</DialogTitle>
          <DialogDescription>
            {dashboardId.admin.editDialog.description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-schoolName">{dashboardId.admin.editDialog.schoolName} *</Label>
              <Input
                id="edit-schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g., SMA Negeri 1 Jakarta"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-region">{dashboardId.admin.editDialog.region} *</Label>
              <Input
                id="edit-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g., Jakarta Pusat"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-principalName">{dashboardId.admin.editDialog.principalName} *</Label>
              <Input
                id="edit-principalName"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                placeholder="e.g., Dr. Ahmad Suryadi, M.Pd"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">{dashboardId.admin.editDialog.activeStatus}</Label>
              <Switch id="edit-active" checked={active} onCheckedChange={setActive} />
            </div>

            {schoolSummary && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p className="font-medium mb-1">{dashboardId.admin.editDialog.principalIdLabel}</p>
                <p className="font-mono break-all">{schoolSummary.principal.toString()}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateSchool.isPending}
            >
              {dashboardId.common.cancel}
            </Button>
            <Button type="submit" disabled={updateSchool.isPending}>
              {updateSchool.isPending ? dashboardId.common.saving : dashboardId.admin.editDialog.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
