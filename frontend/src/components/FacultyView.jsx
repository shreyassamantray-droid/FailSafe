import { useState } from 'react'
import StudentCard from './StudentCard'

function FacultyView() {
  const [students, setStudents] = useState([])
  const [status, setStatus] = useState('')

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return

    setStatus('Analysing students...')
    setStudents([])

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      const results = data.results

      const atRisk = results.filter(s => s.at_risk).length
      setStatus(`${results.length} students analysed — ${atRisk} flagged at risk`)
      setStudents(results)
      localStorage.setItem('failsafe_results', JSON.stringify(results))

    } catch {
      setStatus('Error connecting to backend. Is it running?')
    }
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Faculty View</h1>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '14px' }}>Upload student data to identify at-risk students</p>

      <label style={{
        display: 'block', background: 'white',
        border: '2px dashed #ccc', borderRadius: '8px',
        padding: '2rem', textAlign: 'center',
        cursor: 'pointer', marginBottom: '2rem'
      }}>
        <span style={{ color: '#666', fontSize: '14px' }}>Click to upload a student CSV file</span>
        <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
      </label>

      {status && <p style={{ color: '#666', fontSize: '14px', marginBottom: '1rem' }}>{status}</p>}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {students.map(s => <StudentCard key={s.student_index} student={s} />)}
      </div>
    </div>
  )
}

export default FacultyView