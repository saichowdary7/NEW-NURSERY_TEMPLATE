import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/jayalakshmi/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Taraka Jayalakshmi Nursery" },
      { name: "description", content: "Terms for using the Taraka Jayalakshmi Nursery plant nursery website and its plant previews." },
      { property: "og:title", content: "Terms of Use — Taraka Jayalakshmi Nursery" },
      { property: "og:description", content: "Terms for using the Taraka Jayalakshmi Nursery website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage title="Terms of Use">
      <p>Plant information and 3D previews are a guide only; real plants vary in size, shape and colour.</p>
      <p>Availability is confirmed when you contact us directly.</p>
    </LegalPage>
  ),
});
