export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className='flex flex-col items-center justify-start gap-4 py-8 md:py-10'>
      <div className='inline-block max-w-lg justify-start text-center'>
        {children}
      </div>
    </section>
  );
}
