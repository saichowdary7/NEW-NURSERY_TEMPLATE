// Site configuration — replace placeholder values with real business details.
// WhatsApp number: set VITE_WHATSAPP_NUMBER (digits only, with country code, e.g. 919876543210).
export const siteConfig = {
  name: "Taraka Jayalakshmi Nursery",
  tagline: "Plants Bring Life",
  whatsappNumber: (import.meta.env["VITE_WHATSAPP_NUMBER"] as string | undefined)?.replace(/\D/g, "") ?? "",
  // PLACEHOLDERS — leave empty until real details are supplied.
  email: "",
  hours: "",
  location: "",
  social: {
    instagram: "",
    facebook: "",
    pinterest: "",
  },
  defaultWhatsAppMessage: "Hello Taraka Jayalakshmi Nursery! I'm interested in your plants and would like some guidance.",
};

export function whatsappLink(message = siteConfig.defaultWhatsAppMessage) {
  if (!siteConfig.whatsappNumber) return null;
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const enquiryTypes = [
  "Plant Availability",
  "Plant Care Advice",
  "Home Gardening",
  "Office Plants",
  "Landscape Design",
  "AR / Plant Preview Support",
  "Other",
] as const;
export type EnquiryType = (typeof enquiryTypes)[number];
