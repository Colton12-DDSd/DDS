'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!search) {
      setResults([])
      setErrorMsg('')
      return
    }

    setLoading(true)
    setErrorMsg('')

    const fetchHorses = async () => {
      try {
        const { data, error, status, statusText } = await supabase.rpc('get_distinct_horses', { search_text: search })

        if (error) {
          console.error('RPC error:', JSON.stringify(error, null, 2))
          console.log('RPC status:', status, statusText)

          const { data: fallbackData, error: fallbackError } = await supabase
            .from('race_results')
            .select('horse_id, horse_name')
            .ilike('horse_name', `%${search}%`)
            .limit(100)

          if (fallbackError) {
            setErrorMsg('Error fetching horses: ' + fallbackError.message)
            setResults([])
          } else {
            const uniqueResults = Array.from(
              new Map(fallbackData.map(item => [item.horse_id, item])).values()
            )
            setResults(uniqueResults)
          }
        } else {
          setResults(data || [])
        }
      } catch (e) {
        setErrorMsg('Unexpected error: ' + (e as Error).message)
        setResults([])
      }

      setLoading(false)
    }

    fetchHorses()
  }, [search])

  return (
    <main className="p-8 max-w-xl mx-auto bg-nice-gray text-nice-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Search Horses</h1>

      <p className="bg-red-500 text-white p-4 mb-4">
        If this is red with white text, Tailwind is working
      </p>

      <input
        type="text"
        placeholder="Type a horse name..."
        className="w-96 max-w-full p-2 border border-white rounded mb-4 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
      />


      {loading && <p>Loading...</p>}

      {errorMsg && <p className="text-red-600">{errorMsg}</p>}

      {!loading && results.length === 0 && search && (
        <p>No horses found for &quot;{search}&quot;.</p>
      )}

      <ul>
        {results.map((horse) => (
          <li key={horse.horse_id} className="p-2 border-b">
            🐎 <Link href={`/horses/${horse.horse_id}`}>{horse.horse_name}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
