'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

type AugmentStat = {
  cpu_augment: string
  ram_augment: string
  hydraulic_augment: string
  races: number
  wins: number
  win_pct: number
}

export default function Augments() {
  const [results, setResults] = useState<AugmentStat[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    supabase
      .from('race_results')
      .select(`
        cpu_augment,
        ram_augment,
        hydraulic_augment,
        count(*) as races,
        sum(CASE WHEN finish_position = 1 THEN 1 ELSE 0 END) as wins
      `)
      .group('cpu_augment, ram_augment, hydraulic_augment')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching augment stats:', error)
          setResults([])
        } else if (data) {
          // Calculate win percentage and cast numeric strings to numbers
          const augments = data.map((row: any) => {
            const races = Number(row.races)
            const wins = Number(row.wins)
            const win_pct = races > 0 ? (wins / races) * 100 : 0
            return {
              cpu_augment: row.cpu_augment,
              ram_augment: row.ram_augment,
              hydraulic_augment: row.hydraulic_augment,
              races,
              wins,
              win_pct,
            }
          })

          // Sort descending by win_pct
          augments.sort((a: AugmentStat, b: AugmentStat) => b.win_pct - a.win_pct)

          setResults(augments)
        }
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl mb-6 font-bold">Augments Win Rate</h1>

      {loading && <p>Loading...</p>}

      {!loading && results.length === 0 && <p>No augment data found.</p>}

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
