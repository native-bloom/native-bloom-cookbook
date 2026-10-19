import type { BotAvatarType } from "bot-avatars";

export type Agent = {
  type: BotAvatarType;
  role: string;
};

export const CREW: Agent[] = [
  { type: "clover", role: "Writes your tests" },
  { type: "droid", role: "Ships the builds" },
  { type: "star", role: "Polishes the UI" },
  { type: "ghost", role: "Hunts bugs at night" },
  { type: "cat", role: "Reviews your PRs" },
  { type: "cloud", role: "Deploys on Fridays" },
  { type: "hexagon", role: "Wires up the API" },
  { type: "flower", role: "Animates everything" },
];

export const CREW_SIZE = 3;
