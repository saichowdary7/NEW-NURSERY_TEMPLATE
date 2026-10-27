import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./motion";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-5 py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <Link to="/"><Logo /></Link>
        <h1 className="mt-12 text-5xl text-foreground">{title}</h1>
        <p className="mt-3 text-sm italic text-muted-foreground">Placeholder text — replace with your reviewed policy before launch.</p>
        <div className="mt-8 space-y-4 leading-relaxed text-foreground/80">{children}</div>
        <Link to="/" className="btn-outline mt-12"><ArrowLeft className="h-4 w-4" /> Back to Taraka Jayalakshmi Nursery</Link>
      </div>
    </div>
  );
}
