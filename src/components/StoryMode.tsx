/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GameCharacter } from "../types";
import { StarWarsSoundEngine } from "../utils";
import { Compass, BookOpen, Star, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";

// Robust Local Star Wars branching narrative database for offline and non-server deployments
const LOCAL_STORY_DB: Record<string, Record<string, {
  dialogue: string;
  choices: { text: string; nextPrompt: string }[];
  elementalAffinity: string;
  bountyReward: number;
  portrait?: string;
}>> = {
  tatooine: {
    "landing": {
      dialogue: `Din Djarin stops and looks at you. "Mos Eisley is as dangerous as ever. The local guild reports a rogue Jawa clan has salvaged a working Imperial tracker." Grogu coos softly, looking around. "We should search the local cantina for clues or scan the canyon dunes."`,
      choices: [
        { text: "Investigate the dim cantina for leads", nextPrompt: "tatooine_cantina" },
        { text: "Scan the barren canyon dunes for footprints", nextPrompt: "tatooine_dunes" }
      ],
      elementalAffinity: "Beskar-Physical",
      bountyReward: 1200,
      portrait: "Din Djarin"
    },
    "tatooine_cantina": {
      dialogue: `You enter the dim cantina. The patrons fall silent, staring at your gleaming armor. Boba Fett sits in a corner booth, raising his glass. "Looking for the Jawa salvage? A group of bounty hunters went out to the old moisture farm. They might have a tracker."`,
      choices: [
        { text: "Team up with Boba Fett to assault the farm", nextPrompt: "tatooine_farm_assault" },
        { text: "Purchase the tracking fob from Boba Fett", nextPrompt: "tatooine_fob_bought" }
      ],
      elementalAffinity: "Blaster-Energy",
      bountyReward: 1800,
      portrait: "Boba Fett"
    },
    "tatooine_dunes": {
      dialogue: `The desert heat is intense. Suddenly, sand kicks up as a massive Tusken Raider raiding party ambushes you from the ridge! Din Djarin draws his Amban sniper rifle. "Take cover! We need to disable their leader or negotiate."`,
      choices: [
        { text: "Defeat the Tusken Raider chieftain", nextPrompt: "tatooine_tusken_defeat" },
        { text: "Offer them a piece of Beskar to pass safely", nextPrompt: "tatooine_tusken_peace" }
      ],
      elementalAffinity: "Explosive-Thermal",
      bountyReward: 1500,
      portrait: "Din Djarin"
    },
    "tatooine_farm_assault": {
      dialogue: `With Boba Fett's rocket pack providing air support, you breach the moisture farm. The rogue hunters are caught off guard, scrambling for cover. "This is our chance!" Din Djarin calls out. "Secure the mainframe!"`,
      choices: [
        { text: "Recover the Imperial tracker", nextPrompt: "story_complete" },
        { text: "Search for hidden Beskar weapon crates", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Cryo-Carbonite",
      bountyReward: 2500,
      portrait: "Boba Fett"
    },
    "tatooine_fob_bought": {
      dialogue: `You exchange credits for the tracking fob. The coordinates lead to a sandcrawler buried in a canyon. Grogu points excitedly at a glowing container. "We found the salvage," Din Djarin says, "but a Krayt Dragon is nesting nearby!"`,
      choices: [
        { text: "Quietly sneak in and steal the tracker", nextPrompt: "story_complete" },
        { text: "Use explosives to distract the beast", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Force-Affiliation",
      bountyReward: 2200,
      portrait: "Grogu"
    },
    "tatooine_tusken_defeat": {
      dialogue: `You defeat the chieftain in single combat. The remaining raiders scatter into the dunes. Among their spoils, you discover the stolen Imperial datapad! "Outstanding work," Mando nods.`,
      choices: [
        { text: "Extract the data and secure the perimeter", nextPrompt: "story_complete" },
        { text: "Return to the outpost with the cargo", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Beskar-Physical",
      bountyReward: 2000,
      portrait: "Din Djarin"
    },
    "tatooine_tusken_peace": {
      dialogue: `The Raiders accept the tribute. The chief bows and hand-delivers a lockbox containing the salvage. Grogu coos happily, munching on a desert frog. "A peaceful resolution," Din says. "This is the Way."`,
      choices: [
        { text: "Open the lockbox to confirm the cargo", nextPrompt: "story_complete" },
        { text: "Head back to the docking bay immediately", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Force-Affiliation",
      bountyReward: 2400,
      portrait: "Grogu"
    }
  },
  nevarro: {
    "landing": {
      dialogue: `The volcanic soil of Nevarro smolders. Greef Karga greets you at the plaza. "My friends, a remnant Moff Gideon loyalist squad is occupying a volcanic lava tube bunker. They are refining illegal materials."`,
      choices: [
        { text: "Ask Greef Karga for backup and heavy blasters", nextPrompt: "nevarro_karga" },
        { text: "Infiltrate the lava tubes directly under cover", nextPrompt: "nevarro_tubes" }
      ],
      elementalAffinity: "Blaster-Energy",
      bountyReward: 1300,
      portrait: "Din Djarin"
    },
    "nevarro_karga": {
      dialogue: `Greef Karga hands you a thermal detonate launcher. "Take this, you'll need it. My scouts spotted a massive defense turret guarding the bunker entrance." Din Djarin tests the charges. "This will blow the blast doors right open."`,
      choices: [
        { text: "Launch a full frontal assault on the doors", nextPrompt: "nevarro_assault" },
        { text: "Sneak around to the exhaust port with the bombs", nextPrompt: "nevarro_exhaust" }
      ],
      elementalAffinity: "Explosive-Thermal",
      bountyReward: 1900,
      portrait: "Din Djarin"
    },
    "nevarro_tubes": {
      dialogue: `You slip quietly into the hot lava tubes. Heat waves shimmer, and suddenly Moff Gideon's holo-projector activates in front of you. "You walk into your own demise, hunters. My Dark Troopers are already behind you."`,
      choices: [
        { text: "Engage the Dark Troopers head-on", nextPrompt: "nevarro_dark_troopers" },
        { text: "Trigger a rockslide to trap the troopers", nextPrompt: "nevarro_rockslide" }
      ],
      elementalAffinity: "Cryo-Carbonite",
      bountyReward: 1700,
      portrait: "Moff Gideon"
    },
    "nevarro_assault": {
      dialogue: `The doors vaporize under your thermal volley! Remnant stormtroopers scramble in panic. Mando fires his whistling birds, clearing the main deck. "The refining core is exposed! Plant the override code!"`,
      choices: [
        { text: "Secure the refined fuel reserves", nextPrompt: "story_complete" },
        { text: "Capture the Imperial officer in charge", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Blaster-Energy",
      bountyReward: 2600,
      portrait: "Din Djarin"
    },
    "nevarro_exhaust": {
      dialogue: `You climb the exhaust shaft and place the charges. The explosion disables the entire bunker's power grid! In the darkness, Grogu uses the Force to levitate the primary target's escape capsule, blocking them.`,
      choices: [
        { text: "Arrest the escaping target immediately", nextPrompt: "story_complete" },
        { text: "Raid the armory for high-grade power cells", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Force-Affiliation",
      bountyReward: 2300,
      portrait: "Grogu"
    },
    "nevarro_dark_troopers": {
      dialogue: `You stand your ground against the mechanical behemoths. Using your beskar spear, you pierce their armor. "Target neutralized," Mando says, wiping sweat from his helmet. "The refinery control deck is ours."`,
      choices: [
        { text: "Shut down the refinery forever", nextPrompt: "story_complete" },
        { text: "Reprogram the remaining droids for defense", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Beskar-Physical",
      bountyReward: 2800,
      portrait: "Din Djarin"
    },
    "nevarro_rockslide": {
      dialogue: `Your blasters hit the ceiling support struts, causing a massive collapse that buries the Dark Troopers! Behind the rubble, you find a hidden safe box filled with pure Imperial Beskar ingots.`,
      choices: [
        { text: "Claim the Beskar and seal the tunnel", nextPrompt: "story_complete" },
        { text: "Exfiltrate before the volcano erupts", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Beskar-Physical",
      bountyReward: 2700,
      portrait: "Din Djarin"
    }
  },
  coruscant: {
    "landing": {
      dialogue: `You descend into Sector 1313 on Coruscant. Neon lights highlight shadowy dealers. Bo-Katan Kryze meets you near the lower terminal. "A syndicate slicer is selling Mandalorian secrets. We must stop the leak."`,
      choices: [
        { text: "Bribe a local cantina informant for the slicer's location", nextPrompt: "coruscant_bribe" },
        { text: "Hack the district security terminal mainframe", nextPrompt: "coruscant_hack" }
      ],
      elementalAffinity: "Cryo-Carbonite",
      bountyReward: 1400,
      portrait: "Bo-Katan Kryze"
    },
    "coruscant_bribe": {
      dialogue: `The informant pockets your credits. "The slicer is hiding in a VIP lounge upstairs, but he's protected by heavy-duty syndicate guards." Bo-Katan checks her blasters. "We can enter through the skylight or bluff our way in."`,
      choices: [
        { text: "Smash through the glass skylight with jetpacks", nextPrompt: "coruscant_skylight" },
        { text: "Disguise yourselves as syndicate high rollers", nextPrompt: "coruscant_disguise" }
      ],
      elementalAffinity: "Beskar-Physical",
      bountyReward: 1800,
      portrait: "Bo-Katan Kryze"
    },
    "coruscant_hack": {
      dialogue: `You bypass the mainframe security. Cybernetic warnings blink, but you trace the signal to a flying luxury airspeeder! "He's escaping!" Din Djarin yells. "We need to intercept him."`,
      choices: [
        { text: "Hijack a nearby speeder and pursue them", nextPrompt: "coruscant_pursuit" },
        { text: "Use a long-range ion cannon to disable his speeder", nextPrompt: "coruscant_ion" }
      ],
      elementalAffinity: "Blaster-Energy",
      bountyReward: 1900,
      portrait: "Din Djarin"
    },
    "coruscant_skylight": {
      dialogue: `You crash through the glass! Shards scatter as you deploy smoke grenades. The slicer panics, trying to delete the hard drives. Bo-Katan tackles him to the ground. "Secure the drive before it wipes!"`,
      choices: [
        { text: "Download the stolen secrets", nextPrompt: "story_complete" },
        { text: "Arrest the slicer for the New Republic", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Explosive-Thermal",
      bountyReward: 2600,
      portrait: "Bo-Katan Kryze"
    },
    "coruscant_disguise": {
      dialogue: `Your disguise works flawlessly. You walk past the guard lines. Grogu uses a tiny Force distraction to make the slicer drop his keycard. You corner him in his private booth. "No escape, slicer," Mando says.`,
      choices: [
        { text: "Confiscate his data pads", nextPrompt: "story_complete" },
        { text: "Demand the name of his employer", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Force-Affiliation",
      bountyReward: 2400,
      portrait: "Grogu"
    },
    "coruscant_pursuit": {
      dialogue: `You leap between speeding traffic, boarding his luxury speeder! After a brief fistfight, you seize the controls. The slicer raises his hands in surrender. "Don't shoot! I'll give you everything!"`,
      choices: [
        { text: "Take the encryption key", nextPrompt: "story_complete" },
        { text: "Hand him over to the local marshal", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Beskar-Physical",
      bountyReward: 2900,
      portrait: "Din Djarin"
    },
    "coruscant_ion": {
      dialogue: `The blue ion bolt strikes the target's speeder, causing it to glide to an emergency landing on a high-rise pad. You corner him as his droid escorts shut down. "The data is safe," Bo-Katan declares.`,
      choices: [
        { text: "Extract the files on site", nextPrompt: "story_complete" },
        { text: "Retrieve the bounty reward immediately", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Blaster-Energy",
      bountyReward: 2500,
      portrait: "Bo-Katan Kryze"
    }
  },
  mandalore: {
    "landing": {
      dialogue: `Mandalore's glassed surface lies quiet. Din Djarin scans the desolate ruins. "We are near the ancient Forge. Sensors indicate scavengers are melting down sacred Beskar shrines. We must reclaim them."`,
      choices: [
        { text: "Scout the hollow dome ruins from above", nextPrompt: "mandalore_dome" },
        { text: "Descend into the cavernous deep mines", nextPrompt: "mandalore_mines" }
      ],
      elementalAffinity: "Beskar-Physical",
      bountyReward: 1500,
      portrait: "Din Djarin"
    },
    "mandalore_dome": {
      dialogue: `You overlook the dome ruins. A patrol of Imperial Super Commandos with jetpacks swoops down! Bo-Katan ignites her darksaber. "For Mandalore! Stand ready!"`,
      choices: [
        { text: "Engage the commandos in jetpack dogfights", nextPrompt: "mandalore_dogfight" },
        { text: "Lure them into a narrow corridor to disarm them", nextPrompt: "mandalore_corridor" }
      ],
      elementalAffinity: "Force-Affiliation",
      bountyReward: 2000,
      portrait: "Bo-Katan Kryze"
    },
    "mandalore_mines": {
      dialogue: `You walk the dark caves. Suddenly, a massive subterranean beast - a Mandalorian cave monster - blocks your path! Grogu steps forward, raising his hands, attempting to soothe the beast.`,
      choices: [
        { text: "Let Grogu use the Force to calm the beast", nextPrompt: "mandalore_force_calm" },
        { text: "Deploy heavy thermal detonators to blast it", nextPrompt: "mandalore_blast_beast" }
      ],
      elementalAffinity: "Force-Affiliation",
      bountyReward: 1900,
      portrait: "Grogu"
    },
    "mandalore_dogfight": {
      dialogue: `With high-flying maneuvers, you blast their jetpacks, forcing them to crash-land. You secure their heavy Imperial scanners. "The scavengers' exact location is mapped," Bo-Katan says.`,
      choices: [
        { text: "Recover the sacred Beskar ingots", nextPrompt: "story_complete" },
        { text: "Restore the old forge beacon", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Blaster-Energy",
      bountyReward: 2800,
      portrait: "Bo-Katan Kryze"
    },
    "mandalore_corridor": {
      dialogue: `You trap them in the corridor. Without their aerial advantage, they surrender after a brief combat cycle. You find a stash of pristine armor plates. "The legacy of Mandalore is preserved," Din Djarin says.`,
      choices: [
        { text: "Store the armor for new recruits", nextPrompt: "story_complete" },
        { text: "Deliver the prisoners to the guild", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Beskar-Physical",
      bountyReward: 2700,
      portrait: "Din Djarin"
    },
    "mandalore_force_calm": {
      dialogue: `The monster whimpers and steps aside, revealing a hidden chest of Beskar ingots from the Old Empire. Grogu falls asleep in his cradle from exhaustion. "He did it," Din says. "He saved us."`,
      choices: [
        { text: "Carry Grogu and the Beskar back to the ship", nextPrompt: "story_complete" },
        { text: "Seal the cave to protect the nesting grounds", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Force-Affiliation",
      bountyReward: 3000,
      portrait: "Grogu"
    },
    "mandalore_blast_beast": {
      dialogue: `The thermal explosion collapses the cavern roof on the beast, opening a path to the scavenger camp! You take them by surprise and seize their refinery gear. "A decisive victory," Bo-Katan nods.`,
      choices: [
        { text: "Seize the heavy refinery gear", nextPrompt: "story_complete" },
        { text: "Secure the mines for the Guild", nextPrompt: "story_complete" }
      ],
      elementalAffinity: "Explosive-Thermal",
      bountyReward: 2500,
      portrait: "Bo-Katan Kryze"
    }
  }
};

const getStoryCompleteSegment = (planet: string, characterName: string) => {
  return {
    dialogue: `VICTORY! Your critical decisions have successfully resolved the tactical campaign on ${planet}. Din Djarin places a hand on your shoulder. "You fought well, ${characterName}. You are a true Mandalorian. This is the Way." Grogu coos happily, waving his tiny hands.`,
    choices: [
      { text: "Begin a new narrative on Tatooine", nextPrompt: "restart_tatooine" },
      { text: "Begin a new narrative on Mandalore", nextPrompt: "restart_mandalore" }
    ],
    elementalAffinity: "Beskar-Physical",
    bountyReward: 1500,
    portrait: "Din Djarin"
  };
};

const getGenericFallback = (promptText: string, planet: string, characterName: string) => {
  return {
    dialogue: `Din Djarin stops and looks at you. "This is the Way," he remarks solemnly. The dust blows across the canyons of ${planet || "Tatooine"}. Grogu coos softly in his floating cradle, sensing the danger. "We must head to the cantina if we want to find the client's tracer."`,
    choices: [
      { text: "Agree and scout the cantina for targets", nextPrompt: "landing" },
      { text: "Refuse and scout the outskirts instead", nextPrompt: "landing" }
    ],
    elementalAffinity: "Beskar-Physical",
    bountyReward: 1500,
    portrait: "Din Djarin"
  };
};

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

  const loadLocalFallback = (promptText: string) => {
    const planetKey = currentPlanet.toLowerCase();
    const db = LOCAL_STORY_DB[planetKey] || LOCAL_STORY_DB["tatooine"];
    
    let key = promptText;
    if (key.includes("Landing") || key.includes("outpost") || key.includes("Reconnect") || key.includes("Reconnecting")) {
      key = "landing";
    }

    if (key === "story_complete") {
      const data = getStoryCompleteSegment(currentPlanet, character.name);
      setStoryDialogue(data.dialogue);
      setChoices(data.choices);
      setActiveAffinity(data.elementalAffinity);
      setBountyReward(data.bountyReward);
      if (data.portrait) {
        setActivePortrait(data.portrait);
      }
      return;
    }

    if (key === "restart_tatooine") {
      onTravelPlanet("Tatooine");
      setTimeout(() => loadStorySegment("Landing at the central outpost docks."), 50);
      return;
    }
    if (key === "restart_mandalore") {
      onTravelPlanet("Mandalore");
      setTimeout(() => loadStorySegment("Landing at the central outpost docks."), 50);
      return;
    }

    const data = db[key] || db["landing"] || getGenericFallback(promptText, currentPlanet, character.name);
    setStoryDialogue(data.dialogue);
    setChoices(data.choices);
    setActiveAffinity(data.elementalAffinity);
    setBountyReward(data.bountyReward);
    if (data.portrait) {
      setActivePortrait(data.portrait);
    }
  };

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
        setStoryDialogue(data.dialogue || "");
        setChoices(data.choices || []);
        setActiveAffinity(data.elementalAffinity || "Beskar-Physical");
        setBountyReward(data.bountyReward || 1500);
        
        // Dynamically select portrait based on response content to make it lively!
        const diag = (data.dialogue || "").toLowerCase();
        if (diag.includes("grogu")) {
          setActivePortrait("Grogu");
        } else if (diag.includes("boba") || diag.includes("fett")) {
          setActivePortrait("Boba Fett");
        } else if (diag.includes("gideon")) {
          setActivePortrait("Moff Gideon");
        } else if (diag.includes("bo-katan") || diag.includes("kryze")) {
          setActivePortrait("Bo-Katan Kryze");
        } else {
          setActivePortrait("Din Djarin");
        }
      } else {
        // Fallback silently to client-side narrative generator to guarantee zero errors
        loadLocalFallback(promptText);
      }
    } catch (e) {
      // Fallback silently to client-side narrative generator to guarantee zero errors
      loadLocalFallback(promptText);
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
                  <button onClick={() => loadStorySegment("Landing at the central outpost docks.")} className="mt-3 bg-black border border-[#2D3139] hover:bg-[#1A1D23] duration-300 text-white font-bold font-mono px-4 py-2 rounded">
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
