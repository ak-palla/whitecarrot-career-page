'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateCareerPage } from '@/app/actions/career-pages';
import { toast } from 'sonner';

interface InlineThemeControlsProps {
  company: any;
  careerPage: any;
  onThemeChange?: (theme: any) => void;
}

export function InlineThemeControls({ company, careerPage, onThemeChange }: InlineThemeControlsProps) {
  const [theme, setTheme] = useState(careerPage?.theme || { primaryColor: '#000000', secondaryColor: '#ffffff' });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await updateCareerPage(careerPage.id, { theme }, company.slug);

    if (res.error) {
      toast.error(`Error: ${res.error}`);
    } else {
      toast.success('Theme updated!');
      onThemeChange?.(theme);
    }
    setSaving(false);
  }

  // Notify parent of theme changes immediately for live preview
  const handleThemeUpdate = (newTheme: any) => {
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Page Theme</h3>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Primary Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => handleThemeUpdate({ ...theme, primaryColor: e.target.value })}
              className="w-10 h-8 p-1 cursor-pointer"
            />
            <Input
              value={theme.primaryColor}
              onChange={(e) => handleThemeUpdate({ ...theme, primaryColor: e.target.value })}
              className="font-mono text-xs h-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Secondary Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={theme.secondaryColor}
              onChange={(e) => handleThemeUpdate({ ...theme, secondaryColor: e.target.value })}
              className="w-10 h-8 p-1 cursor-pointer"
            />
            <Input
              value={theme.secondaryColor}
              onChange={(e) => handleThemeUpdate({ ...theme, secondaryColor: e.target.value })}
              className="font-mono text-xs h-8"
            />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Colors are automatically applied across all sections. Use variants in each section to control styling.
      </p>
    </div>
  );
}

