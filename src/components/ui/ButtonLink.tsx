import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export interface ButtonLinkProps {
  to: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  className?: string;
  onClick?: () => void;
}

export function ButtonLink({ to, children, variant = 'primary', className = '', onClick }: ButtonLinkProps) {
  const cls =
    variant === 'primary'
      ? 'sb-btn-primary'
      : variant === 'secondary'
        ? 'sb-btn-secondary'
        : variant === 'accent'
          ? 'sb-btn-accent'
          : 'sb-btn-ghost';
  return (
    <Link to={to} className={`${cls} ${className}`} onClick={onClick}>
      {children}
    </Link>
  );
}

export default ButtonLink;
