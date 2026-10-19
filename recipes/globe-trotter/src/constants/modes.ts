export type ModeId = "drive" | "sail" | "fly" | "ride";

export type Mode = {
  id: ModeId;
  /** The morphing hero word. */
  word: string;
  /** What you book: "Take the jeep". */
  vehicle: string;
  emoji: string;
  /** Backdrop tint while this mode is on top of the globe. */
  ground: string;
  facts: string[];
  model: number;
  /** Largest dimension of the vehicle, in globe radii. */
  size: number;
  /** Height above the surface, in globe radii. */
  lift: number;
  /** Turns the model so its nose points along the road, in radians. */
  yaw: number;
  /** Nodes in the model we don't want on screen (a base plate, landing gear). */
  hide?: string[];
};

export const TRIP = { from: "LISBON", to: "PORTO" };

export const MODES: Mode[] = [
  {
    id: "drive",
    word: "DRIVE",
    vehicle: "jeep",
    emoji: "🚙",
    ground: "#F29B6B",
    facts: ["3H 10M", "€42", "SCENIC ROUTE"],
    model: require("../../assets/models/jeep.glb"),
    size: 0.56,
    lift: 0,
    yaw: -Math.PI / 2,
    hide: ["group2133652563"],
  },
  {
    id: "sail",
    word: "SAIL",
    vehicle: "boat",
    emoji: "⛵️",
    ground: "#3FB5B0",
    facts: ["9H", "€65", "SLOW & SALTY"],
    model: require("../../assets/models/boat.glb"),
    size: 0.62,
    lift: -0.05,
    yaw: -Math.PI / 2,
  },
  {
    id: "fly",
    word: "FLY",
    vehicle: "plane",
    emoji: "✈️",
    ground: "#9C8CF0",
    facts: ["55M", "€89", "WINDOW SEAT"],
    model: require("../../assets/models/plane.glb"),
    size: 0.66,
    lift: 0.28,
    yaw: -Math.PI / 2,
    hide: ["Wheel1", "Wheel2", "Wheel3", "Wheel4", "Wheel5", "Wheel6"],
  },
  {
    id: "ride",
    word: "RIDE",
    vehicle: "bike",
    emoji: "🚲",
    ground: "#E9B44C",
    facts: ["2 DAYS", "€0", "LEGS OF STEEL"],
    model: require("../../assets/models/bike.glb"),
    size: 0.46,
    lift: 0,
    yaw: Math.PI,
  },
];
