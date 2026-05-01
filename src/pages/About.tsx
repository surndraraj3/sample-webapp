import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/contexts/I18nContext";
import { Target, Eye, Sprout } from "lucide-react";

const About = () => {
  const { t } = useI18n();
  return (
    <SiteLayout>
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="container max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold">{t("about.title")}</h1>
          <p className="mt-4 text-primary-foreground/85 text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </section>

      <section className="container py-16 grid gap-8 md:grid-cols-3">
        {[
          { icon: Target, t: t("about.mission.t"), d: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Empower every Indian farmer with smart, affordable irrigation technology." },
          { icon: Eye, t: t("about.vision.t"), d: "Sed do eiusmod tempor incididunt ut labore. To make sustainable water management the standard across rural India." },
          { icon: Sprout, t: t("about.story.t"), d: "Ut enim ad minim veniam, quis nostrud exercitation. Founded in 2018 by engineers and farmers united by one goal: save water, save energy, save nature." },
        ].map((b, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-8 shadow-card transition-smooth hover:shadow-elegant">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-cta text-primary-foreground shadow-soft">
              <b.icon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold">{b.t}</h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">{b.d}</p>
          </div>
        ))}
      </section>

      <section className="container pb-20">
        <div className="rounded-3xl bg-secondary/50 p-10 md:p-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default About;
