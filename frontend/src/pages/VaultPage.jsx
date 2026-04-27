import { useState } from 'react'
import { useReels } from '../hooks/useReels'
import ReelCard from '../components/ReelCard'
import ImportModal from '../components/ImportModal'

export default function VaultPage() {
  const [showImportModal, setShowImportModal] = useState(false)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState(null)
  const { data, isLoading, error } = useReels(page, 20, category)

  const categories = [
    { value: null, label: 'All' },
    { value: 'fitness', label: '💪 Fitness' },
    { value: 'finance', label: '💰 Finance' },
    { value: 'mindset', label: '🧠 Mindset' },
    { value: 'tech', label: '💻 Tech' },
    { value: 'travel', label: '✈️ Travel' }
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Your Vault</h2>
        <p className="text-slate-400">
          {data?.total || 0} reels saved · {data?.total ? Math.ceil(data.total / 20) : 0} pages
        </p>
      </div>

      <div className="mb-8 flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setCategory(cat.value)
              setPage(1)
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              category === cat.value
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-slate-400 mt-4">Loading your vault...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-red-300">
          Error loading reels. Please try again.
        </div>
      ) : data?.reels.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {data.reels.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}
          </div>

          <div className="flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-300">Page {page}</span>
            <button
              disabled={data.reels.length < 20}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg mb-4">Your vault is empty</p>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
          >
            Add Your First Reel
          </button>
        </div>
      )}

      <button
        onClick={() => setShowImportModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-2xl flex items-center justify-center shadow-lg transition"
      >
        +
      </button>

      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  )
}
