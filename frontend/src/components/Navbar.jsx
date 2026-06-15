import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const role = localStorage.getItem('role')
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: 'white',
      borderBottom: '1px solid #eee'
    }}>
      <span style={{ fontWeight: '700', fontSize: '18px' }}>⚠️ Failsafe</span>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#111', textDecoration: 'none', fontSize: '14px' }}>Faculty View</Link>
        {role === 'hod' && (
          <Link to="/dashboard" style={{ color: '#ff5032', textDecoration: 'none', fontSize: '14px' }}>HOD Dashboard</Link>
        )}
        <button onClick={handleLogout} style={{
          background: 'none', border: '1px solid #ddd',
          padding: '6px 14px', borderRadius: '6px',
          fontSize: '13px', cursor: 'pointer', color: '#666'
        }}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar