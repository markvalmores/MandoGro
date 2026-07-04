/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { CharacterClass, GameSettings } from "../types";
import { StarWarsSoundEngine } from "../utils";
import { Swords, Star, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";

interface TitleScreenProps {
  onStartGame: (name: string, chosenClass: CharacterClass) => void;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ 
  onStartGame, 
  settings, 
  onUpdateSettings 
}) => {
  const [name, setName] = useState("Mando-Foundling");
  const [selectedClass, setSelectedClass] = useState<CharacterClass>(CharacterClass.WARRIOR);
  
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(true);

  // Load YouTube Player API and initialize background loop
  useEffect(() => {
    // Inject YouTube iframe API script if it doesn't exist
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    const initPlayer = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        playerRef.current = new (window as any).YT.Player("bg-youtube-player", {
          videoId: "igOn1d9kcew",
          playerVars: {
            autoplay: 1,
            mute: 1, // Start muted to safely autoplay in modern browsers
            controls: 0,
            loop: 1,
            playlist: "igOn1d9kcew",
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            fs: 0,
            disablekb: 1,
            autohide: 1,
          },
          events: {
            onReady: (event: any) => {
              setPlayerReady(true);
              event.target.playVideo();
              const targetVol = Math.floor(settings.masterVolume * (settings.musicVolume / 100));
              event.target.setVolume(targetVol);
            },
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            }
          }
        });
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }
  }, []);

  // Update volume when volume slider or settings change
  useEffect(() => {
    if (playerRef.current && playerReady) {
      const targetVol = Math.floor(settings.masterVolume * (settings.musicVolume / 100));
      playerRef.current.setVolume(targetVol);
      if (!audioBlocked) {
        playerRef.current.unMute();
        playerRef.current.playVideo();
      } else {
        playerRef.current.mute();
      }
    }
  }, [settings.masterVolume, settings.musicVolume, playerReady, audioBlocked]);

  const handleStart = () => {
    StarWarsSoundEngine.playLightsaber();
    onStartGame(name, selectedClass);
  };

  const selectClassType = (c: CharacterClass) => {
    StarWarsSoundEngine.playClick();
    setSelectedClass(c);
  };

  // Interaction helper to activate audio
  const handleInteraction = () => {
    if (audioBlocked) {
      setAudioBlocked(false);
      if (playerRef.current && playerReady) {
        playerRef.current.unMute();
        const targetVol = Math.floor(settings.masterVolume * (settings.musicVolume / 100));
        playerRef.current.setVolume(targetVol);
        playerRef.current.playVideo();
      }
    }
  };

  return (
    <div 
      id="title_screen" 
      onClick={handleInteraction}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0E] text-[#E0E0E0] overflow-y-auto p-4 font-sans select-none"
    >
      
      {/* Background YouTube Video Loop */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div 
          id="bg-youtube-player" 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-45"
          style={{
            width: "100vw",
            height: "56.25vw", // 16:9 ratio
            minHeight: "100vh",
            minWidth: "177.77vh"
          }}
        />
        {/* Deep cinematic vignette layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_30%,#0A0B0E_95%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-transparent to-[#0A0B0E]/80 pointer-events-none" />
      </div>

      {/* Decorative stars / particles in background with a gentle pulse */}
      <motion.div 
        initial={{ opacity: 0.1 }}
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(#C69C6D_1px,transparent_1px)] [background-size:24px_24px] z-1" 
      />

      {/* Interactive Holo-Audio Controller */}
      <div 
        onClick={(e) => e.stopPropagation()} // Prevent click propagation triggering sound activation again
        className="absolute top-4 right-4 z-30 bg-[#0D1016]/90 border border-[#2D3139]/80 p-3.5 rounded-xl font-mono text-xs text-[#E0E0E0] backdrop-blur-md flex flex-col gap-2 w-64 shadow-2xl select-none"
      >
        <div className="flex items-center justify-between border-b border-[#2D3139] pb-1.5 mb-1">
          <span className="text-[9px] text-[#C69C6D] font-bold uppercase tracking-widest flex items-center gap-1">
            {audioBlocked ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#C69C6D]" />}
            <span>// TRANSMITTER SOUND</span>
          </span>
          <button 
            onClick={() => {
              StarWarsSoundEngine.playClick();
              setAudioBlocked(!audioBlocked);
            }}
            className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase cursor-pointer transition-all ${
              audioBlocked 
                ? "bg-red-950/40 text-red-400 border border-red-500/30 animate-pulse" 
                : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {audioBlocked ? "Muted" : "Active"}
          </button>
        </div>
        
        {/* Master Volume */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] text-[#8E9299] font-bold">
            <span>MASTER VOLUME:</span>
            <span className="text-[#C69C6D]">{settings.masterVolume}%</span>
          </div>
          <input 
            type="range"
            min="0"
            max="100"
            value={settings.masterVolume}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onUpdateSettings({
                ...settings,
                masterVolume: val
              });
              if (audioBlocked && val > 0) {
                setAudioBlocked(false);
              }
            }}
            className="w-full accent-[#C69C6D] h-1 bg-[#1A1D23] rounded-lg cursor-pointer"
          />
        </div>

        {/* Music Volume */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] text-[#8E9299] font-bold">
            <span>MUSIC VOLUME:</span>
            <span className="text-[#C69C6D]">{settings.musicVolume}%</span>
          </div>
          <input 
            type="range"
            min="0"
            max="100"
            value={settings.musicVolume}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onUpdateSettings({
                ...settings,
                musicVolume: val
              });
              if (audioBlocked && val > 0) {
                setAudioBlocked(false);
              }
            }}
            className="w-full accent-[#C69C6D] h-1 bg-[#1A1D23] rounded-lg cursor-pointer"
          />
        </div>

        {audioBlocked && (
          <div className="text-[8px] text-red-400/80 font-bold uppercase text-center animate-pulse mt-1">
            ⚠️ CLICK ANYWHERE TO RESUME AUDIO
          </div>
        )}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl w-full bg-[#0D1016]/90 border border-[#2D3139] p-8 rounded-2xl shadow-[0_0_50px_rgba(198,156,109,0.15)] backdrop-blur-md flex flex-col items-center relative z-10 text-center"
      >
        
        {/* Cinematic Title Logo */}
        <div className="space-y-2 mb-8">
          <motion.div 
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="flex justify-center items-center gap-1.5 text-[10px] font-mono text-[#C69C6D] uppercase"
          >
            <Star className="w-3 h-3 text-[#C69C6D] fill-[#C69C6D] animate-spin-slow" />
            STAR WARS TURN-BASED SAGA
            <Star className="w-3 h-3 text-[#C69C6D] fill-[#C69C6D] animate-spin-slow" />
          </motion.div>
          
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60, delay: 0.4 }}
            className="text-6xl font-extrabold tracking-tighter text-white font-mono drop-shadow-[0_4px_12px_rgba(198,156,109,0.4)] select-none" 
            style={{ fontFamily: "'Arial Black', sans-serif" }}
          >
            MANDOGRO
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-[10px] uppercase tracking-widest text-[#8E9299] font-bold font-mono"
          >
            THIS IS THE WAY • V1.0.4 Imperial Outpost
          </motion.p>
        </div>

        {/* Character Creation Form */}
        <div className="w-full space-y-6 text-left border-y border-[#2D3139] py-6 my-2">
          
          {/* Name input */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-1.5 font-mono"
          >
            <label className="block text-xs text-[#8E9299] uppercase tracking-wider font-bold">Configure Codex Name:</label>
            <input
              id="title_name_input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0A0B0E] border border-[#2D3139] hover:border-[#5c6169] focus:border-[#C69C6D] text-[#C69C6D] font-semibold px-4 py-2.5 rounded-lg text-sm transition-all focus:outline-none"
            />
          </motion.div>

          {/* Class Selectors */}
          <div className="space-y-3 font-mono">
            <motion.label 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="block text-xs text-[#8E9299] uppercase tracking-wider font-bold"
            >
              Select Guild Specialization:
            </motion.label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {Object.values(CharacterClass).map((c, idx) => (
                <motion.button
                  id={`class_select_${c.replace(/\s+/g, '_')}`}
                  key={c}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectClassType(c)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    selectedClass === c
                      ? "bg-[#C69C6D]/10 border-[#C69C6D] text-[#C69C6D] shadow-[0_0_15px_rgba(198,156,109,0.2)] font-bold"
                      : "bg-[#0A0B0E]/60 border-[#2D3139] text-[#8E9299] hover:border-neutral-700"
                  }`}
                >
                  <span className="font-bold text-sm tracking-wide mb-1">{c}</span>
                  <span className="text-[10px] text-[#5C6169] leading-relaxed">
                    {c === CharacterClass.WARRIOR && "Heavy armor plating. +40 HP, increased defense."}
                    {c === CharacterClass.TACTICIAN && "Gadgets master. +30 Shield, +20 Force Energy."}
                    {c === CharacterClass.FORCE_OUTCAST && "Wield custom force. +40 Energy, +15 Attack."}
                    {c === CharacterClass.SABOTEUR && "Explosives. +10% Crit chance, high Speed."}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

        </div>

        {/* Start trigger Action */}
        <motion.button
          id="btn_press_hunt_to_start"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="mt-6 px-10 py-4 border-2 border-[#C69C6D] bg-black text-[#C69C6D] hover:bg-[#C69C6D] hover:text-black font-bold font-mono tracking-[0.2em] text-base shadow-[0_10px_20px_rgba(198,156,109,0.15)] hover:shadow-[0_10px_30px_rgba(198,156,109,0.3)] transition-all flex items-center gap-2 relative group duration-300 cursor-pointer"
        >
          <Swords className="w-5 h-5 animate-pulse" /> HUNT TO START
        </motion.button>

        {/* Dynamic portraits scroll decoration */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-8 flex justify-center items-center gap-4 text-[#5C6169] text-[10px] font-mono uppercase tracking-[0.2em] font-bold"
        >
          <span>TATOOINE</span>
          <span>•</span>
          <span>NEVARRO</span>
          <span>•</span>
          <span>CORUSCANT</span>
          <span>•</span>
          <span>MANDALORE</span>
        </motion.div>

      </motion.div>
    </div>
  );
};
