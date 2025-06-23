import { Logo } from '@/components/logo';

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background to-primary/30">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="animate-pulse">
          <Logo className="h-20 w-20 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-green-400">NeoBridge</h1>
        <div className="mt-4 flex items-center justify-center space-x-2">
           <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse [animation-delay:-0.3s]"></div>
           <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse [animation-delay:-0.15s]"></div>
           <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
