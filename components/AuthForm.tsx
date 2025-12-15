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
import { Gift, Eye, EyeOff } from "lucide-react";

export function AuthForm() {
  const [mode, setMode] = useState<"LOGIN" | "CLAIM" | "REGISTER">("LOGIN");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode !== "LOGIN") {
        if (password.length < 6) {
          setError("Şifre en az 6 karakter olmalıdır.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Şifreler eşleşmiyor.");
          setLoading(false);
          return;
        }
      }

      let endpoint = "/api/auth/login";
      let body: any = { username, password };

      if (mode === "CLAIM") {
        endpoint = "/api/auth/claim";
      } else if (mode === "REGISTER") {
        endpoint = "/api/auth/register";
        body = { ...body, name };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Account not claimed. Please claim your account.") {
          setMode("CLAIM");
          setError("Lütfen şifre belirlemek için hesabınızı doğrulayın.");
        } else if (data.error === "Account already claimed. Please login.") {
          setMode("LOGIN");
          setError("Hesap zaten doğrulanmış. Lütfen giriş yapın.");
        } else {
          const errorMap: Record<string, string> = {
            "User not found": "Kullanıcı bulunamadı",
            "Invalid credentials": "Kullanıcı adı veya şifre hatalı",
            "Internal server error": "Sunucu hatası",
            "Username already exists": "Bu kullanıcı adı zaten alınmış",
            "Missing required fields": "Tüm alanları doldurun",
          };
          setError(errorMap[data.error] || data.error || "Bir hata oluştu");
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
          {mode === "LOGIN"
            ? "Giriş yapmak için bilgilerinizi girin"
            : mode === "CLAIM"
            ? "Hesabınızı doğrulayın ve şifre belirleyin"
            : "Yeni bir organizatör hesabı oluşturun"}
        </CardDescription>
        <div className="flex gap-2 justify-center mt-4 bg-white/5 p-1 rounded-lg">
          <button
            onClick={() => setMode("LOGIN")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === "LOGIN"
                ? "bg-white text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => setMode("REGISTER")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === "REGISTER"
                ? "bg-white text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            Organizatör Ol
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            {mode === "REGISTER" && (
              <div className="flex flex-col space-y-1.5">
                <label
                  className="text-sm font-medium text-white/80"
                  htmlFor="name"
                >
                  Ad Soyad
                </label>
                <Input
                  id="name"
                  placeholder="Adınız Soyadınız"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="flex flex-col space-y-1.5">
              <label
                className="text-sm font-medium text-white/80"
                htmlFor="username"
              >
                Kullanıcı Adı
              </label>
              <Input
                id="username"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5 relative">
              <label
                className="text-sm font-medium text-white/80"
                htmlFor="password"
              >
                {mode === "LOGIN" ? "Şifre" : "Şifre Belirle"}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "LOGIN" ? "Şifre" : "Şifre Belirle"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {mode !== "LOGIN" && (
              <div className="flex flex-col space-y-1.5 relative">
                <label
                  className="text-sm font-medium text-white/80"
                  htmlFor="confirmPassword"
                >
                  Şifreyi Onayla
                </label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifreyi Onayla"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            {error && (
              <p className="text-sm text-red-300 text-center bg-red-900/50 py-1 rounded border border-red-500/20">
                {error}
              </p>
            )}
          </div>
          <Button className="w-full mt-6" type="submit" disabled={loading}>
            {loading
              ? "Yükleniyor..."
              : mode === "LOGIN"
              ? "Giriş Yap"
              : mode === "REGISTER"
              ? "Kayıt Ol"
              : "Hesabı Doğrula"}
          </Button>
          {(mode === "LOGIN" || mode === "CLAIM") && (
            <p className="text-[10px] text-white/40 text-center mt-2">
              {mode === "LOGIN"
                ? "Katılımcı hesabınızı doğrulamak için aşağıya tıklayın."
                : "Şifrenizi belirledikten sonra giriş yapabilirsiniz."}
            </p>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-center flex-col gap-2">
        {mode === "LOGIN" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("CLAIM")}
            className="text-xs text-white/50 hover:text-white"
          >
            Katılımcı hesabını doğrula
          </Button>
        )}
        {mode === "CLAIM" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("LOGIN")}
            className="text-xs text-white/50 hover:text-white"
          >
            Giriş ekranına dön
          </Button>
        )}
        {mode === "REGISTER" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode("LOGIN")}
            className="text-xs text-white/50 hover:text-white"
          >
            Zaten hesabınız var mı? Giriş Yap
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
