'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function AdminAccessPage() {
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (secretCode === 'admin123') {
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: 'جاري إعادة توجيهك إلى لوحة التحكم.',
        });
        router.push('/admin/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'خطأ في الدخول',
          description: 'الرمز السري غير صحيح. يرجى المحاولة مرة أخرى.',
        });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto border-red-500/30 shadow-red-500/10 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-500/10 rounded-full p-3 w-fit mb-2">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl">دخول المسؤول</CardTitle>
          <CardDescription>
            الرجاء إدخال الرمز السري للوصول إلى لوحة التحكم الإدارية.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secret-code">الرمز السري</Label>
              <Input
                id="secret-code"
                type="password"
                placeholder="••••••••"
                required
                className="text-center tracking-widest"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-red-500 hover:bg-red-600 text-white transition-all duration-300 hover:glow-warning" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'دخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
