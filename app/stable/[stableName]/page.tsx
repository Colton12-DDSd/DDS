'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'

export default function StableDetail() {
  const { stableName } = useParams()
  const [horses, setHorses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!stableName) return

    setLoading(true)
    supabase
      .from('race_results')
      .select('horse_id, horse_name, bloodline, generation, rating, earnings')
      .eq('stable_name', stableName)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching stable horses:', error)
          setHorses([])
        } else if (data) {
          // Deduplicate horses by horse_id
          const uniqueHorses = Array.from(
            new Map(data.map(h => [h.horse_id, h])).values()
          )
          setHorses(uniqueHorses)
        }
        setLoading(false)
      })
  }, [stableName])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/stable-search">
        <button className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
          ← Back to Stable Search
        </button>
      </Link>

      <h1 className="text-3xl mb-6 font-bold">Stable: {stableName}</h1>

      {loading && <p>Loading horses...</p>}

      {!loading && horses.length === 0 && (
        <p>No horses found in this stable.</p>
      )}

      {!loading && horses.length > 0 && (
        <table className="w-full border-collapse border border-gray-700 text-sm table-auto mx-auto">
          <thead>
            <tr>
              <th className="border border-gray-700 p-2">Horse Name</th>
              <th className="border border-gray-700 p-2">Bloodline</th>
              <th className="border border-gray-700 p-2">Generation</th>
              <th className="border border-gray-700 p-2">Rating</th>
              <th className="border border-gray-700 p-2">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {horses.map((h) => (
              <tr key={h.horse_id} className="border border-gray-700">
                <td className="border border-gray-700 p-2">
                  <Link href={`/horses/${h.horse_id}`}>{h.horse_name}</Link>
                </td>
                <td className="border border-gray-700 p-2">{h.bloodline}</td>
                <td className="border border-gray-700 p-2">{h.generation}</td>
                <td className="border border-gray-700 p-2">{h.rating}</td>
                <td className="border border-gray-700 p-2">${Number(h.earnings).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
