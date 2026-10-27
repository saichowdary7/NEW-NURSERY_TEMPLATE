import { createElement, useEffect, useRef, useState } from "react";
import { ArrowLeft, Box, Camera, Loader2, Maximize2, Move, Rotate3d, Smartphone, AlertTriangle, RefreshCw, X } from "lucide-react";
import { plants, type Plant } from "@/data/plants";
import { Button } from "@/components/ui/button";

type Status = "loading" | "ready" | "error";
type ArState = "idle" | "unsupported" | "session-started" | "object-placed" | "failed";
type CameraState = "off" | "starting" | "on" | "denied" | "unavailable";
type ViewerElement = HTMLElement & { loaded?: boolean; canActivateAR?: boolean; activateAR?: () => Promise<void> };

export function PlantARViewer({ plant, onBack, onSelect }: {
  plant: Plant; onBack: () => void; onSelect: (plant: Plant) => void;
}) {
  const ref = useRef<ViewerElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const feed = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [libReady, setLibReady] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [ar, setAr] = useState<ArState>("idle");
  const [attempt, setAttempt] = useState(0);
  const [camera, setCamera] = useState<CameraState>("off");
  const [moving, setMoving] = useState(false);
  const [size, setSize] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const live = camera === "on" || camera === "starting";

  useEffect(() => {
    let alive = true;
    import("@google/model-viewer")
      .then(() => { if (alive) setLibReady(true); })
      .catch(() => { if (alive) setStatus("error"); });
    return () => { alive = false; };
  }, [attempt]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !libReady || !plant.model.glb) return;
    setStatus("loading");
    setAr("idle");
    const onLoad = () => setStatus("ready");
    const onError = () => setStatus("error");
    const onAr = (event: Event) => {
      const value = (event as CustomEvent<{ status: string }>).detail?.status;
      if (value === "session-started" || value === "object-placed" || value === "failed") setAr(value);
      if (value === "not-presenting") setAr("idle");
    };
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    el.addEventListener("ar-status", onAr);
    // Cached custom elements can finish loading before the React effect attaches.
    if (el.loaded) onLoad();
    const check = window.setInterval(() => { if (el.loaded) onLoad(); }, 500);
    const timeout = window.setTimeout(() => { if (!el.loaded) onError(); }, 45000);
    return () => {
      window.clearInterval(check);
      window.clearTimeout(timeout);
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
      el.removeEventListener("ar-status", onAr);
    };
  }, [libReady, plant.model.glb, attempt]);

  const stopCamera = () => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    setCamera("off");
    setMoving(false);
  };
  useEffect(() => () => { stream.current?.getTracks().forEach((track) => track.stop()); }, []);

  // Fallback when the device can't start native AR: live camera feed with the 3D plant standing on it.
  const startCamera = async () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setCamera("unavailable"); return; }
    setCamera("starting");
    setSize(1);
    setOffset({ x: 0, y: 0 });
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      stream.current = media;
      if (feed.current) { feed.current.srcObject = media; await feed.current.play().catch(() => undefined); }
      setCamera("on");
    } catch (error) {
      setCamera(error instanceof DOMException && error.name === "NotAllowedError" ? "denied" : "unavailable");
    }
  };

  const launchAR = async () => {
    const el = ref.current;
    if (el?.canActivateAR && el.activateAR) {
      try { await el.activateAR(); return; } catch { setAr("failed"); }
    }
    setAr("unsupported");
    await startCamera();
  };

  const fullscreen = () => { void stage.current?.requestFullscreen?.().catch(() => undefined); };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <Button onClick={() => { stopCamera(); onBack(); }} variant="link" className="px-0"><ArrowLeft /> Back to Plant Details</Button>
        {plant.model.glb && <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Rotate3d className="h-4 w-4" />360° preview</span>}
      </div>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Choose a plant">
        {plants.map((item) => (
          <Button key={item.id} variant="outline" onClick={() => { stopCamera(); onSelect(item); }} aria-pressed={plant.id === item.id}
            aria-label={`Preview ${item.name}`} className={`h-auto flex-col whitespace-normal p-2 text-center text-xs ${plant.id === item.id ? "border-primary bg-accent" : ""}`}>
            <img src={item.image} alt="" className="h-12 w-10 rounded object-cover" />
            <span className="min-h-8 leading-4">{item.name}</span>
          </Button>
        ))}
      </div>
      <div ref={stage} className={`relative shrink-0 overflow-hidden rounded-lg border border-border ${live ? "h-[62svh] min-h-90 bg-black sm:h-120" : "h-85 bg-secondary sm:h-105"}`}>
        <video ref={feed} muted playsInline autoPlay aria-label="Your camera" className={`absolute inset-0 h-full w-full object-cover ${live ? "" : "hidden"}`} />
        {!plant.model.glb ? (
          <img src={plant.image} alt={plant.name} className="h-full w-full object-contain" />
        ) : (
          <div className="absolute inset-0" style={live ? { transform: `translate(${offset.x}px, ${offset.y}px) scale(${size})` } : undefined}>
            {libReady && createElement("model-viewer", {
              key: `${plant.id}-${attempt}`, ref, src: plant.model.glb, "ios-src": plant.model.usdz,
              alt: `3D model of ${plant.name}`, ar: true, "ar-modes": "webxr scene-viewer quick-look",
              "ar-placement": "floor", "ar-scale": "auto", "camera-controls": true, "auto-rotate": !live,
              "camera-orbit": live ? "0deg 80deg auto" : "0deg 75deg auto", "camera-target": "auto auto auto", "field-of-view": "30deg",
              "touch-action": "pan-y", "shadow-intensity": "1", "shadow-softness": "0.8", exposure: "1.05", "environment-image": "neutral",
              className: "absolute inset-0 h-full w-full bg-transparent",
            }, createElement("span", { slot: "ar-button", hidden: true }))}
          </div>
        )}
        {live && moving && (
          <div className="absolute inset-0 z-10 cursor-move touch-none" aria-label="Drag to move the plant"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }; }}
            onPointerMove={(e) => { if (drag.current) setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y }); }}
            onPointerUp={() => { drag.current = null; }} />
        )}
        {live && (
          <>
            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 bg-gradient-to-b from-black/55 to-transparent p-3 text-white">
              <span className="flex items-center gap-1.5 text-xs font-medium"><Camera className="h-4 w-4" /> Camera view · {plant.name}</span>
              <span className="flex gap-2">
                {typeof document !== "undefined" && document.fullscreenEnabled && (
                  <button onClick={fullscreen} aria-label="Full screen" className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur"><Maximize2 className="h-4 w-4" /></button>
                )}
                <button onClick={stopCamera} aria-label="Close camera" className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur"><X className="h-4 w-4" /></button>
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center gap-3 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
              <button onClick={() => setMoving((m) => !m)} aria-pressed={moving} className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium backdrop-blur ${moving ? "bg-white text-primary" : "bg-white/20"}`}>
                {moving ? <Move className="h-4 w-4" /> : <Rotate3d className="h-4 w-4" />} {moving ? "Drag to move" : "Drag to rotate"}
              </button>
              <label className="flex flex-1 items-center gap-2 text-xs">
                Size
                <input type="range" min={0.4} max={1.8} step={0.05} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-white" aria-label="Plant size" />
              </label>
            </div>
          </>
        )}
        {camera === "starting" && (
          <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center text-sm text-white" role="status">
            <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Opening camera…</span>
          </div>
        )}
        {plant.model.glb && status === "loading" && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-secondary/80 text-sm text-muted-foreground" role="status">
            <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading {plant.name}…</span>
          </div>
        )}
        {plant.model.glb && status === "error" && (
          <div className="absolute inset-0 grid place-items-center bg-secondary p-6 text-center">
            <div><AlertTriangle className="mx-auto h-7 w-7 text-destructive" /><p className="my-3 text-sm">This plant preview couldn't load.</p>
              <Button variant="outline" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }}><RefreshCw /> Try again</Button>
            </div>
          </div>
        )}
      </div>
      {plant.model.glb ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">{live ? "Point your camera at the spot, then rotate, move and size the plant." : "Species preview; actual plant size and shape may vary."}</p>
          {!live && <Button onClick={launchAR} disabled={status !== "ready"} className="shrink-0"><Box /> Place in My Room</Button>}
        </div>
      ) : <Notice icon={<Box className="h-4 w-4" />}>A matching 3D model for {plant.name} isn't available yet. Its photo is shown instead.</Notice>}
      {camera === "on" && ar === "unsupported" && <Notice icon={<Smartphone className="h-4 w-4" />}>Showing the plant over your camera. For true floor placement, open the published site in Android Chrome or iPhone Safari.</Notice>}
      {camera === "unavailable" && <Notice icon={<Camera className="h-4 w-4" />}>Camera view isn't available here. It needs a device camera and a secure (https) page, so open the published site on your phone. The 360° preview remains available.</Notice>}
      {camera === "denied" && <Notice icon={<AlertTriangle className="h-4 w-4" />}>Camera access was blocked. Allow camera permission for this site in your browser settings, then tap Place in My Room again.</Notice>}
      {ar === "session-started" && <Notice icon={<Smartphone className="h-4 w-4" />}>Move your phone slowly over a well-lit floor until the plant appears.</Notice>}
      {ar === "object-placed" && <Notice icon={<Box className="h-4 w-4" />}>Plant placed in your room.</Notice>}
      {ar === "failed" && camera !== "on" && <Notice icon={<AlertTriangle className="h-4 w-4" />}>Room placement couldn't start. Check camera permission and try again on a supported phone.</Notice>}
    </div>
  );
}

function Notice({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div role="status" className="mt-3 flex gap-2 rounded-lg border border-border bg-secondary p-3 text-sm text-foreground"><span className="mt-0.5 text-primary">{icon}</span><p>{children}</p></div>;
}
