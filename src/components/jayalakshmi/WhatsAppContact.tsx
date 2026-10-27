import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { siteConfig, whatsappLink } from "@/config/site";

export function WhatsAppContact() {
  const link = whatsappLink();
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-accent p-8 shadow-card">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><MessageCircle className="h-7 w-7" /></span>
        <h3 className="mt-6 text-3xl text-foreground">Let's Chat on WhatsApp</h3>
        <p className="mt-2 text-muted-foreground">Get quick answers about plants, availability, and gardening ideas.</p>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="btn-primary mt-7">Chat on WhatsApp</a>
        ) : (
          <>
            <button disabled className="btn-primary mt-7">Chat on WhatsApp</button>
            <p className="mt-3 text-xs text-muted-foreground">WhatsApp chat will be available once our business number is added.</p>
          </>
        )}
      </div>
      <ul className="space-y-4 rounded-3xl border border-border bg-card p-7">
        <Info icon={Mail} label="Email" value={siteConfig.email} />
        <Info icon={Clock} label="Opening hours" value={siteConfig.hours} />
        <Info icon={MapPin} label="Visit us" value={siteConfig.location} />
      </ul>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 h-5 w-5 text-sage" />
      <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-foreground">{value || <span className="italic text-muted-foreground">Coming soon</span>}</p></div>
    </li>
  );
}
