import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full py-2 px-3.5 text-[13px] font-bold text-white cursor-pointer transition-all hover:bg-white/25"
    >
      <span className="text-sm">🌐</span>
      <span>{lang === "ar" ? "EN" : "عربي"}</span>
    </button>
  );
}
