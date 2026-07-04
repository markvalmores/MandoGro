/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { StarWarsSoundEngine } from "../utils";
import { Play, RotateCcw, Crosshair, Sparkles, Navigation, Swords, Star, Coins } from "lucide-react";

interface MiniGamesModeProps {
  playerName: string;
  onRewardCredits: (credits: number) => void;
  onClose: () => void;
}

export const MiniGamesMode: React.FC<MiniGamesModeProps> = ({
  playerName,
  onRewardCredits,
  onClose,
}) => {
  const [activeGame, setActiveGame] = useState<"speeder" | "space" | "duel" | "crafting">("speeder");
  
  // Game state trackers
  const [highScores, setHighScores] = useState({ speeder: 250, space: 1200, duel: 3, crafting: 5 });
  const [earnedCredits, setEarnedCredits] = useState(0);

  const rewardCredits = (amount: number) => {
    setEarnedCredits(prev => prev + amount);
    onRewardCredits(amount);
  };

  // ==========================================
  // Game 1: Swoop Speeder Racing Engine
  // ==========================================
  const speederCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [speederRunning, setSpeederRunning] = useState(false);
  const [speederScore, setSpeederScore] = useState(0);

  useEffect(() => {
    if (activeGame !== "speeder" || !speederCanvasRef.current) return;
    const canvas = speederCanvasRef.current;
    const ctx = canvas.getContext("2d")!;
    let animationId: number;

    // Speeder variables
    let speederY = 100;
    let speederVelocity = 0;
    const gravity = 0.4;
    const lift = -6;
    
    // Obstacles
    let obstacleX = 400;
    let obstacleY = 120;
    let obstacleSpeed = 4;
    
    // Coins
    let coinX = 600;
    let coinY = 80;

    let scoreVal = 0;

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = "#1e1b4b"; // Dark purple cosmic sky
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sand terrain dunes drawing (desert parallax background)
      ctx.fillStyle = "#7c2d12"; // Deep sand orange
      ctx.beginPath();
      ctx.moveTo(0, 160);
      ctx.quadraticCurveTo(100, 140, 200, 170);
      ctx.quadraticCurveTo(300, 180, 400, 150);
      ctx.lineTo(400, 200);
      ctx.lineTo(0, 200);
      ctx.fill();

      // Gravity calculations
      speederVelocity += gravity;
      speederY += speederVelocity;

      // Keep inside bounds
      if (speederY > 150) {
        speederY = 150;
        speederVelocity = 0;
      }
      if (speederY < 10) {
        speederY = 10;
        speederVelocity = 0;
      }

      // Draw Speeder bike (stylish orange polygon)
      ctx.fillStyle = "#f59e0b"; // Orange/yellow speeder
      ctx.beginPath();
      ctx.moveTo(30, speederY);
      ctx.lineTo(60, speederY + 5);
      ctx.lineTo(65, speederY + 12);
      ctx.lineTo(25, speederY + 10);
      ctx.closePath();
      ctx.fill();
      // Thrust fire effect
      ctx.fillStyle = "#f97316";
      ctx.fillRect(15, speederY + 4, 10, 3);

      // Draw obstacle (canyon spires)
      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.moveTo(obstacleX, 200);
      ctx.lineTo(obstacleX + 15, obstacleY);
      ctx.lineTo(obstacleX + 30, 200);
      ctx.closePath();
      ctx.fill();

      // Draw collectable token
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(coinX, coinY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Move obstacle and coin
      obstacleX -= obstacleSpeed;
      coinX -= obstacleSpeed;

      if (obstacleX < -30) {
        obstacleX = canvas.width + Math.random() * 200;
        obstacleY = 70 + Math.random() * 80;
        scoreVal += 10;
        setSpeederScore(scoreVal);
      }

      if (coinX < -30) {
        coinX = canvas.width + Math.random() * 300;
        coinY = 40 + Math.random() * 100;
      }

      // Collisions
      const distToObstacle = Math.hypot(45 - (obstacleX + 15), speederY - obstacleY);
      if (distToObstacle < 25) {
        // Crash
        StarWarsSoundEngine.playExplosion();
        setSpeederRunning(false);
        rewardCredits(Math.floor(scoreVal / 2));
        if (scoreVal > highScores.speeder) {
          setHighScores(prev => ({ ...prev, speeder: scoreVal }));
        }
        return;
      }

      const distToCoin = Math.hypot(45 - coinX, speederY - coinY);
      if (distToCoin < 18) {
        // Collect coin
        StarWarsSoundEngine.playClick();
        scoreVal += 25;
        setSpeederScore(scoreVal);
        coinX = -100; // Reset off-screen
      }

      if (speederRunning) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    if (speederRunning) {
      gameLoop();
    } else {
      // Clear screen static
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px monospace";
      ctx.fillText("SPEEDER OFFLINE - PRESS START ENGINE", 75, 100);
    }

    const handleCanvasClick = () => {
      if (speederRunning) {
        StarWarsSoundEngine.playClick();
        speederVelocity = lift;
      }
    };

    canvas.addEventListener("click", handleCanvasClick);
    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [activeGame, speederRunning]);


  // ==========================================
  // Game 2: Space Combat Shoot 'Em Up
  // ==========================================
  const spaceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spaceRunning, setSpaceRunning] = useState(false);
  const [spaceScore, setSpaceScore] = useState(0);

  useEffect(() => {
    if (activeGame !== "space" || !spaceCanvasRef.current) return;
    const canvas = spaceCanvasRef.current;
    const ctx = canvas.getContext("2d")!;
    let animationId: number;

    // Ship X coordinates
    let playerShipX = 200;
    
    // Bullets & enemies
    let laserY = -100;
    let laserX = 0;
    
    let tieX = 200;
    let tieY = -20;
    let tieSpeed = 3;

    let scoreVal = 0;

    const gameLoop = () => {
      ctx.fillStyle = "#09090b"; // Pitch black space
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield background
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 15; i++) {
        ctx.fillRect((i * 35 + scoreVal) % canvas.width, (i * 22) % canvas.height, 1.5, 1.5);
      }

      // Draw player starfighter (blue crest Razor Crest silhouette)
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.moveTo(playerShipX, 175);
      ctx.lineTo(playerShipX - 18, 195);
      ctx.lineTo(playerShipX - 10, 190);
      ctx.lineTo(playerShipX + 10, 190);
      ctx.lineTo(playerShipX + 18, 195);
      ctx.closePath();
      ctx.fill();
      // Shield glow rings
      ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
      ctx.beginPath();
      ctx.arc(playerShipX, 185, 22, 0, Math.PI, true);
      ctx.stroke();

      // Bullet movement
      if (laserY > -10) {
        laserY -= 6;
        ctx.fillStyle = "#ef4444"; // Red laser bolt
        ctx.fillRect(laserX, laserY, 3, 10);
      }

      // Tie Fighter target
      ctx.fillStyle = "#a1a1aa";
      ctx.fillRect(tieX - 12, tieY, 24, 4); // Wings
      ctx.fillRect(tieX - 3, tieY - 6, 6, 12); // Pod
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(tieX, tieY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Enemy moves down
      tieY += tieSpeed;
      if (tieY > 210) {
        tieY = -10;
        tieX = 40 + Math.random() * 320;
      }

      // Laser collision
      if (laserY > -10 && Math.abs(laserX - tieX) < 16 && Math.abs(laserY - tieY) < 12) {
        StarWarsSoundEngine.playExplosion();
        scoreVal += 100;
        setSpaceScore(scoreVal);
        tieY = -20;
        tieX = 40 + Math.random() * 320;
        laserY = -100; // Reset laser
      }

      // Enemy crashes into player
      if (Math.abs(playerShipX - tieX) < 22 && Math.abs(185 - tieY) < 18) {
        StarWarsSoundEngine.playExplosion();
        setSpaceRunning(false);
        rewardCredits(Math.floor(scoreVal / 5));
        if (scoreVal > highScores.space) {
          setHighScores(prev => ({ ...prev, space: scoreVal }));
        }
        return;
      }

      if (spaceRunning) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    if (spaceRunning) {
      gameLoop();
    } else {
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px monospace";
      ctx.fillText("STARFIGHTER COCKPIT OFFLINE", 100, 100);
    }

    const handleCanvasMove = (e: MouseEvent) => {
      if (spaceRunning) {
        const rect = canvas.getBoundingClientRect();
        playerShipX = e.clientX - rect.left;
        
        // Auto shoot
        if (laserY <= -10) {
          StarWarsSoundEngine.playBlaster();
          laserX = playerShipX;
          laserY = 170;
        }
      }
    };

    canvas.addEventListener("mousemove", handleCanvasMove);
    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleCanvasMove);
    };
  }, [activeGame, spaceRunning]);


  // ==========================================
  // Game 3: Tactical Saber / Blaster PVP Duel
  // ==========================================
  const [duelPlayerHp, setDuelPlayerHp] = useState(100);
  const [duelEnemyHp, setDuelEnemyHp] = useState(100);
  const [duelEnemyName, setDuelEnemyName] = useState("Cad Bane");
  const [duelLog, setDuelLog] = useState<string[]>(["Challenge initiated! Choose your tactical stance."]);

  const handleDuelAction = (playerAction: "strike" | "block" | "detonate") => {
    StarWarsSoundEngine.playLightsaber();
    
    // Choose enemy random action
    const actions = ["strike", "block", "detonate"] as const;
    const enemyAction = actions[Math.floor(Math.random() * 3)];

    let pDamage = 0;
    let eDamage = 0;
    let message = "";

    if (playerAction === enemyAction) {
      message = `Clash! Both implemented ${playerAction.toUpperCase()} causing minor deflection rebounds.`;
      pDamage = 5;
      eDamage = 5;
    } else if (playerAction === "strike" && enemyAction === "block") {
      message = `${duelEnemyName} perfectly blocked your lightsaber slash and retaliated!`;
      pDamage = 20;
    } else if (playerAction === "strike" && enemyAction === "detonate") {
      message = "You slashed deep before their thermal detonator fused! Direct critical strike!";
      eDamage = 35;
    } else if (playerAction === "block" && enemyAction === "strike") {
      message = "Parry! You deflected their blaster discharge right back into them!";
      eDamage = 20;
    } else if (playerAction === "block" && enemyAction === "detonate") {
      message = "The thermal detonator explosion breaks through your lightsaber shield!";
      pDamage = 25;
    } else if (playerAction === "detonate" && enemyAction === "strike") {
      message = "Boom! You tossed a thermal mine, disrupting their heavy charge!";
      pDamage = 10;
      eDamage = 30;
    } else if (playerAction === "detonate" && enemyAction === "block") {
      message = "Your high-explosive grenade completely vaporizes their defensive stance!";
      eDamage = 30;
    }

    const nextPlayerHp = Math.max(0, duelPlayerHp - pDamage);
    const nextEnemyHp = Math.max(0, duelEnemyHp - eDamage);

    setDuelPlayerHp(nextPlayerHp);
    setDuelEnemyHp(nextEnemyHp);
    setDuelLog(prev => [message, ...prev]);

    // Check ending conditions
    if (nextEnemyHp <= 0) {
      StarWarsSoundEngine.playForceHeal();
      setDuelLog(prev => ["BOUNTY SECURED! Target incapacitated.", ...prev]);
      rewardCredits(1200);
      setHighScores(p => ({ ...p, duel: p.duel + 1 }));
      // Reset
      setTimeout(() => {
        setDuelPlayerHp(100);
        setDuelEnemyHp(100);
        setDuelEnemyName(Math.random() > 0.5 ? "Boba Fett" : "Cad Bane");
        setDuelLog(["New elite target acquired. Engage!"]);
      }, 3000);
    } else if (nextPlayerHp <= 0) {
      StarWarsSoundEngine.playExplosion();
      setDuelLog(prev => ["DEFEAT! Your shield crashed under fire.", ...prev]);
      setTimeout(() => {
        setDuelPlayerHp(100);
        setDuelEnemyHp(100);
        setDuelLog(["Datapad rebooted. Challenge target again."]);
      }, 3000);
    }
  };


  // ==========================================
  // Game 4: Ancient Artifact Crafting Grid
  // ==========================================
  const [craftingGrid, setCraftingGrid] = useState<string[]>([
    "Beskar", "Rune", "Kyber",
    "Kyber", "Beskar", "Rune",
    "Rune", "Kyber", "Beskar"
  ]);
  const [craftingLog, setCraftingLog] = useState("Select adjacent components to trigger Kyber fusion!");

  const handleRuneClick = (idx: number) => {
    StarWarsSoundEngine.playClick();
    
    // Cycle item to simulate matching fusion
    const items = ["Beskar", "Rune", "Kyber", "Scrap"];
    const updated = [...craftingGrid];
    const current = updated[idx];
    const nextIdx = (items.indexOf(current) + 1) % items.length;
    updated[idx] = items[nextIdx];
    setCraftingGrid(updated);

    // Check matching matrix (3 in a row horizontal)
    if (updated[0] === updated[1] && updated[1] === updated[2]) {
      StarWarsSoundEngine.playForceHeal();
      setCraftingLog(`FUSED ANCIENT ${updated[0].toUpperCase()} AMULET! +1500 Credits rewarded.`);
      rewardCredits(1500);
      setHighScores(p => ({ ...p, crafting: p.crafting + 1 }));
    } else {
      setCraftingLog("Energy aligned. Keep modifying matrix runes to synchronize relics.");
    }
  };


  return (
    <div id="minigames_modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0D1016] border border-[#2D3139] rounded-xl max-w-4xl w-full flex flex-col h-[90vh] shadow-2xl overflow-hidden font-sans">
        
        {/* Header Tabs */}
        <div className="border-b border-[#2D3139] p-4 bg-[#0D1016] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Swords className="text-[#C69C6D] w-5 h-5 animate-pulse" />
            <h2 className="text-base font-bold font-mono text-white tracking-wide">
              RECREATION DATAPAD MINI-GAMES
            </h2>
          </div>

          <div className="flex gap-2 items-center text-xs font-mono bg-[#0A0B0E] border border-[#C69C6D]/20 px-3 py-1 rounded">
            <Coins className="w-4 h-4 text-[#C69C6D]" />
            <span className="text-[#8E9299] font-bold">SESSION GAINS:</span>
            <span className="text-[#C69C6D] font-bold">{earnedCredits} CREDITS</span>
          </div>
        </div>

        {/* Sub-selector tabs */}
        <div className="flex bg-[#0A0B0E]/60 border-b border-[#2D3139] text-xs font-mono">
          <button
            id="tab_game_speeder"
            onClick={() => { StarWarsSoundEngine.playClick(); setActiveGame("speeder"); }}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeGame === "speeder" ? "border-[#C69C6D] text-[#C69C6D] bg-[#0D1016] font-bold" : "border-transparent text-[#8E9299] hover:text-white"
            }`}
          >
            <Navigation className="w-3.5 h-3.5" /> SPEEDER RACING
          </button>
          <button
            id="tab_game_space"
            onClick={() => { StarWarsSoundEngine.playClick(); setActiveGame("space"); }}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeGame === "space" ? "border-[#C69C6D] text-[#C69C6D] bg-[#0D1016] font-bold" : "border-transparent text-[#8E9299] hover:text-white"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" /> SPACE SHOOTER
          </button>
          <button
            id="tab_game_duel"
            onClick={() => { StarWarsSoundEngine.playClick(); setActiveGame("duel"); }}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeGame === "duel" ? "border-[#C69C6D] text-[#C69C6D] bg-[#0D1016] font-bold" : "border-transparent text-[#8E9299] hover:text-white"
            }`}
          >
            <Swords className="w-3.5 h-3.5" /> SABER DUEL
          </button>
          <button
            id="tab_game_crafting"
            onClick={() => { StarWarsSoundEngine.playClick(); setActiveGame("crafting"); }}
            className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeGame === "crafting" ? "border-[#C69C6D] text-[#C69C6D] bg-[#0D1016] font-bold" : "border-transparent text-[#8E9299] hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> ALIEN CRAFTING
          </button>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0A0B0E]/40 flex flex-col md:flex-row gap-6">
          
          {/* Main active game viewport */}
          <div className="flex-1 flex flex-col justify-between h-full max-h-[50vh] md:max-h-none">
            
            {/* SPEEDER VIEWPORT */}
            {activeGame === "speeder" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold font-mono text-[#C69C6D] uppercase">Swoop Canyon Racing Circuit</h3>
                  <p className="text-xs text-[#8E9299]">Click canvas to trigger Altitude stabilizer thruster hops. Dodge spikes!</p>
                </div>

                <div className="relative flex justify-center bg-[#0A0B0E] p-2 rounded-xl border border-[#2D3139]">
                  <canvas
                    id="speeder_canvas"
                    ref={speederCanvasRef}
                    width="400"
                    height="200"
                    className="w-full max-w-[450px] aspect-video cursor-pointer bg-[#0D1016] rounded"
                  />
                  {!speederRunning && (
                    <button
                      id="btn_start_speeder"
                      onClick={() => { StarWarsSoundEngine.playClick(); setSpeederRunning(true); }}
                      className="absolute inset-0 m-auto w-36 h-11 border border-[#2D3139] bg-black hover:bg-[#1A1D23] hover:border-[#C69C6D] hover:text-[#C69C6D] text-white font-bold font-mono text-sm rounded shadow-lg flex items-center justify-center gap-1 transition-all duration-300 cursor-pointer"
                    >
                      <Play className="w-4 h-4" /> START ENGINE
                    </button>
                  )}
                </div>

                <div className="flex justify-between text-xs font-mono bg-[#0A0B0E] p-3 rounded border border-[#2D3139]">
                  <span className="text-[#8E9299] font-bold">CANYON POSITION: {speederScore}m</span>
                  <span className="text-[#C69C6D] font-bold">RECORD CHRONICLE: {highScores.speeder}m</span>
                </div>
              </div>
            )}

            {/* SPACE VIEWPORT */}
            {activeGame === "space" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold font-mono text-[#C69C6D] uppercase">Aero-Fighter Squadron Skirmish</h3>
                  <p className="text-xs text-[#8E9299]">Glide cursor inside cockpit to maneuver flight path. Blast TIE fighters!</p>
                </div>

                <div className="relative flex justify-center bg-[#0A0B0E] p-2 rounded-xl border border-[#2D3139]">
                  <canvas
                    id="space_canvas"
                    ref={spaceCanvasRef}
                    width="400"
                    height="200"
                    className="w-full max-w-[450px] aspect-video cursor-crosshair rounded"
                  />
                  {!spaceRunning && (
                    <button
                      id="btn_start_space"
                      onClick={() => { StarWarsSoundEngine.playClick(); setSpaceRunning(true); }}
                      className="absolute inset-0 m-auto w-36 h-11 border border-[#2D3139] bg-black hover:bg-[#1A1D23] hover:border-[#C69C6D] hover:text-[#C69C6D] text-white font-bold font-mono text-sm rounded shadow-lg flex items-center justify-center gap-1 transition-all duration-300 cursor-pointer"
                    >
                      <Play className="w-4 h-4" /> IGNITE DRIVES
                    </button>
                  )}
                </div>

                <div className="flex justify-between text-xs font-mono bg-[#0A0B0E] p-3 rounded border border-[#2D3139]">
                  <span className="text-[#8E9299] font-bold">SCORE COUNTER: {spaceScore}</span>
                  <span className="text-[#C69C6D] font-bold">TOP GUN SQUADRON: {highScores.space}</span>
                </div>
              </div>
            )}

            {/* SABER DUEL VIEWPORT */}
            {activeGame === "duel" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold font-mono text-[#C69C6D] uppercase">Tactical Saber Blade Duel (PVP Mode)</h3>
                  <p className="text-xs text-[#8E9299]">Select tactical stance adjustments to out-maneuver target bounty counters.</p>
                </div>

                {/* Clash layout */}
                <div className="bg-[#0A0B0E] p-4 rounded-xl border border-[#2D3139] space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Player Health */}
                    <div className="space-y-1 text-xs font-mono text-left">
                      <div className="flex justify-between">
                        <span className="text-[#C69C6D] font-bold">Mando Hunter ({playerName})</span>
                        <span className="text-[#8E9299] font-bold">{duelPlayerHp}% HP</span>
                      </div>
                      <div className="h-2 bg-[#1A1D23] rounded overflow-hidden">
                        <div style={{ width: `${duelPlayerHp}%` }} className="h-full bg-[#C69C6D] transition-all duration-300" />
                      </div>
                    </div>

                    {/* Enemy Health */}
                    <div className="space-y-1 text-xs font-mono text-right">
                      <div className="flex justify-between">
                        <span className="text-rose-500 font-bold">{duelEnemyName}</span>
                        <span className="text-[#8E9299] font-bold">{duelEnemyHp}% HP</span>
                      </div>
                      <div className="h-2 bg-[#1A1D23] rounded overflow-hidden">
                        <div style={{ width: `${duelEnemyHp}%` }} className="h-full bg-rose-500 ml-auto transition-all duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Duel Logs */}
                  <div className="bg-[#0D1016] p-3 h-20 rounded border border-[#2D3139] text-[10px] font-mono overflow-y-auto space-y-1 text-[#8E9299]">
                    {duelLog.map((log, idx) => (
                      <div key={idx} className={idx === 0 ? "text-[#C69C6D] font-semibold" : ""}>
                        • {log}
                      </div>
                    ))}
                  </div>

                  {/* Move selectors */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      id="btn_duel_strike"
                      onClick={() => handleDuelAction("strike")}
                      className="py-2.5 bg-black border border-[#2D3139] hover:border-[#C69C6D] text-xs font-mono text-[#8E9299] hover:text-[#C69C6D] rounded-lg transition-all duration-300 cursor-pointer"
                    >
                      STRIKE (Saber slash)
                    </button>
                    <button
                      id="btn_duel_block"
                      onClick={() => handleDuelAction("block")}
                      className="py-2.5 bg-black border border-[#2D3139] hover:border-[#C69C6D] text-xs font-mono text-[#8E9299] hover:text-[#C69C6D] rounded-lg transition-all duration-300 cursor-pointer"
                    >
                      BLOCK (Parry shield)
                    </button>
                    <button
                      id="btn_duel_detonate"
                      onClick={() => handleDuelAction("detonate")}
                      className="py-2.5 bg-black border border-[#2D3139] hover:border-[#C69C6D] text-xs font-mono text-[#8E9299] hover:text-[#C69C6D] rounded-lg transition-all duration-300 cursor-pointer"
                    >
                      DETONATE (Mine)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ALIEN CRAFTING VIEWPORT */}
            {activeGame === "crafting" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold font-mono text-[#C69C6D] uppercase">Ancient Alien Artifact Crafting Matrix</h3>
                  <p className="text-xs text-[#8E9299]">Cycle materials inside ancient nodes to align Kyber energies. Align 3 of a kind horizontally.</p>
                </div>

                <div className="bg-[#0A0B0E] p-6 rounded-xl border border-[#2D3139] flex flex-col items-center">
                  <div className="grid grid-cols-3 gap-3 w-48 mb-4">
                    {craftingGrid.map((item, idx) => (
                      <button
                        id={`craft_rune_${idx}`}
                        key={idx}
                        onClick={() => handleRuneClick(idx)}
                        className={`h-14 w-14 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                          item === "Beskar"
                            ? "bg-[#1A1D23] border-[#2D3139] text-[#E0E0E0]"
                            : item === "Rune"
                            ? "bg-purple-950/20 border-purple-800/40 text-purple-300"
                            : item === "Kyber"
                            ? "bg-sky-950/20 border-sky-500/40 text-[#C69C6D] font-bold animate-pulse"
                            : "bg-[#0A0B0E] border-[#2D3139] text-[#8E9299]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-[#0A0B0E] border border-[#2D3139] rounded text-center text-[10px] font-mono text-[#C69C6D] font-bold w-full">
                    {craftingLog}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Game Instructions/Status sidebar */}
          <div className="md:w-1/3 bg-[#0D1016]/40 p-4 rounded-xl border border-[#2D3139] flex flex-col justify-between font-mono text-xs">
            <div>
              <span className="text-[#C69C6D] font-bold uppercase tracking-widest block mb-3">REC-CHRONO ROOM</span>
              <p className="text-[#8E9299] leading-relaxed mb-4">
                Bounty hunting requires sharp physical reflexes and strategic clarity. Play these datapad recreations to earn credit rewards usable in the main campaigns.
              </p>

              <div className="space-y-2 bg-[#0A0B0E] p-3 rounded border border-[#2D3139]">
                <span className="text-[10px] text-[#8E9299] font-bold">BOUNTY RECORDS:</span>
                <div className="flex justify-between border-b border-[#2D3139]/40 py-1">
                  <span className="text-[#8E9299]">Speeder Top:</span>
                  <span className="text-white font-bold">{highScores.speeder}m</span>
                </div>
                <div className="flex justify-between border-b border-[#2D3139]/40 py-1">
                  <span className="text-[#8E9299]">Fighter Top:</span>
                  <span className="text-white font-bold">{highScores.space}</span>
                </div>
                <div className="flex justify-between border-b border-[#2D3139]/40 py-1">
                  <span className="text-[#8E9299]">Saber Duels:</span>
                  <span className="text-white font-bold">{highScores.duel} Wins</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8E9299]">Relics Crafted:</span>
                  <span className="text-white font-bold">{highScores.crafting} Relic(s)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#2D3139] text-center">
              <span className="text-[10px] text-[#8E9299] font-bold uppercase">PLAY-TO-EARN PROTOCOLS ACTIVE</span>
            </div>
          </div>

        </div>

        {/* Footer controls */}
        <div className="border-t border-[#2D3139] p-4 bg-[#0D1016] flex justify-end">
          <button
            id="minigames_close"
            onClick={() => { StarWarsSoundEngine.playClick(); onClose(); }}
            className="px-6 py-2.5 border border-[#2D3139] bg-black hover:bg-[#1A1D23] hover:text-[#C69C6D] hover:border-[#C69C6D] text-white rounded font-mono font-bold text-xs transition-all duration-300 cursor-pointer"
          >
            DISMISS PLAYPAD
          </button>
        </div>

      </div>
    </div>
  );
};
