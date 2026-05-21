import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "te";

type Dict = Record<string, { en: string; te: string }>;

const dict: Dict = {
  "nav.home": { en: "Home", te: "హోమ్" },
  "nav.products": { en: "Products", te: "ఉత్పత్తులు" },
  "nav.about": { en: "About", te: "మా గురించి" },
  "nav.dealer": { en: "Dealer", te: "డీలర్" },
  "nav.admin": { en: "Admin", te: "అడ్మిన్" },
  "nav.cart": { en: "Cart", te: "కార్ట్" },
  "nav.login": { en: "Login", te: "లాగిన్" },
  "nav.profile": { en: "Profile", te: "ప్రొఫైల్" },
  "nav.logout": { en: "Logout", te: "లాగ్అవుట్" },
  "nav.orders": { en: "Orders", te: "ఆర్డర్లు" },

  "hero.tag": { en: "Save Nature For Future", te: "భవిష్యత్తు కోసం ప్రకృతిని కాపాడండి" },
  "hero.title": { en: "Smart Water Motors Built for Indian Farmers", te: "భారత రైతుల కోసం రూపొందించిన స్మార్ట్ వాటర్ మోటర్లు" },
  "hero.sub": { en: "Save electricity, protect your motor, and grow more with MSI Innovations.", te: "విద్యుత్ ఆదా చేయండి, మీ మోటార్‌ను రక్షించండి, MSI Innovations తో మరింత పండించండి." },
  "hero.cta": { en: "Shop Products", te: "ఉత్పత్తులను చూడండి" },
  "hero.cta2": { en: "Learn More", te: "మరింత తెలుసుకోండి" },

  "feat.title": { en: "Why farmers choose MSI", te: "రైతులు MSI ని ఎందుకు ఎంచుకుంటారు" },
  "feat.1.t": { en: "Saves Electricity", te: "విద్యుత్ ఆదా" },
  "feat.1.d": { en: "Auto cut-off when tank is full.", te: "ట్యాంక్ నిండగానే ఆటో కట్-ఆఫ్." },
  "feat.2.t": { en: "Protects Motor", te: "మోటార్ రక్షణ" },
  "feat.2.d": { en: "Dry-run & voltage protection.", te: "డ్రై-రన్ మరియు వోల్టేజ్ రక్షణ." },
  "feat.3.t": { en: "Easy Install", te: "సులభ ఇన్‌స్టాల్" },
  "feat.3.d": { en: "Plug & play with any motor.", te: "ఏ మోటార్‌తోనైనా ప్లగ్ & ప్లే." },
  "feat.4.t": { en: "Telugu Support", te: "తెలుగు మద్దతు" },
  "feat.4.d": { en: "Manuals and support in Telugu.", te: "తెలుగులో మాన్యువల్స్ మరియు మద్దతు." },

  "products.title": { en: "Our Products", te: "మా ఉత్పత్తులు" },
  "products.sub": { en: "Designed in India, for Indian farms.", te: "భారత పొలాల కోసం, భారత్‌లో రూపొందించబడింది." },
  "products.add": { en: "Add to Cart", te: "కార్ట్‌కు జోడించండి" },
  "products.added": { en: "Added", te: "జోడించబడింది" },

  "cart.title": { en: "Your Cart", te: "మీ కార్ట్" },
  "cart.empty": { en: "Your cart is empty.", te: "మీ కార్ట్ ఖాళీగా ఉంది." },
  "cart.continue": { en: "Continue Shopping", te: "షాపింగ్ కొనసాగించండి" },
  "cart.subtotal": { en: "Subtotal", te: "మొత్తం" },
  "cart.checkout": { en: "Pay Now", te: "ఇప్పుడు చెల్లించండి" },
  "cart.qty": { en: "Qty", te: "పరిమాణం" },
  "cart.remove": { en: "Remove", te: "తొలగించు" },

  "auth.title": { en: "Login with Mobile", te: "మొబైల్‌తో లాగిన్ చేయండి" },
  "auth.sub": { en: "We'll send a one-time code to your mobile.", te: "మేము మీ మొబైల్‌కు ఒక-సారి కోడ్ పంపుతాము." },
  "auth.mobile": { en: "Mobile Number", te: "మొబైల్ నంబర్" },
  "auth.send": { en: "Send OTP", te: "OTP పంపండి" },
  "auth.otp": { en: "Enter OTP", te: "OTP నమోదు చేయండి" },
  "auth.verify": { en: "Verify & Continue", te: "ధృవీకరించి కొనసాగించండి" },
  "auth.back": { en: "Back", te: "వెనక్కు" },

  "about.title": { en: "About MSI Innovations", te: "MSI ఇన్నోవేషన్స్ గురించి" },
  "about.mission.t": { en: "Our Mission", te: "మా లక్ష్యం" },
  "about.vision.t": { en: "Our Vision", te: "మా దృష్టి" },
  "about.story.t": { en: "Our Story", te: "మా కథ" },

  "footer.tag": { en: "Save Nature For Future", te: "భవిష్యత్తు కోసం ప్రకృతిని కాపాడండి" },
  "footer.rights": { en: "All rights reserved.", te: "అన్ని హక్కులు ప్రత్యేకించబడ్డాయి." },

  "profile.title": { en: "My Profile", te: "నా ప్రొఫైల్" },
  "profile.mobile": { en: "Mobile", te: "మొబైల్" },
  "profile.orders": { en: "Order History", te: "ఆర్డర్ చరిత్ర" },
  "profile.no_orders": { en: "No orders yet.", te: "ఇంకా ఆర్డర్లు లేవు." },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nContext = createContext<Ctx | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("msi.lang") as Lang) || "en");
  useEffect(() => { localStorage.setItem("msi.lang", lang); }, [lang]);
  const setLang = (l: Lang) => setLangState(l);
  const t = (k: string) => dict[k]?.[lang] ?? k;
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n must be used inside I18nProvider");
  return c;
};
