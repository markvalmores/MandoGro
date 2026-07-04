/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GameCharacter, EnemyCharacter, ElementAffinity, GameSettings, SaveData } from "../types";
import { StarWarsSoundEngine } from "../utils";
import { Sliders, Shield, Award, Cloud, Swords, Eye, Zap, Volume2, Users, Flame, Info, Compass, Sparkles, Database, Layers } from "lucide-react";

interface GameConsoleProps {
  saveData: SaveData;
  settings: GameSettings;
  onUpdateSave: (updatedSave: SaveData) => void;
  onUpdateSettings: (updatedSettings: GameSettings) => void;
  onOpenSettings: () => void;
  onOpenArmor: () => void;
  onOpenSkills: () => void;
  onOpenSaves: () => void;
  onOpenSocial: () => void;
  onOpenMiniGames: () => void;
  onOpenStory: () => void;
  onOpenCodex: () => void;
  onOpenCardBattle: () => void;
}

export const GameConsole: React.FC<GameConsoleProps> = ({
  saveData,
  settings,
  onUpdateSave,
  onUpdateSettings,
  onOpenSettings,
  onOpenArmor,
  onOpenSkills,
  onOpenSaves,
  onOpenSocial,
  onOpenMiniGames,
  onOpenStory,
  onOpenCodex,
  onOpenCardBattle,
}) => {
  const { character, credits, beskarIngots, currentPlanet } = saveData;

  // Active combat state
  const [battleActive, setBattleActive] = useState(true);
  const [coopActive, setCoopActive] = useState(false); // Offline local co-op option
  const [teamMode, setTeamMode] = useState<"Solo" | "Mando-Grogu" | "Co-op">("Mando-Grogu");
  
  // Enemies list (2.5D positions on coordinate grid)
  const [enemies, setEnemies] = useState<EnemyCharacter[]>([
    { id: "e_1", name: "Imperial Dark Trooper", hp: 110, maxHp: 110, shield: 40, maxShield: 40, attack: 18, defense: 14, speed: 8, element: ElementAffinity.BLASTER_ENERGY, portrait: "Dark Trooper", actions: ["Laser Fire", "Heavy Shield Charging"], x: 140, y: 80 },
    { id: "e_2", name: "Moff Gideon (Boss)", hp: 280, maxHp: 280, shield: 120, maxShield: 120, attack: 32, defense: 22, speed: 12, element: ElementAffinity.FORCE_AFFILIATION, portrait: "Moff Gideon", actions: ["Darksaber Strike", "E-Web Blast", "Imperial Reinforcements"], x: 100, y: 50 },
    { id: "e_3", name: "Stormtrooper Scout", hp: 60, maxHp: 60, shield: 0, maxShield: 0, attack: 12, defense: 8, speed: 11, element: ElementAffinity.BESKAR_PHYSICAL, portrait: "Stormtrooper", actions: ["Blaster Fire", "Thermal Grenade"], x: 60, y: 80 }
  ]);
  const [selectedEnemyId, setSelectedEnemyId] = useState<string>("e_1");

  // Custom visual feedback states for API image-based combat and lasers
  const [laserBolt, setLaserBolt] = useState<{ active: boolean; x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // Advanced SFX & VFX States
  const [shieldFlash, setShieldFlash] = useState<{ active: boolean; x: number; y: number } | null>(null);
  const [forceRipple, setForceRipple] = useState<{ active: boolean; x: number; y: number; color: string } | null>(null);
  const [explosionFlash, setExplosionFlash] = useState<{ active: boolean; x: number; y: number } | null>(null);

  // Listen to Holonet summon calls from StarWarsCodex
  useEffect(() => {
    if (saveData.summonedEnemy) {
      const newEnemy: EnemyCharacter = {
        id: `e_api_${Date.now()}`,
        name: saveData.summonedEnemy.name,
        hp: saveData.summonedEnemy.hp,
        maxHp: saveData.summonedEnemy.hp,
        shield: saveData.summonedEnemy.shield,
        maxShield: saveData.summonedEnemy.shield,
        attack: saveData.summonedEnemy.attack,
        defense: saveData.summonedEnemy.defense,
        speed: 10,
        element: saveData.summonedEnemy.element,
        portrait: saveData.summonedEnemy.portrait,
        actions: ["Force Gaze", "Blaster Charge", "Holographic Distortion"],
        x: Math.floor(100 + Math.random() * 80),
        y: Math.floor(60 + Math.random() * 20),
      };
      setEnemies(prev => {
        // We filter out any previous holographic summon to prevent crowding, then append
        const filtered = prev.filter(e => !e.id.startsWith("e_api_"));
        const newList = [...filtered, newEnemy];
        setSelectedEnemyId(newEnemy.id);
        return newList;
      });
      addLog(`[HOLONET CALL] Holographic combatant ${saveData.summonedEnemy.name} injected into arena!`);
    }
  }, [saveData.summonedEnemy]);

  useEffect(() => {
    if (saveData.summonedCompanion) {
      setCoopCharacter({
        name: saveData.summonedCompanion.name,
        hp: saveData.summonedCompanion.hp,
        maxHp: saveData.summonedCompanion.hp,
        shield: saveData.summonedCompanion.shield,
        maxShield: saveData.summonedCompanion.shield,
        attack: saveData.summonedCompanion.attack,
      });
      setCoopActive(true);
      setTeamMode("Co-op");
      addLog(`[HOLONET CALL] Activated tactical companion: ${saveData.summonedCompanion.name}!`);
    }
  }, [saveData.summonedCompanion]);

  // Local Co-op Companion data
  const [coopCharacter, setCoopCharacter] = useState({
    name: "Cobb Vanth",
    hp: 120,
    maxHp: 120,
    shield: 40,
    maxShield: 40,
    attack: 24,
  });

  // Action Queue log
  const [battleLogs, setBattleLogs] = useState<string[]>([
    "Tactical perimeter scanning completed.",
    "Imperial remnant ambush detected! Prepare defensive measures.",
    "Grogu hover cradle stabilized. Mando & Grogu Team Mode online!"
  ]);

  // Turn tracking state
  const [currentTurn, setCurrentTurn] = useState<"player" | "coop" | "enemies">("player");

  // Device & Network state (lower-left monitoring)
  const [deviceStats, setDeviceStats] = useState({
    cpu: "ARM Cortex-A16 v8.4 (8-Core)",
    gpu: "Apple Metal GPU / Qualcomm Adreno 740",
    ping: 34,
    touchScreen: true,
    orientation: "Landscape"
  });

  // Fetch device capabilities & latency
  useEffect(() => {
    // Detect basic characteristics
    const isTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
    const isPortrait = window.innerHeight > window.innerWidth;
    
    // Periodically fluctuate simulated ping latency for visual immersion
    const interval = setInterval(() => {
      setDeviceStats(prev => ({
        ...prev,
        ping: Math.floor(25 + Math.random() * 15),
        touchScreen: isTouch,
        orientation: isPortrait ? "Portrait" : "Landscape"
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Log adding helper
  const addLog = (log: string) => {
    setBattleLogs(prev => [log, ...prev]);
  };

  // Turn base battle calculations
  const handleAttack = (skillType: "blaster" | "birds" | "carbonite" | "force") => {
    if (currentTurn !== "player") return;

    const target = enemies.find(e => e.id === selectedEnemyId);
    if (!target || target.hp <= 0) {
      addLog("Choose an active imperial target.");
      return;
    }

    // Play action specific SFX
    if (skillType === "blaster") {
      StarWarsSoundEngine.playBlaster();
    } else if (skillType === "birds") {
      StarWarsSoundEngine.playExplosion();
      // Set explosion on target immediately
      setExplosionFlash({ active: true, x: target.x, y: target.y + 12 });
      setTimeout(() => setExplosionFlash(null), 400);
    } else if (skillType === "carbonite") {
      StarWarsSoundEngine.playJetpack(); // Pressurized cold burst sound
    } else if (skillType === "force") {
      StarWarsSoundEngine.playForceLightning(); // Electrifying force channel sound
      // Ripple green waves from Grogu (x=40, y=130)
      setForceRipple({ active: true, x: 40, y: 130, color: "#10b981" });
      setTimeout(() => setForceRipple(null), 500);
    }

    let damage = character.stats.attack;
    let attackElement = ElementAffinity.BESKAR_PHYSICAL;
    let message = "";

    if (skillType === "blaster") {
      damage = Math.floor(character.stats.attack * 1.2);
      attackElement = ElementAffinity.BLASTER_ENERGY;
      message = `${character.name} fires a heavy Amban Blaster bolt at ${target.name}.`;
    } else if (skillType === "birds") {
      damage = Math.floor(character.stats.attack * 1.8);
      attackElement = ElementAffinity.EXPLOSIVE_THERMAL;
      message = `${character.name} unleashes Whistling Birds homing micro-missiles onto ${target.name}!`;
    } else if (skillType === "carbonite") {
      damage = Math.floor(character.stats.attack * 0.9);
      attackElement = ElementAffinity.CRYO_CARBONITE;
      message = `${character.name} sprays Carbonite mist, freezing ${target.name}.`;
    } else if (skillType === "force") {
      damage = Math.floor(character.stats.attack * 2.2);
      attackElement = ElementAffinity.FORCE_AFFILIATION;
      message = `Mando & Grogu TEAM UP! Grogu channels the Force to slam ${target.name} while Mando fires his sniper.`;
    }

    // Shield absorbing calculation
    let finalDamage = damage;
    let shieldDmg = 0;
    let hpDmg = 0;

    if (target.shield > 0) {
      shieldDmg = Math.min(target.shield, finalDamage);
      target.shield -= shieldDmg;
      finalDamage -= shieldDmg;
      // Shield block visual and audio effects
      StarWarsSoundEngine.playShieldAbsorb();
      setShieldFlash({ active: true, x: target.x, y: target.y + 12 });
      setTimeout(() => setShieldFlash(null), 300);
    }
    hpDmg = Math.min(target.hp, finalDamage);
    target.hp -= hpDmg;

    // Trigger visual laser bolt animation toward target
    setLaserBolt({ active: true, x1: 70, y1: 140, x2: target.x, y2: target.y + 12 });
    setTimeout(() => setLaserBolt(null), 250);

    // Trigger visual floating text damage above target
    const textId = Date.now();
    setFloatingTexts(prev => [...prev, { id: textId, text: `-${damage}`, x: target.x, y: target.y - 10 }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== textId));
    }, 1000);

    addLog(message);
    addLog(`Hit! Dealt ${shieldDmg + hpDmg} ${attackElement} damage (${shieldDmg} to Shield, ${hpDmg} to HP) to ${target.name}.`);

    // Check if enemy dead
    if (target.hp <= 0) {
      StarWarsSoundEngine.playExplosion();
      setExplosionFlash({ active: true, x: target.x, y: target.y + 12 });
      setTimeout(() => setExplosionFlash(null), 400);
      addLog(`Target eliminated! Imperial ${target.name} defeated.`);
      // Auto select next living target
      const living = enemies.find(e => e.id !== target.id && e.hp > 0);
      if (living) {
        setSelectedEnemyId(living.id);
      }
    }

    // Check if all dead
    const anyLiving = enemies.some(e => e.hp > 0);
    if (!anyLiving) {
      setBattleActive(false);
      StarWarsSoundEngine.playLevelUp(); // Victory progression triumph sound!
      addLog("SQUAD SIGHTS CLEAR! Ambush defeated. Bounty earned: +2500 Credits.");
      
      // Update credits on save
      const updated = { ...saveData, credits: credits + 2500 };
      onUpdateSave(updated);
      return;
    }

    // Transfer turn
    if (coopActive) {
      setCurrentTurn("coop");
    } else {
      triggerEnemyTurns();
    }
  };

  // Local Co-op second action
  const handleCoopAttack = () => {
    if (currentTurn !== "coop") return;
    StarWarsSoundEngine.playExplosion(); // Heavy rocket launcher sound

    const target = enemies.find(e => e.id === selectedEnemyId);
    if (!target || target.hp <= 0) return;

    let damage = coopCharacter.attack;
    
    // Shield absorbing calculation
    let finalDamage = damage;
    let shieldDmg = 0;
    if (target.shield > 0) {
      shieldDmg = Math.min(target.shield, finalDamage);
      target.shield -= shieldDmg;
      finalDamage -= shieldDmg;
      StarWarsSoundEngine.playShieldAbsorb();
      setShieldFlash({ active: true, x: target.x, y: target.y + 12 });
      setTimeout(() => setShieldFlash(null), 300);
    }
    let hpDmg = Math.min(target.hp, finalDamage);
    target.hp -= hpDmg;

    // Trigger visual explosion at enemy target
    setExplosionFlash({ active: true, x: target.x, y: target.y + 12 });
    setTimeout(() => setExplosionFlash(null), 400);

    // Visual laser tracer and damage popup from companion coordinates (x=100, y=155)
    setLaserBolt({ active: true, x1: 100, y1: 155, x2: target.x, y2: target.y + 12 });
    setTimeout(() => setLaserBolt(null), 250);

    const textId = Date.now();
    setFloatingTexts(prev => [...prev, { id: textId, text: `-${damage}`, x: target.x, y: target.y - 10 }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== textId));
    }, 1000);

    addLog(`Local Co-op Companion Cobb Vanth fires Boba Fett's rocket launcher at ${target.name} dealing ${damage} damage!`);
    
    if (target.hp <= 0) {
      StarWarsSoundEngine.playExplosion();
      setExplosionFlash({ active: true, x: target.x, y: target.y + 12 });
      setTimeout(() => setExplosionFlash(null), 400);
      addLog(`${target.name} has been neutralized.`);
    }

    triggerEnemyTurns();
  };

  // Enemy Counter Attacks turn logic
  const triggerEnemyTurns = () => {
    setCurrentTurn("enemies");
    setTimeout(() => {
      let aliveEnemies = enemies.filter(e => e.hp > 0);
      if (aliveEnemies.length === 0) return;

      // Each enemy attacks
      aliveEnemies.forEach((enemy, idx) => {
        setTimeout(() => {
          // Choose target (Player or Co-op companion)
          let targetIsPlayer = true;
          if (coopActive && Math.random() > 0.5) {
            targetIsPlayer = false;
          }

          const targetX = targetIsPlayer ? 70 : 100;
          const targetY = targetIsPlayer ? 115 : 130;

          // Play enemy blaster SFX
          StarWarsSoundEngine.playBlaster();

          // Visual laser from enemy coordinates back to player/coop
          setLaserBolt({ active: true, x1: enemy.x, y1: enemy.y + 12, x2: targetX, y2: targetY });
          setTimeout(() => setLaserBolt(null), 250);

          // Damage floating text
          const textId = Date.now() + idx;
          setFloatingTexts(prev => [...prev, { id: textId, text: `-${enemy.attack}`, x: targetX, y: targetY - 15 }]);
          setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== textId));
          }, 1000);

          if (targetIsPlayer) {
            // Damage player shield first
            let rawDmg = Math.floor(enemy.attack * (1 - character.stats.defense / 100));
            if (rawDmg < 2) rawDmg = 2;
            
            let sDmg = Math.min(character.stats.shield, rawDmg);
            if (sDmg > 0) {
              // Sound & Shield VFX on player coordinates (70, 115)
              StarWarsSoundEngine.playShieldAbsorb();
              setShieldFlash({ active: true, x: 70, y: 115 });
              setTimeout(() => setShieldFlash(null), 300);
            }
            character.stats.shield = Math.max(0, character.stats.shield - sDmg);
            let hDmg = Math.min(character.stats.hp, rawDmg - sDmg);
            character.stats.hp = Math.max(0, character.stats.hp - hDmg);

            addLog(`${enemy.name} uses ${enemy.actions[0]} dealing ${sDmg + hDmg} damage to Mando!`);
          } else {
            // Damage coop companion
            let sDmg = Math.min(coopCharacter.shield, enemy.attack);
            if (sDmg > 0) {
              // Sound & Shield VFX on companion coordinates (100, 130)
              StarWarsSoundEngine.playShieldAbsorb();
              setShieldFlash({ active: true, x: 100, y: 130 });
              setTimeout(() => setShieldFlash(null), 300);
            }
            coopCharacter.shield -= sDmg;
            let hDmg = Math.min(coopCharacter.hp, enemy.attack - sDmg);
            coopCharacter.hp -= hDmg;
            addLog(`${enemy.name} fires at Companion Cobb Vanth dealing ${enemy.attack} damage!`);
          }

          // Check defeat
          if (character.stats.hp <= 0) {
            StarWarsSoundEngine.playExplosion();
            setExplosionFlash({ active: true, x: 70, y: 140 });
            setTimeout(() => setExplosionFlash(null), 400);
            addLog("Mando shield systems critical. Retreat to Nevarro enclave!");
            // Revive player to avoid soft lock
            character.stats.hp = character.stats.maxHp;
            character.stats.shield = character.stats.maxShield;
          }
        }, idx * 1000);
      });

      // Give turn back to player
      setTimeout(() => {
        setCurrentTurn("player");
      }, aliveEnemies.length * 1000);

    }, 800);
  };

  // Reset/Restart Battle
  const handleResetBattle = () => {
    StarWarsSoundEngine.playForceHeal();
    setEnemies([
      { id: "e_1", name: "Imperial Dark Trooper", hp: 110, maxHp: 110, shield: 40, maxShield: 40, attack: 18, defense: 14, speed: 8, element: ElementAffinity.BLASTER_ENERGY, portrait: "Dark Trooper", actions: ["Laser Fire", "Heavy Shield Charging"], x: 140, y: 80 },
      { id: "e_2", name: "Moff Gideon (Boss)", hp: 280, maxHp: 280, shield: 120, maxShield: 120, attack: 32, defense: 22, speed: 12, element: ElementAffinity.FORCE_AFFILIATION, portrait: "Moff Gideon", actions: ["Darksaber Strike", "E-Web Blast", "Imperial Reinforcements"], x: 100, y: 50 },
      { id: "e_3", name: "Stormtrooper Scout", hp: 60, maxHp: 60, shield: 0, maxShield: 0, attack: 12, defense: 8, speed: 11, element: ElementAffinity.BESKAR_PHYSICAL, portrait: "Stormtrooper", actions: ["Blaster Fire", "Thermal Grenade"], x: 60, y: 80 }
    ]);
    setSelectedEnemyId("e_1");
    setBattleActive(true);
    setCurrentTurn("player");
    addLog("Tactical battlefield re-synchronized. Ambush active!");
  };

  // Toggle offline local co-op
  const handleToggleCoop = () => {
    StarWarsSoundEngine.playClick();
    setCoopActive(!coopActive);
    setTeamMode(coopActive ? "Mando-Grogu" : "Co-op");
    addLog(coopActive ? "Returning to Mando-Grogu team mode." : "Offline local co-op companion Cobb Vanth joined battle!");
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0B0E] text-[#E0E0E0] overflow-hidden font-sans">
      <div id="game_console" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      
      {/* 1. Left Action & Settings Command Hub Column */}
      <div className="w-full lg:w-80 bg-[#0D1016] border-r border-[#2D3139] flex flex-col justify-between p-4 space-y-4 shrink-0">
        <div className="space-y-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2 border-b border-[#2D3139] pb-3">
            <Swords className="text-[#C69C6D] w-5 h-5" />
            <h1 className="text-xl font-extrabold font-mono text-[#C69C6D] tracking-wider">
              MANDOGRO
            </h1>
          </div>

          {/* Active Portrait Frame */}
          <div className="flex items-center gap-3 bg-[#131720]/80 p-2.5 rounded-lg border border-[#2D3139]">
            <div className="relative w-12 h-12 rounded bg-neutral-900 border border-[#C69C6D]/30 overflow-hidden shrink-0">
              {character.activePortrait && character.activePortrait.startsWith("http") ? (
                <img src={character.activePortrait} alt={character.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1A1D23] flex items-center justify-center font-bold text-lg text-[#C69C6D]">
                  M
                </div>
              )}
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none" />
            </div>
            <div className="min-w-0 font-mono text-left">
              <span className="text-[10px] text-[#8E9299] block font-bold tracking-wider">// TRANSCEIVER FEED</span>
              <span className="text-white font-bold text-xs truncate block">{character.name}</span>
              <span className="text-[9px] text-[#C69C6D] block font-bold">{character.rank}</span>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#8E9299]">HUNTER STATUS:</span>
              <span className="text-white font-bold">{character.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E9299]">CLASS:</span>
              <span className="text-[#E0E0E0] truncate max-w-[150px]">{character.class}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E9299]">RANK:</span>
              <span className="text-[#C69C6D] font-semibold">{character.rank}</span>
            </div>
            <div className="flex justify-between border-b border-[#2D3139] pb-2">
              <span className="text-[#8E9299]">CREDITS / BESKAR:</span>
              <span className="text-[#E0E0E0] font-bold">{credits} CR / {beskarIngots} Beskar</span>
            </div>
          </div>

          {/* Core Game Modes Selector Buttons */}
          <div className="space-y-1.5 font-mono">
            <span className="text-[10px] text-[#8E9299] uppercase tracking-widest block mb-2">Select Campaign Mode:</span>
            
            <button
              id="btn_mode_codex"
              onClick={onOpenCodex}
              className="w-full text-left p-3 rounded-lg border border-[#38bdf8]/30 hover:border-[#38bdf8] bg-[#1A1D23] hover:bg-[#252a33] text-[#E0E0E0] hover:text-[#38bdf8] transition-all text-xs font-bold uppercase flex items-center justify-between bg-gradient-to-r from-sky-950/10 to-[#1A1D23] cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#38bdf8] animate-pulse" />
                <span>Holo-API Codex</span>
              </span>
              <span className="text-[9px] text-[#38bdf8] bg-[#38bdf8]/15 border border-[#38bdf8]/30 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">API</span>
            </button>

            <button
              id="btn_mode_story"
              onClick={onOpenStory}
              className="w-full text-left p-3 rounded-lg border border-[#2D3139] hover:border-[#C69C6D] bg-[#1A1D23] hover:bg-[#252a33] text-[#E0E0E0] hover:text-[#C69C6D] transition-all text-xs font-bold uppercase flex items-center justify-between"
            >
              <span>Story Campaign Mode</span>
              <span className="text-[10px] text-[#C69C6D] bg-[#C69C6D]/10 border border-[#C69C6D]/20 px-1.5 py-0.5 rounded">Active</span>
            </button>

            <button
              id="btn_mode_card_battle"
              onClick={onOpenCardBattle}
              className="w-full text-left p-3 rounded-lg border border-[#C69C6D]/40 hover:border-[#C69C6D] bg-[#1C1611] hover:bg-[#2A2016] text-[#E0E0E0] hover:text-[#C69C6D] transition-all text-xs font-bold uppercase flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C69C6D] animate-pulse" />
                <span>Mando Card Battle</span>
              </span>
              <span className="text-[10px] text-[#C69C6D] bg-[#C69C6D]/15 border border-[#C69C6D]/30 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">SABACC</span>
            </button>

            <button
              id="btn_mode_mini_games"
              onClick={onOpenMiniGames}
              className="w-full text-left p-3 rounded-lg border border-[#2D3139] hover:border-[#C69C6D] bg-[#1A1D23] hover:bg-[#252a33] text-[#E0E0E0] hover:text-[#C69C6D] transition-all text-xs font-bold uppercase flex items-center justify-between"
            >
              <span>Play Datapad Mini Games</span>
              <span className="text-[10px] text-[#8E9299]">4 Games</span>
            </button>
            
            <button
              id="btn_mode_coop"
              onClick={handleToggleCoop}
              className={`w-full text-left p-3 rounded-lg border text-xs font-bold uppercase flex items-center justify-between transition-all ${
                coopActive
                  ? "border-[#C69C6D] bg-[#C69C6D]/10 text-[#C69C6D]"
                  : "border-[#2D3139] hover:border-[#C69C6D] bg-[#1A1D23] hover:bg-[#252a33] text-[#E0E0E0] hover:text-[#C69C6D]"
              }`}
            >
              <span>Local Offline Co-op Mode</span>
              <span className="text-[10px] text-[#8E9299]">{coopActive ? "On" : "Off"}</span>
            </button>
          </div>

          {/* Tactical Forge & Upgrades Shortcuts */}
          <div className="space-y-1.5 font-mono pt-2 border-t border-[#2D3139]">
            <span className="text-[10px] text-[#8E9299] uppercase tracking-widest block mb-2">Armor & Skills Forge:</span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                id="btn_nav_armor"
                onClick={onOpenArmor}
                className="p-2.5 rounded border border-[#2D3139] bg-[#1A1D23] text-center hover:border-[#C69C6D]/50 hover:text-[#C69C6D] transition-all"
              >
                ARMOR FORGE
              </button>
              <button
                id="btn_nav_skills"
                onClick={onOpenSkills}
                className="p-2.5 rounded border border-[#2D3139] bg-[#1A1D23] text-center hover:border-[#C69C6D]/50 hover:text-[#C69C6D] transition-all"
              >
                SKILLS TREE
              </button>
            </div>
          </div>

        </div>

        {/* Global Utilities footer section */}
        <div className="space-y-2 border-t border-[#2D3139] pt-4 font-mono text-[11px]">
          <button
            id="btn_nav_social"
            onClick={onOpenSocial}
            className="w-full flex items-center justify-between p-2 rounded hover:bg-[#1A1D23] text-[#8E9299] hover:text-[#E0E0E0] transition-all"
          >
            <span>Holonet Social & Messenger</span>
            <span className="text-[#C69C6D] font-bold">● LIVE</span>
          </button>
          
          <button
            id="btn_nav_saves"
            onClick={onOpenSaves}
            className="w-full flex items-center justify-between p-2 rounded hover:bg-[#1A1D23] text-[#8E9299] hover:text-[#E0E0E0] transition-all"
          >
            <span>Datapad Saves (.mando)</span>
            <span className="text-[#C69C6D]">Save/Load</span>
          </button>

          <button
            id="btn_nav_settings"
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between p-2 rounded hover:bg-[#1A1D23] text-[#8E9299] hover:text-[#E0E0E0] transition-all"
          >
            <span>Configure Core Systems</span>
            <span>Settings</span>
          </button>
        </div>

      </div>

      {/* 2. Middle Visual 2.5D Tactical Battlefield Canvas */}
      <div className="flex-1 flex flex-col justify-between p-4 relative overflow-hidden bg-[#0A0B0E]/80 border-r border-[#2D3139]">
        
        {/* Top planetary banner */}
        <div className="flex justify-between items-center bg-[#0D1016]/80 p-3 rounded-xl border border-[#2D3139] backdrop-blur shadow-md z-10">
          <div className="flex items-center gap-2">
            <Compass className="text-[#C69C6D] w-4 h-4" />
            <span className="text-xs font-bold font-mono tracking-wider">SECURE SECTOR COVERT ENCLAVE: {currentPlanet.toUpperCase()}</span>
          </div>
          <span className="text-[10px] font-mono text-green-500 bg-green-950/40 px-2 py-0.5 rounded border border-green-500/20">
            SECURE TRANSMISSION
          </span>
        </div>

        {/* 2.5D Battle Matrix Graphics viewport */}
        <div className="flex-1 my-4 bg-[#0D1016] rounded-xl border border-[#2D3139] relative flex items-center justify-center p-4 overflow-hidden shadow-inner">
          
          {/* Isometric grid decoration background */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#a1a1aa_1px,transparent_1px),linear-gradient(-45deg,#a1a1aa_1px,transparent_1px)] [background-size:40px_40px]" />
          
          {/* Battle Arena SVG */}
          <svg viewBox="0 0 320 200" className="w-full h-full max-w-[550px] aspect-video">
            
            {/* 2.5D ground elements (Desert rocks or platform depending on planet) */}
            <path d="M 20 150 L 300 150 L 260 190 L 60 190 Z" fill="#2e2e33" opacity="0.3" />
            <path d="M 50 110 L 270 110 L 300 150 L 20 150 Z" fill="#1f1f23" opacity="0.4" />

            {/* MANDO AND GROGU ACTIVE COMBATANTS TRACER */}
            <g id="combatant_mando" className="cursor-pointer">
              {/* Placement aura */}
              <ellipse cx="70" cy="140" rx="20" ry="8" fill="rgba(198,156,109,0.15)" stroke="#C69C6D" strokeWidth="1" />
              {/* Mando helmet sprite */}
              <circle cx="70" cy="115" r="10" fill="#a1a1aa" stroke="#52525b" strokeWidth="1.5" />
              <path d="M 68 110 L 72 110 L 70 118 L 70 124" stroke="#000000" strokeWidth="1" />
              <path d="M 65 125 L 75 125 L 80 145 L 60 145 Z" fill="#52525b" />
              {/* Cape */}
              <path d="M 60 125 L 56 142 L 64 145 Z" fill="#27272a" />
              {/* Jetpack burner */}
              <path d="M 58 130 L 56 135 L 58 135" stroke="#ef4444" strokeWidth="1" />
            </g>

            {/* GROGU FLOATING CRADLE */}
            <g id="combatant_grogu">
              <ellipse cx="40" cy="145" rx="14" ry="6" fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="0.5" />
              {/* Cradle sphere */}
              <ellipse cx="40" cy="130" rx="10" ry="8" fill="#e4e4e7" stroke="#a1a1aa" />
              <path d="M 30 130 L 50 130" stroke="#71717a" strokeWidth="1" />
              {/* Grogu ears & eyes */}
              <path d="M 33 125 L 25 122 L 34 127 Z" fill="#10b981" />
              <path d="M 47 125 L 55 122 L 46 127 Z" fill="#10b981" />
              <circle cx="40" cy="126" r="4" fill="#10b981" />
              <circle cx="39" cy="126" r="1" fill="#000" />
              <circle cx="41" cy="126" r="1" fill="#000" />
            </g>

            {/* COOP COMPANION COBB VANTH IF ENGAGED */}
            {coopActive && (
              <g id="combatant_coop">
                <ellipse cx="100" cy="155" rx="18" ry="7" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="1" />
                {saveData.summonedCompanion?.portrait ? (
                  <g>
                    <clipPath id="clip-coop-hologram">
                      <circle cx="100" cy="130" r="14" />
                    </clipPath>
                    <circle cx="100" cy="130" r="15" fill="none" stroke="#38bdf8" strokeWidth="1" className="animate-pulse" />
                    <image 
                      href={saveData.summonedCompanion.portrait} 
                      x="86" 
                      y="116" 
                      width="28" 
                      height="28" 
                      clipPath="url(#clip-coop-hologram)"
                      referrerPolicy="no-referrer"
                    />
                  </g>
                ) : (
                  <g>
                    <circle cx="100" cy="130" r="9" fill="#15803d" />
                    <path d="M 95 139 L 105 139 L 108 158 L 92 158 Z" fill="#b45309" />
                  </g>
                )}
              </g>
            )}

            {/* ENEMY TARGETS GROUP */}
            {enemies.map((enemy) => {
              if (enemy.hp <= 0) return null;
              const isSelected = selectedEnemyId === enemy.id;

              return (
                <g
                  id={`sprite_enemy_${enemy.id}`}
                  key={enemy.id}
                  onClick={() => { StarWarsSoundEngine.playClick(); setSelectedEnemyId(enemy.id); }}
                  className="cursor-pointer group"
                >
                  {/* Selector Target Reticle */}
                  {isSelected && (
                    <g>
                      <ellipse cx={enemy.x} cy={enemy.y + 35} rx="24" ry="9" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
                      <path d={`M ${enemy.x - 28} ${enemy.y + 35} L ${enemy.x - 22} ${enemy.y + 35}`} stroke="#ef4444" strokeWidth="2" />
                      <path d={`M ${enemy.x + 22} ${enemy.y + 35} L ${enemy.x + 28} ${enemy.y + 35}`} stroke="#ef4444" strokeWidth="2" />
                    </g>
                  )}

                  {/* Standard placement floor ring */}
                  <ellipse cx={enemy.x} cy={enemy.y + 35} rx="16" ry="6" fill="rgba(239,68,68,0.05)" stroke="#7f1d1d" strokeWidth="0.5" />

                  {/* Enemy bodies depending on type */}
                  {enemy.portrait && enemy.portrait.startsWith("http") ? (
                    <g>
                      <clipPath id={`clip-enemy-${enemy.id}`}>
                        <circle cx={enemy.x} cy={enemy.y + 12} r="14" />
                      </clipPath>
                      {/* Outer Hologram border ring */}
                      <circle cx={enemy.x} cy={enemy.y + 12} r="15" fill="none" stroke="#dc2626" strokeWidth="1" className="animate-pulse" />
                      <image 
                        href={enemy.portrait} 
                        x={enemy.x - 14} 
                        y={enemy.y - 2} 
                        width="28" 
                        height="28" 
                        clipPath={`url(#clip-enemy-${enemy.id})`}
                        referrerPolicy="no-referrer"
                      />
                    </g>
                  ) : enemy.portrait === "Moff Gideon" ? (
                    <g>
                      {/* Black armor and cape */}
                      <path d={`M ${enemy.x - 10} ${enemy.y + 10} L ${enemy.x + 10} ${enemy.y + 10} L ${enemy.x + 12} ${enemy.y + 35} L ${enemy.x - 12} ${enemy.y + 35} Z`} fill="#18181b" />
                      {/* Darksaber glowing blade */}
                      <path d={`M ${enemy.x - 12} ${enemy.y + 25} L ${enemy.x - 25} ${enemy.y - 10} L ${enemy.x - 22} ${enemy.y - 10} Z`} fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
                      {/* Head */}
                      <circle cx={enemy.x} cy={enemy.y} r="8" fill="#18181b" stroke="#dc2626" strokeWidth="1" />
                    </g>
                  ) : enemy.portrait === "Dark Trooper" ? (
                    <g>
                      <path d={`M ${enemy.x - 9} ${enemy.y + 10} L ${enemy.x + 9} ${enemy.y + 10} L ${enemy.x + 10} ${enemy.y + 35} L ${enemy.x - 10} ${enemy.y + 35} Z`} fill="#27272a" />
                      <circle cx={enemy.x} cy={enemy.y} r="7" fill="#18181b" />
                      {/* Red glowing visor */}
                      <line x1={enemy.x - 4} y1={enemy.y - 1} x2={enemy.x + 4} y2={enemy.y - 1} stroke="#ef4444" strokeWidth="1.5" />
                    </g>
                  ) : (
                    <g>
                      {/* White stormtrooper plate */}
                      <path d={`M ${enemy.x - 8} ${enemy.y + 10} L ${enemy.x + 8} ${enemy.y + 10} L ${enemy.x + 9} ${enemy.y + 35} L ${enemy.x - 9} ${enemy.y + 35} Z`} fill="#f4f4f5" />
                      <circle cx={enemy.x} cy={enemy.y} r="6" fill="#f4f4f5" stroke="#000" strokeWidth="0.5" />
                      <line x1={enemy.x - 3} y1={enemy.y + 1} x2={enemy.x + 3} y2={enemy.y + 1} stroke="#000" strokeWidth="1" />
                    </g>
                  )}

                  {/* HP & Shield floating micro-bar */}
                  <g transform={`translate(${enemy.x - 20}, ${enemy.y - 18})`}>
                    <rect x="0" y="0" width="40" height="4" fill="#3f3f46" rx="1" />
                    <rect x="0" y="0" width={(enemy.hp / enemy.maxHp) * 40} height="4" fill="#ef4444" rx="1" />
                    {enemy.shield > 0 && (
                      <rect x="0" y="-3" width={(enemy.shield / enemy.maxShield) * 40} height="2" fill="#38bdf8" rx="0.5" />
                    )}
                  </g>
                </g>
              );
            })}

            {/* Visual Laser bolt laser tracing beams */}
            {laserBolt && laserBolt.active && (
              <line 
                x1={laserBolt.x1} 
                y1={laserBolt.y1} 
                x2={laserBolt.x2} 
                y2={laserBolt.y2} 
                stroke="#ef4444" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                className="animate-pulse"
              />
            )}

            {/* ADVANCED VFX LAYER - SHIELD FLASHES */}
            {shieldFlash && shieldFlash.active && (
              <g>
                <circle
                  cx={shieldFlash.x}
                  cy={shieldFlash.y}
                  r="22"
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeDasharray="4,4"
                  className="animate-ping"
                  opacity="0.85"
                />
                <circle
                  cx={shieldFlash.x}
                  cy={shieldFlash.y}
                  r="24"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              </g>
            )}

            {/* ADVANCED VFX LAYER - FORCE RIPPLE */}
            {forceRipple && forceRipple.active && (
              <g>
                <circle
                  cx={forceRipple.x}
                  cy={forceRipple.y}
                  r="45"
                  fill="none"
                  stroke={forceRipple.color}
                  strokeWidth="4"
                  className="animate-ping"
                  opacity="0.8"
                />
                <circle
                  cx={forceRipple.x}
                  cy={forceRipple.y}
                  r="25"
                  fill="none"
                  stroke={forceRipple.color}
                  strokeWidth="2"
                  className="animate-pulse"
                  opacity="0.5"
                />
              </g>
            )}

            {/* ADVANCED VFX LAYER - EXPLOSION PARTICLE BURSTS */}
            {explosionFlash && explosionFlash.active && (
              <g>
                <circle
                  cx={explosionFlash.x}
                  cy={explosionFlash.y}
                  r="18"
                  fill="rgba(249, 115, 22, 0.4)"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  className="animate-ping"
                  opacity="0.9"
                />
                {/* Visual fire spark line clusters */}
                <line x1={explosionFlash.x - 14} y1={explosionFlash.y - 14} x2={explosionFlash.x + 14} y2={explosionFlash.y + 14} stroke="#f97316" strokeWidth="2" />
                <line x1={explosionFlash.x + 14} y1={explosionFlash.y - 14} x2={explosionFlash.x - 14} y2={explosionFlash.y + 14} stroke="#f97316" strokeWidth="2" />
                <line x1={explosionFlash.x} y1={explosionFlash.y - 18} x2={explosionFlash.x} y2={explosionFlash.y + 18} stroke="#eab308" strokeWidth="1.5" />
                <line x1={explosionFlash.x - 18} y1={explosionFlash.y} x2={explosionFlash.x + 18} y2={explosionFlash.y} stroke="#eab308" strokeWidth="1.5" />
              </g>
            )}

            {/* Visual Floating Damage numbers text */}
            {floatingTexts.map(f => (
              <text
                key={f.id}
                x={f.x}
                y={f.y}
                fill="#f43f5e"
                fontSize="10"
                fontWeight="extrabold"
                fontFamily="monospace"
                textAnchor="middle"
                className="animate-float-up-fade"
              >
                {f.text}
              </text>
            ))}

          </svg>

          {/* Turn Alert Overlay Indicator */}
          <div className="absolute top-2 left-2 bg-[#0A0B0E]/85 text-[#C69C6D] border border-[#2D3139] font-mono text-[10px] px-3 py-1 rounded-lg">
            TURN PHASE: <span className="font-bold uppercase text-[#E0E0E0]">{currentTurn === "player" ? "Your Move" : currentTurn === "coop" ? "Companion Cobb Move" : "Enemy Fire"}</span>
          </div>

          {/* Target details box overlay */}
          {enemies.find(e => e.id === selectedEnemyId) && (
            <div className="absolute top-2 right-2 bg-[#0A0B0E]/90 text-[#E0E0E0] border border-[#2D3139] p-2.5 rounded-lg text-[10px] font-mono space-y-1">
              <span className="text-rose-500 font-bold block">TARGET MATRIX:</span>
              <span>Name: {enemies.find(e => e.id === selectedEnemyId)?.name}</span>
              <span>HP: {enemies.find(e => e.id === selectedEnemyId)?.hp} / {enemies.find(e => e.id === selectedEnemyId)?.maxHp}</span>
              <span className="text-sky-400 block font-bold">Weakness: Thermal-Explosive</span>
            </div>
          )}
        </div>

        {/* Action Panel Controllers */}
        <div className="bg-[#0D1016] rounded-xl border border-[#2D3139] p-4 space-y-4 shadow-md z-10">
          
          {/* Action Queue and skill triggers */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-2">
              <span className="text-[10px] font-mono text-[#8E9299] uppercase tracking-widest block font-bold">Choose Strategic Action Skill:</span>
              
              <div className="grid grid-cols-2 gap-2 font-mono">
                <button
                  id="btn_skill_blaster"
                  disabled={currentTurn !== "player"}
                  onClick={() => handleAttack("blaster")}
                  className="p-3 bg-[#1A1D23] border border-[#2D3139] hover:border-[#C69C6D]/50 rounded-lg text-xs font-semibold hover:text-[#C69C6D] flex items-center justify-between transition-all"
                >
                  <span>Amban Blaster Strike</span>
                  <Zap className="w-3.5 h-3.5 text-[#C69C6D]" />
                </button>

                <button
                  id="btn_skill_birds"
                  disabled={currentTurn !== "player"}
                  onClick={() => handleAttack("birds")}
                  className="p-3 bg-[#1A1D23] border border-[#2D3139] hover:border-[#C69C6D]/50 rounded-lg text-xs font-semibold hover:text-[#C69C6D] flex items-center justify-between transition-all"
                >
                  <span>Whistling Birds Strike</span>
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                </button>

                <button
                  id="btn_skill_carbonite"
                  disabled={currentTurn !== "player"}
                  onClick={() => handleAttack("carbonite")}
                  className="p-3 bg-[#1A1D23] border border-[#2D3139] hover:border-[#C69C6D]/50 rounded-lg text-xs font-semibold hover:text-[#C69C6D] flex items-center justify-between transition-all"
                >
                  <span>Carbonite Mist Spray</span>
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                </button>

                <button
                  id="btn_skill_force"
                  disabled={currentTurn !== "player"}
                  onClick={() => handleAttack("force")}
                  className="p-3 bg-[#1A1D23] border border-[#C69C6D]/30 hover:border-[#C69C6D] rounded-lg text-xs font-bold hover:text-[#C69C6D] flex items-center justify-between transition-all bg-gradient-to-r from-emerald-950/5 to-[#1A1D23]"
                >
                  <span>Mando-Grogu Team-up</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                </button>
              </div>

              {/* Local co-op action button */}
              {coopActive && (
                <div className="pt-2 border-t border-[#2D3139]">
                  <button
                    id="btn_coop_action"
                    disabled={currentTurn !== "coop"}
                    onClick={handleCoopAttack}
                    className="w-full p-2 bg-sky-950/20 border border-sky-500/30 hover:border-sky-500/80 text-sky-400 rounded-lg text-xs font-bold font-mono transition-all uppercase"
                  >
                    Companion Cobb Vanth Action turn
                  </button>
                </div>
              )}
            </div>

            {/* Battle logs queue */}
            <div className="w-full sm:w-60 bg-[#1A1D23] border border-[#2D3139] rounded-lg p-3 flex flex-col justify-between shrink-0">
              <span className="text-[9px] font-mono text-[#8E9299] uppercase tracking-widest block mb-2 border-b border-[#2D3139] pb-1 font-bold">COGNITIVE ACTION LOG</span>
              
              <div className="h-20 max-h-20 overflow-y-auto space-y-1.5 text-[9px] font-mono text-[#8E9299] pr-1">
                {battleLogs.map((log, idx) => (
                  <div key={idx} className={`break-words whitespace-normal ${idx === 0 ? "text-[#C69C6D] font-bold" : ""}`}>
                    &gt; {log}
                  </div>
                ))}
              </div>

              {!battleActive && (
                <button
                  id="btn_restart_battle"
                  onClick={handleResetBattle}
                  className="w-full mt-2 py-1.5 border-2 border-[#C69C6D] hover:bg-[#C69C6D] text-[#C69C6D] hover:text-black font-mono font-bold text-xs rounded transition-all duration-300"
                >
                  RE-ENGAGE AMBUSH SQUAD
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Right Status & Device Metrics (HUD Panel) */}
      <div className="w-full lg:w-72 bg-[#0D1016] border-l border-[#2D3139] p-4 flex flex-col justify-between text-xs font-mono shrink-0">
        <div className="space-y-4">
          <span className="text-[#C69C6D] font-bold tracking-widest block mb-3 uppercase border-b border-[#2D3139] pb-1.5 flex items-center gap-1">
            <Info className="w-4 h-4" /> HUD MONITORING
          </span>

          {/* Dynamic player stats indicators */}
          <div className="space-y-3 bg-[#1A1D23] p-3 rounded-lg border border-[#2D3139]">
            <span className="text-[10px] text-[#8E9299] uppercase font-bold">MANDO COMBAT SYSTEM STATUS:</span>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8E9299]">VITALS (HP):</span>
                <span className="text-[#E0E0E0]">{character.stats.hp} / {character.stats.maxHp}</span>
              </div>
              <div className="h-2 bg-[#0A0B0E] rounded-full overflow-hidden">
                <div style={{ width: `${(character.stats.hp / character.stats.maxHp) * 100}%` }} className="h-full bg-emerald-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8E9299]">BESKAR PLATES (SHIELD):</span>
                <span className="text-[#E0E0E0]">{character.stats.shield} / {character.stats.maxShield}</span>
              </div>
              <div className="h-2 bg-[#0A0B0E] rounded-full overflow-hidden">
                <div style={{ width: `${(character.stats.shield / character.stats.maxShield) * 100}%` }} className="h-full bg-sky-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8E9299]">FORCE CHANNELS (ENERGY):</span>
                <span className="text-[#E0E0E0]">{character.stats.energy} / {character.stats.maxEnergy}</span>
              </div>
              <div className="h-2 bg-[#0A0B0E] rounded-full overflow-hidden">
                <div style={{ width: `${(character.stats.energy / character.stats.maxEnergy) * 100}%` }} className="h-full bg-purple-500" />
              </div>
            </div>
          </div>

          {/* Device matrix details */}
          <div className="space-y-2 bg-[#1A1D23] p-3 rounded-lg border border-[#2D3139] text-[10px]">
            <span className="text-[10px] text-[#8E9299] uppercase font-bold">HARDWARE MATRICES DETECTED:</span>
            
            <div className="flex justify-between border-b border-[#2D3139]/40 py-1">
              <span className="text-[#8E9299]">CPU Architecture:</span>
              <span className="text-[#E0E0E0]">{deviceStats.cpu}</span>
            </div>
            <div className="flex justify-between border-b border-[#2D3139]/40 py-1">
              <span className="text-[#8E9299]">GPU Device:</span>
              <span className="text-[#E0E0E0]">{deviceStats.gpu}</span>
            </div>
            <div className="flex justify-between border-b border-[#2D3139]/40 py-1">
              <span className="text-[#8E9299]">Touchscreen Sensors:</span>
              <span className="text-[#E0E0E0]">{deviceStats.touchScreen ? "ACTIVE SENSORS" : "OFFLINE"}</span>
            </div>
            <div className="flex justify-between border-b border-[#2D3139]/40 py-1">
              <span className="text-[#8E9299]">Device Screen:</span>
              <span className="text-[#E0E0E0]">{deviceStats.orientation}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#8E9299]">Transmission Latency:</span>
              <span className="text-green-400 font-bold">{deviceStats.ping}ms (Optimal)</span>
            </div>
          </div>

        </div>

        {/* Quick controls mapper tip */}
        <div className="bg-[#1A1D23]/60 p-3 rounded-lg border border-[#2D3139]/40 text-[9px] text-[#8E9299] leading-relaxed text-center">
          <span>HARDWARE ASSIGNMENTS:</span>
          <p className="mt-1">W-S-A-D coordinates movement targets. Click on-screen elements directly if virtual joystick is active.</p>
        </div>

      </div>

      </div>

      {/* Elegant bottom footer bar with User and Streamlabs links */}
      <div className="h-9 shrink-0 bg-[#07090C] border-t border-[#2D3139]/80 px-4 flex items-center justify-between text-[10px] font-mono text-[#8E9299] z-10">
        <div className="flex items-center gap-1.5 select-none">
          <span className="text-[#8E9299]/60 tracking-wider">SECURE LINK ESTABLISHED // MADE BY</span>
          <span className="text-[#C69C6D] font-extrabold tracking-widest uppercase hover:text-[#e4b57d] transition-colors">USAGYUUN VTUBER</span>
        </div>
        <div className="flex items-center">
          <a 
            id="tip_cookie_link"
            href="https://streamlabs.com/usagyuunvtuber/tip" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#C69C6D] hover:text-[#e4b57d] font-bold flex items-center gap-1.5 bg-[#C69C6D]/10 hover:bg-[#C69C6D]/20 px-3 py-1 rounded border border-[#C69C6D]/30 transition-all uppercase text-[9px] tracking-widest hover:scale-105 active:scale-95 duration-150"
          >
            <span>🍪 BUY ME A COOKIE</span>
          </a>
        </div>
      </div>

    </div>
  );
};
