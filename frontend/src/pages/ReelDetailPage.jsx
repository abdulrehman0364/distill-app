import { useParams } from 'react-router-dom'
import { useReelDetail } from '../hooks/useReels'
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
      {reel.thumbnail_url && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img
            src={reel.thumbnail_url}
            alt="Reel"
            className="w-full h-96 object-cover"
          />
        </div>
      )}

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

      {extraction?.summary && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-3">Summary</h2>
          <p className="text-slate-300 leading-relaxed">{extraction.summary}</p>
        </div>
      )}

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
