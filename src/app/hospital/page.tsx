'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hospital, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function HospitalLoginPage() {
  const [hospitalId, setHospitalId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // We create a standardized email from the hospital ID to use with Firebase Auth.
      // You must create a corresponding user in your Firebase console.
      // Example: for Hospital ID "hosp123", create user "hosp123@neobridge.com".
      const email = `${hospitalId}@neobridge.com`;
      await signInWithEmailAndPassword(auth, email, password);

      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'جاري إعادة توجيهك إلى لوحة التحكم.',
      });
      router.push('/hospital/dashboard');

    } catch (error) {
      console.error("Hospital login failed:", error);
      toast({
        variant: 'destructive',
        title: 'خطأ في الدخول',
        description: 'معرف المستشفى أو كلمة المرور غير صحيحة.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto border-teal-500/30 shadow-teal-500/10 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-teal-500/10 rounded-full p-3 w-fit mb-2">
            <Hospital className="h-8 w-8 text-teal-400" />
          </div>
          <CardTitle className="text-2xl">بوابة المستشفى</CardTitle>
          <CardDescription>
            سجل الدخول لإدارة أسرة المستشفى المتاحة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospital-id">معرف المستشفى</Label>
              <Input
                id="hospital-id"
                type="text"
                placeholder="أدخل معرف المستشفى"
                required
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
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
            <Button type="submit" className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-all duration-300 hover:glow-icu" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'تسجيل الدخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
