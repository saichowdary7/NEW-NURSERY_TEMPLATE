import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import { enquiryTypes, siteConfig, whatsappLink, type EnquiryType } from "@/config/site";

export type EnquiryPrefill = { topic: EnquiryType; message: string; key: number };
type Errors = Partial<Record<"name" | "email" | "phone" | "message", string>>;

// No backend is connected yet. Submitting hands the enquiry to WhatsApp or email
// (whichever is configured). Replace `deliverEnquiry` with a FastAPI POST later.
function deliverEnquiry(d: { name: string; email: string; phone: string; topic: string; message: string }) {
  const text = `Hello Taraka Jayalakshmi Nursery!\n\nName: ${d.name}\nEmail: ${d.email}${d.phone ? `\nPhone: ${d.phone}` : ""}\nEnquiry: ${d.topic}\n\n${d.message}`;
  const wa = whatsappLink(text);
  if (wa) { window.open(wa, "_blank", "noopener"); return "whatsapp" as const; }
  if (siteConfig.email) {
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(`Enquiry: ${d.topic}`)}&body=${encodeURIComponent(text)}`;
    return "email" as const;
  }
  return null;
}

export function ContactForm({ prefill }: { prefill: EnquiryPrefill | null }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "Plant Availability" as string, message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<null | "whatsapp" | "email" | "unavailable">(null);

  useEffect(() => {
    if (prefill) { setForm((f) => ({ ...f, topic: prefill.topic, message: prefill.message || f.message })); setResult(null); }
  }, [prefill]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (form.name.trim().length < 2) er.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = "Please enter a valid email address.";
    if (form.phone && !/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) er.phone = "Please enter a valid phone number.";
    if (form.message.trim().length < 10) er.message = "Please tell us a little more (at least 10 characters).";
    setErrors(er);
    if (Object.keys(er).length) return;
    setResult(deliverEnquiry({ ...form, name: form.name.trim(), email: form.email.trim() }) ?? "unavailable");
  };

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" error={errors.name}><input className="field" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} autoComplete="name" maxLength={100} /></Field>
        <Field label="Email" error={errors.email}><input type="email" className="field" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} autoComplete="email" maxLength={255} /></Field>
        <Field label="Phone Number (optional)" error={errors.phone}><input type="tel" className="field" value={form.phone} onChange={set("phone")} aria-invalid={!!errors.phone} autoComplete="tel" maxLength={20} /></Field>
        <Field label="Enquiry Type">
          <select className="field" value={form.topic} onChange={set("topic")}>{enquiryTypes.map((t) => <option key={t}>{t}</option>)}</select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Message" error={errors.message}><textarea rows={5} className="field resize-none" value={form.message} onChange={set("message")} aria-invalid={!!errors.message} maxLength={1000} /></Field>
        </div>
      </div>
      <button type="submit" className="btn-primary mt-7 w-full sm:w-auto"><Send className="h-4 w-4" /> Send Enquiry</button>
      <div aria-live="polite">
        {result === "whatsapp" && <Msg ok>We've opened WhatsApp with your enquiry ready — just tap send to reach us.</Msg>}
        {result === "email" && <Msg ok>Your email app should open with the enquiry ready — just press send.</Msg>}
        {result === "unavailable" && <Msg>Online enquiries aren't connected yet, so your message hasn't been sent. Please check back soon.</Msg>}
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function Msg({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <p className={`mt-5 flex gap-2 rounded-xl border p-3 text-sm ${ok ? "border-sage bg-accent text-primary" : "border-destructive/30 bg-secondary text-foreground"}`}>
      {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}{children}
    </p>
  );
}
