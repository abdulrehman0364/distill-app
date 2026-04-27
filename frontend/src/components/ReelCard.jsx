import { Link } from 'react-router-dom'
import { formatDate, getCategoryIcon } from '../services/api'

export default function ReelCard({ reel }) {
  const extraction = reel.extractions?.[0]

  return (
    <Link
      to={`/reel/${reel.id}`}
      className="group rounded-lg overflow-hidden bg-slate-800 hover:bg-slate-700 transition shadow-md hover:shadow-lg cursor-pointer"
    >
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

        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
          {getCategoryIcon(extraction?.category)} {extraction?.category || 'loading'}
        </div>

        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          @{reel.creator_username || 'unknown'}
        </div>
      </div>

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
