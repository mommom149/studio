import { Logo } from '@/components/logo';

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
    </div>
  );
}
