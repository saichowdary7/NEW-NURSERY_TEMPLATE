import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar, scrollToId } from "@/components/jayalakshmi/Navbar";
import { HeroSection } from "@/components/jayalakshmi/HeroSection";
import { NurseryJourney } from "@/components/jayalakshmi/NurseryJourney";
import { PlantMarquee } from "@/components/jayalakshmi/PlantMarquee";
import { PlantCategories } from "@/components/jayalakshmi/PlantCategories";
import { FeaturedPlants } from "@/components/jayalakshmi/FeaturedPlants";
import { PlantDetails } from "@/components/jayalakshmi/PlantDetails";
import { ServicesSection } from "@/components/jayalakshmi/ServicesSection";
import { AboutSection } from "@/components/jayalakshmi/AboutSection";
import { ContactForm, type EnquiryPrefill } from "@/components/jayalakshmi/ContactForm";
import { WhatsAppContact } from "@/components/jayalakshmi/WhatsAppContact";
import { Footer } from "@/components/jayalakshmi/Footer";
import { SectionHeading } from "@/components/jayalakshmi/motion";
import type { CategoryId, Plant } from "@/data/plants";
import type { EnquiryType } from "@/config/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Taraka Jayalakshmi Nursery — Plants Bring Life | Premium Plant Nursery" },
      { name: "description", content: "Discover beautiful indoor, outdoor and flowering plants, preview them in your space with AR, and get expert plant guidance from Taraka Jayalakshmi Nursery." },
      { property: "og:title", content: "Taraka Jayalakshmi Nursery — Plants Bring Life" },
      { property: "og:description", content: "A premium plant nursery: curated plants, AR previews and thoughtful gardening guidance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const [selected, setSelected] = useState<Plant | null>(null);
  const [mode, setMode] = useState<"details" | "ar">("details");
  const [prefill, setPrefill] = useState<EnquiryPrefill | null>(null);

  const enquire = (topic: EnquiryType, message = "") => {
    setPrefill({ topic, message, key: Date.now() });
    setSelected(null);
    setTimeout(() => scrollToId("contact"), 50);
  };

  return (
    <div className="min-h-screen overflow-x-clip">
      <Navbar />
      <main>
        <HeroSection />
        <NurseryJourney />
        <PlantMarquee />
        <ServicesSection onEnquire={enquire} />
        <section id="plants" className="scroll-mt-20 py-24 md:py-32">
          <div className="mx-auto max-w-7xl space-y-28 px-5 md:px-8">
            <PlantCategories onSelect={(id) => { setFilter(id); scrollToId("featured"); }} />
            <FeaturedPlants filter={filter} onFilter={setFilter} onOpen={(p, m) => { setSelected(p); setMode(m); }} />
          </div>
        </section>
        <AboutSection />
        <section id="contact" className="scroll-mt-20 bg-secondary py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <SectionHeading eyebrow="Get in touch" title={<>Let's Grow Something <em className="italic text-primary">Beautiful</em></>} subtitle="Have a question about a plant or need help creating your green space? We'd love to help." />
            <div className="mt-16 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              <ContactForm prefill={prefill} />
              <WhatsAppContact />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <PlantDetails
        plant={selected}
        mode={mode}
        onModeChange={setMode}
        onClose={() => setSelected(null)}
        onSelect={setSelected}
        onContact={(p) => enquire("Plant Availability", `Hello Taraka Jayalakshmi Nursery! I'm interested in the ${p.name}. Could you tell me about availability and care?`)}
      />
    </div>
  );
}
