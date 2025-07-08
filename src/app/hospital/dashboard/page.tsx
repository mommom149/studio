
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
import { getHospitalData, updateHospitalBeds, type BedCounts } from './actions';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function HospitalDashboardPage() {
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [hospitalName, setHospitalName] = useState('');
  const [beds, setBeds] = useState<BedCounts | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    toast({
      title: 'تم تسجيل الخروج',
      description: 'لقد قمت بتسجيل الخروج بنجاح.',
    });
    router.push('/hospital');
  }, [router, toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const id = user.email.split('@')[0];
        setHospitalId(id);
      } else {
        router.push('/hospital');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!hospitalId) return;

    const fetchData = async () => {
      setIsLoading(true);
      const data = await getHospitalData(hospitalId);
      if (data) {
        setHospitalName(data.name);
        setBeds(data.beds);
        setLastUpdated(data.lastUpdated);
      } else {
        toast({
          variant: 'destructive',
          title: 'خطأ في جلب البيانات',
          description: `لم يتم العثور على بيانات للمستشفى بالمعرف: ${hospitalId}. يرجى مراجعة المسؤول.`,
        });
        handleLogout();
      }
      setIsLoading(false);
    };

    fetchData();
  }, [hospitalId, toast, handleLogout]);


  const handleBedChange = (unit: keyof BedCounts, amount: number) => {
    if (!beds) return;
    setBeds(prev => ({
      ...prev!,
      [unit]: Math.max(0, (prev?.[unit] ?? 0) + amount),
    }));
  };

  const handleUpdate = async () => {
    if (!hospitalId || !beds) return;
    setIsUpdating(true);
    const result = await updateHospitalBeds(hospitalId, beds);
    if (result.success) {
      toast({
        title: 'تم تحديث البيانات',
        description: 'تم حفظ عدد الأسرة المتاحة بنجاح.',
      });
      setLastUpdated(new Date()); // Optimistic update of timestamp
    } else {
       toast({
        variant: 'destructive',
        title: 'فشل التحديث',
        description: result.message,
      });
    }
    setIsUpdating(false);
  };

  const unitConfig: { key: keyof BedCounts; name: string; iconColor: string }[] = [
    { key: 'nicu', name: 'وحدة العناية المركزة لحديثي الولادة (NICU)', iconColor: 'text-green-400' },
    { key: 'picu', name: 'وحدة العناية المركزة للأطفال (PICU)', iconColor: 'text-violet-400' },
    { key: 'icu', name: 'وحدة العناية المركزة (ICU)', iconColor: 'text-teal-400' },
  ];

  if (isLoading || !beds) {
    return (
       <div className="flex-1 flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48 mt-2" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
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
                    {unitConfig.map(u => (
                      <TableRow key={u.key}>
                        <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-8 w-12 mx-auto" /></TableCell>
                        <TableCell className="text-center flex justify-center gap-2">
                           <Skeleton className="h-9 w-9" />
                           <Skeleton className="h-9 w-9" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row justify-between items-center gap-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-11 w-44" />
            </CardFooter>
          </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl mx-auto border-teal-500/30 shadow-teal-500/10 shadow-lg">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">أهلاً بك، {hospitalName}</CardTitle>
            <CardDescription>إدارة الأسرة المتاحة في الوقت الفعلي</CardDescription>
          </div>
           <Button variant="ghost" size="icon" onClick={handleLogout}>
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
            {lastUpdated && (
              <Badge variant="outline">
                  آخر تحديث: {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: ar })}
              </Badge>
            )}
            <Button 
              className="w-full sm:w-auto h-11 bg-teal-600 hover:bg-teal-700 text-white hover:glow-icu" 
              onClick={handleUpdate} 
              disabled={isUpdating}
            >
                {isUpdating ? <Loader2 className="animate-spin" /> : <Save className="me-2" />}
                {isUpdating ? 'جاري التحديث...' : 'تحديث عدد الأسرة'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
