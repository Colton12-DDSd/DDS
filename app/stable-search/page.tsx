'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

export default function StableSearch() {
  const [search, setSearch] = useState('')
  const [stables, setStables] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!search) {
      setStables([])
      return
    }
    setLoading(true)

    supabase
      .from('race_results')
      .select('stable_name', { count: 'exact', head: false })
      .ilike('stable_name', `%${search}%`)
      .limit(20)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error searching stables:', error)
          setStables([])
        } else if (data) {
          const uniqueStables = Array.from(new Set(data.map(s => s.stable_name))).filter(Boolean)
          setStables(uniqueStables)
        }
        setLoading(false)
      })
  }, [search])

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Search Stables</h1>

      <input
        type="text"
        placeholder="Type stable name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-80 max-w-full p-2 border border-gray-700 rounded mb-4 mx-auto block"
      />


      {loading && <p>Loading...</p>}

      {!loading && stables.length === 0 && search && (
        <p>No stables found for &quot;{search}&quot;.</p>
      )}

      <ul>
        {stables.map((stable) => (
          <li key={stable} className="p-2 border-b">
            <Link href={`/stable/${encodeURIComponent(stable)}`}>
              {stable}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
