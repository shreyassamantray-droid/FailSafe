function StatCard({ number, label }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      textAlign: 'center',
      flex: 1
    }}>
      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ff5032' }}>{number}</div>
      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{label}</div>
    </div>
  )
}

export default StatCard