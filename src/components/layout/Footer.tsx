import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Linkedin } from "lucide-react";
import { scrollToId } from "@/lib/utils";
import logoSera from "@/assets/logoSera.png";

const navLink =
  "relative text-sm  text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all hover:after:w-full";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logoSera}
                alt="Seramoney"
                className="h-10 w-10 object-contain"
              />
              <span className="font-display text-xl font-bold">
                Sera<span className="text-accent">money</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground max-w-xs">
              Plateforme d’échange de cryptomonnaies via Mobile Money,
              spécialement conçue pour Madagascar.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold lg:text-xl mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToId("features")}
                  className={navLink}
                >
                  Fonctionnalités
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("cryptos")}
                  className={navLink}
                >
                  Cryptomonnaies
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("how-it-works")}
                  className={navLink}
                >
                  Comment ça marche
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 lg:text-xl">
              Contact
            </h4>

            <ul className="space-y-3 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                contact@seramoney.mg
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                +261 32 27 662 45
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                Antananarivo, Madagascar
              </li>
            </ul>

            <div className="flex items-center gap-3">
              <a
                href="https://web.facebook.com/profile.php?id=61579986895690"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>

              <a
                href="https://www.linkedin.com/in/harizo-andrianaivo-a93b75263/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center lg:text-sm text-sm text-muted-foreground">
          © {new Date().getFullYear()} Eclisher ANDRIANAIVO. Tous droits
          réservés.
        </div>
      </div>
    </footer>
  );
}
