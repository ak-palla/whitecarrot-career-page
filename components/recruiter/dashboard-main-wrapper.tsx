'use client';

import { useNavigationLoading } from './navigation-loading-context';
import { Loader2 } from 'lucide-react';

export function DashboardMainWrapper({ children }: { children: React.ReactNode }) {
    const { isNavigating } = useNavigationLoading();

    return (
        <main className="mx-auto max-w-5xl p-6 relative">
            {isNavigating && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                </div>
            )}
            {children}
        </main>
    );
}

