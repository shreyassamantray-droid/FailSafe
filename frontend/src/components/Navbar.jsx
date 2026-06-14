import { Link } from 'react-router-dom'

function Navbar() {
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
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Link to="/" style={{ color: '#111', textDecoration: 'none', fontSize: '14px' }}>Faculty View</Link>
        <Link to="/dashboard" style={{ color: '#ff5032', textDecoration: 'none', fontSize: '14px' }}>HOD Dashboard</Link>
      </div>
    </nav>
  )
}

export default Navbar