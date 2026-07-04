/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CharacterClass {
  WARRIOR = "Warrior (Beskar Vanguard)",
  TACTICIAN = "Tactician (Gadgeteer Master)",
  FORCE_OUTCAST = "Force Outcast (Mystic Wanderer)",
  SABOTEUR = "Saboteur (Demolitions Specialist)",
}

export enum ElementAffinity {
  BESKAR_PHYSICAL = "Beskar-Physical",
  BLASTER_ENERGY = "Blaster-Energy",
  EXPLOSIVE_THERMAL = "Explosive-Thermal",
  FORCE_AFFILIATION = "Force-Affiliation",
  CRYO_CARBONITE = "Cryo-Carbonite",
}

export enum GameRank {
  INITIATE = "Initiate Hunt",
  FOUNDLING = "Foundling Vanguard",
  BLOODED = "Blooded Hunter",
  VANGUARD = "Vanguard Veteran",
  CHIEFTAIN = "Clan Chieftain",
  MANDALOR = "Mand'alor Legend",
}

export interface CharacterStats {
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number; // e.g. 0.15 for 15%
  evasion: number; // e.g. 0.05 for 5%
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  requiredSkillId?: string;
  statBonus?: Partial<CharacterStats>;
  abilityUnlocked?: string;
  iconName: string;
}

export interface SkillTree {
  branchName: string;
  skills: SkillNode[];
}

export interface ArmorPiece {
  slot: "helmet" | "chest" | "gauntlets" | "jetpack";
  name: string;
  color: string; // Hex color
  sigil: string; // e.g. "Mythosaur", "Mudhorn", "Nite Owl", "None"
  durability: number;
  stats: Partial<CharacterStats>;
  elementResistances: Record<ElementAffinity, number>; // Percentage e.g. 20 for 20%
}

export interface GameCharacter {
  id: string;
  name: string;
  class: CharacterClass;
  rank: GameRank;
  level: number;
  xp: number;
  xpNeeded: number;
  stats: CharacterStats;
  baseStats: CharacterStats;
  skillPoints: number;
  skills: SkillTree[];
  armor: Record<"helmet" | "chest" | "gauntlets" | "jetpack", ArmorPiece>;
  activePortrait: string; // base64 or graphic name
  isNPC: boolean;
}

export interface EnemyCharacter {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  attack: number;
  defense: number;
  speed: number;
  element: ElementAffinity;
  portrait: string;
  actions: string[];
  x: number; // 2.5D grid X
  y: number; // 2.5D grid Y
}

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  isGroup: boolean;
  messages: ChatMessage[];
}

export interface ForumComment {
  author: string;
  text: string;
  timestamp: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  author: string;
  upvotes: number;
  commentsCount: number;
  timestamp: string;
  comments: ForumComment[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  guild: string;
  bountyCount: number;
  faction: string;
  reputation: number;
}

export interface CompanionFriend {
  id: string;
  name: string;
  online: boolean;
  status: string;
  relation: string;
}

export interface SaveData {
  character: GameCharacter;
  credits: number;
  beskarIngots: number;
  artifactMaterials: number;
  currentPlanet: string;
  choicesHistory: string[];
  unlockedPlanets: string[];
  customShipLoadout: {
    weapon: string;
    shield: string;
    engine: string;
    hull: string;
  };
  summonedEnemy?: {
    name: string;
    hp: number;
    shield: number;
    attack: number;
    defense: number;
    element: ElementAffinity;
    portrait: string;
  };
  summonedCompanion?: {
    name: string;
    hp: number;
    shield: number;
    attack: number;
    portrait: string;
  };
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  graphicsQuality: "low" | "medium" | "high" | "ultra";
  enableTouchControls: boolean;
  controlMap: Record<string, string>;
  screenOrientation: "auto" | "portrait" | "landscape";
}
