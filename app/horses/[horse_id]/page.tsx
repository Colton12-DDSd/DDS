'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type Race = {
  race_id: string
  finish_position: number
  earnings: number
  finish_time: number // make sure this is numeric in your DB
  race_date?: string // optional for ordering
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
        ...horseRows[0],
      })

      const { data: raceRows, error: raceError } = await supabase
        .from('race_results')
        .select('race_id, finish_position, earnings, finish_time, race_date')
        .eq('horse_id', horseId)
        .order('race_date', { ascending: true })

      if (raceError || !raceRows) {
        setError('Failed to load race history.')
        setLoading(false)
        return
      }

      // Parse finish_time to number if necessary
      const parsedRaces = raceRows.map((r) => ({
        ...r,
        finish_time: typeof r.finish_time === 'string' ? parseFloat(r.finish_time) : r.finish_time,
      }))

      setRaces(parsedRaces)
      setLoading(false)
      setError(null)
    }

    fetchHorseDetails()
  }, [horseId])

  // Helper for linear regression (y = slope * x + intercept)
  function linearRegression(y: number[], x: number[]) {
    const n = y.length
    const sum_x = x.reduce((a, b) => a + b, 0)
    const sum_y = y.reduce((a, b) => a + b, 0)
    const sum_xy = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sum_xx = x.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x)
    const intercept = (sum_y - slope * sum_x) / n

    return { slope, intercept }
  }

  const xData = races.map((_, i) => i) // 0-based race indices
  const yData = races.map((r) => r.finish_time)

  const { slope, intercept } = linearRegression(yData, xData)

  // Calculate trendline finish times for each race index
  const trendlineData = xData.map((x) => slope * x + intercept)

  const averageFinishPosition =
    races.length > 0
      ? (races.reduce((sum, r) => sum + r.finish_position, 0) / races.length).toFixed(2)
      : '-'

  const winCount = races.filter((r) => r.finish_position === 1).length
  const winPercentage = races.length > 0 ? ((winCount / races.length) * 100).toFixed(2) + '%' : '-'

  const totalEarnings = races.length > 0 ? races.reduce((sum, r) => sum + r.earnings, 0).toFixed(2) : '-'

  const chartData = {
    labels: races.map((r, i) => `Race ${i + 1}`),
    datasets: [
      {
        label: 'Finish Time (seconds)',
        data: yData,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Trendline',
        data: trendlineData,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 0.8)',
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Finish Times Over Races',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Finish Time (seconds)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Race Order',
        },
      },
    },
  }

  if (loading) return <p className="p-4">Loading horse details...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>
  if (!horseData) return <p className="p-4">Horse not found.</p>

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">🐎 {horseData.horse_name}</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Profile Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-lg">
          <div>
            <strong>Bloodline:</strong> {horseData.bloodline}
          </div>
          <div>
            <strong>Generation:</strong> {horseData.generation}
          </div>
          <div>
            <strong>Gender:</strong> {horseData.gender}
          </div>
          <div>
            <strong>Overall Rating:</strong> {horseData.rating}
          </div>
          <div>
            <strong>Speed Rating:</strong> {horseData.speed_rating}
          </div>
          <div>
            <strong>Sprint Rating:</strong> {horseData.sprint_rating}
          </div>
          <div>
            <strong>Endurance Rating:</strong> {horseData.endurance_rating}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Current Stats</h2>
        <div className="grid grid-cols-3 gap-4 text-lg">
          <div>
            <strong>Average Finish Position:</strong> {averageFinishPosition}
          </div>
          <div>
            <strong>Win Percentage:</strong> {winPercentage}
          </div>
          <div>
            <strong>Total Earnings:</strong> ${totalEarnings}
          </div>
        </div>
      </section>

      {races.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Finish Time Over Races</h2>
          <Line data={chartData} options={options} />
        </section>
      )}
    </main>
  )
}
