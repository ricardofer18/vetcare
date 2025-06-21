import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'white';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const variantClasses = {
    default: 'border-muted-foreground/20 border-t-muted-foreground',
    primary: 'border-primary/20 border-t-primary',
    white: 'border-white/20 border-t-white'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

interface LoadingPageProps {
  title?: string;
  description?: string;
  showLogo?: boolean;
}

export function LoadingPage({ 
  title = "Cargando...", 
  description = "Por favor espera un momento",
  showLogo = false 
}: LoadingPageProps) {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center space-y-4 animate-in fade-in duration-700">
        <div className="relative">
          <LoadingSpinner size="lg" variant="primary" />
          {showLogo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-primary rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {showLogo && (
            <h2 className="text-xl font-semibold text-foreground animate-in fade-in duration-1000 delay-300">VetCare</h2>
          )}
          <p className="text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

interface GlobalLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function GlobalLoading({ isLoading, children }: GlobalLoadingProps) {
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-40">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" variant="primary" />
          <p className="text-sm text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 