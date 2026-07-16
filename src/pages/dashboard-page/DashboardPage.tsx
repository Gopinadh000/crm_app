import { useEffect, useState } from 'react'
import {
  HandshakeOutlined,
  PeopleAltOutlined,
  PersonSearchOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material'
import PageTitle from '../../components/common/page-title/PageTitle'
import { useAuth } from '../../services/context/AuthContext'
import {
  fetchDashboard,
  type DashboardStats,
  type RecentContact,
} from '../../services/api/dashboard/dashboard.api'
import StatWidget from './components/StatWidget'
import RecentContactsTable from './components/RecentContactsTable'

const emptyStats: DashboardStats = {
  totalUsers: 0,
  totalLeads: 0,
  totalProspects: 0,
  totalCustomers: 0,
}

const DashboardPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const displayName =
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'there'

  useEffect(() => {
    let cancelled = false

    const loadDashboard = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const data = await fetchDashboard()
        if (cancelled) return
        setStats(data.stats)
        setRecentContacts(data.recentContacts || [])
      } catch (err: unknown) {
        if (cancelled) return
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Unable to load dashboard'
        setErrorMessage(message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-3 tablet:gap-4 desktop:h-full desktop:min-h-0">
      <PageTitle title={`Hi 👋 ${displayName}`} />

      {errorMessage ? (
        <div className="shrink-0 rounded-sm bg-red-50 px-3 py-2.5 text-sm text-red-600 tablet:px-4 tablet:py-3">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid shrink-0 grid-cols-1 gap-3 mobile:grid-cols-2 tablet:gap-4 desktop:grid-cols-4">
        <StatWidget
          title="Total Users"
          value={isLoading ? '—' : stats.totalUsers}
          subtitle="Registered accounts in the system"
          icon={<PeopleAltOutlined fontSize="small" />}
          accentClass="bg-blue-50"
          iconClass="text-blue-600"
        />
        <StatWidget
          title="Total Leads"
          value={isLoading ? '—' : stats.totalLeads}
          subtitle="Contacts marked as Lead"
          icon={<PersonSearchOutlined fontSize="small" />}
          accentClass="bg-amber-50"
          iconClass="text-amber-600"
        />
        <StatWidget
          title="Prospects"
          value={isLoading ? '—' : stats.totalProspects}
          subtitle="Contacts marked as Prospect"
          icon={<TrendingUpOutlined fontSize="small" />}
          accentClass="bg-violet-50"
          iconClass="text-violet-600"
        />
        <StatWidget
          title="Customers"
          value={isLoading ? '—' : stats.totalCustomers}
          subtitle="Contacts marked as Customer"
          icon={<HandshakeOutlined fontSize="small" />}
          accentClass="bg-emerald-50"
          iconClass="text-emerald-600"
        />
      </div>

      <RecentContactsTable contacts={recentContacts} isLoading={isLoading} />
    </div>
  )
}

export default DashboardPage
