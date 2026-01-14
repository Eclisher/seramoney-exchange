import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CryptoCard } from "@/components/crypto/CryptoIcon";
import { 
  Shield, 
  Zap, 
  Users, 
  ArrowRight, 
  Smartphone,
  CheckCircle2,
  Wallet,
  Send,
  Clock,
  BadgeCheck
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Transactions vérifiées manuellement par notre équipe pour une sécurité maximale."
  },
  {
    icon: Zap,
    title: "Rapide",
    description: "Traitement des demandes en quelques heures pendant les heures ouvrables."
  },
  {
    icon: Smartphone,
    title: "Mobile Money",
    description: "Utilisez MVola ou Orange Money pour acheter et vendre vos cryptos."
  },
  {
    icon: Users,
    title: "Support humain",
    description: "Une équipe dédiée à Madagascar pour vous accompagner."
  }
];

const cryptos = [
  { crypto: "USDT" as const, name: "Tether", network: "TRC20 / BEP20" },
  { crypto: "BTC" as const, name: "Bitcoin", network: "BTC Network" },
  { crypto: "TRX" as const, name: "Tron", network: "TRC20" },
  { crypto: "LTC" as const, name: "Litecoin", network: "LTC Network" },
];

const steps = [
  {
    icon: Users,
    title: "Créez votre compte",
    description: "Inscrivez-vous avec votre numéro Mobile Money"
  },
  {
    icon: Wallet,
    title: "Faites votre demande",
    description: "Choisissez d'acheter ou vendre des cryptos"
  },
  {
    icon: Send,
    title: "Effectuez le transfert",
    description: "Envoyez le paiement Mobile Money ou les cryptos"
  },
  {
    icon: BadgeCheck,
    title: "Recevez vos fonds",
    description: "Validation manuelle et envoi sous 24h"
  }
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="relative  overflow-hidden gradient-hero ">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              Plateforme d'échange crypto à Madagascar
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
              Achetez et vendez vos{" "}
              <span className="text-accent">cryptomonnaies</span> via Mobile
              Money
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Échangez USDT, Bitcoin, Tron et Litecoin facilement avec MVola ou
              Orange Money. Transactions sécurisées et validées par notre
              équipe.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" variant="hero" asChild>
                <Link to="/register">
                  Faire un échange
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="hero-outline" asChild>
                <Link to="#how-it-works">Comment ça marche</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Sans frais cachés</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Support 7j/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Pourquoi choisir <span className="text-accent">Seramoney</span> ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une solution simple et sécurisée pour échanger vos cryptomonnaies
              à Madagascar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-background border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cryptos Section */}
      <section id="cryptos" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Cryptomonnaies disponibles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Échangez les cryptos les plus populaires via Binance, la première
              plateforme mondiale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {cryptos.map((crypto, index) => (
              <CryptoCard key={index} {...crypto} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <span>Propulsé par</span>
              <span className="font-semibold text-foreground">Binance</span>
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Quatre étapes simples pour échanger vos cryptomonnaies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="p-6 rounded-2xl bg-background border border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                      {index + 1}
                    </div>
                    <step.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="xl" variant="hero" asChild>
              <Link to="/register">
                Commencer maintenant
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary text-primary-foreground">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Prêt à échanger vos cryptos ?
            </h2>
            <p className="text-primary-foreground/80">
              Rejoignez des centaines d'utilisateurs à Madagascar qui font
              confiance à Seramoney Exchange.
            </p>
            <Button size="xl" variant="accent" asChild>
              <Link to="/register">
                Créer un compte gratuit
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
