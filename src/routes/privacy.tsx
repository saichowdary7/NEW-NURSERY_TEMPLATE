import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/jayalakshmi/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Taraka Jayalakshmi Nursery" },
      { name: "description", content: "How Taraka Jayalakshmi Nursery handles the information you share when you enquire about plants and services." },
      { property: "og:title", content: "Privacy Policy — Taraka Jayalakshmi Nursery" },
      { property: "og:description", content: "How Taraka Jayalakshmi Nursery handles your enquiry information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage title="Privacy Policy">
      <p>We only use the details you share with us (such as your name, email and message) to respond to your enquiry.</p>
      <p>The AR preview uses your device camera only after you choose to start it, and the camera feed stays on your device.</p>
    </LegalPage>
  ),
});
