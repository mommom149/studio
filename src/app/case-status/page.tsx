'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileSearch, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';

type CaseStatus = 'Received' | 'Reviewed' | 'Admitted';

interface CaseDetails {
  caseNumber: string;
  patientName: string;
  submissionDate: string;
  type: 'NICU' | 'PICU' | 'ICU';
  status: CaseStatus;
  lastUpdateNote?: string;
}

const statusMap: Record<CaseStatus, { text: string; className: string }> = {
  Received: { text: 'تم الاستلام', className: 'bg-gray-500' },
  Reviewed: { text: 'قيد المراجعة', className: 'bg-yellow-500' },
  Admitted: { text: 'تم القبول', className: 'bg-green-500' },
};

export default function CaseStatusPage() {
  const [caseNumber, setCaseNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CaseDetails | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Mock API call
    setTimeout(() => {
      if (caseNumber.toUpperCase().startsWith('NICU') || caseNumber.toUpperCase().startsWith('PICU') || caseNumber.toUpperCase().startsWith('ICU')) {
        const type = caseNumber.split('-')[0].toUpperCase() as 'NICU' | 'PICU' | 'ICU';
        const statuses: CaseStatus[] = ['Received', 'Reviewed', 'Admitted'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        setResult({
          caseNumber: caseNumber.toUpperCase(),
          patientName: 'محمد علي',
          submissionDate: new Date().toLocaleDateString('ar-EG'),
          type,
          status: randomStatus,
          lastUpdateNote: randomStatus === 'Reviewed' ? 'الحالة مستقرة، في انتظار توفر سرير.' : undefined,
        });
      } else {
        setError('رقم الحالة غير صالح. يرجى التحقق مرة أخرى.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const getBadgeColor = (type: 'NICU' | 'PICU' | 'ICU') => {
    switch (type) {
      case 'NICU': return 'bg-green-500/20 text-green-300 border-green-400';
      case 'PICU': return 'bg-violet-500/20 text-violet-300 border-violet-400';
      case 'ICU': return 'bg-teal-500/20 text-teal-300 border-teal-400';
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto border-violet-500/30 shadow-violet-500/10 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-violet-500/10 rounded-full p-3 w-fit mb-2">
            <FileSearch className="h-8 w-8 text-violet-400" />
          </div>
          <CardTitle className="text-2xl">عرض حالة الطلب</CardTitle>
          <CardDescription>أدخل رقم الحالة الخاص بك لتتبع طلبك.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="case-number">رقم الحالة</Label>
              <Input
                id="case-number"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="مثال: NICU-20230101-1234"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white transition-all duration-300 hover:glow-picu" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'بحث'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-destructive text-center text-sm"
              >
                {error}
              </motion.p>
            )}
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full mt-4 p-4 border rounded-lg bg-secondary"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{result.patientName}</h3>
                    <p className="text-sm text-muted-foreground">{result.caseNumber}</p>
                  </div>
                  <Badge className={getBadgeColor(result.type)}>{result.type}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ التقديم:</span>
                    <span>{result.submissionDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">الحالة:</span>
                    <Badge className={statusMap[result.status].className}>{statusMap[result.status].text}</Badge>
                  </div>
                  {result.lastUpdateNote && (
                     <div className="pt-2">
                        <p className="text-muted-foreground text-xs">ملاحظة آخر تحديث:</p>
                        <p className="text-sm">{result.lastUpdateNote}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </div>
  );
}
