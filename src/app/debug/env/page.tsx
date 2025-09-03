export default function DebugEnvPage() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (!isDevelopment && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Not Available</h1>
          <p className="mt-2 text-gray-600">This page is only available in development mode</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Environment Variables Check</h1>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Supabase Configuration</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-80 font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={`ml-2 ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}`}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}
                </span>
              </li>
              <li className="flex items-center">
                <span className="w-80 font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={`ml-2 ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}`}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}
                </span>
              </li>
            </ul>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Azure Backend Configuration</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-80 font-mono text-sm">NEXT_PUBLIC_AZURE_API_URL:</span>
                <span className={`ml-2 ${process.env.NEXT_PUBLIC_AZURE_API_URL ? 'text-green-600' : 'text-red-600'}`}>
                  {process.env.NEXT_PUBLIC_AZURE_API_URL ? '✅ Set' : '❌ Not set'}
                </span>
              </li>
            </ul>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Environment Info</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-80 font-mono text-sm">NODE_ENV:</span>
                <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                  {process.env.NODE_ENV}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Only public environment variables (prefixed with NEXT_PUBLIC_) are accessible in the browser.
          </p>
        </div>
      </div>
    </div>
  )
}