'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

type Race = {
  race_id: string
  finish_position: number
  earnings: number
}

type HorseData = {
  horse_id: string
  horse_name: string
  bloodline: string
  generation: number
  gender: string
  rating: number
  speed_rating: number
  sprint_rating: number
  endurance_rating: number
}

export default function HorseDetailPage() {
  const params = useParams()
  const horseId = params.horse_id as string

  const [horseData, setHorseData] = useState<HorseData | null>(null)
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!horseId) return

    async function fetchHorseDetails() {
      setLoading(true)

      const { data: horseRows, error: horseError } = await supabase
        .from('race_results')
        .select('horse_name, bloodline, generation, gender, rating, speed_rating, sprint_rating, endurance_rating')
        .eq('horse_id', horseId)
        .limit(1)

      if (horseError || !horseRows || horseRows.length === 0) {
        setError('Failed to load horse info.')
        setLoading(false)
        return
      }

      setHorseData({
        horse_id: horseId,
        ...horseRows[0]
      })

      const { data: raceRows, error: raceError } = await supabase
        .from('race_results')
        .select('race_id, finish_position, earnings')
        .eq('horse_id', horseId)

      if (raceError || !raceRows) {
        setError('Failed to load race history.')
        setLoading(false)
        return
      }

      setRaces(raceRows)
      setLoading(false)
      setError(null)
    }

    fetchHorseDetails()
  }, [horseId])

  const averageFinishPosition =
    races.length > 0
      ? (races.reduce((sum, r) => sum + r.finish_position, 0) / races.length).toFixed(2)
      : '-'

  const winCount = races.filter(r => r.finish_position === 1).length
  const winPercentage = races.length > 0 ? ((winCount / races.length) * 100).toFixed(2) + '%' : '-'

  const totalEarnings =
    races.length > 0 ? races.reduce((sum, r) => sum + r.earnings, 0).toFixed(2) : '-'

  if (loading) return <p className="p-4">Loading horse details...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>
  if (!horseData) return <p className="p-4">Horse not found.</p>

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">🐎 {horseData.horse_name}</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Profile Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-lg">
          <div><strong>Bloodline:</strong> {horseData.bloodline}</div>
          <div><strong>Generation:</strong> {horseData.generation}</div>
          <div><strong>Gender:</strong> {horseData.gender}</div>
          <div><strong>Overall Rating:</strong> {horseData.rating}</div>
          <div><strong>Speed Rating:</strong> {horseData.speed_rating}</div>
          <div><strong>Sprint Rating:</strong> {horseData.sprint_rating}</div>
          <div><strong>Endurance Rating:</strong> {horseData.endurance_rating}</div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Current Stats</h2>
        <div className="grid grid-cols-3 gap-4 text-lg">
          <div><strong>Average Finish Position:</strong> {averageFinishPosition}</div>
          <div><strong>Win Percentage:</strong> {winPercentage}</div>
          <div><strong>Total Earnings:</strong> ${totalEarnings}</div>
        </div>
      </section>
    </main>
  )
}
