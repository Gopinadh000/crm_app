import { apiInstance } from '../axios-setup/axiosInstance'
import type { ContactStatus } from '../contacts/contacts.api'

export type DashboardStats = {
  totalUsers: number
  totalLeads: number
  totalProspects: number
  totalCustomers: number
}

export type RecentContact = {
  id: number
  firstName: string
  lastName: string
  email?: string | null
  companyName?: string | null
  status: ContactStatus
  createdAt: string
  image?: string | null
}

export type DashboardData = {
  stats: DashboardStats
  recentContacts: RecentContact[]
}

export const fetchDashboard = async () => {
  const { data } = await apiInstance.get('/v1/dashboard')
  return data.data as DashboardData
}
