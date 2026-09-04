import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, Eye, EyeOff, Loader2, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type PageState = 'checking' | 'ready' | 'invalid' | 'done'

export function ResetPassword() {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState>('checking')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    let resolved = false

    function markReady() {
      if (!resolved) {
        resolved = true
        setPageState('ready')
      }
    }

    // Écoute PASSWORD_RECOVERY (PKCE : fired après échange du code)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') markReady()
    })

    // Vérification immédiate : session déjà établie (ex. refresh de page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady()
    })

    // Timeout de sécurité : si aucun événement après 5s → lien invalide
    const timeout = setTimeout(() => {
      if (!resolved) setPageState('invalid')
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
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
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('Une erreur est survenue. Le lien est peut-être expiré.')
      setPageState('invalid')
      return
    }

    // Succès : on invalide la session de récupération puis on redirige
    setPageState('done')
    await supabase.auth.signOut()
    setTimeout(() => navigate('/login'), 3000)
  }

  // ── États de la page ──────────────────────────────────────────────────────

  if (pageState === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <BrandHeader />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
            <p className="text-sm text-gray-500">Vérification du lien…</p>
          </div>
        </div>
      </div>
    )
  }

  if (pageState === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <BrandHeader />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-gray-900 mb-1">Mot de passe mis à jour</h2>
            <p className="text-sm text-gray-500">
              Votre mot de passe a été réinitialisé. Redirection vers la connexion…
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <BrandHeader />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Lien invalide ou expiré</h2>
            <p className="text-sm text-gray-500 mb-5">
              Ce lien de réinitialisation n'est plus valide. Demandez-en un nouveau.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulaire de réinitialisation ────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <BrandHeader />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Nouveau mot de passe</h2>
          <p className="text-sm text-gray-500 mb-6">Choisis un nouveau mot de passe sécurisé.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Nouveau mot de passe
              </label>
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
              <p className="text-xs text-gray-400 mt-1">Au moins 8 caractères</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Confirmer le mot de passe
              </label>
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
              <div className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </div>
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

function BrandHeader() {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="h-12 w-12 rounded-2xl bg-brand-500 flex items-center justify-center mb-3 shadow-lg shadow-brand-500/30">
        <Zap className="h-6 w-6 text-white" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 tracking-tight">CA-TECH</h1>
      <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mt-0.5">Manager</p>
    </div>
  )
}
