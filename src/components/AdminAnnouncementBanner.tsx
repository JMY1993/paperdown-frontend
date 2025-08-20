import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { X, Shield } from 'lucide-react';
import { useState } from 'react';

interface Announcement {
  id: string;
  channel: string;
  title: string;
  content: string;
  type: string;
  priority: number;
  enabled: boolean;
  start_time?: string;
  end_time?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// API function to fetch admin dashboard announcements (requires admin auth)
const fetchAdminDashboardAnnouncements = async (): Promise<Announcement[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const response = await fetch(`${apiUrl}/api/v1/announcements/admin-dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch admin dashboard announcements');
  }
  return response.json();
};

function AnnouncementItem({ 
  announcement, 
  onDismiss 
}: { 
  announcement: Announcement; 
  onDismiss: (id: string) => void;
}) {
  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'success': return 'default';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'error': return '错误';
      case 'warning': return '警告';
      case 'success': return '成功';
      case 'info':
      default: return '信息';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'success': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Alert variant={getAlertVariant(announcement.type)} className="relative pr-10 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <Shield className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2 mb-2 flex-wrap">
        {announcement.title}
        <Badge variant={getTypeColor(announcement.type)} className="text-xs">
          {getTypeLabel(announcement.type)}
        </Badge>
        <Badge variant="destructive" className="text-xs">
          管理员
        </Badge>
      </AlertTitle>
      <AlertDescription className="whitespace-pre-wrap">
        {announcement.content}
      </AlertDescription>
      <button
        onClick={() => onDismiss(announcement.id)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="关闭公告"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
}

export function AdminAnnouncementBanner({ 
  className = ''
}: { 
  className?: string; 
}) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem('dismissedAdminAnnouncements') || '[]'))
  );

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['announcements', 'admin'],
    queryFn: fetchAdminDashboardAnnouncements,
    refetchInterval: 5 * 60 * 1000, // 每5分钟重新获取一次
    retry: false, // 如果token无效不要重试
  });

  const handleDismiss = (id: string) => {
    const newDismissedIds = new Set(dismissedIds);
    newDismissedIds.add(id);
    setDismissedIds(newDismissedIds);
    localStorage.setItem('dismissedAdminAnnouncements', JSON.stringify([...newDismissedIds]));
  };

  // 过滤掉已被用户关闭的公告
  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedIds.has(announcement.id)
  );

  // 按优先级排序 (数字越小优先级越高)
  const sortedAnnouncements = visibleAnnouncements.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // 优先级相同时，按创建时间倒序
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (isLoading || error || sortedAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {sortedAnnouncements.map((announcement) => (
        <AnnouncementItem
          key={announcement.id}
          announcement={announcement}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}

// Hook for getting admin announcements data
export function useAdminAnnouncements() {
  return useQuery({
    queryKey: ['announcements', 'admin'],
    queryFn: fetchAdminDashboardAnnouncements,
    refetchInterval: 5 * 60 * 1000,
    retry: false,
  });
}