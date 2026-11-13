"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary ha capturado un error no controlado:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[320px] flex flex-col items-center justify-center p-8 rounded-3xl backdrop-blur-2xl bg-white/80 dark:bg-emerald-950/70 border border-red-500/30 text-center m-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-emerald-950 dark:text-white mb-2">
            No se pudo cargar este componente
          </h2>
          <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-300/70 max-w-md mb-6 leading-relaxed">
            Ocurrió un error inesperado al renderizar esta sección visual. Tus datos y sesión permanecen protegidos.
          </p>
          <Button
            variant="primary"
            onClick={this.handleReset}
            iconLeft={<RefreshCw className="w-4 h-4" />}
          >
            Recargar sección
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
