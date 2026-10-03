import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ThermalGuard ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <Card className="max-w-lg w-full border-red-500/40 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <CardTitle className="justify-center text-xl font-bold text-white">
                Platform Diagnostic Notice
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                A rendering anomaly was safely captured by the client boundary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-lg bg-black/40 border border-white/5 p-3 text-xs text-rose-300 font-mono break-words">
                {this.state.error?.message || 'Unknown runtime error'}
              </div>
            </CardContent>
            <CardFooter className="justify-center pt-2">
              <Button
                variant="cyan"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
