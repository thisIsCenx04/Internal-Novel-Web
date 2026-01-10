import api from '../../../shared/api/httpClient'

export type CategoryPayload = {
  id: string
  name: string
  slug: string
}

export async function fetchCategories(): Promise<CategoryPayload[]> {
  const res = await api.get('/api/admin/categories')
  return res.data?.data as CategoryPayload[]
}

export async function createCategory(name: string): Promise<CategoryPayload> {
  const res = await api.post('/api/admin/categories', { name })
  return res.data?.data as CategoryPayload
}

export async function updateCategory(id: string, name: string): Promise<CategoryPayload> {
  const res = await api.put(`/api/admin/categories/${id}`, { name })
  return res.data?.data as CategoryPayload
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/api/admin/categories/${id}`)
}
