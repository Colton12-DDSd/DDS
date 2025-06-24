'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Augments() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    supabase.rpc('get_augment_stats_all')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching augment stats:', error)
          setResults([])
        } else {
          // Sort descending by win_pct
          const sorted = (data || []).sort((a, b) => b.win_pct - a.win_pct)
          setResults(sorted)
        }
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl mb-6 font-bold">All Augments Win Rate</h1>

      {loading && <p>Loading...</p>}

      {!loading && results.length === 0 && (
        <p>No augment data found.</p>
      )}

      {!loading && results.length > 0 && (
        <table className="w-full border-collapse border border-gray-700 text-sm">
          <thead>
            <tr>
              <th className="border border-gray-700 p-2">CPU Augment</th>
              <th className="border border-gray-700 p-2">RAM Augment</th>
              <th className="border border-gray-700 p-2">Hydraulic Augment</th>
              <th className="border border-gray-700 p-2">Win %</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border border-gray-700">
                <td className="border border-gray-700 p-2">{r.cpu_augment}</td>
                <td className="border border-gray-700 p-2">{r.ram_augment}</td>
                <td className="border border-gray-700 p-2">{r.hydraulic_augment}</td>
                <td className="border border-gray-700 p-2">{r.win_pct.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
