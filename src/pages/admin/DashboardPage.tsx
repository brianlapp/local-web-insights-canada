import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, ChartBar, AlertCircle } from 'lucide-react'

const stats = [
  {
    name: 'Total Businesses',
    value: '0',
    description: 'Businesses audited',
    icon: Building2,
  },
  {
    name: 'Total Signatures',
    value: '0',
    description: 'Petition signatures',
    icon: Users,
  },
  {
    name: 'Average Score',
    value: '0',
    description: 'Overall audit score',
    icon: ChartBar,
  },
  {
    name: 'Pending Reviews',
    value: '0',
    description: 'Awaiting review',
    icon: AlertCircle,
  },
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your business audits and petition signatures
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Create a new business audit
            </p>
            <p className="text-sm text-muted-foreground">
              • Review pending signatures
            </p>
            <p className="text-sm text-muted-foreground">
              • Update business status
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 