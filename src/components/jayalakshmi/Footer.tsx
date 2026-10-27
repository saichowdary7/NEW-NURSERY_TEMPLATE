import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { siteConfig, whatsappLink } from "@/config/site";
import { LeafMark, Logo } from "./motion";
import { navItems, scrollToId } from "./Navbar";
import { services } from "./ServicesSection";

export function Footer() {
  const wa = whatsappLink();
  const socials = [
    { k: "instagram", i: Instagram, href: siteConfig.social.instagram },
    { k: "facebook", i: Facebook, href: siteConfig.social.facebook },
  ].filter((s) => s.href);

  return (
    <footer className="relative overflow-hidden border-t border-border bg-secondary pt-20">
      <LeafMark className="pointer-events-none absolute -left-8 bottom-6 h-40 w-40 rotate-12 text-olive" />
      <LeafMark className="pointer-events-none absolute -right-10 top-6 h-48 w-48 -rotate-45 text-olive" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8">
        <div>
          <Logo />
          <p className="mt-2 font-serif text-lg italic text-primary">{siteConfig.tagline}</p>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">Carefully selected plants and honest guidance for greener homes, offices and gardens.</p>
        </div>
        <FooterCol title="Explore">
          {navItems.map((n) => <li key={n.id}><button onClick={() => scrollToId(n.id)} className="link-underline">{n.label}</button></li>)}
        </FooterCol>
        <FooterCol title="Services">
          {services.map((s) => <li key={s.title}><button onClick={() => scrollToId("services")} className="link-underline">{s.title}</button></li>)}
        </FooterCol>
        <FooterCol title="Connect">
          <li>{wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</a> : <button onClick={() => scrollToId("contact")} className="link-underline">Contact us</button>}</li>
          {socials.map(({ k, i: Icon, href }) => <li key={k}><a href={href} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-2 capitalize"><Icon className="h-4 w-4" />{k}</a></li>)}
        </FooterCol>
      </div>
      <div className="relative mx-auto mt-16 flex max-w-7xl flex-col gap-3 border-t border-border px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between md:px-8">
        <p>© {new Date().getFullYear()} Taraka Jayalakshmi Nursery. All rights reserved.</p>
        <div className="flex gap-5"><a href="/privacy" className="link-underline">Privacy Policy</a><a href="/terms" className="link-underline">Terms</a></div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h4 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-primary">{title}</h4><ul className="mt-5 space-y-3 text-sm text-foreground/80">{children}</ul></div>;
}
