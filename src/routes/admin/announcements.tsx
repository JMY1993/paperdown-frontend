import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';
import { HomeAnnouncementBanner } from '../../components/PublicAnnouncementBanner';
import { AdminAnnouncementBanner } from '../../components/AdminAnnouncementBanner';

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

interface CreateAnnouncementData {
  channel: string;
  title: string;
  content: string;
  type: string;
  priority: number;
  enabled: boolean;
  start_time?: string;
  end_time?: string;
}

interface UpdateAnnouncementData {
  channel?: string;
  title?: string;
  content?: string;
  type?: string;
  priority?: number;
  enabled?: boolean;
  start_time?: string;
  end_time?: string;
}

// API functions
const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/v1/admin/announcements', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch announcements');
  }
  const data = await response.json();
  return data.announcements || [];
};

const createAnnouncement = async (data: CreateAnnouncementData): Promise<Announcement> => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/v1/admin/announcements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create announcement');
  }
  return response.json();
};

const updateAnnouncement = async (id: string, data: UpdateAnnouncementData): Promise<Announcement> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/v1/admin/announcements/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update announcement');
  }
  return response.json();
};

const deleteAnnouncement = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/v1/admin/announcements/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete announcement');
  }
};

// 从现有公告中提取频道名称
const getExistingChannels = (announcements: Announcement[]): string[] => {
  return [...new Set(announcements.map(a => a.channel))];
};

function AnnouncementForm({ 
  announcement, 
  onSubmit, 
  onCancel,
  availableChannels = []
}: { 
  announcement?: Announcement; 
  onSubmit: (data: CreateAnnouncementData | UpdateAnnouncementData) => void;
  onCancel: () => void;
  availableChannels?: string[];
}) {
  const [formData, setFormData] = useState({
    channel: announcement?.channel || '',
    title: announcement?.title || '',
    content: announcement?.content || '',
    type: announcement?.type || 'info',
    priority: announcement?.priority || 1,
    enabled: announcement?.enabled ?? true,
    start_time: announcement?.start_time ? announcement.start_time.substring(0, 16) : '',
    end_time: announcement?.end_time ? announcement.end_time.substring(0, 16) : '',
  });
  
  
  // 使用传入的可用频道列表

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      start_time: formData.start_time ? new Date(formData.start_time).toISOString() : undefined,
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : undefined,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="channel">频道</Label>
        <Input
          placeholder="输入频道名称"
          value={formData.channel}
          onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="title">标题</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="content">内容</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          required
          rows={4}
          className="whitespace-pre-wrap break-words"
        />
      </div>

      <div>
        <Label htmlFor="type">类型</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">信息</SelectItem>
            <SelectItem value="warning">警告</SelectItem>
            <SelectItem value="error">错误</SelectItem>
            <SelectItem value="success">成功</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">优先级 (数字越小优先级越高)</Label>
        <Input
          id="priority"
          type="number"
          min="1"
          max="10"
          value={formData.priority}
          onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={formData.enabled}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
        />
        <Label htmlFor="enabled">启用</Label>
      </div>

      <div>
        <Label htmlFor="start_time">开始时间 (可选)</Label>
        <Input
          id="start_time"
          type="datetime-local"
          value={formData.start_time}
          onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="end_time">结束时间 (可选)</Label>
        <Input
          id="end_time"
          type="datetime-local"
          value={formData.end_time}
          onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          {announcement ? '更新' : '创建'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}

function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: fetchAnnouncements,
  });

  // 获取现有频道列表
  const availableChannels = getExistingChannels(announcements);

  const createMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      setShowCreateDialog(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementData }) => 
      updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      setShowEditDialog(false);
      setEditingAnnouncement(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    },
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'success': return 'default';
      default: return 'outline';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">公告管理</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              创建公告
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建新公告</DialogTitle>
            </DialogHeader>
            <AnnouncementForm
              onSubmit={(data) => createMutation.mutate(data as CreateAnnouncementData)}
              onCancel={() => setShowCreateDialog(false)}
              availableChannels={availableChannels}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 公告预览区域 */}
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">公告预览</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">首页公告 (home频道)</h3>
            <HomeAnnouncementBanner />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">管理员公告 (admin-dashboard频道)</h3>
            <AdminAnnouncementBanner />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {announcement.title}
                    <Badge variant="outline" className="text-xs">
                      📢 {announcement.channel}
                    </Badge>
                    <Badge variant={getTypeColor(announcement.type)}>
                      {announcement.type}
                    </Badge>
                    <Badge variant={announcement.enabled ? 'default' : 'secondary'}>
                      {announcement.enabled ? '启用' : '禁用'}
                    </Badge>
                    <Badge variant={announcement.is_active ? 'default' : 'outline'}>
                      {announcement.is_active ? '有效' : '无效'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    优先级: {announcement.priority} | 
                    创建时间: {formatDateTime(announcement.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAnnouncement(announcement);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('确定要删除这个公告吗？')) {
                        deleteMutation.mutate(announcement.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap mb-4">{announcement.content}</p>
              {(announcement.start_time || announcement.end_time) && (
                <div className="text-sm text-muted-foreground">
                  {announcement.start_time && (
                    <p>开始时间: {formatDateTime(announcement.start_time)}</p>
                  )}
                  {announcement.end_time && (
                    <p>结束时间: {formatDateTime(announcement.end_time)}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑公告</DialogTitle>
          </DialogHeader>
          {editingAnnouncement && (
            <AnnouncementForm
              announcement={editingAnnouncement}
              onSubmit={(data) => updateMutation.mutate({ 
                id: editingAnnouncement.id, 
                data: data as UpdateAnnouncementData 
              })}
              onCancel={() => {
                setShowEditDialog(false);
                setEditingAnnouncement(null);
              }}
              availableChannels={availableChannels}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute('/admin/announcements')({
  component: AnnouncementsPage,
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    if (!context.auth.permissions.includes('role:admin')) {
      throw new Error('Access denied');
    }
  },
});