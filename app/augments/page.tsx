'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Augments() {
  const [bloodline, setBloodline] = useState('All')
  const [results, setResults] = useState<any[]>([])
  const [bloodlines, setBloodlines] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(false)

  // Load distinct bloodlines on component mount
  useEffect(() => {
    supabase.rpc('get_distinct_bloodlines').then(({ data, error }) => {
      if (error) {
        console.error('Error loading bloodlines:', error)
        return
      }
      if (data) {
        setBloodlines(['All', ...data.map((row: any) => row.bloodline)])
      }
    })
  }, [])

  // Fetch augment stats whenever selected bloodline changes
  useEffect(() => {
    setLoading(true)
    const rpcCall =
      bloodline === 'All'
        ? supabase.rpc('get_augment_win_rates')
        : supabase.rpc('get_augment_win_rates_filtered', { in_bloodline: bloodline })

    rpcCall.then(({ data, error }) => {
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
      <h1 className="text-3xl mb-6 font-bold">Best Augments by Bloodline</h1>

      <select
        value={bloodline}
        onChange={e => setBloodline(e.target.value)}
        className="border p-2 rounded mb-6"
      >
        {bloodlines.map(bl => (
          <option key={bl} value={bl}>
            {bl}
          </option>
        ))}
      </select>

      {loading && <p>Loading...</p>}

      {!loading && results.length === 0 && <p>No data found for selected filters.</p>}

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
                <td className="border border-gray-700 p-2">
                  {typeof r.win_pct === 'number' ? r.win_pct.toFixed(2) : 'N/A'}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
