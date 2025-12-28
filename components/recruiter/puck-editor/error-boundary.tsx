'use client';

/**
 * Puck Editor Error Boundary
 * Specialized error boundary for the Puck editor component
 */

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PuckErrorBoundaryProps {
  children: ReactNode;
  onReset: () => void;
}

interface PuckErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class PuckErrorBoundary extends Component<PuckErrorBoundaryProps, PuckErrorBoundaryState> {
  constructor(props: PuckErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Puck Editor Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Editor Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The page editor encountered an error. This usually happens when there's invalid data in your page structure.
            </p>
            <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted p-2 rounded">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset();
              }}
            >
              Reset Editor
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

