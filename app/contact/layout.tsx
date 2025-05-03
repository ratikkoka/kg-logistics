export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className='min-h-[calc(100vh-64px)]'>
      <div className='flex min-h-[calc(100vh-64px)] w-screen items-start justify-center p-8'>
        {children}
      </div>
    </section>
  );
}
