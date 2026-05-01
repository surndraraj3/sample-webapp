import productMotorRobo from "@/assets/product-motor-robo.jpg";
import productAntiScaling from "@/assets/product-anti-scaling.jpg";
import productSubmersible from "@/assets/product-submersible.jpg";
import productSensor from "@/assets/product-sensor.jpg";

export type Product = {
  id: string;
  name: { en: string; te: string };
  tagline: { en: string; te: string };
  description: { en: string; te: string };
  price: number; // INR
  image: string;
};

export const products: Product[] = [
  {
    id: "smart-motor-robo",
    name: { en: "Smart Water Motor Robo", te: "స్మార్ట్ వాటర్ మోటర్ రోబో" },
    tagline: { en: "Auto on/off with dry-run protection", te: "డ్రై-రన్ రక్షణతో ఆటో ఆన్/ఆఫ్" },
    description: {
      en: "Intelligent controller that switches your motor on when water arrives and off when the tank is full. Saves electricity and protects your motor.",
      te: "నీరు వచ్చినప్పుడు మోటార్‌ను ఆన్ చేసి, ట్యాంక్ నిండినప్పుడు ఆఫ్ చేసే తెలివైన కంట్రోలర్. విద్యుత్ ఆదా చేస్తుంది, మోటార్‌ను రక్షిస్తుంది.",
    },
    price: 4499,
    image: productMotorRobo,
  },
  {
    id: "anti-scaling-unit",
    name: { en: "Anti-Scaling Unit", te: "యాంటీ-స్కేలింగ్ యూనిట్" },
    tagline: { en: "Prevents pipe blockage from hard water", te: "హార్డ్ వాటర్ నుండి పైపుల్లో మురికిని ఆపుతుంది" },
    description: {
      en: "Chemical-free water treatment that stops scale build-up in pipes and motors, extending equipment life.",
      te: "పైపుల్లో మరియు మోటార్లలో స్కేల్ ఏర్పడకుండా ఆపే రసాయన రహిత నీటి శుద్ధి.",
    },
    price: 7999,
    image: productAntiScaling,
  },
  {
    id: "submersible-pump",
    name: { en: "Heavy-Duty Submersible Pump", te: "హెవీ-డ్యూటీ సబ్మెర్సిబుల్ పంప్" },
    tagline: { en: "1.5 HP — built for borewells", te: "1.5 HP — బోర్‌వెల్‌ల కోసం" },
    description: {
      en: "Robust 1.5 HP submersible pump with copper winding, designed for deep borewells and continuous duty.",
      te: "లోతైన బోర్‌వెల్‌లు మరియు నిరంతర పనికి రాగి వైండింగ్‌తో దృఢమైన 1.5 HP సబ్మెర్సిబుల్ పంప్.",
    },
    price: 18999,
    image: productSubmersible,
  },
  {
    id: "smart-sensor",
    name: { en: "Smart Water Level Sensor", te: "స్మార్ట్ వాటర్ లెవల్ సెన్సార్" },
    tagline: { en: "Wireless tank monitoring", te: "వైర్‌లెస్ ట్యాంక్ పర్యవేక్షణ" },
    description: {
      en: "Wireless tank sensor that talks to your controller and your phone, with low-water and overflow alerts.",
      te: "మీ కంట్రోలర్ మరియు ఫోన్‌తో మాట్లాడే వైర్‌లెస్ ట్యాంక్ సెన్సార్, తక్కువ నీరు మరియు ఓవర్‌ఫ్లో హెచ్చరికలతో.",
    },
    price: 2499,
    image: productSensor,
  },
];

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
