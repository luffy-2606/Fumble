import axios from 'axios'

const baseURL = ''  // Vite proxies /api → http://localhost:5000

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fmbl_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fmbl_token')
      localStorage.removeItem('fmbl_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginPayload { roll_number: string; password: string }
export interface RegisterPayload { roll_number: string; first_name: string; last_name: string; email: string; phone?: string; password: string }
export interface AuthUser { user_id: number; roll_number: string; first_name: string; last_name: string; email: string; role: string; token: string }
export interface MeUser { user_id: number; roll_number: string; first_name: string; last_name: string; email: string; phone?: string; role: string }

export const authApi = {
  login: (data: LoginPayload) => api.post<AuthUser>('/api/auth/login', data).then(r => r.data),
  register: (data: RegisterPayload) => api.post<AuthUser>('/api/auth/register', data).then(r => r.data),
  me: () => api.get<MeUser>('/api/auth/me').then(r => r.data),
}

// ─── Tournaments ──────────────────────────────────────────────────────────────
export interface Tournament {
  tournament_id: number; name: string; sport_name: string; organizer_name: string
  venue_name: string; start_date: string; end_date: string; status: string
}
export const tournamentsApi = {
  list: (status?: string) => api.get<Tournament[]>('/api/tournaments', { params: status ? { status } : {} }).then(r => r.data),
  get: (id: number) => api.get<Tournament>(`/api/tournaments/${id}`).then(r => r.data),
  create: (data: { name: string; sport_id: number; organizer_id: number; start_date: string; end_date: string; venue_id?: number }) =>
    api.post<Tournament>('/api/tournaments', data).then(r => r.data),
  updateStatus: (id: number, status: string) => api.patch(`/api/tournaments/${id}/status`, { status }).then(r => r.data),
  delete: (id: number) => api.delete(`/api/tournaments/${id}`).then(r => r.data),
}

// ─── Matches ──────────────────────────────────────────────────────────────────
export interface Match {
  match_id: number; tournament_name: string; team_a: string; team_b: string
  winner: string | null; match_date: string; match_time: string; status: string
}
export const matchesApi = {
  list: () => api.get<Match[]>('/api/matches').then(r => r.data),
  get: (id: number) => api.get<Match>(`/api/matches/${id}`).then(r => r.data),
  create: (data: { tournament_id: number; team_a_id: number; team_b_id: number; match_date: string; match_time: string; venue_id?: number }) =>
    api.post<Match>('/api/matches', data).then(r => r.data),
  updateResult: (id: number, winner_team_id: number, status: string) => 
    api.patch(`/api/matches/${id}/result`, { winner_team_id, status }).then(r => r.data),
  delete: (id: number) => api.delete(`/api/matches/${id}`).then(r => r.data),
}

// ─── Players ──────────────────────────────────────────────────────────────────
export interface Player {
  profile_id: number; first_name: string; last_name: string; roll_number: string; sport_name: string
  skill_level: string; position: string; is_available: boolean
}
export const playersApi = {
  list: () => api.get<Player[]>('/api/players').then(r => r.data),
  get: (id: number) => api.get<Player>(`/api/players/${id}`).then(r => r.data),
  create: (data: { user_id: number; sport_id: number; skill_level: string; position?: string; bio?: string }) =>
    api.post<Player>('/api/players', data).then(r => r.data),
}

// ─── Teams ────────────────────────────────────────────────────────────────────
export interface Team {
  team_id: number; team_name: string; sport_name: string
  captain_name: string; captain_roll: string; created_at: string
}
export const teamsApi = {
  list: () => api.get<Team[]>('/api/teams').then(r => r.data),
  get: (id: number) => api.get<Team>(`/api/teams/${id}`).then(r => r.data),
}

// ─── Courts ───────────────────────────────────────────────────────────────────
export interface Booking {
  booking_id: number; first_name: string; last_name: string; roll_number: string; venue_name: string
  sport_name: string; booking_date: string; start_time: string; end_time: string
  status: string; created_at: string
}
export const courtsApi = {
  list: (status?: string) => api.get<Booking[]>('/api/courts', { params: status ? { status } : {} }).then(r => r.data),
  get: (id: number) => api.get<Booking>(`/api/courts/${id}`).then(r => r.data),
  create: (data: { user_id: number; venue_id: number; booking_date: string; start_time: string; end_time: string }) =>
    api.post<Booking>('/api/courts', data).then(r => r.data),
  updateStatus: (id: number, status: string) => api.patch(`/api/courts/${id}/status`, { status }).then(r => r.data),
  delete: (id: number) => api.delete(`/api/courts/${id}`).then(r => r.data),
}

// ─── Items ────────────────────────────────────────────────────────────────────
export interface Item {
  item_id: number; item_name: string; sport_name: string
  total_qty: number; available_qty: number; condition: string
}
export const itemsApi = {
  list: () => api.get<Item[]>('/api/items').then(r => r.data),
  get: (id: number) => api.get<Item>(`/api/items/${id}`).then(r => r.data),
  create: (data: { item_name: string; sport_id: number; total_qty: number; condition: string }) =>
    api.post<Item>('/api/items', data).then(r => r.data),
  update: (id: number, data: Partial<Item>) =>
    api.patch<Item>(`/api/items/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/api/items/${id}`).then(r => r.data),
}

// ─── Issuance ─────────────────────────────────────────────────────────────────
export interface Issuance {
  issuance_id: number; first_name: string; last_name: string; roll_number: string; item_name: string
  quantity: number; issued_at: string; due_date: string; returned_at: string | null; status: string
}
export interface CreateIssuancePayload {
  user_id: number
  item_id: number
  quantity: number
  due_date: string
}
export const issuanceApi = {
  list: (status?: string) => api.get<Issuance[]>('/api/issuance', { params: status ? { status } : {} }).then(r => r.data),
  get: (id: number) => api.get<Issuance>(`/api/issuance/${id}`).then(r => r.data),
  create: (data: CreateIssuancePayload) => api.post<Issuance>('/api/issuance', data).then(r => r.data),
  return: (id: number) => api.patch(`/api/issuance/${id}/return`, {}).then(r => r.data),
}

// ─── Venues ───────────────────────────────────────────────────────────────────
export interface Venue {
  venue_id: number; venue_name: string; sport_name: string
  capacity: number; location: string; is_available: boolean
}
export const venuesApi = {
  list: () => api.get<Venue[]>('/api/venues').then(r => r.data),
}

// ─── Sports ───────────────────────────────────────────────────────────────────
export interface Sport {
  sport_id: number; sport_name: string; max_team_size: number; description: string
}
export const sportsApi = {
  list: () => api.get<Sport[]>('/api/sports').then(r => r.data),
}

// ─── Users (admin) ────────────────────────────────────────────────────────────
export interface User {
  user_id: number; roll_number: string; first_name: string; last_name: string; email: string
  phone?: string; role: string; created_at: string
}
export const usersApi = {
  list: () => api.get<User[]>('/api/users').then(r => r.data),
  delete: (id: number) => api.delete(`/api/users/${id}`).then(r => r.data),
}

export default api
