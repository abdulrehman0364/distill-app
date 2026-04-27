import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../services/api'

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data } = await api.get('/collections')
      return data.collections
    }
  })
}

export function useCreateCollection() {
  return useMutation({
    mutationFn: async (title, description) => {
      const { data } = await api.post('/collections', { title, description })
      return data
    }
  })
}

export function useAddReelToCollection() {
  return useMutation({
    mutationFn: async ({ collectionId, reelId }) => {
      const { data } = await api.post(`/collections/${collectionId}/reels`, {
        reel_id: reelId
      })
      return data
    }
  })
}
