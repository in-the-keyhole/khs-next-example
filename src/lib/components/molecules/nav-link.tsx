import { ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

export const NavLink = ({ href, children }: NavLinkProps) => (
  <a href={href}>
    <p className="p-3">{children}</p>
  </a>
);
