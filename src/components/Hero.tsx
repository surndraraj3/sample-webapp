import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import hero1 from "@/assets/hero-farmer-1.jpg";
import hero2 from "@/assets/hero-farmer-2.jpg";
import hero3 from "@/assets/hero-farmer-3.jpg";
import { ArrowRight, Zap, ShieldCheck, Wrench, Languages } from "lucide-react";

const slides = [
  { img: hero1, alt: "Indian farmer holding a smart water motor controller in a paddy field at sunset" },
  { img: hero2, alt: "Indian farmer with irrigation pump motor in a sugarcane field" },
  { img: hero3, alt: "Two Indian farmers installing a blue water motor pump near a borewell" },
];

export const HeroCarousel = () => {
  const { t } = useI18n();
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
    const id = setInterval(() => embla.scrollNext(), 5000);
    return () => { clearInterval(id); embla.off("select", onSelect); };
  }, [embla]);

  return (
    <section className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s, i) => (
            <div className="relative min-w-0 flex-[0_0_100%]" key={i}>
              <div className="relative h-[70vh] min-h-[520px] w-full">
                <img
                  src={s.img}
                  alt={s.alt}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  width={1920}
                  height={1080}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-deep/85 via-primary-deep/55 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container">
                    <div className="max-w-2xl text-primary-foreground animate-fade-up">
                      <span className="inline-flex items-center gap-2 rounded-full bg-accent/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
                        🌱 {t("hero.tag")}
                      </span>
                      <h1 className="mt-5 text-4xl font-bold leading-tight text-balance md:text-6xl">
                        {t("hero.title")}
                      </h1>
                      <p className="mt-5 text-lg text-primary-foreground/90 md:text-xl max-w-xl">
                        {t("hero.sub")}
                      </p>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-elegant">
                          <Link to="/products">
                            {t("hero.cta")} <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="bg-background/10 backdrop-blur border-primary-foreground/40 text-primary-foreground hover:bg-background/20 hover:text-primary-foreground">
                          <Link to="/about">{t("hero.cta2")}</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => embla?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-smooth ${selected === i ? "w-10 bg-accent" : "w-2 bg-primary-foreground/60"}`}
          />
        ))}
      </div>
    </section>
  );
};

export const FeatureStrip = () => {
  const { t } = useI18n();
  const items = [
    { icon: Zap, t: t("feat.1.t"), d: t("feat.1.d") },
    { icon: ShieldCheck, t: t("feat.2.t"), d: t("feat.2.d") },
    { icon: Wrench, t: t("feat.3.t"), d: t("feat.3.d") },
    { icon: Languages, t: t("feat.4.t"), d: t("feat.4.d") },
  ];
  return (
    <section className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">{t("feat.title")}</h2>
        <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-gradient-cta" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <div key={i} className="group rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-smooth hover:shadow-elegant hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cta text-primary-foreground shadow-soft">
              <it.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">{it.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
