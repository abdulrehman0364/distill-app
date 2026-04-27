import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../services/api'

export function useReels(page = 1, limit = 20, category = null) {
  return useQuery({
    queryKey: ['reels', page, limit, category],
    queryFn: async () => {
      const { data } = await api.get('/reels', {
        params: { page, limit, category }
      })
      return data
    },
    staleTime: 5 * 60 * 1000
  })
}

export function useReelDetail(reelId) {
  return useQuery({
    queryKey: ['reel', reelId],
    queryFn: async () => {
      const { data } = await api.get(`/reels/${reelId}`)
      return data
    },
    enabled: !!reelId
  })
}

export function useAddReel() {
  return useMutation({
    mutationFn: async (url) => {
      const { data } = await api.post('/reels', { url })
      return data
    }
  })
}
