/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { GameCharacter, SkillTree as SkillTreeType, SkillNode } from "../types";
import { StarWarsSoundEngine } from "../utils";
import { Sparkles, Award, Lock, CheckCircle2, ShieldAlert } from "lucide-react";

interface SkillTreeProps {
  character: GameCharacter;
  onUpdateCharacter: (updatedCharacter: GameCharacter) => void;
  onClose: () => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({
  character,
  onUpdateCharacter,
  onClose,
}) => {

  const handleUnlockSkill = (branchIdx: number, skillId: string, cost: number) => {
    if (character.skillPoints < cost) {
      StarWarsSoundEngine.playClick();
      return; // Not enough points
    }

    const updatedCharacter = { ...character };
    const branch = updatedCharacter.skills[branchIdx];
    const skillNode = branch.skills.find((s) => s.id === skillId);

    if (!skillNode || skillNode.unlocked) return;

    // Check if prerequisite is unlocked
    if (skillNode.requiredSkillId) {
      const prereq = branch.skills.find((s) => s.id === skillNode.requiredSkillId);
      if (!prereq || !prereq.unlocked) {
        StarWarsSoundEngine.playClick();
        return; // Prerequisite locked
      }
    }

    // Unlock node
    skillNode.unlocked = true;
    updatedCharacter.skillPoints -= cost;

    // Apply permanent stat bonus if any
    if (skillNode.statBonus) {
      Object.entries(skillNode.statBonus).forEach(([statKey, bonusVal]) => {
        const key = statKey as keyof typeof updatedCharacter.stats;
        updatedCharacter.stats[key] = (updatedCharacter.stats[key] as number) + (bonusVal as number);
        updatedCharacter.baseStats[key] = (updatedCharacter.baseStats[key] as number) + (bonusVal as number);
      });
    }

    // Play Force or spark sound
    if (branch.branchName.includes("Grogu")) {
      StarWarsSoundEngine.playForceHeal();
    } else {
      StarWarsSoundEngine.playLightsaber();
    }

    onUpdateCharacter(updatedCharacter);
  };

  return (
    <div id="skill_tree_modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0D1016] border border-[#2D3139] rounded-xl max-w-5xl w-full flex flex-col max-h-[92vh] shadow-2xl overflow-hidden font-sans">
        
        {/* Header section with Skill Points indicator */}
        <div className="border-b border-[#2D3139] p-5 flex flex-col sm:flex-row justify-between items-center bg-[#0D1016] gap-4">
          <div className="flex items-center gap-3">
            <Award className="text-[#C69C6D] w-6 h-6 animate-pulse" />
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white font-mono">
                MANDALORIAN SKILL PATHWAYS
              </h2>
              <p className="text-xs text-[#8E9299] font-mono">Unlock advanced combat, jetpack maneuvers, or force bonds</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[#0A0B0E] border border-[#C69C6D]/30 px-5 py-2.5 rounded-lg">
            <span className="text-xs font-mono text-[#8E9299] font-bold">AVAILABLE ABILITY POINTS:</span>
            <span className="text-2xl font-bold font-mono text-[#C69C6D] animate-bounce">
              {character.skillPoints}
            </span>
          </div>
        </div>

        {/* Tree content scroll area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-[#0A0B0E]/60">
          
          {character.skills.map((treeBranch, branchIdx) => (
            <div key={treeBranch.branchName} className="space-y-4">
              <h3 className="text-sm font-mono font-bold text-[#C69C6D] tracking-widest uppercase border-b border-[#2D3139] pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C69C6D]" />
                {treeBranch.branchName}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {treeBranch.skills.map((skill) => {
                  const isUnlocked = skill.unlocked;
                  
                  // Check if prerequisite is met
                  let isPrereqMet = true;
                  let prereqName = "";
                  if (skill.requiredSkillId) {
                    const prereq = treeBranch.skills.find((s) => s.id === skill.requiredSkillId);
                    if (prereq) {
                      isPrereqMet = prereq.unlocked;
                      prereqName = prereq.name;
                    }
                  }

                  const canUnlock = !isUnlocked && isPrereqMet && character.skillPoints >= skill.cost;

                  return (
                    <div
                      key={skill.id}
                      className={`relative p-5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                        isUnlocked
                          ? "bg-[#C69C6D]/10 border-[#C69C6D]/60 shadow-[0_0_12px_rgba(198,156,109,0.15)] text-[#E0E0E0]"
                          : isPrereqMet
                          ? "bg-[#0A0B0E]/60 border-[#2D3139] text-[#E0E0E0] hover:border-[#C69C6D]/50 hover:bg-[#1A1D23]"
                          : "bg-[#0A0B0E]/20 border-[#2D3139]/40 text-[#5C6169] opacity-60"
                      }`}
                    >
                      {/* Top bar with level tag */}
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-mono tracking-widest text-[#8E9299] uppercase font-bold">
                          NODE CODE: {skill.id.toUpperCase()}
                        </span>
                        
                        {isUnlocked ? (
                          <span className="flex items-center gap-1 text-xs font-mono font-bold text-[#C69C6D]">
                            <CheckCircle2 className="w-4 h-4" /> ACTIVE
                          </span>
                        ) : !isPrereqMet ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-600">
                            <Lock className="w-3.5 h-3.5" /> LOCKED
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-semibold text-[#C69C6D] bg-[#C69C6D]/10 px-2 py-0.5 rounded border border-[#C69C6D]/20">
                            {skill.cost} AP
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="mb-4">
                        <h4 className={`text-base font-bold font-mono tracking-wide ${isUnlocked ? "text-[#C69C6D]" : "text-white"}`}>
                          {skill.name}
                        </h4>
                        <p className="text-xs mt-1.5 leading-relaxed text-[#8E9299]">
                          {skill.description}
                        </p>
                      </div>

                      {/* Stat or capability preview */}
                      <div className="mt-auto space-y-3">
                        {skill.statBonus && (
                          <div className="bg-[#0D1016] p-2 rounded text-[10px] font-mono border border-[#2D3139]/40 flex justify-between">
                            <span className="text-[#8E9299] font-bold">PASSIVE BOOSTS:</span>
                            <span className="text-green-500 font-bold">
                              {Object.entries(skill.statBonus)
                                .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                                .join(", ")}
                            </span>
                          </div>
                        )}

                        {skill.abilityUnlocked && (
                          <div className="bg-[#C69C6D]/10 p-2 rounded text-[10px] font-mono border border-[#C69C6D]/20 flex justify-between">
                            <span className="text-[#C69C6D]/80 font-bold">UNLOCKED ATTACK ABILITY:</span>
                            <span className="text-[#C69C6D] font-bold uppercase">{skill.abilityUnlocked}</span>
                          </div>
                        )}

                        {/* Prerequisite warning */}
                        {!isPrereqMet && prereqName && (
                          <div className="flex items-center gap-1.5 text-[9px] font-mono text-rose-500/80 mt-2 bg-rose-950/10 p-1.5 rounded border border-rose-500/25">
                            <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                            REQUIRES: {prereqName.toUpperCase()}
                          </div>
                        )}

                        {/* Action buttons */}
                        {!isUnlocked && (
                          <button
                            id={`btn_unlock_skill_${skill.id}`}
                            disabled={!canUnlock}
                            onClick={() => handleUnlockSkill(branchIdx, skill.id, skill.cost)}
                            className={`w-full py-2 rounded font-mono text-xs font-bold transition-all ${
                              canUnlock
                                ? "border-2 border-[#C69C6D] bg-black text-[#C69C6D] hover:bg-[#C69C6D] hover:text-black cursor-pointer shadow-md duration-300"
                                : "bg-[#1A1D23] text-[#5C6169] cursor-not-allowed border border-[#2D3139]/40"
                            }`}
                          >
                            {character.skillPoints >= skill.cost ? "ENGAGE PATHWAY" : "INSUFFICIENT POINT CREDITS"}
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>

        {/* Footer controls */}
        <div className="border-t border-[#2D3139] p-4 bg-[#0D1016] flex justify-end">
          <button
            id="skill_tree_close"
            onClick={() => { StarWarsSoundEngine.playClick(); onClose(); }}
            className="px-6 py-2.5 border border-[#2D3139] bg-black hover:bg-[#1A1D23] text-white rounded font-mono font-bold text-sm transition-all duration-300"
          >
            CONFIRM CHANGES
          </button>
        </div>

      </div>
    </div>
  );
};
