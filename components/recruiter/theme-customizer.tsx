'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateCareerPage } from '@/app/actions/career-pages';
import { ImageUploader } from './image-uploader';

export function ThemeCustomizer({
    company,
    careerPage
}: {
    company: any,
    careerPage: any
}) {
    const [theme, setTheme] = useState(careerPage?.theme || { primaryColor: '#000000', secondaryColor: '#ffffff' });
    const [logoUrl, setLogoUrl] = useState(careerPage?.logo_url);
    const [bannerUrl, setBannerUrl] = useState(careerPage?.banner_url);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function handleSave() {
        setSaving(true);
        setMessage(null);
        const res = await updateCareerPage(careerPage.id, {
            theme,
            logo_url: logoUrl,
            banner_url: bannerUrl
        }, company.slug);

        if (res.error) {
            setMessage(`Error: ${res.error}`);
        } else {
            setMessage('Saved successfully!');
            // Auto-hide message after 3s
            setTimeout(() => setMessage(null), 3000);
        }
        setSaving(false);
    }

    return (
        <div className="space-y-8 max-w-lg p-1">
            <div>
                <h2 className="text-lg font-semibold mb-4 text-foreground">Brand Colors</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex gap-2 items-center">
                            <div className="relative">
                                <Input
                                    type="color"
                                    value={theme.primaryColor}
                                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                            </div>
                            <Input
                                value={theme.primaryColor}
                                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                                className="font-mono"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Secondary Color</Label>
                        <div className="flex gap-2 items-center">
                            <div className="relative">
                                <Input
                                    type="color"
                                    value={theme.secondaryColor}
                                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                            </div>
                            <Input
                                value={theme.secondaryColor}
                                onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                                className="font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Assets</h2>
                <div className="space-y-6">
                    <ImageUploader
                        label="Company Logo"
                        bucket="company-logos"
                        currentImageUrl={logoUrl}
                        onUpload={setLogoUrl}
                    />
                    <ImageUploader
                        label="Hero Banner"
                        bucket="company-banners"
                        currentImageUrl={bannerUrl}
                        onUpload={setBannerUrl}
                    />
                </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                {message && <span className="text-sm text-green-600 font-medium animate-in fade-in">{message}</span>}
            </div>
        </div>
    )
}
