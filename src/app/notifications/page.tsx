import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, Bell } from 'lucide-react';

interface Notification {
  id: string;
  caseNumber: string;
  message: string;
  time: string;
  type: 'NICU' | 'PICU' | 'ICU' | 'General';
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: '1',
    caseNumber: 'NICU-20231028-001',
    message: 'تم تحديث الحالة إلى "تم القبول".',
    time: 'منذ ساعتين',
    type: 'NICU',
    read: false,
  },
  {
    id: '2',
    caseNumber: 'PICU-20231028-002',
    message: 'الحالة قيد المراجعة من قبل الفريق الطبي.',
    time: 'منذ 5 ساعات',
    type: 'PICU',
    read: false,
  },
  {
    id: '3',
    caseNumber: 'ICU-20231027-003',
    message: 'تم استلام تقرير طبي جديد.',
    time: 'منذ يوم واحد',
    type: 'ICU',
    read: true,
  },
  {
    id: '4',
    caseNumber: 'NICU-20231026-004',
    message: 'تم تحديث الحالة إلى "تم القبول".',
    time: 'منذ يومين',
    type: 'NICU',
    read: true,
  },
];

const getBadgeStyle = (type: Notification['type']) => {
  switch (type) {
    case 'NICU':
      return 'bg-green-500/20 text-green-300 border-green-400';
    case 'PICU':
      return 'bg-violet-500/20 text-violet-300 border-violet-400';
    case 'ICU':
      return 'bg-teal-500/20 text-teal-300 border-teal-400';
    default:
      return 'bg-secondary';
  }
};

const getIcon = (type: Notification['type']) => {
    switch (type) {
        case 'NICU': return <div className="w-3 h-3 rounded-full bg-green-400" />;
        case 'PICU': return <div className="w-3 h-3 rounded-full bg-violet-400" />;
        case 'ICU': return <div className="w-3 h-3 rounded-full bg-teal-400" />;
        default: return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
}

export default function NotificationsPage() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className='flex items-center gap-3'>
              <BellRing className="h-6 w-6" />
              <CardTitle className="text-2xl">الإشعارات</CardTitle>
            </div>
            {unreadCount > 0 && (
                <Badge variant="destructive" className="h-6">{unreadCount} جديد</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                    !notification.read ? 'bg-secondary' : 'bg-transparent'
                  }`}
                >
                  <div className="mt-1.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-muted-foreground">{notification.caseNumber}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                    <p className="text-foreground">{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
              <Bell className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-semibold">لا توجد إشعارات بعد</h3>
              <p>ستظهر التحديثات الجديدة هنا.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
