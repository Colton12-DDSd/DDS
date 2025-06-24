'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Augments() {
  const [bloodline, setBloodline] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [maxRating, setMaxRating] = useState(5)
  const [results, setResults] = useState<any[]>([])
  const [bloodlines, setBloodlines] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Load distinct bloodlines on mount
  useEffect(() => {
    supabase
      .from('race_results')
      .select('bloodline', { distinct: true })
      .then(({ data }) => {
        if (data) setBloodlines(data.map(row => row.bloodline).filter(Boolean))
      })
  }, [])

  // Fetch augment stats on filter change
  useEffect(() => {
    if (!bloodline) {
      setResults([])
      return
    }

    setLoading(true)

    supabase.rpc('get_augment_stats', {
      in_bloodline: bloodline,
      min_rating: minRating,
      max_rating: maxRating,
    }).then(({ data, error }) => {
      if (error) {
        console.error(error)
        setResults([])
      } else {
        setResults(data || [])
      }
      setLoading(false)
    })
  }, [bloodline, minRating, maxRating])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl mb-6 font-bold">Best Augments by Bloodline & Rating</h1>

      <div className="mb-6 flex gap-4 items-center">
        <select
          value={bloodline}
          onChange={e => setBloodline(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Bloodline</option>
          {bloodlines.map(bl => (
            <option key={bl} value={bl}>{bl}</option>
          ))}
        </select>

        <input
          type="number"
          min={0}
          max={5}
          step={0.1}
          value={minRating}
          onChange={e => setMinRating(parseFloat(e.target.value))}
          placeholder="Min Rating"
          className="border p-2 rounded w-24"
        />

        <input
          type="number"
          min={0}
          max={5}
          step={0.1}
          value={maxRating}
          onChange={e => setMaxRating(parseFloat(e.target.value))}
          placeholder="Max Rating"
          className="border p-2 rounded w-24"
        />
      </div>

      {loading && <p>Loading...</p>}

      {!loading && results.length === 0 && bloodline && (
        <p>No data found for selected filters.</p>
      )}

      {!loading && results.length > 0 && (
        <table className="w-full border-collapse border border-gray-700 text-sm">
          <thead>
            <tr>
              <th className="border border-gray-700 p-2">CPU Augment</th>
              <th className="border border-gray-700 p-2">RAM Augment</th>
              <th className="border border-gray-700 p-2">Hydraulic Augment</th>
              <th className="border border-gray-700 p-2">Races</th>
              <th className="border border-gray-700 p-2">Avg Finish</th>
              <th className="border border-gray-700 p-2">Win %</th>
              <th className="border border-gray-700 p-2">Total Earnings</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border border-gray-700">
                <td className="border border-gray-700 p-2">{r.cpu_augment}</td>
                <td className="border border-gray-700 p-2">{r.ram_augment}</td>
                <td className="border border-gray-700 p-2">{r.hydraulic_augment}</td>
                <td className="border border-gray-700 p-2">{r.races}</td>
                <td className="border border-gray-700 p-2">{r.avg_finish.toFixed(2)}</td>
                <td className="border border-gray-700 p-2">{r.win_pct.toFixed(2)}%</td>
                <td className="border border-gray-700 p-2">${r.total_earnings.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
