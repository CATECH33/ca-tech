import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase envoie un événement PASSWORD_RECOVERY quand le token est valide
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError('Erreur lors de la réinitialisation. Le lien a peut-être expiré.')
    } else {
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-2xl bg-brand-500 flex items-center justify-center mb-3 shadow-lg shadow-brand-500/30">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">CA-TECH</h1>
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mt-0.5">Manager</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-gray-900 mb-1">Mot de passe mis à jour</h2>
            <p className="text-sm text-gray-500">Redirection vers la connexion…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-2xl bg-brand-500 flex items-center justify-center mb-3 shadow-lg shadow-brand-500/30">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">CA-TECH</h1>
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mt-0.5">Manager</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <Loader2 className="h-8 w-8 text-brand-500 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-gray-500">Vérification du lien…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-brand-500 flex items-center justify-center mb-3 shadow-lg shadow-brand-500/30">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">CA-TECH</h1>
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mt-0.5">Manager</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Nouveau mot de passe</h2>
          <p className="text-sm text-gray-500 mb-6">Choisis un nouveau mot de passe sécurisé.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-3 pr-10 text-sm rounded-lg border border-gray-200 bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} CA-TECH — Accès restreint
        </p>
      </div>
    </div>
  )
}
