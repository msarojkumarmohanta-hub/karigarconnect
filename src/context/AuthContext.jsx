import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/services'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('karigar_user') || 'null'))
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('karigar_access_token')))
  useEffect(() => { if (localStorage.getItem('karigar_access_token')) authApi.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)) }, [])
  const login = async (body) => { const data = await authApi.login(body); localStorage.setItem('karigar_access_token', data.accessToken); localStorage.setItem('karigar_user', JSON.stringify(data.user)); setUser(data.user); return data }
  const register = async (body) => { const data = await authApi.register(body); localStorage.setItem('karigar_access_token', data.accessToken); localStorage.setItem('karigar_user', JSON.stringify(data.user)); setUser(data.user); return data }
  const logout = async () => { try { await authApi.logout() } catch { /* session may already be expired */ }; localStorage.removeItem('karigar_access_token'); localStorage.removeItem('karigar_user'); setUser(null) }
  return <AuthContext.Provider value={useMemo(() => ({ user, loading, login, register, logout }), [user, loading])}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
