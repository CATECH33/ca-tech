import { SlidersHorizontal } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'

export function ProspectionParametres() {
  return (
    <Layout title="Paramètres — Prospection IA">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="h-16 w-16 rounded-2xl bg-brand-50 flex items-center justify-center shadow-sm">
          <SlidersHorizontal className="h-8 w-8 text-brand-500" />
        </div>
        <div className="text-center max-w-sm">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-600 border border-brand-100">
            🎯 Prospection IA
          </span>
          <h2 className="text-base font-semibold text-gray-900 mt-3">Paramètres</h2>
          <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
            Configuration des modèles IA, intégrations CRM, templates de messages et préférences du module.
          </p>
        </div>
      </div>
    </Layout>
  )
}
