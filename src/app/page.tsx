import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.15),_transparent_55%)]" />

      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">AdWinner OS</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost">Connexion</Button>
          </Link>
          <Link href="/register">
            <Button>
              Essayer gratuitement <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </nav>
      </header>

      <main className="container flex flex-1 flex-col items-center justify-center py-24 text-center">
        <div className="animate-fade-in rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted-foreground">
          Le copilote IA des e-commerçants Facebook Ads
        </div>
        <h1 className="mt-6 max-w-3xl animate-slide-up text-4xl font-bold tracking-tight sm:text-6xl">
          Trouvez des produits gagnants.
          <br />
          Battez vos concurrents avec l&apos;IA.
        </h1>
        <p className="mt-6 max-w-xl animate-slide-up text-lg text-muted-foreground">
          AdWinner OS analyse la Meta Ad Library, décode la stratégie de vos concurrents et génère
          de meilleures publicités — pour que vous lanciez plus vite, plus intelligemment.
        </p>
        <div className="mt-10 flex animate-slide-up items-center gap-3">
          <Link href="/register">
            <Button size="lg">
              Créer mon compte <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              J&apos;ai déjà un compte
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
