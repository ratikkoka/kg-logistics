import { type ReactNode } from 'react';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <section className='h-[calc(100vh-64px)]'>
      <div className='flex h-[calc(100vh-64px)] w-screen items-start justify-center p-8'>
        {children}
      </div>
    </section>
  );
}
