import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Stethoscope, FileSearch, Shield, Hospital } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-4">
          أهلاً بكم في نيوبريدج
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10">
          نساعد في تنسيق الرعاية الطارئة لحديثي الولادة والأطفال والبالغين عندما تكون كل ثانية مهمة.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <Button
            asChild
            className="h-14 text-lg bg-green-500/20 text-green-300 border border-green-400 hover:bg-green-500/30 hover:text-white hover:glow-nicu transition-all duration-300"
          >
            <Link href="/submit-case">
              <Stethoscope className="me-2" />
              إرسال حالة جديدة
            </Link>
          </Button>
          <Button
            asChild
            className="h-14 text-lg bg-violet-500/20 text-violet-300 border border-violet-400 hover:bg-violet-500/30 hover:text-white hover:glow-picu transition-all duration-300"
          >
            <Link href="/case-status">
              <FileSearch className="me-2" />
              عرض حالة الطلب
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-14 text-lg border-red-400/50 text-red-300 hover:bg-red-500/20 hover:text-white hover:border-red-400 hover:glow-warning transition-all duration-300"
          >
            <Link href="/admin">
              <Shield className="me-2" />
              دخول المسؤول
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-14 text-lg border-teal-400/50 text-teal-300 hover:bg-teal-500/20 hover:text-white hover:border-teal-400 hover:glow-icu transition-all duration-300"
          >
            <Link href="/hospital">
              <Hospital className="me-2" />
              دخول المستشفى
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
