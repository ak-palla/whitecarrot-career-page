'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  const isEnvError = error.message?.includes('Missing Supabase environment variables');

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            {isEnvError
              ? 'Supabase configuration is missing'
              : 'An error occurred while loading the dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEnvError ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please ensure the following environment variables are set in your Vercel project:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                You can add these in Vercel Dashboard → Settings → Environment Variables
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {error.message || 'An unexpected error occurred'}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button onClick={() => (window.location.href = '/auth/login')} variant="outline">
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

