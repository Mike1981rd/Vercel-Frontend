export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Editor layout without sidebar - full width
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}