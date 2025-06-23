'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Copy } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

function SuccessContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (caseId) {
      navigator.clipboard.writeText(caseId);
      toast({
        title: 'تم النسخ!',
        description: 'تم نسخ رقم الحالة إلى الحافظة.',
      });
    }
  };

  return (
     <div className="flex-1 flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto text-center border-green-500/50 shadow-green-500/20 shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-green-500/10 rounded-full p-4 w-fit mb-4">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
          <CardTitle className="text-3xl">تم إرسال الحالة بنجاح!</CardTitle>
          <CardDescription>
            لقد تم استلام طلبك. يرجى حفظ رقم الحالة لتتبع طلبك.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-secondary border border-dashed flex items-center justify-between">
            <div className="flex flex-col items-start">
                <span className="text-sm text-muted-foreground">رقم الحالة الخاص بك</span>
                <span className="text-xl font-bold font-mono text-foreground">{caseId || 'غير متوفر'}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={copyToClipboard} disabled={!caseId}>
              <Copy className="h-5 w-5" />
              <span className="sr-only">نسخ رقم الحالة</span>
            </Button>
          </div>
          <div className='flex flex-col sm:flex-row gap-4'>
            <Button asChild className="w-full h-11">
                <Link href={`/case-status?caseId=${caseId}`}>عرض حالة الطلب</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-11">
                <Link href="/">العودة إلى الصفحة الرئيسية</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}
