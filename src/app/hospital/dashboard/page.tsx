
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Minus, Plus, Save, LogOut, Bed } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface BedCounts {
  nicu: number;
  picu: number;
  icu: number;
}

export default function HospitalDashboardPage() {
  const [hospitalName] = useState('مستشفى النور التخصصي');
  const [beds, setBeds] = useState<BedCounts>({ nicu: 3, picu: 2, icu: 1 });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = useCallback(() => {
    toast({
      title: 'تم تسجيل الخروج',
      description: 'تم تسجيل خروجك تلقائيًا بسبب عدم النشاط.',
      variant: 'default',
    });
    router.push('/hospital');
  }, [router, toast]);

  useEffect(() => {
    let logoutTimer: NodeJS.Timeout;

    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(handleLogout, 10 * 60 * 1000); // 10 minutes
    };

    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(logoutTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [handleLogout]);

  const handleBedChange = (unit: keyof BedCounts, amount: number) => {
    setBeds(prev => ({
      ...prev,
      [unit]: Math.max(0, prev[unit] + amount),
    }));
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    // In a real app, this would be an API call to save the bed counts
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsUpdating(false);
      toast({
        title: 'تم تحديث البيانات',
        description: 'تم حفظ عدد الأسرة المتاحة بنجاح.',
      });
    }, 1200);
  };

  const unitConfig: { key: keyof BedCounts; name: string; iconColor: string }[] = [
    { key: 'nicu', name: 'وحدة العناية المركزة لحديثي الولادة (NICU)', iconColor: 'text-green-400' },
    { key: 'picu', name: 'وحدة العناية المركزة للأطفال (PICU)', iconColor: 'text-violet-400' },
    { key: 'icu', name: 'وحدة العناية المركزة (ICU)', iconColor: 'text-teal-400' },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl mx-auto border-teal-500/30 shadow-teal-500/10 shadow-lg">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">أهلاً بك، {hospitalName}</CardTitle>
            <CardDescription>إدارة الأسرة المتاحة في وضع الكشك</CardDescription>
          </div>
           <Button variant="ghost" size="icon" onClick={() => router.push('/hospital')}>
              <LogOut className="h-5 w-5"/>
              <span className="sr-only">تسجيل الخروج</span>
           </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">الوحدة</TableHead>
                  <TableHead className="text-center">الأسرة المتاحة</TableHead>
                  <TableHead className="text-center">التحكم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unitConfig.map(({ key, name, iconColor }) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Bed className={`h-5 w-5 ${iconColor}`} />
                        <span>{name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-2xl font-bold tabular-nums">{beds[key]}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => handleBedChange(key, -1)}
                          disabled={beds[key] === 0 || isUpdating}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => handleBedChange(key, 1)}
                          disabled={isUpdating}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row justify-between items-center gap-4">
            <Badge variant="outline">
                آخر تحديث: {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: ar })}
            </Badge>
            <Button 
              className="w-full sm:w-auto h-11 bg-teal-600 hover:bg-teal-700 text-white hover:glow-icu" 
              onClick={handleUpdate} 
              disabled={isUpdating}
            >
                {isUpdating ? <Loader2 className="animate-spin" /> : <Save />}
                {isUpdating ? 'جاري التحديث...' : 'تحديث عدد الأسرة'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
