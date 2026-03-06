import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

export default function Auth() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg font-bold text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message === "Invalid login credentials" ? "بيانات الدخول غير صحيحة" : error.message);
      }
    } else {
      if (!fullName.trim()) {
        toast.error("يرجى إدخال الاسم الكامل");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتفعيل الحساب");
        setMode("login");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-store-md">
            🛍️
          </div>
          <h1 className="text-2xl font-black text-foreground">StoreOS</h1>
          <p className="text-muted-foreground text-sm mt-1">نظام إدارة المتجر</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-store-md">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  mode === m
                    ? "bg-primary text-primary-foreground shadow-store"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5 font-bold">الاسم الكامل</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-foreground text-sm transition-colors focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                  placeholder="أحمد محمد"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5 font-bold">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-foreground text-sm transition-colors focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                placeholder="admin@storeos.ae"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5 font-bold">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-xl py-3 px-4 text-foreground text-sm transition-colors focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                placeholder="••••••••"
                dir="ltr"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl py-3.5 text-sm font-bold cursor-pointer transition-all hover:-translate-y-0.5 shadow-store-md disabled:opacity-60"
            >
              {submitting
                ? "جاري المعالجة..."
                : mode === "login"
                ? "تسجيل الدخول"
                : "إنشاء حساب جديد"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-5">
            المتجر متاح للجميع بدون تسجيل دخول
            <br />
            <span className="text-primary font-bold">تسجيل الدخول مطلوب للإدارة والمناديب فقط</span>
          </p>
        </div>
      </div>
    </div>
  );
}
