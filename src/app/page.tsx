import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Stethoscope, FileSearch } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-2xl text-center">
        <Logo className="h-24 w-24 mx-auto mb-6 text-green-400" />
        <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-4">
          أهلاً بكم في نيوبريدج
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10">
          نساعد في تنسيق الرعاية الطارئة لحديثي الولادة والأطفال والبالغين عندما تكون كل ثانية مهمة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link href="/submit-case" className="group block rounded-lg border bg-card text-card-foreground shadow-sm hover:border-green-500/50 hover:shadow-green-500/10 transition-all">
              <div className="flex flex-col space-y-1.5 p-6 h-full">
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold leading-none tracking-tight">إرسال حالة جديدة</h3>
                        <p className="text-sm text-muted-foreground">تقديم طلب إحالة عاجل.</p>
                    </div>
                    <Stethoscope className="w-8 h-8 text-green-400" />
                </div>
              </div>
          </Link>
          <Link href="/case-status" className="group block rounded-lg border bg-card text-card-foreground shadow-sm hover:border-violet-500/50 hover:shadow-violet-500/10 transition-all">
               <div className="flex flex-col space-y-1.5 p-6 h-full">
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold leading-none tracking-tight">عرض حالة الطلب</h3>
                        <p className="text-sm text-muted-foreground">تتبع حالة طلب الإحالة الخاص بك.</p>
                    </div>
                    <FileSearch className="w-8 h-8 text-violet-400" />
                </div>
              </div>
          </Link>
      </div>
    </div>
  );
}
