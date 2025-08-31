export default function TestIconsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
      {children}
    </div>
  );
}