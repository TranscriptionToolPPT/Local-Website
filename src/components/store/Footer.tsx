import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t, dir } = useLanguage();

  const quickLinks = [t.footerLinkStore, t.footerLinkTrack, t.footerLinkReturn, t.footerLinkFaq];
  const categoryLinks = dir === "rtl"
    ? ["سكوترات", "ايرفراير", "لابتوب", "سماعات", "عطور", "بيوتي", "تلفزيونات"]
    : ["Scooters", "Air Fryers", "Laptops", "Headphones", "Perfumes", "Beauty", "TVs"];

  return (
    <footer className="mt-16 rounded-t-3xl overflow-hidden" style={{
      background: 'linear-gradient(135deg, hsl(162 50% 22%) 0%, hsl(162 45% 28%) 100%)'
    }} dir={dir}>
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center text-lg">🛍️</div>
              <div>
                <div className="text-base font-black text-white leading-none">StoreOS</div>
                <div className="text-[10px] font-bold text-white/60">UAE</div>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">{t.footerDesc}</p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">{t.quickLinks}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l}><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">{t.categories}</h4>
            <ul className="space-y-2.5">
              {categoryLinks.map((l) => (
                <li key={l}><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">{t.contactUs}</h4>
            <ul className="space-y-3">
              {[
                { icon: "📍", text: dir === "rtl" ? "دبي، الإمارات العربية المتحدة" : "Dubai, United Arab Emirates" },
                { icon: "📞", text: "+971 50 123 4567" },
                { icon: "✉️", text: "support@storeos.ae" },
                { icon: "🕐", text: t.footerWorkHours },
              ].map((c, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-white/50">
                  <span>{c.icon}</span><span>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center py-6 border-t border-white/10 mb-6">
          {[
            { icon: "🚚", text: t.freeShipping },
            { icon: "💵", text: t.codPayment },
            { icon: "↩️", text: t.returnPolicy },
            { icon: "🔒", text: t.secureTransactions },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/10 rounded-full px-5 py-2 border border-white/10">
              <span className="text-base">{b.icon}</span>
              <span className="text-xs font-bold text-white/70">{b.text}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} StoreOS UAE. {t.allRightsReserved} 🇦🇪</p>
        </div>
      </div>
    </footer>
  );
}
