'use client';

/**
 * Error fallback UI component
 * Displays user-friendly error messages
 */

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  message,
}: ErrorFallbackProps) {
  const errorMessage = message || error?.message || 'An unexpected error occurred';

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>
            We encountered an error while processing your request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm font-mono text-muted-foreground break-words">
              {errorMessage}
            </p>
          </div>
          
          {resetErrorBoundary && (
            <div className="flex gap-2">
              <Button
                onClick={resetErrorBoundary}
                variant="default"
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Reload Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

