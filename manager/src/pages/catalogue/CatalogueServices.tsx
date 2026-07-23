import { ShoppingBag } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'

export function CatalogueServices() {
  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Catalogue</span>
            <span>/</span>
            <span className="text-gray-600">Services</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez les services affichés sur le site public.
          </p>
        </div>

        {/* Empty state */}
        <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50 py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-brand-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Aucun service pour le moment</p>
            <p className="text-xs text-gray-400 mt-0.5">Les services du catalogue apparaîtront ici.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
