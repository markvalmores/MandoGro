/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GameCharacter } from "../types";
import { StarWarsSoundEngine } from "../utils";
import { Compass, BookOpen, Star, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";

interface StoryModeProps {
  character: GameCharacter;
  currentPlanet: string;
  credits: number;
  choicesHistory: string[];
  onRewardCredits: (credits: number) => void;
  onUpdateChoicesHistory: (history: string[]) => void;
  onTravelPlanet: (planet: string) => void;
  onClose: () => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({
  character,
  currentPlanet,
  credits,
  choicesHistory,
  onRewardCredits,
  onUpdateChoicesHistory,
  onTravelPlanet,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Active story state fetched from server
  const [storyDialogue, setStoryDialogue] = useState<string>("");
  const [choices, setChoices] = useState<{ text: string; nextPrompt: string }[]>([]);
  const [activeAffinity, setActiveAffinity] = useState<string>("");
  const [bountyReward, setBountyReward] = useState<number>(1000);

  // Character portraits based on story context
  const [activePortrait, setActivePortrait] = useState<string>("Din Djarin");

  const loadStorySegment = async (promptText: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/gemini/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          currentPlanet,
          choicesHistory,
          characterName: character.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStoryDialogue(data.dialogue);
        setChoices(data.choices);
        setActiveAffinity(data.elementalAffinity);
        setBountyReward(data.bountyReward);
        
        // Dynamically select portrait based on response content to make it lively!
        if (data.dialogue.toLowerCase().includes("grogu")) {
          setActivePortrait("Grogu");
        } else if (data.dialogue.toLowerCase().includes("boba") || data.dialogue.toLowerCase().includes("fett")) {
          setActivePortrait("Boba Fett");
        } else if (data.dialogue.toLowerCase().includes("gideon")) {
          setActivePortrait("Moff Gideon");
        } else if (data.dialogue.toLowerCase().includes("bo-katan") || data.dialogue.toLowerCase().includes("kryze")) {
          setActivePortrait("Bo-Katan Kryze");
        } else {
          setActivePortrait("Din Djarin");
        }
      } else {
        setErrorMsg("Failed to sync transmission matrix with central servers.");
      }
    } catch (e) {
      setErrorMsg("Central server transmission drop. Outpost fallback triggered.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial story loading sequence
    loadStorySegment("Landing at the central outpost docks.");
  }, [currentPlanet]);

  const handleChoiceSelect = (choiceText: string, nextPrompt: string) => {
    StarWarsSoundEngine.playClick();
    onRewardCredits(bountyReward);
    
    // Append choice to history
    const updatedHistory = [...choicesHistory, choiceText];
    onUpdateChoicesHistory(updatedHistory);
    
    // Reward and load next segment
    loadStorySegment(nextPrompt);
  };

  return (
    <div id="story_mode_panel" className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0D1016] border border-[#2D3139] rounded-xl max-w-4xl w-full flex flex-col h-[85vh] shadow-2xl overflow-hidden font-sans">
        
        {/* Header bar */}
        <div className="border-b border-[#2D3139] p-4 bg-[#0D1016] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="text-[#C69C6D] w-5 h-5" />
            <div>
              <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                TACTICAL STORY CAMPAIGN
              </h2>
              <p className="text-[10px] text-[#8E9299] font-mono uppercase">Branching Narrative Matrix • Gemini Powered</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-[#0A0B0E] px-3 py-1.5 rounded border border-[#C69C6D]/20 font-mono text-xs">
            <span className="text-[#8E9299] font-bold">CURRENT REGION:</span>
            <span className="text-[#C69C6D] font-bold">{currentPlanet.toUpperCase()} SYSTEM</span>
          </div>
        </div>

        {/* Story Body splits */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0A0B0E]/40">
          
          {/* Left Character Portrait Column */}
          <div className="md:w-1/3 bg-[#0A0B0E]/80 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#2D3139]/80">
            <div className="relative w-44 h-44 rounded-xl border border-[#2D3139] overflow-hidden bg-[#0A0B0E] p-1 flex items-center justify-center shadow-lg group">
              
              {/* Dynamic Portrait rendering */}
              <div className="w-full h-full bg-[#0D1016] rounded flex flex-col items-center justify-center text-center relative overflow-hidden">
                {activePortrait === "Grogu" ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-12 bg-emerald-600 rounded-full flex items-center justify-center relative">
                      <div className="absolute -left-4 w-6 h-4 bg-emerald-600 rounded-l-full transform -rotate-12" />
                      <div className="absolute -right-4 w-6 h-4 bg-emerald-600 rounded-r-full transform rotate-12" />
                      <div className="w-2 h-2 bg-black rounded-full mx-1" />
                      <div className="w-2 h-2 bg-black rounded-full mx-1" />
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-3 uppercase tracking-wider font-bold">THE CHILD</div>
                  </div>
                ) : activePortrait === "Boba Fett" ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-16 bg-green-800 rounded-t-xl border border-red-600 relative flex items-center justify-center">
                      <div className="w-10 h-2 bg-neutral-900 mt-2" />
                    </div>
                    <div className="text-[10px] text-green-400 font-mono mt-3 uppercase tracking-wider font-bold">BOBA FETT</div>
                  </div>
                ) : activePortrait === "Moff Gideon" ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-neutral-800 rounded-full border-2 border-rose-600 relative flex items-center justify-center">
                      <div className="w-10 h-10 bg-neutral-900 rounded-full" />
                    </div>
                    <div className="text-[10px] text-rose-500 font-mono mt-3 uppercase tracking-wider font-bold">MOFF GIDEON</div>
                  </div>
                ) : activePortrait === "Bo-Katan Kryze" ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-sky-900 rounded-t-lg border-2 border-sky-400 relative flex items-center justify-center">
                      <div className="w-10 h-4 bg-neutral-900" />
                    </div>
                    <div className="text-[10px] text-sky-400 font-mono mt-3 uppercase tracking-wider font-bold">BO-KATAN</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-neutral-600 rounded-t-full border border-neutral-400 relative flex items-center justify-center">
                      <div className="w-10 h-2 bg-neutral-950" />
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-3 uppercase tracking-wider font-bold">DIN DJARIN</div>
                  </div>
                )}
                
                {/* HUD overlays */}
                <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#C69C6D]/50" />
                <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#C69C6D]/50" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#C69C6D]/50" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#C69C6D]/50" />
              </div>

            </div>

            <div className="mt-4 text-center space-y-1 font-mono text-xs">
              <span className="text-[#8E9299] text-[10px] uppercase block font-bold">TRANSMITTING VOICE:</span>
              <p className="text-[#C69C6D] font-bold">{activePortrait.toUpperCase()}</p>
              <div className="bg-[#0D1016] border border-[#2D3139] px-2 py-1 rounded text-[10px] text-[#8E9299] font-bold mt-2">
                AFFINITY: {activeAffinity || "Beskar-Physical"}
              </div>
            </div>
          </div>

          {/* Right Dialogue & Choices Area */}
          <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
            
            {/* Main story panel */}
            <div className="space-y-4">
              {loading ? (
                <div className="h-44 flex flex-col items-center justify-center gap-3 text-neutral-400 font-mono text-xs">
                  <RefreshCw className="w-8 h-8 text-[#C69C6D] animate-spin" />
                  <span>DECRYPTING HOLONET STORY MATRICES...</span>
                </div>
              ) : errorMsg ? (
                <div className="h-44 flex flex-col items-center justify-center gap-2 text-rose-400 font-mono text-xs text-center p-4">
                  <AlertTriangle className="w-10 h-10 animate-bounce" />
                  <span>{errorMsg}</span>
                  <button onClick={() => loadStorySegment("Reconnecting datapad.")} className="mt-3 bg-black border border-[#2D3139] hover:bg-[#1A1D23] duration-300 text-white font-bold font-mono px-4 py-2 rounded">
                    RETRY MATRIX
                  </button>
                </div>
              ) : (
                <div className="space-y-4 font-mono">
                  <div className="bg-[#0A0B0E]/80 p-5 rounded-xl border border-[#2D3139] shadow-inner">
                    <p className="text-sm leading-relaxed text-[#E0E0E0]">
                      {storyDialogue || "The stars stretch before you in hyperspace. Select an entry maneuver."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#8E9299] border-b border-[#2D3139] pb-2 font-bold">
                    <span>ESTIMATED BOUNTY CONTRACT VALUE:</span>
                    <span className="text-[#C69C6D] font-bold">+{bountyReward} CREDITS</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action options */}
            {!loading && !errorMsg && (
              <div className="mt-6 space-y-2.5">
                <span className="text-[10px] font-mono text-[#8E9299] uppercase tracking-widest block font-bold">CHOOSE YOUR PATHWAYS:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                  {choices.map((choice, index) => (
                    <button
                      id={`btn_story_choice_${index}`}
                      key={index}
                      onClick={() => handleChoiceSelect(choice.text, choice.nextPrompt)}
                      className="p-4 bg-[#0A0B0E] border border-[#2D3139] hover:border-[#C69C6D] text-left rounded-lg text-xs hover:bg-[#1A1D23]/60 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <span className="text-[#E0E0E0] group-hover:text-[#C69C6D] font-bold transition-colors">{choice.text}</span>
                      <span className="text-[10px] text-[#8E9299] mt-2 italic truncate w-full">{choice.nextPrompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Travel planet backup choice */}
            <div className="mt-6 pt-4 border-t border-[#2D3139]/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
              <span className="text-[#8E9299] font-bold">TRAVEL TO OTHER QUADRANTS:</span>
              <div className="flex gap-2">
                {["Tatooine", "Nevarro", "Coruscant", "Mandalore"].map((p) => (
                  <button
                    id={`btn_story_travel_${p}`}
                    key={p}
                    disabled={p === currentPlanet}
                    onClick={() => { StarWarsSoundEngine.playClick(); onTravelPlanet(p); }}
                    className={`px-3 py-1.5 rounded border text-[10px] transition-all cursor-pointer ${
                      p === currentPlanet
                        ? "bg-[#C69C6D]/10 border-[#C69C6D]/30 text-[#C69C6D] font-bold"
                        : "bg-[#0A0B0E] border-[#2D3139] text-[#8E9299] hover:text-white hover:border-[#C69C6D]/50 duration-300"
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-[#2D3139] p-4 bg-[#0D1016] flex justify-end">
          <button
            id="story_mode_close"
            onClick={() => { StarWarsSoundEngine.playClick(); onClose(); }}
            className="px-6 py-2 border border-[#2D3139] bg-black hover:bg-[#1A1D23] rounded text-white font-mono text-xs font-bold transition-all duration-300"
          >
            DISCONNECT DATAPAD
          </button>
        </div>

      </div>
    </div>
  );
};
