import { useEffect, useState } from 'react'

type Status = 'processing' | 'success' | 'error'

export function GoogleOAuthCallback() {
  const [status, setStatus] = useState<Status>('processing')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')
    const errorDesc = params.get('error_description')

    if (code && window.opener) {
      window.opener.postMessage(
        { type: 'google-oauth-callback', code },
        window.location.origin,
      )
      setStatus('success')
      setTimeout(() => window.close(), 1500)
    } else if (error) {
      const msg = errorDesc ?? error
      if (window.opener) {
        window.opener.postMessage(
          { type: 'google-oauth-callback', error: msg },
          window.location.origin,
        )
      }
      setErrorMsg(msg)
      setStatus('error')
      setTimeout(() => window.close(), 3000)
    } else {
      setErrorMsg('Paramètres OAuth manquants.')
      setStatus('error')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-xs w-full">
        {/* Google G */}
        <div
          className="h-12 w-12 rounded-full mx-auto mb-5 flex items-center justify-center text-white text-xl font-bold shadow"
          style={{ background: 'linear-gradient(135deg, #4285f4 25%, #34a853 50%, #ea4335 75%)' }}
        >
          G
        </div>

        {status === 'processing' && (
          <>
            <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-800">Connexion en cours…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-800">Connexion réussie !</p>
            <p className="text-xs text-gray-400 mt-1">Cette fenêtre va se fermer…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <svg className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-800">Connexion refusée</p>
            <p className="text-xs text-gray-400 mt-1">{errorMsg}</p>
          </>
        )}
      </div>
    </div>
  )
}
