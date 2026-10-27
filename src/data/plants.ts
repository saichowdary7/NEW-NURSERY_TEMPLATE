import monstera from "@/assets/monstera.jpg";
import peaceLily from "@/assets/peace-lily.jpg";
import areca from "@/assets/areca.jpg";
import snake from "@/assets/snake.jpg";
import jade from "@/assets/jade.jpg";
import fiddle from "@/assets/fiddle.jpg";
import catOutdoor from "@/assets/cat-outdoor.jpg";
import catFlowering from "@/assets/cat-flowering.jpg";
import catFruit from "@/assets/cat-fruit.jpg";
import catSucculent from "@/assets/cat-succulent.jpg";
import monsteraModel from "@/assets/monstera.glb.asset.json";
import arecaModel from "@/assets/areca.glb.asset.json";
import snakeModel from "@/assets/snake.glb.asset.json";
import fiddleModel from "@/assets/fiddle.glb.asset.json";

export type CategoryId = "indoor" | "outdoor" | "flowering" | "fruit" | "succulents" | "air-purifying";

export const categories: { id: CategoryId; name: string; description: string; image: string }[] = [
  { id: "indoor", name: "Indoor Plants", description: "Lush foliage that thrives in bright, calm interiors.", image: monstera },
  { id: "outdoor", name: "Outdoor Plants", description: "Hardy greenery for terraces, balconies and gardens.", image: catOutdoor },
  { id: "flowering", name: "Flowering Plants", description: "Soft blooms that bring colour to every corner.", image: catFlowering },
  { id: "fruit", name: "Fruit Plants", description: "Grow your own citrus and seasonal fruit at home.", image: catFruit },
  { id: "succulents", name: "Succulents", description: "Sculptural, low-water plants for sunny spots.", image: catSucculent },
  { id: "air-purifying", name: "Air-Purifying Plants", description: "Easy companions loved for fresher-feeling rooms.", image: snake },
];

// Species-specific CC0 Innerscene models; an empty source means no matching
// model is available yet. Never substitute another species for missing assets.

export type Plant = {
  id: string;
  name: string;
  botanical: string;
  image: string;
  categories: CategoryId[];
  description: string;
  light: string;
  water: string;
  height: string;
  suitability: "Indoor" | "Outdoor" | "Indoor & Outdoor";
  difficulty: "Easy" | "Moderate" | "Needs attention";
  model: { glb: string; usdz?: string; isPlaceholder: boolean };
};

export const plants: Plant[] = [
  {
    id: "monstera", name: "Monstera Deliciosa", botanical: "Monstera deliciosa", image: monstera,
    categories: ["indoor"],
    description: "Iconic split leaves and a relaxed, sculptural form — a statement plant for living rooms.",
    light: "Bright, indirect light", water: "When the top 3–5 cm of soil is dry", height: "1.5–2.5 m indoors",
    suitability: "Indoor", difficulty: "Easy", model: { glb: monsteraModel.url, isPlaceholder: false },
  },
  {
    id: "peace-lily", name: "Peace Lily", botanical: "Spathiphyllum wallisii", image: peaceLily,
    categories: ["indoor", "flowering", "air-purifying"],
    description: "Glossy leaves and elegant white blooms; tolerant of lower light corners.",
    light: "Low to medium indirect light", water: "Keep soil lightly moist", height: "40–90 cm",
    suitability: "Indoor", difficulty: "Easy", model: { glb: "", isPlaceholder: false },
  },
  {
    id: "areca", name: "Areca Palm", botanical: "Dypsis lutescens", image: areca,
    categories: ["indoor", "outdoor", "air-purifying"],
    description: "Feathery, arching fronds that soften any room with a tropical feel.",
    light: "Bright, indirect light", water: "When the top layer of soil dries", height: "1.5–2 m indoors",
    suitability: "Indoor & Outdoor", difficulty: "Moderate", model: { glb: arecaModel.url, isPlaceholder: false },
  },
  {
    id: "snake", name: "Snake Plant", botanical: "Dracaena trifasciata", image: snake,
    categories: ["indoor", "air-purifying", "succulents"],
    description: "Upright, architectural leaves; remarkably forgiving and drought tolerant.",
    light: "Low to bright light", water: "Every 2–4 weeks; let soil dry fully", height: "60–120 cm",
    suitability: "Indoor & Outdoor", difficulty: "Easy", model: { glb: snakeModel.url, isPlaceholder: false },
  },
  {
    id: "jade", name: "Jade Plant", botanical: "Crassula ovata", image: jade,
    categories: ["succulents", "indoor"],
    description: "A charming succulent with plump, glossy leaves that grows into a little tree.",
    light: "Bright light, some direct sun", water: "When soil is completely dry", height: "60–90 cm",
    suitability: "Indoor & Outdoor", difficulty: "Easy", model: { glb: "", isPlaceholder: false },
  },
  {
    id: "fiddle", name: "Fiddle Leaf Fig", botanical: "Ficus lyrata", image: fiddle,
    categories: ["indoor"],
    description: "Large, violin-shaped leaves on a slender trunk — a refined designer favourite.",
    light: "Bright, consistent indirect light", water: "When the top 5 cm is dry", height: "1.8–3 m indoors",
    suitability: "Indoor", difficulty: "Needs attention", model: { glb: fiddleModel.url, isPlaceholder: false },
  },
];
