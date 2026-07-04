/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameCharacter, CharacterClass, GameRank, ElementAffinity, GameSettings, SaveData } from "./types";

// Dynamic Web Audio Synthesizer for Star Wars sound effects
export class StarWarsSoundEngine {
  private static ctx: AudioContext | null = null;
  private static masterVolume: number = 80;
  private static sfxVolume: number = 80;
  private static musicVolume: number = 80;

  // Set active volume levels in real-time
  public static setVolumes(master: number, sfx: number, music: number) {
    this.masterVolume = master;
    this.sfxVolume = sfx;
    this.musicVolume = music;
  }

  private static getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Calculate current scale based on master volume and sfx volume
  private static getSFXVolumeFactor(): number {
    return (this.masterVolume / 100) * (this.sfxVolume / 100);
  }

  // Play standard UI click/blip
  public static playClick() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      
      const vol = 0.15 * this.getSFXVolumeFactor();
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, vol * 0.05), ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // Play blaster bolt sound
  public static playBlaster() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
      
      const vol = 0.18 * this.getSFXVolumeFactor();
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, vol * 0.05), ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }

  // Play lightsaber swing / ignition hum
  public static playLightsaber() {
    try {
      const ctx = this.getContext();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(110, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.4);
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(115, ctx.currentTime);
      osc2.frequency.linearRampToValueAtTime(135, ctx.currentTime + 0.4);

      const vol = 0.22 * this.getSFXVolumeFactor();
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(Math.max(0.001, vol * 0.05), ctx.currentTime + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  // Play explosion
  public static playExplosion() {
    try {
      const ctx = this.getContext();
      const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // White noise generator
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);

      const gain = ctx.createGain();
      const vol = 0.38 * this.getSFXVolumeFactor();
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, vol * 0.05), ctx.currentTime + 0.5);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start();
      noiseNode.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }

  // Play Force heal hum
  public static playForceHeal() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.5);
      
      // Gentle modulation
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      mod.frequency.value = 6;
      modGain.gain.value = 15;
      
      mod.connect(modGain);
      modGain.connect(osc.frequency);
      
      const vol = 0.22 * this.getSFXVolumeFactor();
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(Math.max(0.001, vol * 0.05), ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      mod.start();
      osc.start();
      mod.stop(ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }

  // Play shield deflection/absorb
  public static playShieldAbsorb() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.25);

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      const vol = 0.25 * this.getSFXVolumeFactor();
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, vol * 0.01), ctx.currentTime + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }

  // Play dark Force lightning
  public static playForceLightning() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const duration = 0.4;
      const vol = 0.28 * this.getSFXVolumeFactor();

      // Quick repeated cracking bursts
      for (let i = 0; i < 3; i++) {
        const burstTime = now + (i * 0.12);
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        // Crackling pitch variance
        osc.frequency.setValueAtTime(400 + Math.random() * 600, burstTime);
        osc.frequency.linearRampToValueAtTime(100 + Math.random() * 200, burstTime + 0.1);

        gain.gain.setValueAtTime(vol, burstTime);
        gain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(burstTime);
        osc.stop(burstTime + 0.1);
      }
    } catch (e) {}
  }

  // Play rank or level progression triumph
  public static playLevelUp() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 arpeggio
      const noteDuration = 0.12;
      const vol = 0.22 * this.getSFXVolumeFactor();

      notes.forEach((freq, idx) => {
        const noteTime = now + (idx * noteDuration);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(vol, noteTime);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.001, vol * 0.05), noteTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.25);
      });
    } catch (e) {}
  }

  // Play Jetpack activation swoosh
  public static playJetpack() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.35);

      const filter = ctx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.setValueAtTime(500, ctx.currentTime);

      const vol = 0.3 * this.getSFXVolumeFactor();
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, vol * 0.05), ctx.currentTime + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }
}

// Generate a default Mandalorian character
export const createDefaultCharacter = (name: string, characterClass: CharacterClass): GameCharacter => {
  const baseStats = {
    hp: 120,
    maxHp: 120,
    shield: 60,
    maxShield: 60,
    energy: 50,
    maxEnergy: 50,
    attack: 25,
    defense: 15,
    speed: 10,
    critChance: 0.1,
    evasion: 0.05,
  };

  // Adjust stats based on chosen class
  if (characterClass === CharacterClass.WARRIOR) {
    baseStats.maxHp += 40;
    baseStats.hp += 40;
    baseStats.defense += 10;
  } else if (characterClass === CharacterClass.TACTICIAN) {
    baseStats.maxShield += 30;
    baseStats.shield += 30;
    baseStats.energy += 20;
    baseStats.maxEnergy += 20;
  } else if (characterClass === CharacterClass.FORCE_OUTCAST) {
    baseStats.energy += 40;
    baseStats.maxEnergy += 40;
    baseStats.attack += 15;
    baseStats.defense -= 5;
  } else if (characterClass === CharacterClass.SABOTEUR) {
    baseStats.attack += 10;
    baseStats.critChance += 0.10;
    baseStats.speed += 4;
  }

  // Branching Skill Trees
  const skills = [
    {
      branchName: "Hunter (Combat Dominance)",
      skills: [
        { id: "h_1", name: "Beskar Reinforcement", description: "Increase max armor HP by +25", cost: 1, unlocked: false, statBonus: { maxHp: 25 }, iconName: "shield" },
        { id: "h_2", name: "Heavy Blaster Sweep", description: "Unlocks heavy collateral blaster strike, hitting multiple targets", cost: 1, unlocked: false, requiredSkillId: "h_1", abilityUnlocked: "Blaster Sweep", iconName: "zap" },
        { id: "h_3", name: "Whistling Birds Strike", description: "Unlocks the iconic homing micro-missiles. Inflicts Thermal damage", cost: 2, unlocked: false, requiredSkillId: "h_2", abilityUnlocked: "Whistling Birds", iconName: "crosshair" }
      ]
    },
    {
      branchName: "Tactician (Beskar Gadgetry)",
      skills: [
        { id: "t_1", name: "Jetpack Thrusters", description: "Increase movement speed and dodge chance +5%", cost: 1, unlocked: false, statBonus: { speed: 3, evasion: 0.05 }, iconName: "wind" },
        { id: "t_2", name: "Carbonite Spray", description: "Unlocks Cryo-spray which freezes enemies and reduces speed by 50%", cost: 1, unlocked: false, requiredSkillId: "t_1", abilityUnlocked: "Carbonite Spray", iconName: "snowflake" },
        { id: "t_3", name: "Amban Sniper Rifle", description: "Unlocks long-range disintegration beam. High crit chance", cost: 2, unlocked: false, requiredSkillId: "t_2", abilityUnlocked: "Amban Sniper", iconName: "target" }
      ]
    },
    {
      branchName: "Foundling bond (Grogu Team-Up)",
      skills: [
        { id: "g_1", name: "Grogu Cookie Cheer", description: "Grogu occasionally heals 15 HP to player every round start", cost: 1, unlocked: false, abilityUnlocked: "Cookie Heal", iconName: "cookie" },
        { id: "g_2", name: "Force Barrier Protection", description: "Grogu creates a temporary Force Shield absorbing 40 damage", cost: 2, unlocked: false, requiredSkillId: "g_1", abilityUnlocked: "Force Barrier", iconName: "activity" },
        { id: "g_3", name: "Force Choke Crush", description: "Grogu unleashes force telekinesis, stunning a boss for 1 turn", cost: 3, unlocked: false, requiredSkillId: "g_2", abilityUnlocked: "Force Choke", iconName: "eye" }
      ]
    }
  ];

  // Default custom armor pieces
  const armor: Record<"helmet" | "chest" | "gauntlets" | "jetpack", any> = {
    helmet: {
      slot: "helmet",
      name: "Standard Beskar Helmet",
      color: "#a0a0a0",
      sigil: "None",
      durability: 100,
      stats: { defense: 8, evasion: 0.02 },
      elementResistances: {
        [ElementAffinity.BESKAR_PHYSICAL]: 10,
        [ElementAffinity.BLASTER_ENERGY]: 15,
        [ElementAffinity.EXPLOSIVE_THERMAL]: 5,
        [ElementAffinity.FORCE_AFFILIATION]: 0,
        [ElementAffinity.CRYO_CARBONITE]: 5,
      }
    },
    chest: {
      slot: "chest",
      name: "Durasteel Segmented Plate",
      color: "#808080",
      sigil: "None",
      durability: 100,
      stats: { hp: 30, defense: 12 },
      elementResistances: {
        [ElementAffinity.BESKAR_PHYSICAL]: 15,
        [ElementAffinity.BLASTER_ENERGY]: 10,
        [ElementAffinity.EXPLOSIVE_THERMAL]: 10,
        [ElementAffinity.FORCE_AFFILIATION]: 5,
        [ElementAffinity.CRYO_CARBONITE]: 5,
      }
    },
    gauntlets: {
      slot: "gauntlets",
      name: "Vambrace Launchers",
      color: "#a8a8a8",
      sigil: "None",
      durability: 100,
      stats: { attack: 6, critChance: 0.02 },
      elementResistances: {
        [ElementAffinity.BESKAR_PHYSICAL]: 5,
        [ElementAffinity.BLASTER_ENERGY]: 5,
        [ElementAffinity.EXPLOSIVE_THERMAL]: 15,
        [ElementAffinity.FORCE_AFFILIATION]: 0,
        [ElementAffinity.CRYO_CARBONITE]: 10,
      }
    },
    jetpack: {
      slot: "jetpack",
      name: "Z-6 Vector Flight pack",
      color: "#909090",
      sigil: "None",
      durability: 100,
      stats: { speed: 4, evasion: 0.04 },
      elementResistances: {
        [ElementAffinity.BESKAR_PHYSICAL]: 5,
        [ElementAffinity.BLASTER_ENERGY]: 5,
        [ElementAffinity.EXPLOSIVE_THERMAL]: 20,
        [ElementAffinity.FORCE_AFFILIATION]: 5,
        [ElementAffinity.CRYO_CARBONITE]: 0,
      }
    }
  };

  return {
    id: "mando_player",
    name,
    class: characterClass,
    rank: GameRank.INITIATE,
    level: 1,
    xp: 0,
    xpNeeded: 100,
    stats: { ...baseStats },
    baseStats,
    skillPoints: 2,
    skills,
    armor,
    activePortrait: "Default-Bounty-Hunter",
    isNPC: false,
  };
};

export const createDefaultSaveData = (name: string, characterClass: CharacterClass): SaveData => {
  return {
    character: createDefaultCharacter(name, characterClass),
    credits: 5000,
    beskarIngots: 3,
    artifactMaterials: 2,
    currentPlanet: "Tatooine",
    choicesHistory: [],
    unlockedPlanets: ["Tatooine", "Nevarro"],
    customShipLoadout: {
      weapon: "Laser Cannons Mk-I",
      shield: "Deflector Screen standard",
      engine: "Hyperdrive Class 2",
      hull: "Light Titan Plating"
    }
  };
};

export const defaultSettings: GameSettings = {
  masterVolume: 80,
  sfxVolume: 90,
  musicVolume: 60,
  graphicsQuality: "medium",
  enableTouchControls: true,
  controlMap: {
    "MoveUp": "W",
    "MoveDown": "S",
    "MoveLeft": "A",
    "MoveRight": "D",
    "Attack": "Space",
    "Dodge": "Shift",
  },
  screenOrientation: "auto",
};
