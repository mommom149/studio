'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, CalendarIcon, Loader2, Upload, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { ar } from 'date-fns/locale';
import { getServiceTypeAction, submitCaseAction } from './actions';
import { useState, useTransition } from 'react';
import type { DetectServiceTypeOutput } from '@/ai/flows/auto-detect-service-type';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  patientName: z.string().min(2, { message: 'الاسم مطلوب.' }),
  dob: z.date({ required_error: 'تاريخ الميلاد مطلوب.' }),
  contactPhone: z.string().min(8, { message: 'رقم هاتف صحيح مطلوب.' }),
  contactEmail: z.string().email({ message: 'بريد إلكتروني صحيح مطلوب.' }),
  referringHospital: z.string().min(3, { message: 'اسم المستشفى أو الطبيب مطلوب.' }),
  medicalReport: z.instanceof(File, { message: 'التقرير الطبي مطلوب.' }),
  birthCertificate: z.instanceof(File, { message: 'شهادة الميلاد مطلوبة.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitCasePage() {
  const [isPending, startTransition] = useTransition();
  const [isDetecting, startDetectingTransition] = useTransition();
  const [serviceTypeInfo, setServiceTypeInfo] = useState<DetectServiceTypeOutput | null>(null);
  const [age, setAge] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      contactPhone: '',
      contactEmail: '',
      referringHospital: '',
    },
  });

  const handleDobChange = (date: Date | undefined) => {
    form.setValue('dob', date as Date, { shouldValidate: true });

    if (!date) {
      setAge(null);
      setServiceTypeInfo(null);
      return;
    }

    // --- Age calculation for display ---
    const now = new Date();
    let years = now.getFullYear() - date.getFullYear();
    let months = now.getMonth() - date.getMonth();
    let days = now.getDate() - date.getDate();

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

    setAge(ageParts.length > 0 ? ageParts.join(' و ') : 'حديث الولادة');

    // --- Age calculation for AI ---
    setServiceTypeInfo(null);
    let ageInMonths = (now.getFullYear() - date.getFullYear()) * 12;
    ageInMonths -= date.getMonth();
    ageInMonths += now.getMonth();
    if (now.getDate() < date.getDate()) {
      ageInMonths--;
    }

    if (ageInMonths < 0) {
      ageInMonths = 0;
    }

    startDetectingTransition(async () => {
      const result = await getServiceTypeAction(ageInMonths);
      setServiceTypeInfo(result);
    });
  };

  const getBadgeColor = (type?: string) => {
    switch (type) {
      case 'NICU': return 'bg-green-500/20 text-green-300 border-green-400';
      case 'PICU': return 'bg-violet-500/20 text-violet-300 border-violet-400';
      case 'ICU': return 'bg-teal-500/20 text-teal-300 border-teal-400';
      default: return 'bg-secondary';
    }
  }

  async function onSubmit(values: FormValues) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
            if (value instanceof Date) {
                 formData.append(key, value.toISOString());
            } else if (value instanceof File) {
                 formData.append(key, value);
            } else if (typeof value === 'string') {
                 formData.append(key, value);
            }
        }
      });
      if (serviceTypeInfo?.serviceType) {
        formData.append('serviceType', serviceTypeInfo.serviceType);
      } else {
        // Handle case where AI detection hasn't completed or failed.
        // For now, we'll just prevent submission. A better UX would show an error.
        return;
      }
      await submitCaseAction(formData);
    });
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto border-green-500/30 shadow-green-500/10 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-500/10 rounded-full p-3 w-fit mb-2">
            <Stethoscope className="h-8 w-8 text-green-400" />
          </div>
          <CardTitle className="text-2xl">إرسال حالة جديدة</CardTitle>
          <CardDescription>املأ النموذج أدناه لتقديم طلب إحالة جديد.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المريض</FormLabel>
                      <FormControl>
                        <Input placeholder="الاسم الكامل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>تاريخ الميلاد</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full justify-start text-right font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="ms-auto me-2 h-4 w-4" />
                              {field.value ? format(field.value, 'PPP', { locale: ar }) : <span>اختر تاريخًا</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={handleDobChange}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                            locale={ar}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel>العمر (محسوب تلقائيًا)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="يُحسب بعد اختيار تاريخ الميلاد"
                    value={age || ''}
                    readOnly
                    className="font-semibold bg-secondary/50 cursor-default"
                  />
                </FormControl>
              </FormItem>

              { (isDetecting || serviceTypeInfo) &&
                <FormItem className="p-4 rounded-lg bg-secondary border border-dashed">
                  <FormLabel className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                    نوع الخدمة (محدد تلقائيًا)
                  </FormLabel>
                  {isDetecting ? (
                     <div className='flex items-center gap-2 text-muted-foreground'>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>جاري تحديد نوع الخدمة...</span>
                     </div>
                  ) : serviceTypeInfo && (
                     <div>
                        <Badge className={getBadgeColor(serviceTypeInfo.serviceType)}>{serviceTypeInfo.serviceType}</Badge>
                        <FormDescription className="mt-2">{serviceTypeInfo.justification}</FormDescription>
                     </div>
                  )}
                </FormItem>
              }

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>هاتف جهة الاتصال</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="رقم الهاتف" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني لجهة الاتصال</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="البريد الإلكتروني" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="referringHospital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المستشفى / الطبيب المُحيل</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم المستشفى أو الطبيب" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="medicalReport"
                  render={({ field: { onChange, value, ...rest }}) => (
                    <FormItem>
                      <FormLabel>تحميل تقرير طبي</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*,application/pdf" className="pt-2"
                          {...rest}
                          onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                        />
                      </FormControl>
                      <FormDescription>التقرير الطبي إلزامي.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="birthCertificate"
                  render={({ field: { onChange, value, ...rest }}) => (
                    <FormItem>
                      <FormLabel>تحميل شهادة ميلاد</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*,application/pdf" className="pt-2"
                          {...rest}
                          onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                        />
                      </FormControl>
                      <FormDescription>شهادة الميلاد إلزامية.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg" disabled={isPending || isDetecting || !serviceTypeInfo}>
                {isPending ? (
                  <>
                    <Loader2 className="me-2 h-5 w-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Upload className="me-2 h-5 w-5" />
                    إرسال الحالة
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
