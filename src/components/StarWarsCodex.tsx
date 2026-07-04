/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Sparkles, Database, Ship, Globe, UserCheck, Skull, Compass, Activity, ShieldAlert, Loader2, HelpCircle } from "lucide-react";
import { StarWarsSoundEngine } from "../utils";
import { ElementAffinity } from "../types";

// Dynamic backup characters list in case the network fails, or if offline
const BACKUP_CHARACTERS = [
  {
    id: 1,
    name: "Luke Skywalker",
    image: "https://starwars-visualguide.com/assets/img/characters/1.jpg",
    species: "human",
    homeworld: "tatooine",
    affiliations: ["Alliance to Restore the Republic", "Jedi Order"],
    height: 1.72,
    mass: 77,
    gender: "male",
  },
  {
    id: 4,
    name: "Darth Vader",
    image: "https://starwars-visualguide.com/assets/img/characters/4.jpg",
    species: "human",
    homeworld: "tatooine",
    affiliations: ["Galactic Empire", "Sith Order"],
    height: 2.02,
    mass: 136,
    gender: "male",
  },
  {
    id: 10,
    name: "Obi-Wan Kenobi",
    image: "https://starwars-visualguide.com/assets/img/characters/10.jpg",
    species: "human",
    homeworld: "stewjon",
    affiliations: ["Alliance to Restore the Republic", "Jedi Order", "Galactic Republic"],
    height: 1.82,
    mass: 77,
    gender: "male",
  },
  {
    id: 13,
    name: "Chewbacca",
    image: "https://starwars-visualguide.com/assets/img/characters/13.jpg",
    species: "wookiee",
    homeworld: "kashyyyk",
    affiliations: ["Alliance to Restore the Republic", "Jedi Order"],
    height: 2.28,
    mass: 112,
    gender: "male",
  },
  {
    id: 20,
    name: "Yoda",
    image: "https://starwars-visualguide.com/assets/img/characters/20.jpg",
    species: "Yoda's species",
    homeworld: "unknown",
    affiliations: ["Jedi Order", "Galactic Republic"],
    height: 0.66,
    mass: 17,
    gender: "male",
  },
  {
    id: 21,
    name: "Palpatine",
    image: "https://starwars-visualguide.com/assets/img/characters/21.jpg",
    species: "human",
    homeworld: "naboo",
    affiliations: ["Galactic Empire", "Sith Order", "Galactic Republic"],
    height: 1.73,
    mass: 75,
    gender: "male",
  },
  {
    id: 22,
    name: "Boba Fett",
    image: "https://starwars-visualguide.com/assets/img/characters/22.jpg",
    species: "human",
    homeworld: "kamino",
    affiliations: ["Bounty Hunters' Guild", "Galactic Empire"],
    height: 1.83,
    mass: 78,
    gender: "male",
  },
  {
    id: 44,
    name: "Darth Maul",
    image: "https://starwars-visualguide.com/assets/img/characters/44.jpg",
    species: "zabrak",
    homeworld: "dathomir",
    affiliations: ["Sith Order", "Shadow Collective", "Death Watch"],
    height: 1.75,
    mass: 80,
    gender: "male",
  }
];

const BACKUP_PLANETS = [
  { id: 1, name: "Tatooine", climate: "arid", terrain: "desert", population: "200000" },
  { id: 2, name: "Alderaan", climate: "temperate", terrain: "grasslands, mountains", population: "2000000000" },
  { id: 3, name: "Yavin IV", climate: "temperate, tropical", terrain: "jungle, rainforests", population: "1000" },
  { id: 4, name: "Hoth", climate: "frozen", terrain: "tundra, ice caves", population: "unknown" },
  { id: 5, name: "Dagobah", climate: "murky", terrain: "swamp, jungles", population: "unknown" },
  { id: 8, name: "Naboo", climate: "temperate", terrain: "grassy hills, swamps, forests", population: "4500000000" },
];

const BACKUP_STARSHIPS = [
  { id: 12, name: "X-wing fighter", model: "T-65 X-wing", cost_in_credits: "149999", max_atmosphering_speed: "1050", hyperdrive_rating: "1.0" },
  { id: 13, name: "TIE Advanced x1", model: "Twin Ion Engine Advanced x1", cost_in_credits: "unknown", max_atmosphering_speed: "1200", hyperdrive_rating: "1.0" },
  { id: 10, name: "Millennium Falcon", model: "YT-1300 light freighter", cost_in_credits: "100000", max_atmosphering_speed: "1050", hyperdrive_rating: "0.5" },
  { id: 21, name: "Razor Crest", model: "ST-70 Assault Ship", cost_in_credits: "85000", max_atmosphering_speed: "1000", hyperdrive_rating: "1.5" },
];

interface StarWarsCodexProps {
  onClose: () => void;
  onSummonEnemy: (enemy: { name: string; hp: number; shield: number; attack: number; defense: number; element: ElementAffinity; portrait: string }) => void;
  onSummonCompanion: (companion: { name: string; hp: number; shield: number; attack: number; portrait: string }) => void;
  onApplyPortrait: (portraitUrl: string) => void;
  onTravelPlanet: (planetName: string) => void;
  onEquipShip: (ship: { weapon: string; hull: string }) => void;
}

export const StarWarsCodex: React.FC<StarWarsCodexProps> = ({
  onClose,
  onSummonEnemy,
  onSummonCompanion,
  onApplyPortrait,
  onTravelPlanet,
  onEquipShip,
}) => {
  const [activeTab, setActiveTab] = useState<"characters" | "planets" | "starships">("characters");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  // API Data arrays
  const [characters, setCharacters] = useState<any[]>([]);
  const [planets, setPlanets] = useState<any[]>([]);
  const [starships, setStarships] = useState<any[]>([]);

  // Selected Item details modal inside Codex
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Fetch API content on component load
  useEffect(() => {
    fetchCharacters();
    fetchPlanets();
    fetchStarships();
  }, []);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      // Fetching Akabab Star Wars API (highly detailed character profiles + images)
      const res = await fetch("https://akabab.github.io/starwars-api/api/all.json");
      if (res.ok) {
        const data = await res.json();
        // Take a beautiful subset or map them
        setCharacters(data);
      } else {
        throw new Error("HTTP error " + res.status);
      }
    } catch (err) {
      console.warn("Using offline Backup Characters API due to fetch failure", err);
      setCharacters(BACKUP_CHARACTERS);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanets = async () => {
    try {
      const res = await fetch("https://swapi.info/api/planets");
      if (res.ok) {
        const data = await res.json();
        // Parse SWAPI planets to keep them clean
        const mapped = data.map((p: any) => {
          const parts = p.url.split("/");
          const swapiId = parts[parts.length - 1] || parts[parts.length - 2];
          return {
            id: swapiId,
            name: p.name,
            climate: p.climate,
            terrain: p.terrain,
            population: p.population,
            diameter: p.diameter,
          };
        });
        setPlanets(mapped);
      } else {
        throw new Error();
      }
    } catch (err) {
      setPlanets(BACKUP_PLANETS);
    }
  };

  const fetchStarships = async () => {
    try {
      const res = await fetch("https://swapi.info/api/starships");
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((s: any) => {
          const parts = s.url.split("/");
          const swapiId = parts[parts.length - 1] || parts[parts.length - 2];
          return {
            id: swapiId,
            name: s.name,
            model: s.model,
            cost_in_credits: s.cost_in_credits,
            max_atmosphering_speed: s.max_atmosphering_speed,
            hyperdrive_rating: s.hyperdrive_rating,
          };
        });
        setStarships(mapped);
      } else {
        throw new Error();
      }
    } catch (err) {
      setStarships(BACKUP_STARSHIPS);
    }
  };

  // Safe image loader fallbacks
  const getCharacterImage = (char: any) => {
    if (char.image) return char.image;
    // Fallback using visualguide standard CDN
    return `https://starwars-visualguide.com/assets/img/characters/${char.id}.jpg`;
  };

  const getPlanetImage = (id: any) => {
    return `https://starwars-visualguide.com/assets/img/planets/${id}.jpg`;
  };

  const getStarshipImage = (id: any) => {
    return `https://starwars-visualguide.com/assets/img/starships/${id}.jpg`;
  };

  // Action handlers
  const triggerSummonEnemy = (char: any) => {
    StarWarsSoundEngine.playExplosion();
    // Estimate logical stats from the physical size
    const hpVal = Math.floor(100 + (char.mass || 80) * 1.2);
    const attackVal = Math.floor(15 + (char.height || 1.8) * 6);
    const shieldVal = char.affiliations?.some((a: string) => a.includes("Empire") || a.includes("Sith")) ? 80 : 40;
    
    // Pick elemental affinity based on affiliations
    let affinity = ElementAffinity.BESKAR_PHYSICAL;
    if (char.affiliations?.some((a: string) => a.includes("Sith") || a.includes("Jedi"))) {
      affinity = ElementAffinity.FORCE_AFFILIATION;
    } else if (char.affiliations?.some((a: string) => a.includes("Empire"))) {
      affinity = ElementAffinity.BLASTER_ENERGY;
    }

    onSummonEnemy({
      name: `${char.name} (Holo-Summon)`,
      hp: hpVal,
      shield: shieldVal,
      attack: attackVal,
      defense: 12,
      element: affinity,
      portrait: getCharacterImage(char),
    });

    showFeedback(`Summoned ${char.name} as Holographic Arena Combatant!`);
  };

  const triggerSummonCompanion = (char: any) => {
    StarWarsSoundEngine.playLightsaber();
    onSummonCompanion({
      name: char.name,
      hp: Math.floor(100 + (char.mass || 70)),
      shield: 60,
      attack: Math.floor(15 + (char.height || 1.8) * 8),
      portrait: getCharacterImage(char),
    });

    showFeedback(`Activated ${char.name} as your Holographic Co-op Fighter!`);
  };

  const triggerApplyPortrait = (char: any) => {
    StarWarsSoundEngine.playForceHeal();
    onApplyPortrait(getCharacterImage(char));
    showFeedback(`Updated Player Codex Face Matrix to ${char.name}!`);
  };

  const triggerTravelPlanet = (planet: any) => {
    StarWarsSoundEngine.playForceHeal();
    onTravelPlanet(planet.name);
    showFeedback(`Hyperdrive plotted! Navigation system set to ${planet.name}.`);
  };

  const triggerEquipShip = (ship: any) => {
    StarWarsSoundEngine.playBlaster();
    onEquipShip({
      weapon: `${ship.model || "Laser Cannon Mk-I"} Frame`,
      hull: `${ship.name} Plated Fuselage`,
    });
    showFeedback(`Equipped ${ship.name} framework to your assault craft!`);
  };

  // Filter lists based on search
  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.affiliations?.some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.species?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlanets = planets.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.climate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.terrain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStarships = starships.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="starwars_codex_modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0D1016] border border-[#2D3139] rounded-xl max-w-5xl w-full flex flex-col h-[90vh] shadow-[0_0_50px_rgba(56,189,248,0.2)] overflow-hidden font-sans"
      >
        {/* Top Header */}
        <div className="border-b border-[#2D3139] p-4 bg-[#0A0B0E] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Database className="text-[#38bdf8] w-5 h-5 animate-pulse" />
            <h2 className="text-lg font-bold font-mono text-white tracking-wide uppercase flex items-center gap-2">
              STAR WARS CANONICAL HOLONET API MATRIX
              <span className="text-[9px] text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/20 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
                REST API Integration
              </span>
            </h2>
          </div>

          <div className="flex gap-1.5 bg-[#0A0B0E] p-1 rounded-lg border border-[#2D3139]">
            {(["characters", "planets", "starships"] as const).map((tab) => (
              <button
                id={`codex_tab_${tab}`}
                key={tab}
                onClick={() => { StarWarsSoundEngine.playClick(); setActiveTab(tab); setSelectedItem(null); }}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#38bdf8] text-[#0A0B0E]"
                    : "text-[#8E9299] hover:text-[#E0E0E0]"
                }`}
              >
                {tab === "characters" ? "Characters (Bio)" : tab === "planets" ? "Planets (SWAPI)" : "Starships (SWAPI)"}
              </button>
            ))}
          </div>
        </div>

        {/* Global Feedback notification bar */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-400 text-xs font-mono px-4 py-2 text-center font-semibold"
            >
              🚀 {feedbackMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter / Search Bar */}
        <div className="p-4 bg-[#090A0D] border-b border-[#2D3139] flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
            <input
              id="codex_search_input"
              type="text"
              placeholder={`Search ${activeTab}... (e.g., Luke, Tatooine, X-wing)`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D1016] text-[#E0E0E0] border border-[#2D3139] hover:border-[#5c6169] focus:border-[#38bdf8] rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none font-mono"
            />
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="text-xs text-[#8E9299] hover:text-white font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dynamic Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left panel: Directory listing */}
          <div className="w-1/2 overflow-y-auto p-4 border-r border-[#2D3139]/50 bg-[#0A0B0E]/30 space-y-2.5">
            
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-3 text-neutral-500 font-mono">
                <Loader2 className="w-8 h-8 text-[#38bdf8] animate-spin" />
                <span className="text-xs">Synchronizing sector database from Star Wars API...</span>
              </div>
            )}

            {!loading && activeTab === "characters" && (
              filteredCharacters.length === 0 ? (
                <div className="text-center py-10 text-xs text-neutral-500 font-mono">No matching records detected.</div>
              ) : (
                filteredCharacters.map((char) => (
                  <motion.div
                    key={char.id}
                    onClick={() => { StarWarsSoundEngine.playClick(); setSelectedItem(char); }}
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(56,189,248,0.05)" }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 font-mono ${
                      selectedItem?.name === char.name
                        ? "bg-[#38bdf8]/10 border-[#38bdf8]"
                        : "bg-[#0D1016] border-[#2D3139] hover:border-neutral-500"
                    }`}
                  >
                    <img
                      src={getCharacterImage(char)}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // fallback to placeholder or standard visualguide url
                        (e.target as HTMLImageElement).src = `https://starwars-visualguide.com/assets/img/characters/${char.id}.jpg`;
                      }}
                      className="w-10 h-12 object-cover rounded border border-neutral-700 bg-neutral-900"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-bold text-xs text-white block truncate">{char.name}</span>
                      <span className="text-[9px] text-[#8E9299] capitalize block truncate">
                        {char.species || "human"} • {char.homeworld || "unknown"}
                      </span>
                      {char.affiliations && char.affiliations.length > 0 && (
                        <span className="text-[8px] text-[#38bdf8] block truncate italic">
                          {char.affiliations[0]}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )
            )}

            {!loading && activeTab === "planets" && (
              filteredPlanets.length === 0 ? (
                <div className="text-center py-10 text-xs text-neutral-500 font-mono">No matching galactic coordinates.</div>
              ) : (
                filteredPlanets.map((planet) => (
                  <motion.div
                    key={planet.id}
                    onClick={() => { StarWarsSoundEngine.playClick(); setSelectedItem(planet); }}
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(56,189,248,0.05)" }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 font-mono ${
                      selectedItem?.name === planet.name
                        ? "bg-[#38bdf8]/10 border-[#38bdf8]"
                        : "bg-[#0D1016] border-[#2D3139] hover:border-neutral-500"
                    }`}
                  >
                    <img
                      src={getPlanetImage(planet.id)}
                      alt={planet.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://starwars-visualguide.com/assets/img/planets/2.jpg"; // Alderaan fallback
                      }}
                      className="w-10 h-10 object-cover rounded-full border border-neutral-700 bg-neutral-900"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-bold text-xs text-white block">{planet.name}</span>
                      <span className="text-[9px] text-[#8E9299] block">
                        Terrain: <span className="text-neutral-300 capitalize">{planet.terrain}</span>
                      </span>
                    </div>
                  </motion.div>
                ))
              )
            )}

            {!loading && activeTab === "starships" && (
              filteredStarships.length === 0 ? (
                <div className="text-center py-10 text-xs text-neutral-500 font-mono">No hyperdrive hulls detected.</div>
              ) : (
                filteredStarships.map((ship) => (
                  <motion.div
                    key={ship.id}
                    onClick={() => { StarWarsSoundEngine.playClick(); setSelectedItem(ship); }}
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(56,189,248,0.05)" }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 font-mono ${
                      selectedItem?.name === ship.name
                        ? "bg-[#38bdf8]/10 border-[#38bdf8]"
                        : "bg-[#0D1016] border-[#2D3139] hover:border-neutral-500"
                    }`}
                  >
                    <img
                      src={getStarshipImage(ship.id)}
                      alt={ship.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://starwars-visualguide.com/assets/img/starships/12.jpg"; // X-wing fallback
                      }}
                      className="w-12 h-10 object-cover rounded border border-neutral-700 bg-neutral-900"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-bold text-xs text-white block truncate">{ship.name}</span>
                      <span className="text-[9px] text-[#8E9299] block truncate">
                        Model: <span className="text-neutral-300">{ship.model}</span>
                      </span>
                    </div>
                  </motion.div>
                ))
              )
            )}

          </div>

          {/* Right panel: Active Card visualizer with full holographic details */}
          <div className="flex-1 bg-[#090A0D] p-6 overflow-y-auto flex flex-col justify-between relative">
            
            {/* Ambient holographic background effects */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-sky-500/20 animate-pulse pointer-events-none" />

            <AnimatePresence mode="wait">
              {selectedItem ? (
                <motion.div
                  key={selectedItem.name + activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col justify-between h-full space-y-6 relative z-10"
                >
                  <div className="space-y-5">
                    
                    {/* Visual hologram header card */}
                    <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start border-b border-[#2D3139] pb-5">
                      <div className="relative group">
                        {/* Outer pulsing hologram glow */}
                        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 opacity-20 blur group-hover:opacity-40 transition-opacity animate-pulse" />
                        
                        <img
                          src={
                            activeTab === "characters"
                              ? getCharacterImage(selectedItem)
                              : activeTab === "planets"
                              ? getPlanetImage(selectedItem.id)
                              : getStarshipImage(selectedItem.id)
                          }
                          alt={selectedItem.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (activeTab === "planets") img.src = "https://starwars-visualguide.com/assets/img/planets/2.jpg";
                            else if (activeTab === "starships") img.src = "https://starwars-visualguide.com/assets/img/starships/12.jpg";
                            else img.src = `https://starwars-visualguide.com/assets/img/characters/${selectedItem.id}.jpg`;
                          }}
                          className="w-32 h-44 sm:w-28 sm:h-36 object-cover rounded-lg border border-sky-500/30 relative z-10 shadow-lg bg-neutral-900"
                        />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10 pointer-events-none" />
                        
                        {/* Holographic scanner line overlay */}
                        <div className="absolute top-0 bottom-0 left-0 right-0 overflow-hidden pointer-events-none rounded-lg z-20">
                          <div className="w-full h-0.5 bg-sky-400 opacity-50 animate-scan-fast" />
                        </div>
                      </div>

                      <div className="flex-1 text-center sm:text-left space-y-1.5 font-mono">
                        <span className="text-[#38bdf8] text-[10px] font-bold tracking-widest block uppercase">
                          // SECURE DATA-FEED IDENTIFIED
                        </span>
                        <h3 className="text-xl font-extrabold text-white tracking-tight">{selectedItem.name}</h3>
                        
                        {activeTab === "characters" && (
                          <>
                            <p className="text-xs text-[#8E9299]">Species: <span className="text-neutral-200 capitalize font-semibold">{selectedItem.species || "human"}</span></p>
                            <p className="text-xs text-[#8E9299]">Gender: <span className="text-neutral-200 capitalize">{selectedItem.gender || "unknown"}</span></p>
                            <p className="text-xs text-[#8E9299]">Homeworld: <span className="text-neutral-200 capitalize">{selectedItem.homeworld || "unknown"}</span></p>
                          </>
                        )}

                        {activeTab === "planets" && (
                          <>
                            <p className="text-xs text-[#8E9299]">Climate: <span className="text-neutral-200 capitalize font-semibold">{selectedItem.climate}</span></p>
                            <p className="text-xs text-[#8E9299]">Terrain: <span className="text-neutral-200 capitalize font-semibold">{selectedItem.terrain}</span></p>
                            <p className="text-xs text-[#8E9299]">Population: <span className="text-[#38bdf8] font-bold">{selectedItem.population}</span></p>
                          </>
                        )}

                        {activeTab === "starships" && (
                          <>
                            <p className="text-xs text-[#8E9299]">Model: <span className="text-neutral-200 font-semibold">{selectedItem.model}</span></p>
                            <p className="text-xs text-[#8E9299]">Atmosphere Speed: <span className="text-[#38bdf8] font-bold">{selectedItem.max_atmosphering_speed}</span></p>
                            <p className="text-xs text-[#8E9299]">Hyperdrive Rating: <span className="text-orange-400 font-bold">{selectedItem.hyperdrive_rating}</span></p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Specifications detail cards */}
                    <div className="bg-[#0A0B0E] p-4 rounded-xl border border-[#2D3139]/70 space-y-3 font-mono text-xs">
                      <span className="text-sky-400/90 font-bold uppercase text-[10px] block tracking-wider">
                        TRANSCEIVER DOSSIER ARCHIVES:
                      </span>
                      
                      {activeTab === "characters" && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-[#2D3139]/40 pb-1.5">
                            <span className="text-[#8E9299]">Height Meterage:</span>
                            <span className="text-white font-semibold">{selectedItem.height || "1.8"} m</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-[#2D3139]/40 pb-1.5">
                            <span className="text-[#8E9299]">Physical Mass:</span>
                            <span className="text-white font-semibold">{selectedItem.mass || "75"} kg</span>
                          </div>
                          <div className="space-y-1 pt-1.5">
                            <span className="text-[#8E9299] block">Affiliations (Faction Alignments):</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedItem.affiliations?.map((aff: string, i: number) => (
                                <span key={i} className="text-[9px] bg-sky-950/40 border border-sky-500/20 text-sky-400 px-2 py-0.5 rounded">
                                  {aff}
                                </span>
                              )) || <span className="text-neutral-600 text-[10px]">Independent Bounty Hunter</span>}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "planets" && (
                        <div className="space-y-2 text-[11px]">
                          <div className="flex justify-between py-1 border-b border-[#2D3139]/40">
                            <span className="text-[#8E9299]">System Diameter:</span>
                            <span className="text-white font-semibold">{selectedItem.diameter} km</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#2D3139]/40">
                            <span className="text-[#8E9299]">Local Gravity Constants:</span>
                            <span className="text-white">1.0 Standard</span>
                          </div>
                          <p className="text-[10px] text-[#8E9299] leading-relaxed pt-1.5">
                            This sector remains under the radar tracking grids of both the New Republic and local syndicates. Exercise extreme caution.
                          </p>
                        </div>
                      )}

                      {activeTab === "starships" && (
                        <div className="space-y-2 text-[11px]">
                          <div className="flex justify-between py-1 border-b border-[#2D3139]/40">
                            <span className="text-[#8E9299]">Canonical Hull cost:</span>
                            <span className="text-amber-500 font-bold">{selectedItem.cost_in_credits} Credits</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#2D3139]/40">
                            <span className="text-[#8E9299]">Hyperdrive Rating:</span>
                            <span className="text-emerald-400 font-semibold">{selectedItem.hyperdrive_rating} Class</span>
                          </div>
                          <p className="text-[10px] text-[#8E9299] leading-relaxed pt-1.5">
                            Heavy vector drives equipped. Excellent structural integrity and flight dynamics certified for hyperspace.
                          </p>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Interactive Action Summon triggers */}
                  <div className="space-y-2 pt-4 border-t border-[#2D3139] font-mono">
                    
                    {activeTab === "characters" && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => triggerSummonEnemy(selectedItem)}
                          className="flex items-center justify-center gap-1.5 p-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 hover:border-rose-500 text-rose-400 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer"
                        >
                          <Skull className="w-3.5 h-3.5" /> Summon Enemy
                        </button>
                        <button
                          onClick={() => triggerSummonCompanion(selectedItem)}
                          className="flex items-center justify-center gap-1.5 p-2 bg-sky-950/20 hover:bg-sky-950/40 border border-sky-500/30 hover:border-sky-500 text-sky-400 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Summon Ally
                        </button>
                        <button
                          onClick={() => triggerApplyPortrait(selectedItem)}
                          className="flex items-center justify-center gap-1.5 p-2 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/30 hover:border-purple-500 text-purple-400 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5" /> Use Portrait
                        </button>
                      </div>
                    )}

                    {activeTab === "planets" && (
                      <button
                        onClick={() => triggerTravelPlanet(selectedItem)}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-sky-950/20 hover:bg-sky-950/40 border border-sky-500/30 hover:border-sky-500 text-sky-400 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer"
                      >
                        <Compass className="w-4 h-4 animate-spin-slow" /> Plot Hyperdrive to {selectedItem.name}
                      </button>
                    )}

                    {activeTab === "starships" && (
                      <button
                        onClick={() => triggerEquipShip(selectedItem)}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer"
                      >
                        <Ship className="w-4 h-4" /> Mount Hull to Razer Crest Loadout
                      </button>
                    )}

                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-neutral-500 font-mono py-20">
                  <Activity className="w-12 h-12 text-sky-500/40 animate-pulse" />
                  <div className="space-y-1 max-w-sm">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Holographic Spec-Viewer Offline</h4>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                      Select any record from the left directory transponder to feed character, planet coordinates, or starship specifications into the tactical HUD receiver.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* Footer controls */}
        <div className="border-t border-[#2D3139] p-4 bg-[#0A0B0E] flex justify-between items-center text-xs font-mono">
          <span className="text-neutral-500 hidden sm:inline">// Connected via secure external Holonet CDN feeds</span>
          <button
            id="codex_close_btn"
            onClick={() => { StarWarsSoundEngine.playClick(); onClose(); }}
            className="px-6 py-2.5 border border-[#2D3139] bg-black hover:bg-neutral-900 text-white hover:text-[#38bdf8] rounded-lg font-bold tracking-wider transition-all cursor-pointer"
          >
            DISCONNECT HOLONET ACCESS
          </button>
        </div>

      </motion.div>
    </div>
  );
};
