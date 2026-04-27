// src/components/ReelCard.jsx

import { Link } from 'react-router-dom'
import { formatDate, getCategoryIcon } from '../services/api'

export default function ReelCard({ reel }) {
  const extraction = reel.extractions?.[0]

  return (
    <Link
      to={`/reel/${reel.id}`}
      className="group rounded-lg overflow-hidden bg-slate-800 hover:bg-slate-700 transition shadow-md hover:shadow-lg cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-slate-700 overflow-hidden">
        {reel.thumbnail_url ? (
          <img
            src={reel.thumbnail_url}
            alt="Reel"
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-600">
            <span className="text-3xl opacity-50">🎬</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
          {getCategoryIcon(extraction?.category)} {extraction?.category || 'loading'}
        </div>

        {/* Creator */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          @{reel.creator_username || 'unknown'}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-white line-clamp-2 mb-2">
          {extraction?.summary || 'Processing...'}
        </h3>

        <p className="text-xs text-slate-400 mb-3">
          {formatDate(reel.saved_at)}
        </p>

        {extraction?.key_points && extraction.key_points.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {extraction.key_points.slice(0, 2).map((point, idx) => (
              <span
                key={idx}
                className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded line-clamp-1"
              >
                {point.slice(0, 20)}...
              </span>
            ))}
            {extraction.key_points.length > 2 && (
              <span className="text-xs text-slate-400 px-2 py-1">
                +{extraction.key_points.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

// src/components/ImportModal.jsx

import { useState } from 'react'
import { useAddReel } from '../hooks/useReels'

export default function ImportModal({ onClose }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const addReelMutation = useAddReel()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!url.includes('instagram.com')) {
      setError('Please provide a valid Instagram reel URL')
      return
    }

    try {
      await addReelMutation.mutateAsync(url)
      setUrl('')
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add reel')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Add Reel</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Instagram Reel URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://instagram.com/reel/..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              required
            />
            <p className="text-xs text-slate-500 mt-2">
              Paste any Instagram reel URL. We'll extract the knowledge automatically.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={addReelMutation.isPending}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium rounded-lg transition"
            >
              {addReelMutation.isPending ? 'Adding...' : 'Add Reel'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
