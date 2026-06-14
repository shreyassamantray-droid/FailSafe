function StudentTable({ students }) {
  const atRisk = students.filter(s => s.at_risk)

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
      <thead>
        <tr>
          {['Student', 'Status', 'Top Risk Factor', 'Impact Score'].map(h => (
            <th key={h} style={{
              textAlign: 'left', padding: '10px 12px',
              background: '#f5f5f5', color: '#666',
              fontSize: '12px', textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {atRisk.map(s => {
          const top = s.top_factors.find(f => f.impact > 0) || s.top_factors[0]
          return (
            <tr key={s.student_index}>
              <td style={{ padding: '10px 12px', borderTop: '1px solid #eee' }}>Student {s.student_index}</td>
              <td style={{ padding: '10px 12px', borderTop: '1px solid #eee' }}>
                <span style={{
                  background: '#fff0ee', color: '#ff5032',
                  padding: '3px 10px', borderRadius: '99px',
                  fontSize: '12px', fontWeight: '700'
                }}>⚠ At Risk</span>
              </td>
              <td style={{ padding: '10px 12px', borderTop: '1px solid #eee' }}>{top ? top.factor : '—'}</td>
              <td style={{ padding: '10px 12px', borderTop: '1px solid #eee' }}>{top ? top.impact : '—'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default StudentTable