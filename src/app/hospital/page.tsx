import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hospital } from "lucide-react";

export default function HospitalLoginPage() {
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
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospital-id">معرف المستشفى</Label>
              <Input
                id="hospital-id"
                type="text"
                placeholder="أدخل معرف المستشفى"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-all duration-300 hover:glow-icu">
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
