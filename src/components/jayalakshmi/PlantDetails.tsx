import { Box, Droplets, Gauge, Home, MessageCircle, Ruler, Sun } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Plant } from "@/data/plants";
import { PlantARViewer } from "./PlantARViewer";

export function PlantDetails({ plant, mode, onModeChange, onClose, onContact, onSelect }: {
  plant: Plant | null;
  mode: "details" | "ar";
  onModeChange: (m: "details" | "ar") => void;
  onClose: () => void;
  onContact: (p: Plant) => void;
  onSelect: (p: Plant) => void;
}) {
  return (
    <Dialog open={!!plant} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-4xl overflow-y-auto rounded-3xl border-border bg-background p-5 sm:p-8">
        {plant && (mode === "ar" ? (
          <>
            <DialogTitle className="font-serif text-3xl">{plant.name} <span className="text-muted-foreground">in your space</span></DialogTitle>
            <DialogDescription className="sr-only">Interactive 3D and AR preview</DialogDescription>
            <PlantARViewer key={plant.id} plant={plant} onSelect={onSelect} onBack={() => onModeChange("details")} />
          </>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl bg-secondary">
              <img src={plant.image} alt={plant.name} width={768} height={960} className="aspect-[4/5] h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <p className="eyebrow">{plant.botanical}</p>
              <DialogTitle className="mt-3 font-serif text-4xl font-medium leading-tight">{plant.name}</DialogTitle>
              <DialogDescription className="mt-3 text-base leading-relaxed text-muted-foreground">{plant.description}</DialogDescription>
              <dl className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { i: Sun, k: "Light", v: plant.light },
                  { i: Droplets, k: "Watering", v: plant.water },
                  { i: Ruler, k: "Mature height", v: plant.height },
                  { i: Home, k: "Suitable for", v: plant.suitability },
                  { i: Gauge, k: "Care", v: plant.difficulty },
                ].map(({ i: Icon, k, v }) => (
                  <div key={k} className="rounded-xl border border-border bg-card p-3">
                    <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><Icon className="h-3.5 w-3.5 text-sage" />{k}</dt>
                    <dd className="mt-1 text-sm text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row">
                <button onClick={() => onModeChange("ar")} className="btn-primary flex-1"><Box className="h-4 w-4" /> View in My Space</button>
                <button onClick={() => onContact(plant)} className="btn-outline flex-1"><MessageCircle className="h-4 w-4" /> Contact About This Plant</button>
              </div>
            </div>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}
