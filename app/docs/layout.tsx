export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">
              <a href="/docs" className="text-blue-600 hover:text-blue-800">
                NextChat Documentation
              </a>
            </h1>
            <div className="flex space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-800">
                ← Back to App
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
