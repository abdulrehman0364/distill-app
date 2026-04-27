import { useState } from 'react'
import { useCollections, useCreateCollection } from '../hooks/useCollections'

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
