'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Augments() {
  const [bloodline, setBloodline] = useState<string>('All')
  const [bloodlines, setBloodlines] = useState<string[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Load distinct bloodlines on mount
  useEffect(() => {
    supabase
      .from('race_results')
      .select('bloodline', { distinct: true })
      .then(({ data }) => {
        if (data) {
          const unique = data.map(row => row.bloodline).filter(Boolean)
          setBloodlines(['All', ...unique])
        }
      })
  }, [])

  // Fetch augment stats on bloodline change
  useEffect(() => {
    setLoading(true)

    // Pass null to RPC if 'All' selected, else pass selected bloodline
    const filter = bloodline === 'All' ? null : bloodline

    supabase.rpc('get_augment_win_rates', { bloodline_filter: filter }).then(({ data, error }) => {
      if (error) {
        console.error('Error fetching augment stats:', error)
        setResults([])
      } else {
        setResults(data || [])
      }
      setLoading(false)
    })
  }, [bloodline])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl mb-6 font-bold">Best Augments by Bloodline & Rating</h1>

      <div className="mb-6">
        <label className="mr-2 font-semibold" htmlFor="bloodline-select">Filter by Bloodline:</label>
        <select
          id="bloodline-select"
          value={bloodline}
          onChange={e => setBloodline(e.target.value)}
          className="border p-2 rounded"
        >
          {bloodlines.map(bl => (
            <option key={bl} value={bl}>{bl}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && results.length === 0 && (
        <p>No augment data found for selected bloodline.</p>
      )}

      {!loading && results.length > 0 && (
        <table className="w-full border-collapse border border-gray-700 text-sm">
          <thead>
            <tr>
              <th className="border border-gray-700 p-2">CPU Augment</th>
              <th className="border border-gray-700 p-2">RAM Augment</th>
              <th className="border border-gray-700 p-2">Hydraulic Augment</th>
              <th className="border border-gray-700 p-2">Races</th>
              <th className="border border-gray-700 p-2">Wins</th>
              <th className="border border-gray-700 p-2">Win %</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border border-gray-700">
                <td className="border border-gray-700 p-2">{r.cpu_augment}</td>
                <td className="border border-gray-700 p-2">{r.ram_augment}</td>
                <td className="border border-gray-700 p-2">{r.hydraulic_augment}</td>
                <td className="border border-gray-700 p-2">{r.races}</td>
                <td className="border border-gray-700 p-2">{r.wins}</td>
                <td className="border border-gray-700 p-2">{r.win_pct.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
