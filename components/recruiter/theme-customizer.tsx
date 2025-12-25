'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { updateCareerPage } from '@/app/actions/career-pages';
import { ImageUploader } from './image-uploader';

export function ThemeCustomizer({
    company,
    careerPage,
    onSaveStateChange
}: {
    company: any,
    careerPage: any,
    onSaveStateChange?: (state: { handleSave: () => Promise<void>, saving: boolean, message: string | null }) => void
}) {
    const [theme, setTheme] = useState(careerPage?.theme || { primaryColor: '#000000' });
    const [logoUrl, setLogoUrl] = useState<string | null | undefined>(careerPage?.logo_url);
    const [bannerUrl, setBannerUrl] = useState<string | null | undefined>(careerPage?.banner_url);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSave = useCallback(async () => {
        setSaving(true);
        setMessage(null);
        const res = await updateCareerPage(careerPage.id, {
            theme,
            logo_url: logoUrl || null,
            banner_url: bannerUrl || null
        }, company.slug);

        if (res.error) {
            setMessage(`Error: ${res.error}`);
        } else {
            setMessage('Saved successfully!');
            // Auto-hide message after 3s
            setTimeout(() => setMessage(null), 3000);
        }
        setSaving(false);
    }, [careerPage.id, company.slug, theme, logoUrl, bannerUrl]);

    // Expose save handler and state to parent
    useEffect(() => {
        if (onSaveStateChange) {
            onSaveStateChange({ handleSave, saving, message });
        }
    }, [onSaveStateChange, handleSave, saving, message]);

    return (
        <Card className="space-y-8 max-w-3xl p-6 flex gap-[30px] justify-start items-start">
            <div className="space-y-4 flex-1">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Assets</h2>
                <div className="space-y-6">
                    <ImageUploader
                        label="Company Logo"
                        bucket="company-logos"
                        currentImageUrl={logoUrl ?? undefined}
                        onUpload={(url) => setLogoUrl(url)}
                    />
                    <ImageUploader
                        label="Hero Banner"
                        bucket="company-banners"
                        currentImageUrl={bannerUrl ?? undefined}
                        onUpload={(url) => setBannerUrl(url)}
                    />
                </div>
            </div>

            <div className="flex-1 !m-0">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Brand Colors</h2>
                <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2 items-center">
                        <div className="relative">
                            <Input
                                type="color"
                                value={theme.primaryColor || '#000000'}
                                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                                className="w-12 h-10 p-1 cursor-pointer"
                            />
                        </div>
                        <Input
                            value={theme.primaryColor || '#000000'}
                            onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                            className="font-mono w-24"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 mb-4 pb-4">
                        Secondary color is automatically generated from your primary color for optimal contrast.
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                        <Button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="bg-create-company hover:bg-create-company text-black"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        {message && (
                            <span className={`text-sm font-medium animate-in fade-in ${
                                message.includes('Error') ? 'text-destructive' : 'text-green-600'
                            }`}>
                                {message}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}

