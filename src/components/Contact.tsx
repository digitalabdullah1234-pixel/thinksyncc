"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { EASE, lift, nudge } from "@/lib/motion";
import { Reveal } from "./Reveal";

type Status = "idle" | "sending" | "success" | "error";

export function Contact() {
  const { t, dir } = useLanguage();
  const { contact, services } = t;
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    contact: "",
    service: "",
    message: "",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setForm({ name: "", contact: "", service: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="border-t border-hairline py-section">
      <div className="shell">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <Reveal>
              <span className="text-fluid-xs uppercase tracking-[0.18em] text-mint">
                {contact.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display-cut mt-4 font-display text-fluid-h2 text-ink">
                {contact.title}
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-5 max-w-md text-fluid-lg text-muted">
                {contact.intro}
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-12 flex flex-col gap-5 border-t border-hairline pt-10">
                <span className="text-fluid-xs uppercase tracking-wider text-muted">
                  {contact.info.title}
                </span>
                <motion.a
                  href={`mailto:${contact.info.email}`}
                  className="flex items-center gap-3 text-ink transition-colors hover:text-mint"
                  {...nudge(dir)}
                >
                  <Mail size={18} strokeWidth={1.5} className="text-mint" />
                  {contact.info.email}
                </motion.a>
                <motion.a
                  href={`tel:${contact.info.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-3 text-ink transition-colors hover:text-mint"
                  {...nudge(dir)}
                >
                  <Phone size={18} strokeWidth={1.5} className="text-mint" />
                  <span dir="ltr">{contact.info.phone}</span>
                </motion.a>
                <div className="flex items-start gap-3 text-ink">
                  <MapPin
                    size={18}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0 text-mint"
                  />
                  <span>
                    {contact.info.location} · {contact.info.locationValue}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-hairline bg-surface p-7 sm:p-10"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-fluid-xs uppercase tracking-wider text-muted">
                    {contact.form.name}
                  </label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder={contact.form.namePlaceholder}
                    className="rounded-lg border border-hairline bg-bg px-4 py-3 text-fluid-sm text-ink placeholder:text-muted outline-none transition-colors focus:border-mint/50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="contactField" className="text-fluid-xs uppercase tracking-wider text-muted">
                    {contact.form.contact}
                  </label>
                  <input
                    id="contactField"
                    required
                    value={form.contact}
                    onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                    placeholder={contact.form.contactPlaceholder}
                    className="rounded-lg border border-hairline bg-bg px-4 py-3 text-fluid-sm text-ink placeholder:text-muted outline-none transition-colors focus:border-mint/50"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <label htmlFor="service" className="text-fluid-xs uppercase tracking-wider text-muted">
                  {contact.form.service}
                </label>
                <select
                  id="service"
                  value={form.service}
                  onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                  className="rounded-lg border border-hairline bg-bg px-4 py-3 text-fluid-sm text-ink outline-none transition-colors focus:border-mint/50"
                >
                  <option value="">{contact.form.servicePlaceholder}</option>
                  {services.items.map((item) => (
                    <option key={item.title} value={item.title}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <label htmlFor="message" className="text-fluid-xs uppercase tracking-wider text-muted">
                  {contact.form.message}
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder={contact.form.messagePlaceholder}
                  className="resize-none rounded-lg border border-hairline bg-bg px-4 py-3 text-fluid-sm text-ink placeholder:text-muted outline-none transition-colors focus:border-mint/50"
                />
              </div>

              <motion.button
                type="submit"
                disabled={status === "sending"}
                className="mt-8 w-full rounded-full bg-mint px-8 py-3.5 text-fluid-sm font-medium text-white transition-colors duration-200 hover:bg-emerald disabled:opacity-60 sm:w-auto"
                {...lift}
              >
                {status === "sending" ? contact.form.sending : contact.form.submit}
              </motion.button>

              {status === "success" && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="mt-5 text-fluid-sm text-mint"
                >
                  {contact.form.success}
                </motion.p>
              )}
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="mt-5 text-fluid-sm text-red-600"
                >
                  {contact.form.error}
                </motion.p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
