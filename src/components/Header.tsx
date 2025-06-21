'use client';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="bg-card shadow-lg border-b border-border relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-center items-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-card-foreground text-center">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
} 