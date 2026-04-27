// src/pages/LoginPage.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email)
      if (result.success) {
        navigate('/')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-purple-500">distill.</span>
          </h1>
          <p className="text-slate-400">Your reels, turned into knowledge</p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium rounded-lg transition"
            >
              {loading ? 'Sending magic link...' : 'Sign in with magic link'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            We'll send you a link to log in. No password needed.
          </p>
        </div>
      </div>
    </div>
  )
}

// src/pages/VaultPage.jsx

import { useState } from 'react'
import { useReels, useAddReel } from '../hooks/api'
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
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Your Vault</h2>
        <p className="text-slate-400">
          {data?.total || 0} reels saved · {data?.total ? Math.ceil(data.total / 20) : 0} pages
        </p>
      </div>

      {/* Category Filter */}
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

      {/* Content */}
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

          {/* Pagination */}
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

      {/* Floating Action Button */}
      <button
        onClick={() => setShowImportModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-2xl flex items-center justify-center shadow-lg transition"
      >
        +
      </button>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  )
}

// src/pages/ReelDetailPage.jsx

import { useParams } from 'react-router-dom'
import { useReelDetail } from '../hooks/api'
import { getCategoryIcon, formatDate } from '../services/api'

export default function ReelDetailPage() {
  const { id } = useParams()
  const { data: reel, isLoading, error } = useReelDetail(id)

  if (isLoading) {
    return <div className="text-center py-20">Loading...</div>
  }

  if (error || !reel) {
    return <div className="text-center py-20 text-red-400">Reel not found</div>
  }

  const extraction = reel.extractions?.[0]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Thumbnail */}
      {reel.thumbnail_url && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img
            src={reel.thumbnail_url}
            alt="Reel"
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{getCategoryIcon(extraction?.category)}</span>
          <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-sm font-medium">
            {extraction?.category || 'general'}
          </span>
        </div>
        <p className="text-sm text-slate-400 mb-2">
          Saved {formatDate(reel.saved_at)} · @{reel.creator_username}
        </p>
      </div>

      {/* Summary */}
      {extraction?.summary && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-3">Summary</h2>
          <p className="text-slate-300 leading-relaxed">{extraction.summary}</p>
        </div>
      )}

      {/* Key Points */}
      {extraction?.key_points && extraction.key_points.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Key Points</h3>
          <ul className="space-y-3">
            {extraction.key_points.map((point, idx) => (
              <li key={idx} className="flex gap-3 text-slate-300">
                <span className="text-purple-400 font-bold flex-shrink-0">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps */}
      {extraction?.steps && extraction.steps.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Steps</h3>
          <ol className="space-y-3">
            {extraction.steps.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-slate-300">
                <span className="text-purple-400 font-bold flex-shrink-0">{item.step}</span>
                <span>{item.action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* References */}
      {reel.references && reel.references.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">References</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reel.references.map((ref) => (
              <div
                key={ref.id}
                className="p-4 bg-slate-800 border border-slate-700 rounded-lg"
              >
                <p className="text-sm text-slate-400 mb-1">{ref.ref_type}</p>
                <p className="font-medium text-white">{ref.ref_name}</p>
                {ref.mention_context && (
                  <p className="text-xs text-slate-400 mt-2 italic">"{ref.mention_context}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// src/pages/CollectionsPage.jsx

import { useState } from 'react'
import { useCollections, useCreateCollection } from '../hooks/api'

export default function CollectionsPage() {
  const { data: collections } = useCollections()
  const createCollectionMutation = useCreateCollection()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    await createCollectionMutation.mutateAsync(title)
    setTitle('')
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Collections</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
        >
          {showForm ? 'Cancel' : 'New Collection'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-slate-800 rounded-lg">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Collection title"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4"
            required
          />
          <button
            type="submit"
            disabled={createCollectionMutation.isPending}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
          >
            Create
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections?.map((collection) => (
          <div
            key={collection.id}
            className="p-6 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition cursor-pointer"
          >
            <p className="text-3xl mb-2">{collection.icon_emoji}</p>
            <h3 className="font-bold text-white mb-1">{collection.title}</h3>
            <p className="text-sm text-slate-400">{collection.collection_reels?.[0]?.count || 0} reels</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// src/pages/SearchPage.jsx

import { useSearchParams } from 'react-router-dom'
import { useSearch } from '../hooks/api'
import ReelCard from '../components/ReelCard'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { data, isLoading } = useSearch(query)

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Search Results</h2>
      {query && <p className="text-slate-400 mb-8">Results for: "{query}"</p>}

      {isLoading ? (
        <div className="text-center py-20">Loading...</div>
      ) : data?.results?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.results.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">No results found</div>
      )}
    </div>
  )
}
