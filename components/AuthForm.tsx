"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Gift } from "lucide-react";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/claim";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Account not claimed. Please claim your account.") {
          setIsLogin(false);
          setError("Lütfen şifre belirlemek için hesabınızı doğrulayın.");
        } else if (data.error === "Account already claimed. Please login.") {
          setIsLogin(true);
          setError("Hesap zaten doğrulanmış. Lütfen giriş yapın.");
        } else {
          const errorMap: Record<string, string> = {
            "User not found": "Kullanıcı bulunamadı",
            "Invalid credentials": "Kullanıcı adı veya şifre hatalı",
            "Internal server error": "Sunucu hatası",
          };
          setError(errorMap[data.error] || "Bir hata oluştu");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-white/10 ring-1 ring-white/20">
            <Gift className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-center">Yılbaşı Çekilişi</CardTitle>
        <CardDescription className="text-center">
          {isLogin
            ? "Giriş yapmak için bilgilerinizi girin"
            : "Hesabınızı doğrulayın ve şifre belirleyin"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Input
                id="username"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Input
                id="password"
                type="password"
                placeholder={isLogin ? "Şifre" : "Yeni Şifre Belirle"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-300 text-center bg-red-900/50 py-1 rounded border border-red-500/20">
                {error}
              </p>
            )}
          </div>
          <Button className="w-full mt-6" type="submit" disabled={loading}>
            {loading
              ? "Yükleniyor..."
              : isLogin
              ? "Giriş Yap"
              : "Hesabı Doğrula"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs text-white/50 hover:text-white"
        >
          {isLogin
            ? "Hesabınızı doğrulamanız mı gerekiyor?"
            : "Zaten hesabınız var mı?"}
        </Button>
      </CardFooter>
    </Card>
  );
}
