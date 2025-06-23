
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, FileText, Hospital, RefreshCw, Search, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

type CaseStatus = 'Received' | 'Reviewed' | 'Admitted' | 'Assigned';
type CaseType = 'NICU' | 'PICU' | 'ICU';

interface Case {
  id: string;
  patientName: string;
  patientAge: string;
  type: CaseType;
  status: CaseStatus;
  reportUrl?: string;
  adminNote: string;
  submissionDate: Date;
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: Date;
}

interface HospitalData {
  id: string;
  name: string;
  beds: {
    nicu: number;
    picu: number;
    icu: number;
  };
  lastUpdated: Date;
}

const initialCases: Case[] = [
  { id: 'NICU-20231028-001', patientName: 'عبدالله الرضيع', patientAge: 'شهر واحد', type: 'NICU', status: 'Received', reportUrl: '#', adminNote: '', submissionDate: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: 'PICU-20231028-002', patientName: 'فاطمة الطفلة', patientAge: '5 سنوات', type: 'PICU', status: 'Reviewed', reportUrl: '#', adminNote: 'تحتاج إلى استشارة متخصصة.', submissionDate: new Date(Date.now() - 5 * 60 * 60 * 1000) },
  { id: 'ICU-20231027-003', patientName: 'أحمد الشيخ', patientAge: '65 سنة', type: 'ICU', status: 'Admitted', reportUrl: '#', adminNote: 'الحالة مستقرة في مستشفى الأمل.', submissionDate: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: 'NICU-20231026-004', patientName: 'سارة الصغيرة', patientAge: 'أسبوعين', type: 'NICU', status: 'Reviewed', reportUrl: '#', adminNote: 'مستقرة ولكن تحتاج إلى مراقبة.', submissionDate: new Date(Date.now() - 48 * 60 * 60 * 1000) },
];

const initialHospitals: HospitalData[] = [
  { id: 'hosp1', name: 'مستشفى الملك فهد', beds: { nicu: 3, picu: 0, icu: 1 }, lastUpdated: new Date() },
  { id: 'hosp2', name: 'مستشفى النور التخصصي', beds: { nicu: 5, picu: 2, icu: 8 }, lastUpdated: new Date(Date.now() - 10 * 60 * 1000) },
  { id: 'hosp3', name: 'مستشفى الملك عبدالله', beds: { nicu: 1, picu: 1, icu: 1 }, lastUpdated: new Date(Date.now() - 30 * 60 * 1000) },
];

export default function AdminDashboardPage() {
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [hospitals, setHospitals] = useState<HospitalData[]>(initialHospitals);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // In a real app, this would be an API call
      setHospitals(prev => prev.map(h => ({ ...h, lastUpdated: new Date() })));
      setLastRefreshed(new Date());
      setIsRefreshing(false);
      toast({ title: 'تم تحديث بيانات المستشفيات' });
    }, 500);
  };
  
  useEffect(() => {
    const interval = setInterval(handleRefresh, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

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

  const updateCase = (caseId: string, updates: Partial<Case>) => {
    setCases(prevCases => prevCases.map(c => c.id === caseId ? { ...c, ...updates } : c));
  };

  const handleAssign = (caseId: string, hospitalId: string) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (hospital) {
        updateCase(caseId, { 
            assignedTo: hospital.name,
            status: 'Assigned',
            assignedBy: 'admin@neobridge.com',
            assignedAt: new Date(),
        });
        toast({
            title: 'تم تعيين الحالة بنجاح!',
            description: `تم تعيين الحالة ${caseId} إلى ${hospital.name}.`,
        });
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
                {filteredCases.map((c) => (
                    <Card key={c.id} className="flex flex-col">
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
                                <Select value={c.status} onValueChange={(newStatus) => updateCase(c.id, { status: newStatus as CaseStatus })}>
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
                                <Textarea id={`note-${c.id}`} placeholder="إضافة ملاحظة..." value={c.adminNote} onChange={(e) => updateCase(c.id, { adminNote: e.target.value })} />
                            </div>
                            {c.reportUrl && <Button variant="secondary" className="w-full"><FileText className="me-2"/> عرض التقرير الطبي</Button>}
                        </CardContent>
                        <CardFooter className="flex flex-col items-start gap-4">
                            {c.status !== 'Assigned' ? (
                                <div className='w-full space-y-2'>
                                    <Label>تعيين إلى مستشفى</Label>
                                    <div className="flex w-full gap-2">
                                        <Select onValueChange={(hospitalId) => handleAssign(c.id, hospitalId)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر مستشفى..."/>
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
                ))}
                {filteredCases.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">لا توجد حالات تطابق معايير البحث.</p>}
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
                        {hospitals.map(h => (
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
