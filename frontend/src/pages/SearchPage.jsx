import { useSearchParams } from 'react-router-dom'
import { useSearch } from '../hooks/useSearch'
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
