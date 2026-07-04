import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/manager/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError('Une erreur est survenue. Vérifie l\'adresse email.')
    } else {
      setSent(true)
    }
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
          {sent ? (
            <div className="text-center py-2">
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <h2 className="text-base font-semibold text-gray-900 mb-1">Email envoyé</h2>
              <p className="text-sm text-gray-500 mb-5">
                Un lien de réinitialisation a été envoyé à <span className="font-medium text-gray-700">{email}</span>. Vérifie ta boîte mail.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-gray-900 mb-1">Mot de passe oublié</h2>
              <p className="text-sm text-gray-500 mb-6">
                Saisis ton adresse email et on t'envoie un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contact@ca-tech.fr"
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
                  {loading ? 'Envoi…' : 'Envoyer le lien'}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} CA-TECH — Accès restreint
        </p>
      </div>
    </div>
  )
}
