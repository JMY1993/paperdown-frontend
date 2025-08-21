import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { requireRole } from '@/utils/routeProtection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLogs, useLogStats, useLogFiles, type LogFilters } from '@/services/logs'
import { formatDistanceToNow } from 'date-fns'

export const Route = createFileRoute('/admin/logs')({
  component: LogsPage,
  beforeLoad: requireRole('admin'),
})

function LogsPage() {
  const [filters, setFilters] = useState<LogFilters>({
    page: 1,
    limit: 50,
  })
  const [refreshInterval, setRefreshInterval] = useState<number>(0) // 0 = no refresh

  const { data: logsData, isLoading: logsLoading } = useLogs(filters, refreshInterval || undefined)
  const { data: statsData } = useLogStats(24, refreshInterval || undefined)
  const { data: logFilesData } = useLogFiles()

  const updateFilter = (key: keyof LogFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset to first page when changing filters
    }))
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'ERROR': return 'destructive'
      case 'WARN': return 'secondary'
      case 'INFO': return 'default'
      case 'DEBUG': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusBadgeVariant = (status?: number) => {
    if (!status) return 'outline'
    if (status >= 500) return 'destructive'
    if (status >= 400) return 'secondary'
    if (status >= 200) return 'default'
    return 'outline'
  }

  const formatLogTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        absolute: date.toLocaleString(),
      }
    } catch {
      return { relative: timeStr, absolute: timeStr }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground">
          Monitor and analyze system logs, API requests, and events
          {refreshInterval > 0 && (
            <span className="ml-2 text-blue-600">
              • Auto-refreshing every {refreshInterval >= 60000 ? `${refreshInterval/60000}m` : `${refreshInterval/1000}s`}
            </span>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(statsData.level_stats).map(([level, count]) => (
            <Card key={level}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{level} Logs</CardTitle>
                <Badge variant={getLevelBadgeVariant(level)}>{level}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter logs by level, event type, user, or time range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Log File</label>
              <Select
                value={filters.log_file || 'current'}
                onValueChange={(value) => updateFilter('log_file', value === 'current' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Current log" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">当前日志</SelectItem>
                  {logFilesData?.files?.map((file) => (
                    <SelectItem key={file.path} value={file.path}>
                      {file.display_name} ({file.log_count} 条记录)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <Select
                value={filters.level || 'all'}
                onValueChange={(value) => updateFilter('level', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                  <SelectItem value="WARN">WARN</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="DEBUG">DEBUG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select
                value={filters.event_type || 'all'}
                onValueChange={(value) => updateFilter('event_type', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="authorization">Authorization</SelectItem>
                  <SelectItem value="email_verification">Email Verification</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                  <SelectItem value="user_operation">User Operation</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="Filter by user ID"
                value={filters.user_id || ''}
                onChange={(e) => updateFilter('user_id', e.target.value || undefined)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Auto Refresh</label>
              <Select
                value={refreshInterval.toString()}
                onValueChange={(value) => setRefreshInterval(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No refresh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No refresh</SelectItem>
                  <SelectItem value="2000">2 seconds</SelectItem>
                  <SelectItem value="5000">5 seconds</SelectItem>
                  <SelectItem value="10000">10 seconds</SelectItem>
                  <SelectItem value="30000">30 seconds</SelectItem>
                  <SelectItem value="60000">1 minute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ page: 1, limit: filters.limit || 50 })}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>
              {logsData && logsData.logs && `Showing ${logsData.logs.length} of ${logsData.pagination.total} logs`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={filters.limit?.toString() || '50'}
              onValueChange={(value) => updateFilter('limit', parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="text-center py-8">Loading logs...</div>
          ) : !logsData?.logs?.length ? (
            <div className="text-center py-8 text-muted-foreground">No logs found</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>HTTP</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsData.logs?.map((log) => {
                      const timeFormat = formatLogTime(log.time)
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-mono">{timeFormat.relative}</div>
                              <div className="text-xs text-muted-foreground">{timeFormat.absolute}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getLevelBadgeVariant(log.level)}>
                              {log.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[300px]">
                              <div className="font-medium truncate">{log.message}</div>
                              {log.event_data && (
                                <div className="text-xs text-muted-foreground mt-1 truncate">
                                  {log.event_data}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.event_type && (
                              <Badge variant="outline">{log.event_type}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {log.user_id && (
                              <div className="text-sm font-mono">{log.user_id}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {log.method && (
                              <div className="space-y-1">
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {log.method}
                                  </Badge>
                                  {log.status && (
                                    <Badge variant={getStatusBadgeVariant(log.status)} className="text-xs">
                                      {log.status}
                                    </Badge>
                                  )}
                                </div>
                                {log.path && (
                                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {log.path}
                                  </div>
                                )}
                                {log.latency_ms && (
                                  <div className="text-xs text-muted-foreground">
                                    {log.latency_ms}ms
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {log.ip && (
                              <div className="text-sm font-mono">{log.ip}</div>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {logsData.pagination.total_pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {logsData.pagination.page} of {logsData.pagination.total_pages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilter('page', logsData.pagination.page - 1)}
                      disabled={!logsData.pagination.has_prev}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilter('page', logsData.pagination.page + 1)}
                      disabled={!logsData.pagination.has_next}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}