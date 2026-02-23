import { ReactNode } from 'react';

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
}

export const ExternalLink = ({ href, children }: ExternalLinkProps) => (
  <a className="underline" href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);
