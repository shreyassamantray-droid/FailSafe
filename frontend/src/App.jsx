import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import FacultyView from './components/FacultyView'
import Dashboard from './components/Dashboard'
import Login from './components/Login'

function ProtectedRoute({ children, hodOnly }) {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (!token) return <Navigate to="/login" />
  if (hodOnly && role !== 'hod') return <Navigate to="/" />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <FacultyView />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute hodOnly>
                  <Dashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App