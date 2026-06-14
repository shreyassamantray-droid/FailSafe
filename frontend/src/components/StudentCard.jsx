import { useState } from 'react'

function StudentCard({ student }) {
  const [intervention, setIntervention] = useState(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  async function getIntervention() {
    setLoading(true)
    setFailed(false)
    try {
      const response = await fetch('http://127.0.0.1:8000/intervene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_data: student.row_data,
          risk_factors: student.top_factors
        })
      })
      const data = await response.json()
      setIntervention(data.intervention)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'white', borderRadius: '8px', padding: '1.25rem',
      borderLeft: `4px solid ${student.at_risk ? '#ff5032' : '#22c55e'}`
    }}>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '15px' }}>Student {student.student_index}</h3>
      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: '99px',
        fontSize: '12px', fontWeight: '700', marginBottom: '0.75rem',
        background: student.at_risk ? '#fff0ee' : '#f0fdf4',
        color: student.at_risk ? '#ff5032' : '#22c55e'
      }}>
        {student.at_risk ? '⚠ At Risk' : '✓ On Track'}
      </span>

      <div style={{ fontSize: '13px', color: '#555' }}>
        {student.top_factors.map(f => (
          <span key={f.factor} style={{ display: 'block', marginTop: '4px' }}>
            • {f.factor}: {f.impact > 0 ? '↑ pushing towards risk' : '↓ reducing risk'}
          </span>
        ))}
      </div>

      {student.at_risk && !intervention && (
        <button onClick={getIntervention} disabled={loading} style={{
          marginTop: '10px', background: 'white', color: '#ff5032',
          border: '1px solid #ff5032', padding: '6px 16px',
          borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
        }}>
          {loading ? 'Generating...' : failed ? 'Failed, try again' : '📋 Generate Intervention'}
        </button>
      )}

      {intervention && (
        <div style={{
          marginTop: '10px', fontSize: '13px', color: '#333',
          background: '#fff8f7', border: '1px solid #ffe0da',
          borderRadius: '6px', padding: '8px 12px'
        }}>
          📋 {intervention}
        </div>
      )}
    </div>
  )
}

export default StudentCard