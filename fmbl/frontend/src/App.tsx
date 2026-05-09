import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import TournamentsPage from './pages/TournamentsPage'
import MatchesPage from './pages/MatchesPage'
import PlayersPage from './pages/PlayersPage'
import TeamsPage from './pages/TeamsPage'
import CourtsPage from './pages/CourtsPage'
import IssuancePage from './pages/IssuancePage'
import UsersPage from './pages/UsersPage'
import ResourcesPage from './pages/ResourcesPage'


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/tournaments" element={<ProtectedRoute><TournamentsPage /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
          <Route path="/players" element={<ProtectedRoute><PlayersPage /></ProtectedRoute>} />
          <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
          <Route path="/courts" element={<ProtectedRoute><CourtsPage /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
          <Route path="/items" element={<Navigate to="/resources" replace />} />
          <Route path="/issuance" element={<ProtectedRoute><IssuancePage /></ProtectedRoute>} />
          <Route path="/venues" element={<Navigate to="/resources" replace />} />
          <Route path="/sports" element={<Navigate to="/resources" replace />} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
