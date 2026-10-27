import { createElement, useEffect, useRef, useState } from "react";
import { ArrowLeft, Box, Camera, Loader2, Maximize2, Move, Rotate3d, Smartphone, SwitchCamera, AlertTriangle, RefreshCw, X } from "lucide-react";
import { plants, type Plant } from "@/data/plants";
import { Button } from "@/components/ui/button";

type Status = "loading" | "ready" | "error";
type ArState = "idle" | "session-started" | "object-placed" | "failed";
// The in-page camera view is the main experience on every device: the selected plant is visible the
// moment the camera opens. "photo" uses a still from the phone's own camera app, which works even where
// live camera access is blocked (any non-https page), so placement never dead-ends.
type CameraState = "off" | "starting" | "on" | "photo" | "denied" | "unavailable";
type Facing = "environment" | "user";
type ViewerElement = HTMLElement & { loaded?: boolean; canActivateAR?: boolean; activateAR?: () => Promise<void> };

export function PlantARViewer({ plant, onBack, onSelect }: {
  plant: Plant; onBack: () => void; onSelect: (plant: Plant) => void;
}) {
  const ref = useRef<ViewerElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const feed = useRef<HTMLVideoElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [libReady, setLibReady] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [ar, setAr] = useState<ArState>("idle");
  const [canAR, setCanAR] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [camera, setCamera] = useState<CameraState>("off");
  const [facing, setFacing] = useState<Facing>("environment");
  const [moving, setMoving] = useState(false);
  const [size, setSize] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [photo, setPhoto] = useState<string | null>(null);
  const startCameraRef = useRef<(face?: Facing) => Promise<void>>(async () => undefined);
  const live = camera === "on" || camera === "starting" || camera === "photo";
  const hasModel = Boolean(plant.model.glb);

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
    const onLoad = () => {
      setStatus("ready");
      // Native AR needs an https page to fetch and render the model.
      setCanAR(Boolean(el.canActivateAR) && window.isSecureContext);
    };
    const onError = () => setStatus("error");
    const onAr = (event: Event) => {
      const value = (event as CustomEvent<{ status: string }>).detail?.status;
      if (value === "session-started" || value === "object-placed" || value === "failed") setAr(value);
      // Native AR couldn't start: fall back to the in-page camera view with the plant visible.
      if (value === "failed") void startCameraRef.current();
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

  const stopStream = () => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
  };
  const stopCamera = () => {
    stopStream();
    setPhoto((url) => { if (url) URL.revokeObjectURL(url); return null; });
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    setCamera("off");
    setMoving(false);
  };
  useEffect(() => () => { stream.current?.getTracks().forEach((track) => track.stop()); }, []);

  // The fixed camera already stands the plant on the floor at true scale; just clear any user adjustments.
  const resetFit = () => {
    setSize(1);
    setOffset({ x: 0, y: 0 });
  };
  // Bring the camera/photo view fully on screen inside the scrolling dialog.
  useEffect(() => { if (live) stage.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [live]);

  const takePhoto = () => picker.current?.click();
  const onPhoto = (file: File | undefined) => {
    if (!file) return;
    stopStream();
    setPhoto((url) => { if (url) URL.revokeObjectURL(url); return URL.createObjectURL(file); });
    resetFit();
    setCamera("photo");
  };

  // Browsers only allow the live camera on https pages, so elsewhere open the phone's camera app instead.
  const startCamera = async (face: Facing = facing) => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setCamera("unavailable"); takePhoto(); return; }
    if (camera === "off" || camera === "unavailable" || camera === "denied") resetFit();
    setCamera("starting");
    stopStream();
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: face }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      stream.current = media;
      if (feed.current) { feed.current.srcObject = media; await feed.current.play().catch(() => undefined); }
      setFacing(face);
      setCamera("on");
    } catch (error) {
      setCamera(error instanceof DOMException && error.name === "NotAllowedError" ? "denied" : "unavailable");
    }
  };
  startCameraRef.current = startCamera;

  const launchNativeAR = async () => {
    const el = ref.current;
    if (!el?.activateAR) return;
    stopCamera();
    try { await el.activateAR(); } catch { setAr("failed"); await startCamera(); }
  };

  const fullscreen = () => { void stage.current?.requestFullscreen?.().catch(() => undefined); };
  // Switching plants keeps the camera running; only the plant changes.
  const choose = (item: Plant) => onSelect(item);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <Button onClick={() => { stopCamera(); onBack(); }} variant="link" className="px-0"><ArrowLeft /> Back to Plant Details</Button>
        {hasModel && !live && <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Rotate3d className="h-4 w-4" />360° preview</span>}
      </div>
      {!live && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Choose a plant">
          {plants.map((item) => (
            <Button key={item.id} variant="outline" onClick={() => choose(item)} aria-pressed={plant.id === item.id}
              aria-label={`Preview ${item.name}`} className={`h-auto flex-col whitespace-normal p-2 text-center text-xs ${plant.id === item.id ? "border-primary bg-accent" : ""}`}>
              <img src={item.image} alt="" className="h-12 w-10 rounded object-cover" />
              <span className="min-h-8 leading-4">{item.name}</span>
            </Button>
          ))}
        </div>
      )}
      <div ref={stage} className={`relative shrink-0 overflow-hidden rounded-lg border border-border ${live ? "h-[72svh] min-h-105 bg-black sm:h-130" : "h-85 bg-secondary sm:h-105"}`}>
        <video ref={feed} muted playsInline autoPlay aria-label="Your camera"
          className={`absolute inset-0 h-full w-full object-cover ${camera === "on" || camera === "starting" ? "" : "hidden"} ${facing === "user" ? "-scale-x-100" : ""}`} />
        {camera === "photo" && photo && <img src={photo} alt="Your room" className="absolute inset-0 h-full w-full object-cover" />}
        <input ref={picker} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Take a photo of your room"
          onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ""; }} />

        <div className="absolute inset-0" style={live ? { transform: `translate(${offset.x}px, ${offset.y}px) scale(${size})` } : undefined}>
          {hasModel ? (
            libReady && createElement("model-viewer", {
              key: `${plant.id}-${attempt}`, ref, src: plant.model.glb, "ios-src": plant.model.usdz,
              alt: `3D model of ${plant.name}`, ar: true, "ar-modes": "webxr scene-viewer quick-look",
              "ar-placement": "floor", "ar-scale": "auto", "camera-controls": true, "auto-rotate": !live,
              // Camera view: one fixed camera for every species (models are real-world metres, base at y=0),
              // so the pot stands near the bottom like it's on the floor and heights stay true to life.
              "camera-orbit": live ? "0deg 82deg 5.2m" : "0deg 75deg auto", "camera-target": live ? "0m 0.8m 0m" : "auto auto auto",
              "max-camera-orbit": live ? "Infinity 100deg 10m" : "Infinity 180deg auto", "disable-zoom": live, "field-of-view": "30deg",
              // model-viewer otherwise widens the field of view per model, breaking true relative scale.
              ...(live ? { "min-field-of-view": "30deg", "max-field-of-view": "30deg" } : {}),
              // In the camera view a drag must rotate the plant rather than scroll the dialog.
              "touch-action": live ? "none" : "pan-y", "interaction-prompt": "none",
              "shadow-intensity": "1", "shadow-softness": "0.8", exposure: "1.05", "environment-image": "neutral",
              // A wide box in the camera view stops model-viewer widening its field of view to fit each
              // model's width in a portrait frame, which would show species at inconsistent scales.
              className: live ? "absolute inset-y-0 -left-1/2 h-full w-[200%] bg-transparent" : "absolute inset-0 h-full w-full bg-transparent",
            }, createElement("span", { slot: "ar-button", hidden: true }))
          ) : live ? (
            // No vetted 3D model for this species: show its real photo standing in the scene instead.
            <div className="absolute inset-x-0 bottom-[14%] flex flex-col items-center">
              <img src={plant.image} alt={plant.name} className="h-[52%] max-h-80 w-auto rounded-2xl border-4 border-white/90 object-cover shadow-[0_30px_50px_-20px_rgba(0,0,0,0.7)]" />
              <span className="mt-2 rounded-full bg-black/55 px-2.5 py-1 text-[0.65rem] text-white">Photo · 3D model coming soon</span>
            </div>
          ) : (
            <img src={plant.image} alt={plant.name} className="h-full w-full object-contain" />
          )}
        </div>

        {live && moving && (
          <div className="absolute inset-0 z-10 cursor-move touch-none" aria-label="Drag to move the plant"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }; }}
            onPointerMove={(e) => { if (drag.current) setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y }); }}
            onPointerUp={() => { drag.current = null; }} />
        )}
        {live && (
          <>
            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 bg-gradient-to-b from-black/60 to-transparent p-3 text-white">
              <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium"><Camera className="h-4 w-4 shrink-0" /><span className="truncate">{camera === "photo" ? "Your photo" : "Camera view"} · {plant.name}</span></span>
              <span className="flex shrink-0 gap-2">
                {camera === "on" && (
                  <button onClick={() => void startCamera(facing === "environment" ? "user" : "environment")} aria-label="Switch camera" className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur"><SwitchCamera className="h-4 w-4" /></button>
                )}
                {camera === "photo" && (
                  <button onClick={takePhoto} aria-label="Retake photo" className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur"><Camera className="h-4 w-4" /></button>
                )}
                {typeof document !== "undefined" && document.fullscreenEnabled && (
                  <button onClick={fullscreen} aria-label="Full screen" className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur"><Maximize2 className="h-4 w-4" /></button>
                )}
                <button onClick={stopCamera} aria-label="Close camera" className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur"><X className="h-4 w-4" /></button>
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 z-20 space-y-2.5 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 pb-3 pt-8 text-white">
              <div className="flex items-center gap-3">
                <button onClick={() => setMoving((m) => !m)} aria-pressed={moving} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium backdrop-blur ${moving ? "bg-white text-primary" : "bg-white/20"}`}>
                  {moving ? <Move className="h-4 w-4" /> : <Rotate3d className="h-4 w-4" />} {moving ? "Drag to move" : "Drag to rotate"}
                </button>
                <label className="flex flex-1 items-center gap-2 text-xs">
                  Size
                  <input type="range" min={0.4} max={1.8} step={0.05} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-white" aria-label="Plant size" />
                </label>
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5" aria-label="Choose a plant to show">
                {plants.map((item) => (
                  <button key={item.id} onClick={() => choose(item)} aria-pressed={plant.id === item.id} aria-label={`Show ${item.name} in the camera`}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[0.7rem] font-medium backdrop-blur ${plant.id === item.id ? "bg-white text-primary" : "bg-white/20 text-white"}`}>
                    <img src={item.image} alt="" className="h-7 w-7 rounded-full object-cover" />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {camera === "starting" && (
          <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center text-sm text-white" role="status">
            <span className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2"><Loader2 className="h-5 w-5 animate-spin" /> Opening camera…</span>
          </div>
        )}
        {hasModel && status === "loading" && (
          live ? (
            <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex justify-center" role="status">
              <span className="flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white"><Loader2 className="h-4 w-4 animate-spin" /> Loading {plant.name}…</span>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-secondary/80 text-sm text-muted-foreground" role="status">
              <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading {plant.name}…</span>
            </div>
          )
        )}
        {hasModel && status === "error" && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-secondary p-6 text-center">
            <div><AlertTriangle className="mx-auto h-7 w-7 text-destructive" /><p className="my-3 text-sm">This plant preview couldn't load.</p>
              <Button variant="outline" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }}><RefreshCw /> Try again</Button>
            </div>
          </div>
        )}
      </div>

      {!live && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">{hasModel ? "Species preview; actual plant size and shape may vary." : `A 3D model for ${plant.name} isn't available yet, so its photo is shown in your camera view.`}</p>
          <div className="flex shrink-0 gap-2">
            {canAR && hasModel && <Button variant="outline" onClick={() => void launchNativeAR()}><Smartphone /> Floor AR</Button>}
            <Button onClick={() => void startCamera("environment")} className="flex-1 sm:flex-none"><Box /> Place in My Room</Button>
          </div>
        </div>
      )}
      {live && <p className="mt-3 text-xs text-muted-foreground">{camera === "photo" ? "Drag to rotate or move the plant, and use Size to fit it to the spot." : "Point your camera at the spot. Drag to rotate or move the plant, use Size to fit it, and tap another plant to swap it."}</p>}
      {camera === "unavailable" && <Notice icon={<Camera className="h-4 w-4" />}>Live camera only works on a secure (https) page, so take a photo of the spot instead and the plant will be placed in it.<br /><button onClick={takePhoto} className="btn-primary mt-3 min-h-10! text-sm"><Camera className="h-4 w-4" /> Take a photo of my room</button></Notice>}
      {camera === "denied" && <Notice icon={<AlertTriangle className="h-4 w-4" />}>Camera access was blocked. Allow camera permission for this site in your browser settings, or take a photo of the spot instead.<br /><button onClick={takePhoto} className="btn-primary mt-3 min-h-10! text-sm"><Camera className="h-4 w-4" /> Take a photo of my room</button></Notice>}
      {ar === "session-started" && <Notice icon={<Smartphone className="h-4 w-4" />}>Move your phone slowly over a well-lit floor until the plant appears.</Notice>}
      {ar === "object-placed" && <Notice icon={<Box className="h-4 w-4" />}>Plant placed in your room.</Notice>}
    </div>
  );
}

function Notice({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div role="status" className="mt-3 flex gap-2 rounded-lg border border-border bg-secondary p-3 text-sm text-foreground"><span className="mt-0.5 text-primary">{icon}</span><p>{children}</p></div>;
}
