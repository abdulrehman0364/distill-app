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
