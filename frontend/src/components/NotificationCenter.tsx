import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Calendar, Award, BookOpen, School } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { getNotifications, markNotificationAsRead } from '../utils/api-new';

type Notification = {
  id: string;
  type: 'homework' | 'deadline' | 'exam' | 'grade' | 'announcement' | 'system' | 'college' | 'course';
  title: string;
  content?: string;
  message?: string;
  time: string;
  read: boolean;
  category?: string;
};



const getIcon = (type: string) => {
  switch (type) {
    case 'homework':
      return <BookOpen className="text-blue-600" />;
    case 'deadline':
      return <AlertCircle className="text-red-600" />;
    case 'exam':
      return <Calendar className="text-purple-600" />;
    case 'grade':
      return <Award className="text-green-600" />;
    case 'announcement':
      return <Info className="text-orange-600" />;
    case 'system':
      return <Bell className="text-gray-600" />;
    case 'college':
      return <School className="text-indigo-600" />;
    default:
      return <Bell className="text-gray-600" />;
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    homework: '作业',
    deadline: 'DDL',
    exam: '考试',
    grade: '成绩',
    announcement: '公告',
    system: '系统',
    college: '院校',
  };
  return labels[type] || '通知';
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        // 转换数据格式
        const formattedNotifications = data.map((notif: any) => ({
          ...notif,
          content: notif.content || notif.message,
        }));
        setNotifications(formattedNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filterNotifications = (types: string[]) => {
    return notifications.filter((n) => types.includes(n.type));
  };

  const handleMarkAllRead = async () => {
    try {
      // 标记所有未读通知为已读
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
      // 更新本地状态
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // 更新本地状态
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const renderNotifications = (notificationsList: Notification[]) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">加载通知中...</p>
        </div>
      );
    }

    if (notificationsList.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">暂无通知</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {notificationsList.map((notification) => (
          <Card
            key={notification.id}
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              !notification.read ? 'border-purple-200 bg-purple-50' : ''
            }`}
            onClick={() => handleNotificationClick(notification.id)}
          >
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3>{notification.title}</h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                      )}
                    </div>
                    <Badge variant="secondary">{getTypeLabel(notification.type)}</Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{notification.content}</p>
                  <p className="text-gray-400 text-sm">{notification.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2>消息与通知</h2>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              全部标记已读
            </Button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-gray-600">
            您有 <span className="text-red-600">{unreadCount}</span> 条未读通知
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-4xl mx-auto">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full mb-6 grid grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="homework">作业</TabsTrigger>
              <TabsTrigger value="exam">考试</TabsTrigger>
              <TabsTrigger value="grade">成绩</TabsTrigger>
              <TabsTrigger value="announcement">公告</TabsTrigger>
              <TabsTrigger value="system">系统</TabsTrigger>
              <TabsTrigger value="college">院校</TabsTrigger>
              <TabsTrigger value="unread">未读</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {renderNotifications(notifications)}
            </TabsContent>

            <TabsContent value="homework">
              {renderNotifications(filterNotifications(['homework', 'deadline']))}
            </TabsContent>

            <TabsContent value="exam">
              {renderNotifications(filterNotifications(['exam']))}
            </TabsContent>

            <TabsContent value="grade">
              {renderNotifications(filterNotifications(['grade']))}
            </TabsContent>

            <TabsContent value="announcement">
              {renderNotifications(filterNotifications(['announcement']))}
            </TabsContent>

            <TabsContent value="system">
              {renderNotifications(filterNotifications(['system']))}
            </TabsContent>

            <TabsContent value="college">
              {renderNotifications(filterNotifications(['college']))}
            </TabsContent>

            <TabsContent value="unread">
              {renderNotifications(notifications.filter((n) => !n.read))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
