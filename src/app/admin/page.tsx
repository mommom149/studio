
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminAccessPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'جاري إعادة توجيهك إلى لوحة التحكم.',
      });
      router.push('/admin/dashboard');

    } catch (error) {
      console.error("Admin login failed:", error);
      toast({
        variant: 'destructive',
        title: 'خطأ في الدخول',
        description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
      });
      setIsLoading(false);
    }
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
            الرجاء إدخال البريد الإلكتروني وكلمة المرور للوصول إلى لوحة التحكم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@neobridge.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
