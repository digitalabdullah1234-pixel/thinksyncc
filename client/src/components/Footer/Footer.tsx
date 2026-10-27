"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { nudge } from "@/lib/motion";
import { Logo } from "../Logo/Logo";

export function Footer() {
  const { t, dir } = useLanguage();
  const { footer, nav, services } = t;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night text-night-ink">
      <div className="shell py-block">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="white" className="h-[clamp(1.75rem,2.2vw,2.25rem)] w-auto" />
            <p className="mt-5 max-w-xs text-fluid-sm text-night-muted">
              {footer.tagline}
            </p>
          </div>

          <div>
            <span className="text-fluid-xs uppercase tracking-wider text-night-mint">
              {footer.servicesHeading}
            </span>
            <ul className="mt-5 flex flex-col gap-3">
              {services.items.map((item) => (
                <li key={item.title}>
                  <motion.a
                    href="#services"
                    className="inline-block text-fluid-sm text-night-muted transition-colors hover:text-night-mint"
                    {...nudge(dir, 3)}
                  >
                    {item.title}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-fluid-xs uppercase tracking-wider text-night-mint">
              {footer.companyHeading}
            </span>
            <ul className="mt-5 flex flex-col gap-3">
              {[
                { href: "#projects", label: nav.projects },
                { href: "#process", label: nav.process },
                { href: "#contact", label: nav.contact },
              ].map((item) => (
                <li key={item.href}>
                  <motion.a
                    href={item.href}
                    className="inline-block text-fluid-sm text-night-muted transition-colors hover:text-night-mint"
                    {...nudge(dir, 3)}
                  >
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-fluid-xs uppercase tracking-wider text-night-mint">
              {footer.contactHeading}
            </span>
            <ul className="mt-5 flex flex-col gap-3 text-fluid-sm text-night-muted">
              <li>{t.contact.info.email}</li>
              <li dir="ltr" className="text-start">
                {t.contact.info.phone}
              </li>
              <li>{t.contact.info.locationValue}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-night-hairline pt-8 sm:flex-row sm:items-center">
          <span className="text-fluid-xs text-night-muted">{footer.vision}</span>
          <span className="text-fluid-xs text-night-muted">
            © {year} ThinkSync. {footer.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}