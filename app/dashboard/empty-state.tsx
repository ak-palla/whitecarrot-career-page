"use client";

import { CreateCompanyDialog } from './create-company-dialog';
import { PixelTrail } from '@/components/ui/pixel-trail';

export function EmptyState() {
    return (
        <div className="relative flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white shadow-sm py-20 overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 z-0 opacity-40">
                <PixelTrail
                    pixelSize={48}
                    fadeDuration={0}
                    delay={500}
                    pixelClassName="rounded-full bg-orange-400"
                />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                <div className="pointer-events-none mb-2">
                    <h3 className="text-xl font-bold tracking-tight">No companies created</h3>
                    <p className="text-muted-foreground max-w-sm">You have not created any companies yet. Get started by creating your first company.</p>
                </div>
                <div className="mt-4">
                    <CreateCompanyDialog />
                </div>
            </div>
        </div>
    )
}
