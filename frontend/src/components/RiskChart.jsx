import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function RiskChart({ students }) {
  const factorCounts = {}
  students.forEach(s => {
    s.top_factors.forEach(f => {
      if (f.impact > 0) {
        factorCounts[f.factor] = (factorCounts[f.factor] || 0) + 1
      }
    })
  })

  const data = Object.entries(factorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([factor, count]) => ({ factor, count }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="factor" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#ff5032" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default RiskChart