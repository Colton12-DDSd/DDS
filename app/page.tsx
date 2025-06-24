import Link from 'next/link'

export default function Home() {
  return (
    <main className="p-8 max-w-xl mx-auto text-center min-h-screen flex flex-col justify-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Zedalytics</h1>
      <div className="space-y-4">
        <Link href="/horse-search">
          <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Search Horses
          </button>
        </Link>
        <Link href="/augments">
          <button className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
            View Augments
          </button>
        </Link>
        <Link href="/stable-search">
          <button className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            Search Stables
          </button>
        </Link>
      </div>
    </main>
  )
}
