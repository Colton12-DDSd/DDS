'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

type AugmentResult = {
  cpu_augment: string
  ram_augment: string
  hydraulic_augment: string
  races: number
  wins: number
  places: number // top 3 finishes count
  win_pct: number
}

export default function Augments() {
  const [bloodline, setBloodline] = useState('All')
  const [results, setResults] = useState<AugmentResult[]>([])
  const [bloodlines, setBloodlines] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'win_pct' | 'place_rate'>('win_pct')

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

  // Calculate place rate and sort results
  const sortedResults = results
    .map((r) => ({
      ...r,
      place_rate: r.races > 0 ? (r.places / r.races) * 100 : 0,
    }))
    .sort((a, b) => {
      if (sortBy === 'win_pct') return b.win_pct - a.win_pct
      else return b.place_rate - a.place_rate
    })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/">
        <button className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
          ← Back to Home
        </button>
      </Link>

      <h1 className="text-3xl mb-6 font-bold">Best Augments by Bloodline</h1>

      <div className="flex gap-4 mb-6 items-center">
        <select
          value={bloodline}
          onChange={e => setBloodline(e.target.value)}
          className="border p-2 rounded"
        >
          {bloodlines.map(bl => (
            <option key={bl} value={bl}>
              {bl}
            </option>
          ))}
        </select>

        <label className="whitespace-nowrap">
          Sort by:{' '}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'win_pct' | 'place_rate')}
            className="border p-2 rounded"
          >
            <option value="win_pct">Win %</option>
            <option value="place_rate">Place Rate (Top 3)</option>
          </select>
        </label>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && results.length === 0 && <p>No data found for selected filters.</p>}

      {!loading && results.length > 0 && (
        <table className="border-collapse border border-gray-700 text-sm table-auto mx-auto">
          <thead>
            <tr>
              <th className="border border-gray-700 p-2 whitespace-nowrap max-w-xs truncate">CPU Augment</th>
              <th className="border border-gray-700 p-2 whitespace-nowrap max-w-xs truncate">RAM Augment</th>
              <th className="border border-gray-700 p-2 whitespace-nowrap max-w-xs truncate">Hydraulic Augment</th>
              <th className="border border-gray-700 p-2 whitespace-nowrap">Races</th>
              <th className="border border-gray-700 p-2 whitespace-nowrap">Wins</th>
              <th className="border border-gray-700 p-2 whitespace-nowrap">Win %</th>
              <th className="border border-gray-700 p-2 whitespace-nowrap">Places (Top 3)</th>
              <th className="border border-gray-700 p-2 whitespace-nowrap">Place Rate %</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((r, i) => (
              <tr key={i} className="border border-gray-700">
                <td className="border border-gray-700 p-2 max-w-xs truncate">{r.cpu_augment}</td>
                <td className="border border-gray-700 p-2 max-w-xs truncate">{r.ram_augment}</td>
                <td className="border border-gray-700 p-2 max-w-xs truncate">{r.hydraulic_augment}</td>
                <td className="border border-gray-700 p-2">{r.races}</td>
                <td className="border border-gray-700 p-2">{r.wins}</td>
                <td className="border border-gray-700 p-2">{r.win_pct.toFixed(2)}%</td>
                <td className="border border-gray-700 p-2">{r.places}</td>
                <td className="border border-gray-700 p-2">{r.place_rate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
