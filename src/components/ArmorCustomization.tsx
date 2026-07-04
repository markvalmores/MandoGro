/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GameCharacter, ArmorPiece, ElementAffinity } from "../types";
import { StarWarsSoundEngine } from "../utils";
import { Shield, Sparkles, Sliders, Check } from "lucide-react";

interface ArmorCustomizationProps {
  character: GameCharacter;
  onUpdateArmor: (updatedArmor: Record<"helmet" | "chest" | "gauntlets" | "jetpack", ArmorPiece>) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: "Beskar Silver", value: "#a1a1aa" },
  { name: "Death Watch Blue", value: "#2563eb" },
  { name: "Mandalore Gold", value: "#d97706" },
  { name: "Outpost Slate", value: "#4b5563" },
  { name: "Crimson Syndicate", value: "#dc2626" },
  { name: "Boba Hunter Green", value: "#15803d" },
  { name: "Night Owl Teal", value: "#0d9488" },
  { name: "Jet Charcoal", value: "#1e1b4b" }
];

const SIGILS = ["None", "Mythosaur", "Mudhorn", "Nite Owl", "Death Watch", "Kryze Sigil"];

export const ArmorCustomization: React.FC<ArmorCustomizationProps> = ({
  character,
  onUpdateArmor,
  onClose,
}) => {
  const [localArmor, setLocalArmor] = useState<Record<"helmet" | "chest" | "gauntlets" | "jetpack", ArmorPiece>>({
    ...character.armor,
  });
  const [selectedSlot, setSelectedSlot] = useState<"helmet" | "chest" | "gauntlets" | "jetpack">("helmet");

  const currentPiece = localArmor[selectedSlot];

  const handleColorChange = (hex: string) => {
    StarWarsSoundEngine.playClick();
    setLocalArmor((prev) => ({
      ...prev,
      [selectedSlot]: {
        ...prev[selectedSlot],
        color: hex,
      },
    }));
  };

  const handleSigilChange = (sigil: string) => {
    StarWarsSoundEngine.playClick();
    setLocalArmor((prev) => ({
      ...prev,
      [selectedSlot]: {
        ...prev[selectedSlot],
        sigil,
      },
    }));
  };

  const handleNameChange = (name: string) => {
    setLocalArmor((prev) => ({
      ...prev,
      [selectedSlot]: {
        ...prev[selectedSlot],
        name,
      },
    }));
  };

  const handleSave = () => {
    StarWarsSoundEngine.playClick();
    onUpdateArmor(localArmor);
    onClose();
  };

  return (
    <div id="armor_modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0D1016] border border-[#2D3139] rounded-xl max-w-4xl w-full flex flex-col md:flex-row max-h-[90vh] shadow-2xl overflow-hidden font-sans text-[#E0E0E0]">
        
        {/* Left Interactive 2.5D Armor Forge Preview */}
        <div className="md:w-1/2 bg-[#0A0B0E] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#2D3139]">
          <div className="text-center mb-4">
            <h3 className="text-sm font-mono text-[#C69C6D] tracking-wider uppercase font-bold">Beskar Forge Preview</h3>
            <p className="text-xs text-[#8E9299] font-mono">Rank: {character.rank}</p>
          </div>

          {/* Animated SVG Figure of the Mandalorian Armor Modules */}
          <div className="relative w-64 h-80 flex items-center justify-center bg-[#0D1016]/40 rounded-xl border border-[#2D3139] p-4">
            <svg viewBox="0 0 200 240" className="w-full h-full">
              {/* Wireframe background silhouette */}
              <path d="M 100 20 L 140 60 L 130 110 L 100 130 L 70 110 L 60 60 Z" fill="#1A1D23" stroke="#2D3139" strokeWidth="1" />
              <path d="M 100 130 L 145 170 L 125 220 L 100 210 L 75 220 L 55 170 Z" fill="#0A0B0E" stroke="#2D3139" strokeWidth="1" strokeDasharray="3,3" />

              {/* JETPACK BACKDROP */}
              <g
                id="svg_jetpack"
                onClick={() => { StarWarsSoundEngine.playClick(); setSelectedSlot("jetpack"); }}
                className="cursor-pointer group"
              >
                <path
                  d="M 40 70 L 30 140 L 55 130 Z M 160 70 L 170 140 L 145 130 Z"
                  fill={localArmor.jetpack.color}
                  stroke={selectedSlot === "jetpack" ? "#C69C6D" : "#2D3139"}
                  strokeWidth={selectedSlot === "jetpack" ? "3" : "1.5"}
                  className="transition-all hover:opacity-80"
                />
                <line x1="40" y1="70" x2="160" y2="70" stroke={localArmor.jetpack.color} strokeWidth="4" />
              </g>

              {/* HELMET MODULE */}
              <g
                id="svg_helmet"
                onClick={() => { StarWarsSoundEngine.playClick(); setSelectedSlot("helmet"); }}
                className="cursor-pointer group"
              >
                <path
                  d="M 75 20 C 75 20, 100 0, 125 20 C 125 20, 130 55, 125 65 L 75 65 C 70 55, 75 20, 75 20 Z"
                  fill={localArmor.helmet.color}
                  stroke={selectedSlot === "helmet" ? "#C69C6D" : "#2D3139"}
                  strokeWidth={selectedSlot === "helmet" ? "3" : "1.5"}
                  className="transition-all hover:opacity-80"
                />
                {/* T-Visor */}
                <path d="M 90 25 L 110 25 L 100 40 L 100 65 L 97 65 L 97 40 Z" fill="#0A0B0E" />
                <line x1="85" y1="35" x2="115" y2="35" stroke="#0A0B0E" strokeWidth="2" />
              </g>

              {/* CHEST PLATE MODULE */}
              <g
                id="svg_chest"
                onClick={() => { StarWarsSoundEngine.playClick(); setSelectedSlot("chest"); }}
                className="cursor-pointer group"
              >
                <path
                  d="M 65 75 L 135 75 L 140 120 L 100 135 L 60 120 Z"
                  fill={localArmor.chest.color}
                  stroke={selectedSlot === "chest" ? "#C69C6D" : "#2D3139"}
                  strokeWidth={selectedSlot === "chest" ? "3" : "1.5"}
                  className="transition-all hover:opacity-80"
                />
                {/* Sigil representation inside chest */}
                {localArmor.chest.sigil !== "None" && (
                  <circle cx="100" cy="100" r="10" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,2" />
                )}
              </g>

              {/* GAUNTLETS MODULE */}
              <g
                id="svg_gauntlets"
                onClick={() => { StarWarsSoundEngine.playClick(); setSelectedSlot("gauntlets"); }}
                className="cursor-pointer group"
              >
                {/* Left gauntlet */}
                <path
                  d="M 45 100 L 35 130 L 45 135 L 52 110 Z"
                  fill={localArmor.gauntlets.color}
                  stroke={selectedSlot === "gauntlets" ? "#C69C6D" : "#2D3139"}
                  strokeWidth={selectedSlot === "gauntlets" ? "3" : "1.5"}
                  className="transition-all hover:opacity-80"
                />
                {/* Right gauntlet */}
                <path
                  d="M 155 100 L 165 130 L 155 135 L 148 110 Z"
                  fill={localArmor.gauntlets.color}
                  stroke={selectedSlot === "gauntlets" ? "#C69C6D" : "#2D3139"}
                  strokeWidth={selectedSlot === "gauntlets" ? "3" : "1.5"}
                  className="transition-all hover:opacity-80"
                />
              </g>

              {/* Labels */}
              <text x="10" y="230" fill="#8E9299" fontSize="8" fontFamily="monospace" fontWeight="bold">CLICK SLOTS TO FOCUS PAINT</text>
            </svg>

            {/* Glowing Active Slot Badge */}
            <div className="absolute top-2 right-2 bg-[#0A0B0E]/80 text-[#C69C6D] font-mono text-[10px] px-2 py-1 rounded border border-[#2D3139]">
              ACTIVE: {selectedSlot.toUpperCase()}
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs font-mono text-[#8E9299] font-bold">SIGN OF THE FOUNDLING:</span>
            <p className="text-sm font-semibold font-mono text-[#C69C6D]">{currentPiece.sigil} Clan Sigil</p>
          </div>
        </div>

        {/* Right Editor Panel */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[80vh] md:max-h-none bg-[#0D1016]">
          <div>
            <h2 className="text-2xl font-semibold text-white font-mono tracking-tight flex items-center gap-2 mb-2">
              <Shield className="text-[#C69C6D]" /> ARMORER FORGE
            </h2>
            <p className="text-xs text-[#8E9299] mb-6 font-mono">
              Forge and color pure Mandalorian armor plates to adapt combat stats and elemental resistance.
            </p>

            {/* Slot selector tabs */}
            <div className="grid grid-cols-4 gap-1 bg-[#0A0B0E] p-1 rounded-lg border border-[#2D3139] mb-6">
              {(["helmet", "chest", "gauntlets", "jetpack"] as const).map((slot) => (
                <button
                  id={`slot_tab_${slot}`}
                  key={slot}
                  onClick={() => { StarWarsSoundEngine.playClick(); setSelectedSlot(slot); }}
                  className={`py-1.5 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                    selectedSlot === slot
                      ? "bg-[#C69C6D] text-[#0A0B0E] shadow-sm"
                      : "text-[#8E9299] hover:text-[#E0E0E0]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            {/* Armor Module Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#8E9299] mb-1.5 font-bold">Module Name Designation</label>
                <input
                  id="armor_name_input"
                  type="text"
                  value={currentPiece.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-[#0A0B0E] text-[#E0E0E0] border border-[#2D3139] rounded px-3 py-2 text-sm focus:border-[#C69C6D] focus:outline-none font-mono"
                />
              </div>

              {/* Dye selection */}
              <div>
                <label className="block text-xs font-mono text-[#8E9299] mb-2 font-bold">Select Paint Alloy (Dye)</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      id={`dye_${c.name.replace(/\s+/g, '_')}`}
                      key={c.name}
                      onClick={() => handleColorChange(c.value)}
                      style={{ backgroundColor: c.value }}
                      className={`h-10 rounded border-2 relative group flex items-center justify-center transition-all hover:scale-105 ${
                        currentPiece.color === c.value ? "border-[#C69C6D] shadow-md scale-105" : "border-transparent"
                      }`}
                      title={c.name}
                    >
                      {currentPiece.color === c.value && (
                        <div className="bg-[#0A0B0E]/80 text-[#C69C6D] p-0.5 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sigil selection */}
              <div>
                <label className="block text-xs font-mono text-[#8E9299] mb-2 font-bold">Engrave Tribal Sigil</label>
                <div className="grid grid-cols-3 gap-2">
                  {SIGILS.map((sigil) => (
                    <button
                      id={`sigil_${sigil.replace(/\s+/g, '_')}`}
                      key={sigil}
                      onClick={() => handleSigilChange(sigil)}
                      className={`py-2 px-1 text-xs font-mono border rounded transition-all ${
                        currentPiece.sigil === sigil
                          ? "bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]"
                          : "bg-[#0A0B0E] border-[#2D3139] text-[#8E9299] hover:text-[#E0E0E0]"
                      }`}
                    >
                      {sigil}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statistics Increments */}
              <div className="bg-[#0A0B0E]/60 p-4 rounded-lg border border-[#2D3139]">
                <span className="text-[10px] font-mono text-[#8E9299] uppercase block mb-2 font-bold">Stat Allocations:</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(currentPiece.stats).map(([stat, val]) => (
                    <div key={stat} className="flex justify-between border-b border-[#2D3139]/40 py-1">
                      <span className="text-[#8E9299] font-semibold">{stat.toUpperCase()}</span>
                      <span className="text-[#C69C6D] font-bold">+{val}</span>
                    </div>
                  ))}
                </div>

                <span className="text-[10px] font-mono text-[#8E9299] uppercase block mt-4 mb-2 font-bold">Elemental Resistances:</span>
                <div className="space-y-1.5 text-xs font-mono">
                  {Object.entries(currentPiece.elementResistances).map(([element, res]) => (
                    <div key={element} className="flex items-center justify-between">
                      <span className="text-[#8E9299] text-[10px] font-bold">{element}</span>
                      <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                        <div className="h-1.5 bg-[#0A0B0E] w-full rounded-full overflow-hidden">
                          <div style={{ width: `${res}%` }} className="h-full bg-[#C69C6D] rounded-full" />
                        </div>
                        <span className="text-[#E0E0E0] text-[10px] font-bold">{res}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-[#2D3139] bg-[#0D1016]">
            <button
              id="armor_forge_cancel"
              onClick={() => { StarWarsSoundEngine.playClick(); onClose(); }}
              className="px-4 py-2 text-xs font-mono text-[#8E9299] hover:text-white transition-all font-bold"
            >
              CANCEL
            </button>
            <button
              id="armor_forge_save"
              onClick={handleSave}
              className="flex items-center gap-1 px-4 py-2 border-2 border-[#C69C6D] bg-black text-[#C69C6D] hover:bg-[#C69C6D] hover:text-black rounded font-mono font-bold text-xs shadow-md transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" /> RE-CAST BESKAR PLATE
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
