import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Users,
  ArrowRight,
  Smartphone,
  CheckCircle2,
  Wallet,
  Send,
  BadgeCheck,
} from "lucide-react";
import { scrollToId } from "@/lib/utils";

const features = [
  {
    icon: Shield,
    title: "Sécurisé",
    description:
      "Transactions vérifiées manuellement par notre équipe pour une sécurité maximale.",
  },
  {
    icon: Zap,
    title: "Rapide",
    description:
      "Traitement des demandes en quelques heures pendant les heures ouvrables.",
  },
  {
    icon: Smartphone,
    title: "Mobile Money",
    description:
      "Utilisez MVola ou Orange Money pour acheter et vendre vos cryptos.",
  },
  {
    icon: Users,
    title: "Support humain",
    description: "Une équipe dédiée à Madagascar pour vous accompagner.",
  },
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
    description: "Inscrivez-vous avec votre numéro Mobile Money",
  },
  {
    icon: Wallet,
    title: "Faites votre demande",
    description: "Choisissez d'acheter ou vendre des cryptos",
  },
  {
    icon: Send,
    title: "Effectuez le transfert",
    description: "Envoyez le paiement Mobile Money ou les cryptos",
  },
  {
    icon: BadgeCheck,
    title: "Recevez vos fonds",
    description: "Validation manuelle et envoi sous 24h",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="relative overflow-hidden h-[85vh] sm:h-[90vh] lg:h-[95vh]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div
          className="
    absolute inset-0
    bg-gradient-to-b from-transparent to-white/30 dark:to-gray-900/95 
    backdrop-blur-[3px]
  "
        />
        <div
          className="
            absolute inset-0  
            bg-gradient-to-b
            from-white/10
            via-white/30
            to-black/55
            sm:from-white/15 sm:via-white/35 sm:to-black/60
            dark:from-black/70 dark:via-black/40 dark:to-black/90
            backdrop-blur-[3px]
          "
        />
        <div className="relative z-10 container py-20 py-24 sm:py-28 md:py-32 lg:py-36">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium backdrop-blur">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              Plateforme d'échange crypto à Madagascar
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-xl  lg:text-7xl text-gray-950  dark:text-gray-300 font-bold leading-tight">
              Achetez et vendez vos{" "}
              <span className="text-accent">cryptomonnaies</span> via Mobile
              Money
            </h1>

            <h3 className="text-lg sm:text-xs md:text-xl text-neutral-900/80   max-w-2xl mx-auto dark:text-gray-400">
              Échangez USDT, Bitcoin, Tron et Litecoin facilement avec MVola ou
              Orange Money. Transactions sécurisées et validées par notre
              équipe.
            </h3>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center justify-center gap-4">
              <Button size="xl" variant="hero" asChild>
                <Link to="/register">
                  Faire un échange
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" onClick={() => scrollToId("how-it-works")} variant="hero-outline" asChild>
                <Link to="">Comment ça marche ?</Link>
                </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent " />
                <span className="text-gray-300">Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span className="text-gray-300">Sans frais cachés</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span className="text-gray-300">Support 7j/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-24 bg-card overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-accent/10 blur-3xl rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-primary/10 blur-3xl rounded-full" />
        </div>
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Pourquoi choisir <span className="text-accent">Seramoney</span> ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto lg:text-lg">
              Une plateforme simple, fiable et adaptée au marché malgache pour
              acheter et vendre vos cryptomonnaies en toute confiance.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute -top-2 -right-2 h-full w-full rounded-2xl bg-accent/5 -z-10 rotate-1" />
                <div className="absolute -bottom-2 -left-2 h-full w-full rounded-2xl bg-primary/5 -z-20 -rotate-1" />
                <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="cryptos"
        className="relative py-24 bg-background overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/4 h-64 w-64 bg-accent/10 blur-3xl rounded-full" />
          <div className="absolute bottom-1/3 right-1/4 h-64 w-64 bg-primary/10 blur-3xl rounded-full" />
        </div>

        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Cryptomonnaies disponibles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto lg:text-lg">
              Échangez les cryptos les plus populaires en toute simplicité, avec
              des taux basés sur la plateforme leader mondiale.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {cryptos.map((crypto) => (
              <CryptoIcon
                key={crypto.crypto}
                symbol={crypto.crypto}
                size="lg"
              />
            ))}
          </div>
          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Propulsé par</span>
            <span className="font-semibold text-foreground">Binance</span>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative py-24 bg-card overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/4 h-72 w-72 bg-accent/10 blur-3xl rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-primary/10 blur-3xl rounded-full" />
        </div>

        <div className="container">
          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto lg:text-lg">
              Un processus simple, clair et sécurisé, entièrement validé par
              notre équipe.
            </p>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Card */}
                <div className="group relative h-full rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                      {index + 1}
                    </div>
                    <step.icon className="h-6 w-6 text-accent" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Animated arrow (desktop only) */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 + 0.2 }}
                    className="hidden lg:flex absolute top-1/2 -right-6 -translate-y-1/2 items-center"
                  >
                    <ArrowRight className="h-6 w-6 text-accent animate-pulse" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <Button size="xl" variant="hero" asChild>
              <Link to="/register">
                Commencer maintenant
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-20 gradient-primary text-primary-foreground">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-3xl lg:text-4xl md:text-4xl font-bold dark:text-gray-100">
              Prêt à échanger vos cryptos ?
            </h2>
            <p className="text-primary-foreground/80 lg:text-base dark:text-yellow-400">
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
