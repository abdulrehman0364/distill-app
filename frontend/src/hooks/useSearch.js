import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

export function useSearch(query) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return { results: [] }
      const { data } = await api.get('/search', {
        params: { q: query }
      })
      return data
    },
    enabled: !!query
  })
}
