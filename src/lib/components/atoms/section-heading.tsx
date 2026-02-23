import { ReactNode } from 'react';

export const SectionHeading = ({ children }: { children: ReactNode }) => (
  <h3 className="p-2 text-2xl font-bold text-center">{children}</h3>
);
