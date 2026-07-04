/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SaveData, GameCharacter, CharacterClass, GameRank } from "../types";
import { StarWarsSoundEngine } from "../utils";
import { 
  X, Shield, Swords, Sparkles, RefreshCw, Zap, Award, Layers, 
  HelpCircle, ChevronRight, Play, CheckCircle, Info, Image as ImageIcon, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CardBattleModeProps {
  saveData: SaveData;
  onUpdateSave: (data: SaveData) => void;
  onClose: () => void;
}

// Image APIs list
type ImageApiType = "picsum" | "unsplash" | "procedural" | "blueprint";

interface Card {
  id: string;
  name: string;
  cost: number;
  type: "attack" | "defend" | "force" | "tactical";
  value: number;
  description: string;
  unsplashId: string;
  picsumSeed: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  specialEffect?: string;
}

interface Opponent {
  id: string;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  rewardCredits: number;
  rewardBeskar: number;
  image: string;
  color: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Legendary";
  aiDeck: Omit<Card, "id">[];
}

const ALL_STAR_CARDS: Omit<Card, "id">[] = [
  {
    name: "Din's Amban Rifle",
    cost: 2,
    type: "attack",
    value: 24,
    description: "Fires a vaporizing disruptor charge. Pierces 50% of enemy shields.",
    unsplashId: "photo-1579546929518-9e396f3cc809",
    picsumSeed: "amban",
    rarity: "rare",
    specialEffect: "pierce"
  },
  {
    name: "Grogu's Force Barrier",
    cost: 2,
    type: "defend",
    value: 20,
    description: "Grogu raises his hands to absorb kinetic blasts. Heals 5 HP.",
    unsplashId: "photo-1618005182384-a83a8bd57fbe",
    picsumSeed: "forcebarrier",
    rarity: "rare",
    specialEffect: "heal_5"
  },
  {
    name: "Whistling Birds",
    cost: 1,
    type: "attack",
    value: 12,
    description: "Launches a flurry of micro-missiles. Draws 1 card.",
    unsplashId: "photo-1531297484001-80022131f5a1",
    picsumSeed: "whistling",
    rarity: "uncommon",
    specialEffect: "draw_1"
  },
  {
    name: "Beskar Chestplate",
    cost: 1,
    type: "defend",
    value: 14,
    description: "Interlocks the legendary metal. Provides robust defense.",
    unsplashId: "photo-1607604276583-eef5d076aa5f",
    picsumSeed: "chestplate",
    rarity: "common"
  },
  {
    name: "Boba's Flame Projector",
    cost: 2,
    type: "attack",
    value: 18,
    description: "Roasts the target. Discards 1 random card to gain +4 attack on next card.",
    unsplashId: "photo-1509198397868-475647b2a1e5",
    picsumSeed: "flamer",
    rarity: "uncommon",
    specialEffect: "burn"
  },
  {
    name: "Jetpack Maneuver",
    cost: 1,
    type: "tactical",
    value: 8,
    description: "Launch vertically. Gain 8 Shield and draw 1 card.",
    unsplashId: "photo-1451187580459-43490279c0fa",
    picsumSeed: "jetpack",
    rarity: "uncommon",
    specialEffect: "draw_1"
  },
  {
    name: "Grogu Force Slumber",
    cost: 3,
    type: "force",
    value: 35,
    description: "A high-tier Force blast that stuns. Opponent loses next action.",
    unsplashId: "photo-1544005313-94ddf0286df2",
    picsumSeed: "forceblast",
    rarity: "legendary",
    specialEffect: "stun"
  },
  {
    name: "Vibroblade Flurry",
    cost: 1,
    type: "attack",
    value: 10,
    description: "Rapid slashing. Low cost high rate offensive action.",
    unsplashId: "photo-1581092580497-e0d23cbdf1dc",
    picsumSeed: "vibro",
    rarity: "common"
  },
  {
    name: "Bounty Puck Intel",
    cost: 0,
    type: "tactical",
    value: 2,
    description: "Analyze tracks. Gain +2 energy this turn.",
    unsplashId: "photo-1526374965328-7f61d4dc18c5",
    picsumSeed: "puck",
    rarity: "uncommon",
    specialEffect: "energy_2"
  },
  {
    name: "Darksaber Resolve",
    cost: 3,
    type: "force",
    value: 40,
    description: "Pure Mandalorian leadership. Deals 40 damage. Inflicts shield disruption.",
    unsplashId: "photo-1563089145-599997674d42",
    picsumSeed: "darksaber",
    rarity: "legendary"
  },
  {
    name: "Bacta Injection",
    cost: 1,
    type: "tactical",
    value: 15,
    description: "Adrenaline patch. Heals 15 HP.",
    unsplashId: "photo-1584515979956-d9f6e5d09982",
    picsumSeed: "bacta",
    rarity: "common",
    specialEffect: "heal"
  }
];

const OPPONENTS: Opponent[] = [
  {
    id: "scout",
    name: "Scout Trooper Remnant",
    title: "Outer Rim Outpost Deserter",
    hp: 60,
    maxHp: 60,
    shield: 15,
    maxShield: 15,
    rewardCredits: 500,
    rewardBeskar: 1,
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=300&q=80",
    color: "#a1a1aa",
    difficulty: "Easy",
    aiDeck: [
      { name: "Scout Pistol", cost: 1, type: "attack", value: 10, description: "", unsplashId: "", picsumSeed: "scout1", rarity: "common" },
      { name: "Scout Armor Shield", cost: 1, type: "defend", value: 10, description: "", unsplashId: "", picsumSeed: "scout2", rarity: "common" },
      { name: "Thermal Grenade", cost: 2, type: "attack", value: 18, description: "", unsplashId: "", picsumSeed: "scout3", rarity: "uncommon" }
    ]
  },
  {
    id: "fennec",
    name: "Fennec Shand",
    title: "Master Mercenary Assassin",
    hp: 95,
    maxHp: 95,
    shield: 25,
    maxShield: 25,
    rewardCredits: 1200,
    rewardBeskar: 2,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80",
    color: "#f97316",
    difficulty: "Medium",
    aiDeck: [
      { name: "MK Sniper Bolt", cost: 2, type: "attack", value: 20, description: "", unsplashId: "", picsumSeed: "sniper", rarity: "rare" },
      { name: "Infiltration Dodge", cost: 1, type: "defend", value: 15, description: "", unsplashId: "", picsumSeed: "dodge", rarity: "uncommon" },
      { name: "Poison Throwing Knife", cost: 1, type: "attack", value: 12, description: "", unsplashId: "", picsumSeed: "knife", rarity: "common" }
    ]
  },
  {
    id: "gideon",
    name: "Moff Gideon",
    title: "Imperial remnants Commander",
    hp: 135,
    maxHp: 135,
    shield: 45,
    maxShield: 45,
    rewardCredits: 2500,
    rewardBeskar: 4,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80",
    color: "#ef4444",
    difficulty: "Hard",
    aiDeck: [
      { name: "Darksaber Sweep", cost: 3, type: "attack", value: 30, description: "", unsplashId: "", picsumSeed: "ds", rarity: "legendary" },
      { name: "Reinforcements Barricade", cost: 2, type: "defend", value: 22, description: "", unsplashId: "", picsumSeed: "barricade", rarity: "rare" },
      { name: "E-Web Blaster Suppression", cost: 1, type: "attack", value: 14, description: "", unsplashId: "", picsumSeed: "eweb", rarity: "uncommon" }
    ]
  },
  {
    id: "boba",
    name: "Boba Fett",
    title: "Daimyo of Tatooine",
    hp: 180,
    maxHp: 180,
    shield: 60,
    maxShield: 60,
    rewardCredits: 5000,
    rewardBeskar: 8,
    image: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=300&q=80",
    color: "#16a34a",
    difficulty: "Legendary",
    aiDeck: [
      { name: "EE-3 Carbine Burst", cost: 2, type: "attack", value: 24, description: "", unsplashId: "", picsumSeed: "ee3", rarity: "rare" },
      { name: "Knee-pad Rocket", cost: 1, type: "attack", value: 15, description: "", unsplashId: "", picsumSeed: "knee", rarity: "uncommon" },
      { name: "Beskar Defiance Shield", cost: 2, type: "defend", value: 28, description: "", unsplashId: "", picsumSeed: "bdef", rarity: "rare" },
      { name: "Jetpack Seeker Missile", cost: 3, type: "attack", value: 38, description: "", unsplashId: "", picsumSeed: "seek", rarity: "legendary" }
    ]
  }
];

export const CardBattleMode: React.FC<CardBattleModeProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  // Config & Customization State
  const [activeImageApi, setActiveImageApi] = useState<ImageApiType>("procedural");
  const [isLobby, setIsLobby] = useState(true);
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent>(OPPONENTS[0]);

  // Battle State
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [playerShield, setPlayerShield] = useState(0);
  const [playerMaxShield] = useState(50);
  const [playerEnergy, setPlayerEnergy] = useState(3);
  const [playerMaxEnergy, setPlayerMaxEnergy] = useState(3);

  const [opponentHp, setOpponentHp] = useState(60);
  const [opponentMaxHp, setOpponentMaxHp] = useState(60);
  const [opponentShield, setOpponentShield] = useState(15);
  const [opponentMaxShield, setOpponentMaxShield] = useState(15);

  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [discard, setDiscard] = useState<Card[]>([]);

  const [currentTurn, setCurrentTurn] = useState<"player" | "opponent">("player");
  const [gameResult, setGameResult] = useState<"victory" | "defeat" | null>(null);
  
  // Intelligence System (Telegraphed Opponent Action)
  const [nextOpponentAction, setNextOpponentAction] = useState<Omit<Card, "id"> | null>(null);
  const [isStunned, setIsStunned] = useState(false);
  const [isOpponentStunned, setIsOpponentStunned] = useState(false);

  // VFX State Hooks
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [floatingDamage, setFloatingDamage] = useState<{ id: number; text: string; isPlayer: boolean; color: string }[]>([]);

  // Sound triggering helper
  const playSound = (type: "click" | "draw" | "attack" | "shield" | "force" | "tactical" | "victory" | "defeat") => {
    switch(type) {
      case "click":
        StarWarsSoundEngine.playClick();
        break;
      case "draw":
        StarWarsSoundEngine.playClick();
        break;
      case "attack":
        StarWarsSoundEngine.playBlaster();
        break;
      case "shield":
        StarWarsSoundEngine.playShieldAbsorb();
        break;
      case "force":
        StarWarsSoundEngine.playForceLightning();
        break;
      case "tactical":
        StarWarsSoundEngine.playJetpack();
        break;
      case "victory":
        StarWarsSoundEngine.playLevelUp();
        break;
      case "defeat":
        StarWarsSoundEngine.playExplosion();
        break;
    }
  };

  // Add a combat log entry
  const addLog = (log: string) => {
    setCombatLogs(prev => [log, ...prev].slice(0, 15));
  };

  // Spawn visual floating damage/healing popup
  const triggerPopup = (text: string, isPlayer: boolean, color: string = "text-red-500") => {
    const id = Date.now() + Math.random();
    setFloatingDamage(prev => [...prev, { id, text, isPlayer, color }]);
    setTimeout(() => {
      setFloatingDamage(prev => prev.filter(p => p.id !== id));
    }, 1200);
  };

  // Initialize and launch a card duel
  const handleStartDuel = (opponent: Opponent) => {
    playSound("click");
    setSelectedOpponent(opponent);
    setOpponentHp(opponent.hp);
    setOpponentMaxHp(opponent.hp);
    setOpponentShield(opponent.shield);
    setOpponentMaxShield(opponent.maxShield);

    // Sync player health with main character stats to make it feel full-stack and integrated
    const pMaxHp = saveData.character.stats.maxHp || 100;
    setPlayerHp(saveData.character.stats.hp || pMaxHp);
    setPlayerMaxHp(pMaxHp);
    setPlayerShield(20); // Initial tactical barrier
    setPlayerEnergy(3);
    setPlayerMaxEnergy(3);

    // Build unique deck
    const initialDeck: Card[] = [];
    // 3 copies of basic cards, 1 copy of rares/legendaries
    ALL_STAR_CARDS.forEach((card, index) => {
      const count = card.rarity === "common" ? 3 : card.rarity === "uncommon" ? 2 : 1;
      for (let i = 0; i < count; i++) {
        initialDeck.push({
          ...card,
          id: `card_${index}_${i}`
        });
      }
    });

    // Shuffle deck
    const shuffled = [...initialDeck].sort(() => Math.random() - 0.5);
    const initialHand = shuffled.slice(0, 5);
    const remainingDeck = shuffled.slice(5);

    setDeck(remainingDeck);
    setHand(initialHand);
    setDiscard([]);
    setCurrentTurn("player");
    setGameResult(null);
    setIsStunned(false);
    setIsOpponentStunned(false);
    setIsLobby(false);
    setCombatLogs([]);

    // Select first opponent telegraphed action
    const randomAction = opponent.aiDeck[Math.floor(Math.random() * opponent.aiDeck.length)];
    setNextOpponentAction(randomAction);

    addLog(`✨ Tactical Datapad Ready. Hologram Card duel against ${opponent.name} initialized.`);
    addLog(`💬 ${opponent.name}: "Draw your cards, hunter. Let's see what you're made of."`);
  };

  // Draw card mechanics
  const drawCards = (count: number, currentHand: Card[], currentDeck: Card[], currentDiscard: Card[]) => {
    let tempHand = [...currentHand];
    let tempDeck = [...currentDeck];
    let tempDiscard = [...currentDiscard];

    for (let i = 0; i < count; i++) {
      if (tempHand.length >= 7) {
        addLog("⚠️ Hand capacity reached (Max 7 cards). Cannot draw more.");
        break;
      }
      if (tempDeck.length === 0) {
        if (tempDiscard.length === 0) {
          addLog("⚠️ Deck and Discard piles are fully empty!");
          break;
        }
        // Reshuffle discard back to deck
        tempDeck = [...tempDiscard].sort(() => Math.random() - 0.5);
        tempDiscard = [];
        addLog("🔄 Out of ammo! Reshuffling discard chamber back into the deck pile.");
        playSound("draw");
      }
      const drawnCard = tempDeck.shift();
      if (drawnCard) {
        tempHand.push(drawnCard);
      }
    }

    setHand(tempHand);
    setDeck(tempDeck);
    setDiscard(tempDiscard);
  };

  // Play a chosen card
  const handlePlayCard = (card: Card) => {
    if (currentTurn !== "player" || gameResult) return;
    if (playerEnergy < card.cost) {
      playSound("click");
      addLog("⚠️ Insufficient energy cells!");
      return;
    }

    // Play Card SFX and deduct energy
    playSound(card.type === "defend" ? "shield" : card.type);
    setPlayerEnergy(prev => prev - card.cost);

    // Apply Card action values
    let damageDealt = 0;
    let shieldGained = 0;
    let hpHealed = 0;

    if (card.type === "attack") {
      damageDealt = card.value;
      
      // Calculate shield pierce effects
      let actualDmg = damageDealt;
      if (card.specialEffect === "pierce" && opponentShield > 0) {
        const pierceAmount = Math.floor(opponentShield * 0.5);
        setOpponentShield(prev => Math.max(0, prev - (opponentShield - pierceAmount)));
        actualDmg = damageDealt - pierceAmount;
      }

      let shieldAbsorb = Math.min(opponentShield, actualDmg);
      if (shieldAbsorb > 0) {
        setOpponentShield(prev => prev - shieldAbsorb);
        triggerPopup(`-${shieldAbsorb} Shield`, false, "text-sky-400");
        actualDmg -= shieldAbsorb;
      }

      if (actualDmg > 0) {
        setOpponentHp(prev => Math.max(0, prev - actualDmg));
        triggerPopup(`-${actualDmg} HP`, false, "text-red-500");
      }

      addLog(`⚔️ You played ${card.name}, dealing ${damageDealt} impact damage.`);
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 300);

    } else if (card.type === "defend") {
      shieldGained = card.value;
      setPlayerShield(prev => Math.min(playerMaxShield, prev + shieldGained));
      triggerPopup(`+${shieldGained} Shield`, true, "text-sky-400");
      addLog(`🛡️ You deployed ${card.name}, generating +${shieldGained} defensive barrier.`);

      // Extra special effect check
      if (card.specialEffect === "heal_5") {
        setPlayerHp(prev => Math.min(playerMaxHp, prev + 5));
        triggerPopup(`+5 HP`, true, "text-emerald-400");
      }

    } else if (card.type === "force" || card.type === "tactical") {
      if (card.type === "force") {
        damageDealt = card.value;
        let shieldAbsorb = Math.min(opponentShield, damageDealt);
        if (shieldAbsorb > 0) {
          setOpponentShield(prev => prev - shieldAbsorb);
          triggerPopup(`-${shieldAbsorb} Shield`, false, "text-sky-400");
          damageDealt -= shieldAbsorb;
        }
        if (damageDealt > 0) {
          setOpponentHp(prev => Math.max(0, prev - damageDealt));
          triggerPopup(`-${damageDealt} HP`, false, "text-red-500");
        }
        addLog(`⚡ You channled ${card.name}, dealing ${card.value} Force-Crush damage.`);
      }

      // Check Special Force & Tactical Effects
      if (card.specialEffect === "stun") {
        setIsOpponentStunned(true);
        addLog("🌀 Opponent STUNNED! They are temporarily frozen in carbonite.");
        triggerPopup("STUNNED!", false, "text-indigo-400 font-bold");
      } else if (card.specialEffect === "energy_2") {
        setPlayerEnergy(prev => prev + 2);
        triggerPopup("+2 Energy", true, "text-amber-400");
      } else if (card.specialEffect === "heal") {
        hpHealed = card.value;
        setPlayerHp(prev => Math.min(playerMaxHp, prev + hpHealed));
        triggerPopup(`+${hpHealed} HP`, true, "text-emerald-400");
        addLog(`🩹 You applied ${card.name}, recovering ${hpHealed} structural HP.`);
      } else if (card.specialEffect === "burn") {
        addLog("🔥 Flaming status applied! Next card attack receives fury modifier.");
      }
    }

    // Special card drawing modifiers
    if (card.specialEffect === "draw_1") {
      const nextHand = hand.filter(c => c.id !== card.id);
      drawCards(1, nextHand, deck, [...discard, card]);
    } else {
      // Discard played card
      setHand(prev => prev.filter(c => c.id !== card.id));
      setDiscard(prev => [...prev, card]);
    }

    // Check Victory condition immediately
    if (opponentHp - damageDealt <= 0 || (card.type === "attack" && opponentHp - (damageDealt - Math.min(opponentShield, damageDealt)) <= 0)) {
      handleEndGame("victory");
    }
  };

  // End Player Turn
  const handleEndTurn = () => {
    playSound("click");
    if (gameResult) return;

    setCurrentTurn("opponent");
    addLog("⏳ Relaying transmission... Opponent tactics analyzing.");

    // Trigger AI Actions
    setTimeout(() => {
      executeOpponentTurn();
    }, 1200);
  };

  // Execute Opponent (AI) Actions
  const executeOpponentTurn = () => {
    if (gameResult) return;

    if (isOpponentStunned) {
      setIsOpponentStunned(false);
      addLog(`🌀 ${selectedOpponent.name} was stunned and recovers from carbonite, skipping their combat cycle.`);
      triggerOpponentPostTurn();
      return;
    }

    if (!nextOpponentAction) {
      triggerOpponentPostTurn();
      return;
    }

    const action = nextOpponentAction;
    addLog(`⚠️ ${selectedOpponent.name} activates [${action.name}]!`);

    // Apply opponent actions
    if (action.type === "attack") {
      playSound("attack");
      let rawDamage = action.value;
      let actualDmg = rawDamage;

      let shieldAbsorb = Math.min(playerShield, actualDmg);
      if (shieldAbsorb > 0) {
        setPlayerShield(prev => prev - shieldAbsorb);
        triggerPopup(`-${shieldAbsorb} Shield`, true, "text-sky-400");
        actualDmg -= shieldAbsorb;
      }

      if (actualDmg > 0) {
        setPlayerHp(prev => Math.max(0, prev - actualDmg));
        triggerPopup(`-${actualDmg} HP`, true, "text-red-500");
      }

      addLog(`💥 ${selectedOpponent.name} attacks dealing ${rawDamage} physical impact.`);
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 300);

      // Check player defeat
      if (playerHp - actualDmg <= 0) {
        handleEndGame("defeat");
        return;
      }

    } else if (action.type === "defend") {
      playSound("shield");
      setOpponentShield(prev => Math.min(opponentMaxShield, prev + action.value));
      triggerPopup(`+${action.value} Shield`, false, "text-sky-400");
      addLog(`🛡️ ${selectedOpponent.name} activates armor deflectors adding +${action.value} Shield.`);
    }

    triggerOpponentPostTurn();
  };

  // Setup next turn params
  const triggerOpponentPostTurn = () => {
    // Telegraph next AI card
    const randomAction = selectedOpponent.aiDeck[Math.floor(Math.random() * selectedOpponent.aiDeck.length)];
    setNextOpponentAction(randomAction);

    // End Opponent Turn and restore player params
    setCurrentTurn("player");
    setPlayerEnergy(playerMaxEnergy);
    
    // Draw 1 card automatically at turn beginning
    drawCards(1, hand, deck, discard);
    addLog("🔋 Core power cells re-charged. Your Turn to act!");
  };

  // Close battle and save rewards
  const handleEndGame = (result: "victory" | "defeat") => {
    setGameResult(result);
    playSound(result === "victory" ? "victory" : "defeat");

    if (result === "victory") {
      addLog(`🏆 VICTORY! Bounty captured successfully!`);
      addLog(`💰 Earnings: +${selectedOpponent.rewardCredits} Credits, +${selectedOpponent.rewardBeskar} Beskar Ingots.`);
      
      // Update persistent save state
      const updatedSave: SaveData = {
        ...saveData,
        credits: saveData.credits + selectedOpponent.rewardCredits,
        beskarIngots: saveData.beskarIngots + selectedOpponent.rewardBeskar,
        character: {
          ...saveData.character,
          xp: saveData.character.xp + 150, // bonus duel XP
        }
      };

      // Check level up in character XP
      if (updatedSave.character.xp >= updatedSave.character.xpNeeded) {
        updatedSave.character.xp -= updatedSave.character.xpNeeded;
        updatedSave.character.xpNeeded = Math.floor(updatedSave.character.xpNeeded * 1.3);
        updatedSave.character.rank = GameRank.MANDALOR;
        addLog("🎖️ SPECIAL DECK BONUS: Your Character leveled up in rank!");
      }

      onUpdateSave(updatedSave);
    } else {
      addLog(`💀 MISSION FAILED. Your shield core blew up and the opponent escaped.`);
    }
  };

  // Return to Lobby to choose another target
  const handleExitToLobby = () => {
    playSound("click");
    setIsLobby(true);
    setGameResult(null);
  };

  return (
    <div 
      id="card_battle_modal" 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-sans select-none overflow-y-auto"
    >
      <div 
        className={`bg-[#0D1016]/95 border border-[#2D3139] rounded-2xl max-w-5xl w-full flex flex-col max-h-[92vh] shadow-2xl overflow-hidden transition-all duration-300 ${
          shakeScreen ? "animate-bounce" : ""
        }`}
      >
        {/* Hologram Header */}
        <div className="bg-[#131720] border-b border-[#2D3139] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Layers className="text-[#C69C6D] w-5 h-5 animate-pulse" />
            <div>
              <h2 className="text-sm font-mono text-[#C69C6D] uppercase tracking-widest font-bold">
                // SABACC HOLOGRAM TACTICS TABLE
              </h2>
              <p className="text-[10px] text-[#8E9299] font-mono">
                Datapad Sandbox Duel • Current Credits: {saveData.credits} CR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* API selector interface */}
            <div className="hidden sm:flex items-center gap-1 bg-[#0A0B0E] p-1 rounded-lg border border-[#2D3139] text-[9px] font-mono">
              <span className="text-[#8E9299] px-1.5 uppercase font-bold text-[8px]">API:</span>
              {(["procedural", "blueprint", "unsplash", "picsum"] as ImageApiType[]).map(api => (
                <button
                  key={api}
                  onClick={() => { playSound("click"); setActiveImageApi(api); }}
                  className={`px-2 py-1 rounded capitalize font-bold transition-all cursor-pointer ${
                    activeImageApi === api 
                      ? "bg-[#C69C6D] text-black" 
                      : "text-[#8E9299] hover:text-white"
                  }`}
                >
                  {api}
                </button>
              ))}
            </div>

            <button 
              id="btn_close_card_battle"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#2D3139] hover:border-red-500/50 hover:bg-red-950/20 text-[#8E9299] hover:text-red-400 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLobby ? (
          /* =======================================================
             LOBBY SCREEN: CHOOSE OPPONENT BOUNTY TARGET
             ======================================================= */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-xl font-bold font-mono text-white">Select a Bounty Duel Target</h3>
              <p className="text-xs text-[#8E9299] font-mono leading-relaxed">
                Choose a bounty opponent. Duels reward Credits and Beskar Ingots directly synced to your character save profile. Switch the Artwork Image API above to load different styles!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OPPONENTS.map((opp) => (
                <div 
                  key={opp.id}
                  className="bg-[#0A0B0E]/60 border border-[#2D3139] rounded-xl p-5 flex gap-4 hover:border-[#C69C6D]/60 transition-all shadow-md group relative overflow-hidden"
                >
                  {/* Aspect Card Thumbnail Illustration wrapper using Selected API */}
                  <div className="w-24 h-24 rounded-lg bg-neutral-900 border border-[#2D3139] overflow-hidden shrink-0 relative">
                    <img 
                      src={
                        activeImageApi === "unsplash" 
                          ? `https://images.unsplash.com/photo-${
                              opp.id === "scout" ? "1593305841991-05c297ba4575" :
                              opp.id === "fennec" ? "1534447677768-be436bb09401" :
                              opp.id === "gideon" ? "1518709268805-4e9042af9f23" :
                              "1500485035595-cbe6f645feb1"
                            }?auto=format&fit=crop&w=150&q=80`
                          : activeImageApi === "picsum"
                          ? `https://picsum.photos/seed/mando-${opp.id}/150/150`
                          : `https://images.unsplash.com/photo-${
                              opp.id === "scout" ? "1593305841991-05c297ba4575" :
                              opp.id === "fennec" ? "1534447677768-be436bb09401" :
                              opp.id === "gideon" ? "1518709268805-4e9042af9f23" :
                              "1500485035595-cbe6f645feb1"
                            }?auto=format&fit=crop&w=150&q=80`
                      }
                      alt={opp.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all"
                    />
                    {/* Retro Grid overlays */}
                    {activeImageApi === "procedural" && (
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent opacity-60 mix-blend-color-dodge" />
                    )}
                    {activeImageApi === "blueprint" && (
                      <div className="absolute inset-0 bg-blue-950/20 border-2 border-blue-500/30 animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left font-mono space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm truncate">{opp.name}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                        opp.difficulty === "Easy" ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/30" :
                        opp.difficulty === "Medium" ? "bg-amber-950/30 text-amber-400 border-amber-500/30" :
                        opp.difficulty === "Hard" ? "bg-red-950/30 text-red-400 border-red-500/30" :
                        "bg-fuchsia-950/30 text-fuchsia-400 border-fuchsia-500/30 animate-pulse"
                      }`}>
                        {opp.difficulty}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#8E9299] truncate">{opp.title}</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] pt-1">
                      <span className="text-red-400 font-semibold">HP: {opp.hp}</span>
                      <span className="text-sky-400 font-semibold">Shield: {opp.shield}</span>
                    </div>

                    {/* Rewards line */}
                    <div className="flex gap-3 text-[10px] text-[#C69C6D] font-bold uppercase pt-1 border-t border-[#1F2229]">
                      <span>🏆 {opp.rewardCredits} Credits</span>
                      <span>💠 {opp.rewardBeskar} Beskar</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartDuel(opp)}
                    className="absolute bottom-5 right-5 bg-black border border-[#C69C6D]/40 group-hover:border-[#C69C6D] text-[#C69C6D] group-hover:bg-[#C69C6D] group-hover:text-black p-2.5 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>

            {/* Instruction Footer */}
            <div className="bg-[#131720]/50 border border-[#2D3139]/80 rounded-xl p-4 flex gap-3 text-left">
              <Info className="w-5 h-5 text-[#C69C6D] shrink-0" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-[#E0E0E0] font-mono">TACTICAL DATAPAD RULES:</h4>
                <p className="text-[#8E9299]">
                  Each player draws a hand of 5 cards from their deck. You have <span className="text-amber-400 font-bold">3 Energy cells</span> each turn. Attack cards deplete opponent HP and Shields, defend cards rebuild your Deflector barriers, and special Force / Tactical cards generate healing or draw modifiers.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* =======================================================
             DUEL SCREEN: ACTIVE CARD COMBAT ARENA
             ======================================================= */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
            
            {/* Main Battle Sandbox Table Area */}
            <div className="flex-1 flex flex-col justify-between p-4 bg-[#0A0B0E]/80 relative overflow-hidden">
              
              {/* Background HUD grids decoration */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(198,156,109,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(198,156,109,0.3)_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              {/* Floating popup messages layer */}
              <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                <div className="w-full h-full relative">
                  {floatingDamage.map(p => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: p.isPlayer ? 100 : -100, scale: 0.8 }}
                      animate={{ opacity: 1, y: p.isPlayer ? 20 : -120, scale: 1.2 }}
                      exit={{ opacity: 0 }}
                      className={`absolute left-1/2 -translate-x-1/2 font-mono font-extrabold text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${p.color}`}
                    >
                      {p.text}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 1. Opponent Status Panel (Telegraphed Action) */}
              <div className="bg-[#131720]/90 border border-[#2D3139] p-4 rounded-xl flex items-center justify-between relative z-10 font-mono text-left max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-[#2D3139] overflow-hidden shrink-0 relative">
                    <img 
                      src={selectedOpponent.image} 
                      alt={selectedOpponent.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                    {isOpponentStunned && (
                      <div className="absolute inset-0 bg-blue-500/40 backdrop-blur-sm flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-wider">
                        Frozen
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#C69C6D] uppercase font-bold tracking-wider">// OPPONENT SECURE LOG</span>
                    <h4 className="text-sm font-bold text-white">{selectedOpponent.name}</h4>
                    
                    {/* HP Progress Bar */}
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="w-28 bg-[#1F2229] h-2 rounded overflow-hidden border border-neutral-800">
                        <div 
                          className="bg-red-500 h-full transition-all duration-300"
                          style={{ width: `${(opponentHp / opponentMaxHp) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-red-400 font-bold">
                        {opponentHp}/{opponentMaxHp} HP
                      </span>
                    </div>

                    {/* Shield Bar */}
                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-28 bg-[#1F2229] h-1.5 rounded overflow-hidden border border-neutral-800">
                        <div 
                          className="bg-sky-400 h-full transition-all duration-300"
                          style={{ width: `${(opponentShield / opponentMaxShield) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-sky-400 font-bold">
                        {opponentShield}/{opponentMaxShield} SHLD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Opponent Intent Telegraphing */}
                {nextOpponentAction && !gameResult && (
                  <div className="bg-[#0A0B0E] border border-red-500/20 rounded-lg p-2 flex flex-col items-end min-w-36 text-right">
                    <span className="text-[8px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5 animate-pulse text-red-500" />
                      <span>INTENT LOGGED</span>
                    </span>
                    <span className="text-white font-bold text-xs truncate max-w-[150px]">{nextOpponentAction.name}</span>
                    <span className="text-[9px] text-[#8E9299]">
                      {nextOpponentAction.type === "attack" ? `⚔️ Deals ${nextOpponentAction.value} damage` : `🛡️ Gain +${nextOpponentAction.value} shield`}
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Middle Arena Visual Deck Info and Notifications */}
              <div className="my-2 text-center flex flex-col justify-center items-center h-28 relative z-10">
                <AnimatePresence mode="wait">
                  {gameResult ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-[#131720]/95 border border-[#2D3139] p-5 rounded-2xl max-w-sm flex flex-col items-center space-y-3 shadow-2xl"
                    >
                      {gameResult === "victory" ? (
                        <>
                          <Award className="w-12 h-12 text-[#C69C6D] animate-bounce" />
                          <h3 className="text-lg font-bold font-mono text-[#C69C6D]">Bounty Capture Success!</h3>
                          <p className="text-[11px] text-[#8E9299] font-mono leading-relaxed">
                            Bounty target neutralized. Rewards successfully saved to your Mandalorian Profile record.
                          </p>
                          <div className="flex gap-2 w-full pt-1">
                            <button
                              onClick={handleExitToLobby}
                              className="flex-1 bg-[#C69C6D] text-black font-bold font-mono text-xs py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer"
                            >
                              Exit to Enclave
                            </button>
                            <button
                              onClick={() => handleStartDuel(selectedOpponent)}
                              className="flex-1 border border-[#2D3139] hover:border-neutral-500 text-white font-bold font-mono text-xs py-2 rounded-lg transition-all cursor-pointer"
                            >
                              Rematch
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <X className="w-12 h-12 text-red-500 animate-pulse" />
                          <h3 className="text-lg font-bold font-mono text-red-400">Tactical Shield Blew Up</h3>
                          <p className="text-[11px] text-[#8E9299] font-mono leading-relaxed">
                            Mando HP reached 0. The target successfully escaped the sub-sector ambush.
                          </p>
                          <div className="flex gap-2 w-full pt-1">
                            <button
                              onClick={handleExitToLobby}
                              className="flex-1 bg-red-950/40 text-red-400 border border-red-500/40 font-bold font-mono text-xs py-2 rounded-lg hover:bg-red-950/60 transition-all cursor-pointer"
                            >
                              Bounty Board
                            </button>
                            <button
                              onClick={() => handleStartDuel(selectedOpponent)}
                              className="flex-1 bg-white text-black font-bold font-mono text-xs py-2 rounded-lg hover:opacity-90 transition-all cursor-pointer"
                            >
                              Retry Ambush
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-6 font-mono text-[10px] text-[#8E9299] bg-[#0D1016]/80 px-4 py-2.5 rounded-full border border-[#2D3139]">
                      <span className="flex items-center gap-1.5 text-white font-bold">
                        <Layers className="w-3.5 h-3.5 text-[#C69C6D]" /> Ammo Deck: {deck.length}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                        🗄️ Discard: {discard.length}
                      </span>
                      <span>•</span>
                      <span>Turn Cycle: <strong className="text-[#C69C6D] uppercase">{currentTurn}</strong></span>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Player Control Frame */}
              <div className="space-y-3 relative z-10 w-full max-w-4xl mx-auto">
                
                {/* HUD bars */}
                <div className="flex justify-between items-center bg-[#131720]/90 border border-[#2D3139] px-4 py-2.5 rounded-xl font-mono text-xs">
                  <div className="flex items-center gap-4 text-left">
                    <div>
                      <span className="text-[9px] text-[#8E9299] uppercase block font-bold">// SECURE CODEX LINK</span>
                      <span className="text-white font-bold text-xs">{saveData.character.name}</span>
                    </div>
                    {/* Player HP bar */}
                    <div className="space-y-0.5">
                      <div className="w-24 bg-[#1F2229] h-1.5 rounded overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-emerald-400 block font-bold">{playerHp}/{playerMaxHp} HP</span>
                    </div>

                    {/* Player Shield bar */}
                    <div className="space-y-0.5">
                      <div className="w-24 bg-[#1F2229] h-1.5 rounded overflow-hidden">
                        <div 
                          className="bg-sky-400 h-full transition-all duration-300"
                          style={{ width: `${(playerShield / playerMaxShield) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-sky-400 block font-bold">{playerShield}/{playerMaxShield} Barrier</span>
                    </div>
                  </div>

                  {/* Energy Cells Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8E9299] font-bold">POWER CELLS:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: playerMaxEnergy }).map((_, i) => (
                        <div 
                          key={i}
                          className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                            i < playerEnergy 
                              ? "bg-amber-400 text-black font-extrabold animate-pulse scale-105" 
                              : "bg-[#1A1D23] border border-[#2D3139] text-[#5C6169]"
                          }`}
                        >
                          <Zap className="w-2.5 h-2.5" />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleEndTurn}
                      disabled={currentTurn !== "player" || !!gameResult}
                      className="ml-3 bg-[#C69C6D] hover:bg-[#b08759] disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      End Turn
                    </button>
                  </div>
                </div>

                {/* Hand cards grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                  <AnimatePresence>
                    {hand.map((card, idx) => (
                      <motion.div
                        key={card.id}
                        id={`sabacc_card_${card.id}`}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        whileHover={{ y: -15, scale: 1.04 }}
                        onClick={() => handlePlayCard(card)}
                        className={`bg-[#131720] border rounded-xl p-3 flex flex-col justify-between h-48 cursor-pointer relative overflow-hidden group select-none text-left font-mono ${
                          playerEnergy >= card.cost && currentTurn === "player" && !gameResult
                            ? "border-[#C69C6D] hover:shadow-[0_0_15px_rgba(198,156,109,0.3)]"
                            : "border-[#2D3139] opacity-70 cursor-not-allowed"
                        }`}
                      >
                        {/* API-based Card Illustration Image Layer */}
                        <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-25 transition-opacity">
                          {activeImageApi === "picsum" ? (
                            <img 
                              src={`https://picsum.photos/seed/mando-${card.picsumSeed}/120/160`} 
                              alt={card.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                          ) : activeImageApi === "unsplash" ? (
                            <img 
                              src={`https://images.unsplash.com/photo-${card.unsplashId}?auto=format&fit=crop&w=120&q=80`} 
                              alt={card.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                          ) : activeImageApi === "procedural" ? (
                            /* Procedural Glowing CSS digital card matrix */
                            <div className="w-full h-full bg-gradient-to-br from-[#0D1016] via-[#1E2530] to-[#0D1016] relative">
                              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-y border-indigo-500/20 h-8 animate-pulse" />
                              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-x border-indigo-500/10 w-8" />
                            </div>
                          ) : (
                            /* Silhouette Minimalist Blueprint */
                            <div className="w-full h-full bg-blue-950/20 flex items-center justify-center border border-dashed border-blue-500/20">
                              <span className="text-[10px] text-blue-500/40">VECTOR</span>
                            </div>
                          )}
                        </div>

                        {/* Top banner: energy cost and rarity mark */}
                        <div className="flex justify-between items-center relative z-10 shrink-0">
                          <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-wider">
                            {card.type}
                          </span>
                          <span className="bg-amber-400 text-black text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                            {card.cost}
                          </span>
                        </div>

                        {/* Card Visual Artwork Container Frame */}
                        <div className="my-1.5 border border-neutral-800 rounded bg-black/40 h-16 flex items-center justify-center relative z-10 overflow-hidden">
                          {activeImageApi === "picsum" ? (
                            <img 
                              src={`https://picsum.photos/seed/mando-${card.picsumSeed}/100/60`} 
                              alt={card.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                          ) : activeImageApi === "unsplash" ? (
                            <img 
                              src={`https://images.unsplash.com/photo-${card.unsplashId}?auto=format&fit=crop&w=100&q=80`} 
                              alt={card.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover animate-pulse" 
                            />
                          ) : activeImageApi === "procedural" ? (
                            <div className="w-full h-full flex flex-col justify-center items-center p-1 bg-gradient-to-t from-emerald-950/30 to-black">
                              <Sparkles className="w-4 h-4 text-[#C69C6D] animate-spin-slow mb-0.5" />
                              <span className="text-[7px] text-[#C69C6D] font-bold tracking-widest uppercase">Holo-API</span>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-1 bg-[#0A0B0E] border-t-2 border-blue-500/30">
                              <Layers className="w-4 h-4 text-blue-400/55 animate-pulse" />
                            </div>
                          )}
                        </div>

                        {/* Bottom Info: Action & Values */}
                        <div className="relative z-10 text-left font-mono space-y-1 flex-1 flex flex-col justify-end">
                          <h5 className="font-bold text-[10px] text-white tracking-wide truncate group-hover:text-[#C69C6D] transition-colors">
                            {card.name}
                          </h5>
                          <p className="text-[8px] text-[#8E9299] leading-tight line-clamp-2 h-6">
                            {card.description}
                          </p>

                          <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-neutral-800 shrink-0">
                            <span className="text-[#8E9299] text-[8px] uppercase font-bold">Value:</span>
                            <span className={`font-bold ${
                              card.type === "attack" ? "text-red-400" :
                              card.type === "defend" ? "text-sky-400" :
                              "text-indigo-400"
                            }`}>
                              {card.type === "attack" && "⚔️"}
                              {card.type === "defend" && "🛡️"}
                              {card.type === "force" && "⚡"}
                              {card.type === "tactical" && "⚙️"}
                              {card.value}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Right Combat Logs & Action Dashboard (Sabacc Holonet Terminal) */}
            <div className="w-full md:w-64 bg-[#0D1016] border-t md:border-t-0 md:border-l border-[#2D3139] flex flex-col justify-between p-4 font-mono text-left select-none shrink-0">
              <div className="space-y-4 overflow-hidden flex flex-col h-full">
                <div className="border-b border-[#2D3139] pb-2">
                  <span className="text-[9px] text-[#C69C6D] font-bold block uppercase tracking-widest">
                    // COMBAT TELEMETRY LOG
                  </span>
                  <span className="text-white text-xs block font-bold">Holo-api feeds active</span>
                </div>

                {/* Log screen content */}
                <div className="flex-1 overflow-y-auto space-y-2 text-[9px] leading-relaxed pr-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                  {combatLogs.length === 0 ? (
                    <div className="text-[#5C6169] italic text-center py-8">
                      Await combat synchronization. Draw hand and launch actions.
                    </div>
                  ) : (
                    combatLogs.map((log, index) => (
                      <div 
                        key={index} 
                        className={`p-1.5 rounded border border-neutral-900/60 transition-all ${
                          log.startsWith("🏆") || log.startsWith("✨") ? "bg-emerald-950/15 text-emerald-400" :
                          log.startsWith("💀") || log.startsWith("💥") || log.startsWith("⚠️") ? "bg-red-950/15 text-red-400" :
                          log.startsWith("🛡️") ? "bg-sky-950/15 text-sky-400" :
                          "bg-[#0A0B0E]/60 text-[#8E9299]"
                        }`}
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action commands for lobby exit */}
              <div className="pt-3 border-t border-[#2D3139] space-y-2 shrink-0">
                <button
                  onClick={handleExitToLobby}
                  className="w-full bg-[#1A1D23] hover:bg-neutral-800 border border-[#2D3139] text-white py-2 rounded-lg text-xs font-bold font-mono text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Sabacc Duel
                </button>
                <div className="text-[8px] text-[#5C6169] text-center font-bold">
                  SABACC ENGINE SECURE V2.1
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
