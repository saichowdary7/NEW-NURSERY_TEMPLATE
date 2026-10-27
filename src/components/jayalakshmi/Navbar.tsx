import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, MessageCircle } from "lucide-react";
import { Logo } from "./motion";

export const navItems = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "plants", label: "Plants" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navbar() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onFilm, setOnFilm] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      // Stay transparent while the hero film fills the screen.
      setOnFilm(window.scrollY < window.innerHeight * 0.35);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    navItems.forEach((n) => { const el = document.getElementById(n.id); if (el) obs.observe(el); });
    return () => { window.removeEventListener("scroll", onScroll); obs.disconnect(); };
  }, []);

  const go = (id: string) => { setOpen(false); scrollToId(id); };
  const clear = onFilm && !open;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${clear ? "border-transparent bg-transparent" : scrolled ? "border-border/70 bg-background/90 backdrop-blur-md" : "border-border/70 bg-background/95"}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8" aria-label="Main">
        <button onClick={() => go("home")} aria-label="Taraka Jayalakshmi Nursery home"><Logo className={clear ? "film-text [&>span:last-child]:text-film-ink" : ""} /></button>
        <ul className="hidden items-center gap-9 md:flex">
          {navItems.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => go(n.id)}
                data-active={active === n.id}
                className={`link-underline text-sm transition-colors ${clear ? "film-text text-film-ink/90 after:bg-film-ink hover:text-film-ink" : active === n.id ? "text-primary" : "text-foreground/70 hover:text-primary"}`}
              >
                {n.label}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={() => go("contact")} className="btn-primary hidden min-h-11! md:inline-flex">
          <MessageCircle className="h-4 w-4" /> Talk to us
        </button>
        <button className={`grid h-11 w-11 place-items-center rounded-full md:hidden ${clear ? "text-film-ink" : "text-primary"}`} onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={open ? "x" : "m"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-md md:hidden">
            <ul className="flex flex-col px-5 py-4">
              {navItems.map((n, i) => (
                <motion.li key={n.id} initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <button onClick={() => go(n.id)} className={`w-full py-3 text-left font-serif text-2xl ${active === n.id ? "text-primary" : "text-foreground/80"}`}>{n.label}</button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
