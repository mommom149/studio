import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

export default function AdminAccessPage() {
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
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secret-code">الرمز السري</Label>
              <Input
                id="secret-code"
                type="password"
                placeholder="••••••••"
                required
                className="text-center tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-red-500 hover:bg-red-600 text-white transition-all duration-300 hover:glow-warning">
              دخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
