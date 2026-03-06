import earbudsImg from "@/assets/products/earbuds.png";
import monitorImg from "@/assets/products/monitor.png";
import keyboardImg from "@/assets/products/keyboard.png";
import mouseImg from "@/assets/products/mouse.png";
import bagImg from "@/assets/products/bag.png";
import powerbankImg from "@/assets/products/powerbank.png";
import standImg from "@/assets/products/stand.png";
import webcamImg from "@/assets/products/webcam.png";
import headphonesImg from "@/assets/products/headphones.png";
import laptopImg from "@/assets/products/laptop.png";
import tvImg from "@/assets/products/tv.png";
import airpodsImg from "@/assets/products/airpods.png";
import airfryerImg from "@/assets/products/airfryer.png";
import scooterImg from "@/assets/products/scooter.png";
import beautyImg from "@/assets/products/beauty.png";
import perfumeImg from "@/assets/products/perfume.png";

// Direct product name → image mapping (highest priority)
const productNameMap: Record<string, string> = {
  "سماعة سامسونج Galaxy Buds Pro": earbudsImg,
  "شاشة LG UltraWide 34 بوصة": monitorImg,
  "كيبورد Logitech MX Keys": keyboardImg,
  "ماوس Logitech MX Master 3S": mouseImg,
  'حقيبة لابتوب Peak Design 15"': bagImg,
  "باور بانك Anker 737 26800mAh": powerbankImg,
  "ستاند مانيتور ErgoTech": standImg,
  "كاميرا ويب Sony INZONE H9": webcamImg,
};

// Keyword-based fallback matching
const nameKeywords: [string, string][] = [
  ["galaxy buds", earbudsImg],
  ["buds pro", earbudsImg],
  ["سماعة سامسونج", earbudsImg],
  ["ultrawide", monitorImg],
  ["شاشة lg", monitorImg],
  ["شاشة", monitorImg],
  ["كيبورد", keyboardImg],
  ["keyboard", keyboardImg],
  ["mx keys", keyboardImg],
  ["ماوس", mouseImg],
  ["mouse", mouseImg],
  ["mx master", mouseImg],
  ["حقيبة", bagImg],
  ["peak design", bagImg],
  ["باور بانك", powerbankImg],
  ["power bank", powerbankImg],
  ["anker", powerbankImg],
  ["ستاند", standImg],
  ["stand", standImg],
  ["ergotech", standImg],
  ["كاميرا ويب", webcamImg],
  ["webcam", webcamImg],
  ["inzone", webcamImg],
  ["sony", webcamImg],
  ["سكوتر", scooterImg],
  ["scooter", scooterImg],
  ["ايرفراير", airfryerImg],
  ["قلاية", airfryerImg],
  ["air fryer", airfryerImg],
  ["بيوتي", beautyImg],
  ["beauty", beautyImg],
  ["كريم", beautyImg],
  ["عناية", beautyImg],
  ["برفيوم", perfumeImg],
  ["عطر", perfumeImg],
  ["perfume", perfumeImg],
  ["ايربودز", airpodsImg],
  ["airpods", airpodsImg],
  ["سماعة لاسلكية", airpodsImg],
  ["سماعة", headphonesImg],
  ["headphone", headphonesImg],
  ["لابتوب", laptopImg],
  ["laptop", laptopImg],
  ["تلفزيون", tvImg],
  ["tv", tvImg],
];

export function getProductImage(productName: string, category: string): string {
  // 1. Exact product name match
  if (productNameMap[productName]) return productNameMap[productName];

  // 2. Keyword match in product name
  const lowerName = productName.toLowerCase();
  for (const [keyword, img] of nameKeywords) {
    if (lowerName.includes(keyword.toLowerCase()) || productName.includes(keyword)) {
      return img;
    }
  }

  // 3. Fallback
  return laptopImg;
}
