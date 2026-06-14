import { useState, useEffect } from 'react'
import StatCard from './StatCard'
import RiskChart from './RiskChart'
import StudentTable from './StudentTable'

function Dashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      try {
        const stored = localStorage.getItem('failsafe_results')
        if (stored) {
          setStudents(JSON.parse(stored))
        }
      } catch {
        console.error('Could not load results')
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [])

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>

  if (students.length === 0) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
      No data yet — upload a CSV on the Faculty View first.
    </div>
  )

  const atRisk = students.filter(s => s.at_risk)
  const percentage = Math.round((atRisk.length / students.length) * 100)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>HOD Dashboard</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard number={students.length} label="Total Students" />
        <StatCard number={atRisk.length} label="Flagged At Risk" />
        <StatCard number={`${percentage}%`} label="Risk Percentage" />
      </div>

      <div style={{
        background: 'white', borderRadius: '8px',
        padding: '1.5rem', marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '16px', marginBottom: '1.5rem' }}>Top Risk Factors</h2>
        <RiskChart students={atRisk} />
      </div>

      <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '1.5rem' }}>At-Risk Students</h2>
        <StudentTable students={students} />
      </div>
    </div>
  )
}

export default Dashboard