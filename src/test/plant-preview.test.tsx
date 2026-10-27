import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { plants } from "@/data/plants";
import { PlantARViewer } from "@/components/jayalakshmi/PlantARViewer";
vi.mock("@google/model-viewer", () => ({}));
afterEach(cleanup);
const monstera = plants.find((plant) => plant.id === "monstera");
if (!monstera) throw new Error("Missing Monstera");
describe("Plant previews", () => {
  it("has distinct models for Monstera, Areca, Snake and Fiddle, never a shared sample", () => {
    const ids = ["monstera", "areca", "snake", "fiddle"];
    const models = ids.map((id) => plants.find((plant) => plant.id === id)?.model.glb);
    expect(models.every((src) => Boolean(src?.startsWith("/__l5e/assets-v1/")))).toBe(true);
    expect(new Set(models).size).toBe(4);
  });
  it("makes all six products selectable", async () => {
    const select = vi.fn();
    render(<PlantARViewer plant={monstera} onBack={vi.fn()} onSelect={select} />);
    for (const plant of plants) fireEvent.click(screen.getByRole("button", { name: `Preview ${plant.name}` }));
    expect(select.mock.calls.map(([plant]) => plant.id)).toEqual(["monstera", "peace-lily", "areca", "snake", "jade", "fiddle"]);
  });
  it("enables placement on load and reports unsupported devices instead of silently doing nothing", async () => {
    const { container } = render(<PlantARViewer plant={monstera} onBack={vi.fn()} onSelect={vi.fn()} />);
    await waitFor(() => expect(container.querySelector("model-viewer")).toBeTruthy());
    const viewer = container.querySelector("model-viewer");
    if (!viewer) throw new Error("Missing viewer");
    fireEvent(viewer, new Event("load"));
    fireEvent.click(screen.getByRole("button", { name: "Place in My Room" }));
    expect(screen.getByRole("status").textContent).toContain("requires a supported phone");
  });
  it("does not use another species for Peace Lily or Jade", () => {
    for (const id of ["peace-lily", "jade"]) expect(plants.find((plant) => plant.id === id)?.model.glb).toBe("");
  });
});
