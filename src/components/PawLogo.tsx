'use client';

import Image from 'next/image';
import { useTheme } from '@/lib/theme';

interface PawLogoProps {
  size?: number;
  className?: string;
}

export function PawLogo({ size = 40, className = '' }: PawLogoProps) {
  const { theme } = useTheme();
  
  const iconSrc = theme === 'dark' ? '/paw-icon-dark.svg' : '/paw-icon-light.svg';
  
  return (
    <Image
      src={iconSrc}
      alt="Vetcare Logo"
      width={size}
      height={size}
      className={className}
    />
  );
} 