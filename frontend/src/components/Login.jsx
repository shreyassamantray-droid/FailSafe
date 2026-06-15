import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin() {
    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)
        navigate('/')
      } else {
        setError('Invalid email or password')
      }
    } catch {
      setError('Could not connect to backend')
    }
  }

  return (
    <div style={{
      maxWidth: '400px', margin: '5rem auto', padding: '2rem',
      background: 'white', borderRadius: '8px'
    }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⚠️ Failsafe</h1>
      <p style={{ color: '#666', fontSize: '13px', marginBottom: '2rem' }}>Sign in to continue</p>

      <input
        type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: '6px',
          border: '1px solid #ddd', fontSize: '14px',
          marginBottom: '1rem', display: 'block'
        }}
      />
      <input
        type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: '6px',
          border: '1px solid #ddd', fontSize: '14px',
          marginBottom: '1rem', display: 'block'
        }}
      />

      {error && <p style={{ color: '#ff5032', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}

      <button onClick={handleLogin} style={{
        width: '100%', background: '#ff5032', color: 'white',
        border: 'none', padding: '12px', borderRadius: '6px',
        fontSize: '14px', cursor: 'pointer'
      }}>
        Sign In
      </button>
    </div>
  )
}

export default Login