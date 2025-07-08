
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, FileText, Hospital, RefreshCw, Search, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { updateCase as updateCaseAction, assignCaseToHospital, type CaseForClient, type HospitalData as HospitalDataForClient } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';


type CaseStatus = 'Received' | 'Reviewed' | 'Admitted' | 'Assigned';
type CaseType = 'NICU' | 'PICU' | 'ICU';

// Shape of case data from Firestore, with fields marked as optional to reflect real-world data
interface CaseFromFirestore {
  patientName?: string;
  dob?: string; // ISO string
  serviceType?: 'NICU' | 'PICU' | 'ICU';
  status?: 'Received' | 'Reviewed' | 'Admitted' | 'Assigned';
  medicalReportUrl?: string;
  submissionDate?: Timestamp;
  adminNote?: string;
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: Timestamp;
  [key: string]: any;
}

interface Case extends Omit<CaseForClient, 'submissionDate' | 'assignedAt'> {
  submissionDate: Date;
  assignedAt?: Date;
}

interface HospitalData extends Omit<HospitalDataForClient, 'lastUpdated'> {
  lastUpdated: Date;
}

function calculateAge(dob: string): string {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return 'عمر غير معروف';
    }
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const ageParts: string[] = [];
    if (years > 0) {
        ageParts.push(`${years} سنة`);
        if (months > 0) ageParts.push(`${months} شهر`);
    } else if (months > 0) {
        ageParts.push(`${months} شهر`);
        if (days > 0) ageParts.push(`${days} يوم`);
    } else if (days >= 0) {
        ageParts.push(`${days} يوم`);
    }
    
    return ageParts.length > 0 ? ageParts.join(' و ') : 'حديث الولادة';
}


export default function AdminDashboardPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [updatingCaseId, setUpdatingCaseId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || currentUser.email !== 'admin@neobridge.com') {
        router.push('/admin');
      } else {
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
        setIsLoadingCases(true);
        setIsLoadingHospitals(true);
    }

    try {
        // Fetch Cases directly from Firestore
        const casesRef = collection(db, 'cases');
        const qCases = query(casesRef, orderBy('submissionDate', 'desc'));
        const casesSnapshot = await getDocs(qCases);
        const fetchedCases: CaseForClient[] = casesSnapshot.docs.map(doc => {
            const data = doc.data() as CaseFromFirestore;
            if (!data.submissionDate || typeof data.submissionDate.toDate !== 'function') return null;
            if (!data.patientName || !data.dob || !data.serviceType) return null;
            
            return {
                id: doc.id,
                patientName: data.patientName,
                patientAge: calculateAge(data.dob),
                type: data.serviceType,
                status: data.status || 'Received',
                reportUrl: data.medicalReportUrl,
                adminNote: data.adminNote || '',
                submissionDate: data.submissionDate.toDate().toISOString(),
                assignedTo: data.assignedTo,
                assignedBy: data.assignedBy,
                assignedAt: data.assignedAt ? data.assignedAt.toDate().toISOString() : undefined,
            };
        }).filter((c): c is CaseForClient => c !== null);

        // Fetch Hospitals directly from Firestore
        const hospitalsRef = collection(db, 'hospitals');
        const qHospitals = query(hospitalsRef, orderBy('name'));
        const hospitalsSnapshot = await getDocs(qHospitals);
        const fetchedHospitals: HospitalDataForClient[] = hospitalsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || 'اسم مستشفى غير معروف',
                beds: data.beds || { icu: 0, nicu: 0, picu: 0 },
                lastUpdated: (data.lastUpdated as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            };
        });

        // Process and set state
        const processedCases: Case[] = fetchedCases.map(c => ({
            ...c,
            submissionDate: new Date(c.submissionDate),
            assignedAt: c.assignedAt ? new Date(c.assignedAt) : undefined,
        }));
        setCases(processedCases);
        
        const processedHospitals: HospitalData[] = fetchedHospitals.map(h => ({
            ...h,
            lastUpdated: new Date(h.lastUpdated),
        }));
        setHospitals(processedHospitals);

    } catch (error) {
        console.error("Error fetching data:", error);
        toast({
            variant: 'destructive',
            title: 'فشل في تحميل البيانات',
            description: 'حدث خطأ أثناء جلب البيانات. قد تكون هناك مشكلة في أذونات الوصول إلى قاعدة البيانات.',
        });
    } finally {
        setIsLoadingCases(false);
        setIsLoadingHospitals(false);
    }
  }, [toast]);


  useEffect(() => {
    if (!isAuthLoading) {
      fetchData();
    }
  }, [fetchData, isAuthLoading]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData(true);
    setLastRefreshed(new Date());
    setIsRefreshing(false);
    toast({ title: 'تم تحديث البيانات' });
  }, [fetchData, toast]);
  
  useEffect(() => {
    if (isAuthLoading) return;
    const interval = setInterval(handleRefresh, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [handleRefresh, isAuthLoading]);

  const filteredCases = useMemo(() => {
    return cases
      .filter(c => typeFilter === 'all' || c.type === typeFilter)
      .filter(c => statusFilter === 'all' || c.status === statusFilter)
      .filter(c =>
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.submissionDate.toLocaleDateString().includes(searchQuery)
      );
  }, [cases, typeFilter, statusFilter, searchQuery]);

  const updateCase = async (caseId: string, updates: Partial<{ status: CaseStatus, adminNote: string }>) => {
    setUpdatingCaseId(caseId);
    const result = await updateCaseAction(caseId, updates);
    if (result.success) {
      toast({ title: 'تم تحديث الحالة' });
      // Refetch to get the latest data and ensure consistency
      fetchData(true);
    } else {
      toast({ variant: 'destructive', title: 'فشل التحديث', description: result.message });
    }
    setUpdatingCaseId(null);
  };

  const handleAssign = async (caseId: string, hospitalId: string) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (hospital) {
        setUpdatingCaseId(caseId);
        const result = await assignCaseToHospital(caseId, hospital.name);
        if (result.success) {
            toast({
                title: 'تم تعيين الحالة بنجاح!',
                description: `تم تعيين الحالة ${caseId} إلى ${hospital.name}.`,
            });
            // Refetch to get the server-generated timestamp and ensure data consistency
            fetchData(true); 
        } else {
             toast({ variant: 'destructive', title: 'فشل تعيين الحالة', description: result.message });
        }
        setUpdatingCaseId(null);
    }
  };

  const getBadgeColor = (type: CaseType) => {
    switch (type) {
      case 'NICU': return 'bg-green-500/20 text-green-300 border-green-400';
      case 'PICU': return 'bg-violet-500/20 text-violet-300 border-violet-400';
      case 'ICU': return 'bg-teal-500/20 text-teal-300 border-teal-400';
    }
  };

  const statusMap: Record<CaseStatus, { text: string; className: string }> = {
    Received: { text: 'تم الاستلام', className: 'bg-gray-500' },
    Reviewed: { text: 'قيد المراجعة', className: 'bg-yellow-500' },
    Admitted: { text: 'تم القبول', className: 'bg-blue-500' },
    Assigned: { text: 'تم التعيين', className: 'bg-green-500' },
  };

  const BedStatusIndicator = ({ count }: { count: number }) => {
    const colorClass = count > 2 ? 'text-green-400' : count > 0 ? 'text-yellow-400' : 'text-red-400';
    const bgClass = count > 2 ? 'bg-green-400' : count > 0 ? 'bg-yellow-400' : 'bg-red-400';
    return (
      <div className="flex items-center gap-2 font-semibold">
        <div className={`w-2.5 h-2.5 rounded-full ${bgClass}`} />
        <span className={colorClass}>{count}</span>
      </div>
    );
  };
  
  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم الإدارية</h1>
      <Tabs defaultValue="cases" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cases"><ClipboardList className="me-2" /> إدارة الحالات</TabsTrigger>
          <TabsTrigger value="hospitals"><Hospital className="me-2" /> توفر المستشفيات</TabsTrigger>
        </TabsList>
        <TabsContent value="cases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الحالات</CardTitle>
              <CardDescription>عرض وتحديث وتعيين الحالات الطبية.</CardDescription>
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث بالرقم، الاسم، أو التاريخ..." className="ps-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="نوع الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    <SelectItem value="NICU">NICU</SelectItem>
                    <SelectItem value="PICU">PICU</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="حالة الطلب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الحالات</SelectItem>
                    <SelectItem value="Received">تم الاستلام</SelectItem>
                    <SelectItem value="Reviewed">قيد المراجعة</SelectItem>
                    <SelectItem value="Admitted">تم القبول</SelectItem>
                    <SelectItem value="Assigned">تم التعيين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {isLoadingCases ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-10 w-full" />
                      </CardFooter>
                    </Card>
                  ))
                ) : filteredCases.length > 0 ? (
                    filteredCases.map((c) => (
                      <Card key={c.id} className="flex flex-col relative">
                          {updatingCaseId === c.id && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          )}
                          <CardHeader>
                              <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg">{c.patientName} <span className="text-sm font-normal text-muted-foreground">({c.patientAge})</span></CardTitle>
                                  <Badge className={getBadgeColor(c.type)}>{c.type}</Badge>
                              </div>
                              <CardDescription>{c.id}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4 flex-1">
                              <div>
                                  <Label>الحالة</Label>
                                  <Select value={c.status} onValueChange={(newStatus) => updateCase(c.id, { status: newStatus as CaseStatus })} disabled={updatingCaseId === c.id}>
                                      <SelectTrigger>
                                          <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                          {Object.entries(statusMap).map(([key, value]) => (
                                              <SelectItem key={key} value={key}>{value.text}</SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div>
                                  <Label htmlFor={`note-${c.id}`}>ملاحظات إدارية</Label>
                                  <Textarea id={`note-${c.id}`} placeholder="إضافة ملاحظة..." defaultValue={c.adminNote} onBlur={(e) => updateCase(c.id, { adminNote: e.target.value })} disabled={updatingCaseId === c.id} />
                              </div>
                              {c.reportUrl && <Button asChild variant="secondary" className="w-full"><a href={c.reportUrl} target="_blank" rel="noopener noreferrer"><FileText className="me-2"/> عرض التقرير الطبي</a></Button>}
                          </CardContent>
                          <CardFooter className="flex flex-col items-start gap-4">
                              {c.status !== 'Assigned' ? (
                                  <div className='w-full space-y-2'>
                                      <Label>تعيين إلى مستشفى</Label>
                                      <div className="flex w-full gap-2">
                                          <Select onValueChange={(hospitalId) => handleAssign(c.id, hospitalId)} disabled={updatingCaseId === c.id || isLoadingHospitals}>
                                              <SelectTrigger>
                                                  <SelectValue placeholder={isLoadingHospitals ? "جاري تحميل المستشفيات..." : "اختر مستشفى..."}/>
                                              </SelectTrigger>
                                              <SelectContent>
                                                  {hospitals.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                                              </SelectContent>
                                          </Select>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="text-sm text-muted-foreground w-full p-2 bg-secondary rounded-md">
                                      <p><span className='font-semibold'>تم التعيين إلى:</span> {c.assignedTo}</p>
                                      <p><span className='font-semibold'>بواسطة:</span> {c.assignedBy}</p>
                                      <p><span className='font-semibold'>في:</span> {c.assignedAt?.toLocaleString('ar-EG')}</p>
                                  </div>
                              )}
                          </CardFooter>
                      </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full text-center py-8">لا توجد حالات تطابق معايير البحث الحالية.</p>
                )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hospitals" className="mt-6">
           <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>توفر الأسرة في المستشفيات</CardTitle>
                        <CardDescription>عرض حي لعدد الأسرة المتاحة.</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline">
                            آخر تحديث: {formatDistanceToNow(lastRefreshed, { addSuffix: true, locale: ar })}
                        </Badge>
                        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>المستشفى</TableHead>
                            <TableHead>NICU</TableHead>
                            <TableHead>PICU</TableHead>
                            <TableHead>ICU</TableHead>
                            <TableHead>آخر تحديث</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingHospitals ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                </TableRow>
                            ))
                        ) : hospitals.map(h => (
                            <TableRow key={h.id}>
                                <TableCell className="font-medium">{h.name}</TableCell>
                                <TableCell><BedStatusIndicator count={h.beds.nicu} /></TableCell>
                                <TableCell><BedStatusIndicator count={h.beds.picu} /></TableCell>
                                <TableCell><BedStatusIndicator count={h.beds.icu} /></TableCell>
                                <TableCell>{formatDistanceToNow(h.lastUpdated, { addSuffix: true, locale: ar })}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
