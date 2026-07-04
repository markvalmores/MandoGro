/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GameSettings } from "../types";
import { StarWarsSoundEngine } from "../utils";
import { Volume2, Sliders, Monitor, Keyboard, Check, RefreshCw } from "lucide-react";

interface SettingsMenuProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<"audio" | "video" | "controls">("audio");
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const handleSave = () => {
    StarWarsSoundEngine.playClick();
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleKeyEdit = (action: string) => {
    StarWarsSoundEngine.playClick();
    setEditingKey(action);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: string) => {
    e.preventDefault();
    const newKey = e.key.toUpperCase();
    setLocalSettings((prev) => ({
      ...prev,
      controlMap: {
        ...prev.controlMap,
        [action]: newKey === " " ? "SPACE" : newKey,
      },
    }));
    setEditingKey(null);
    StarWarsSoundEngine.playClick();
  };

  return (
    <div id="settings_modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0D1016] border border-[#2D3139] rounded-xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="border-b border-[#2D3139] p-4 flex justify-between items-center bg-[#0D1016]">
          <div className="flex items-center gap-3">
            <Sliders className="text-[#C69C6D] w-5 h-5" />
            <h2 className="text-xl font-semibold tracking-wide text-white font-mono">
              HYPERDRIVE SYSTEM SETTINGS
            </h2>
          </div>
          <span className="text-xs font-mono text-[#C69C6D] bg-[#C69C6D]/10 px-2 py-1 rounded border border-[#C69C6D]/20">
            SECURE OUTPOST
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#0A0B0E]/60 border-b border-[#2D3139] text-sm font-mono">
          <button
            id="tab_audio"
            onClick={() => { StarWarsSoundEngine.playClick(); setActiveTab("audio"); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "audio"
                ? "border-[#C69C6D] text-[#C69C6D] bg-[#0D1016]"
                : "border-transparent text-[#8E9299] hover:text-white"
            }`}
          >
            <Volume2 className="w-4 h-4" /> AUDIO
          </button>
          <button
            id="tab_video"
            onClick={() => { StarWarsSoundEngine.playClick(); setActiveTab("video"); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "video"
                ? "border-[#C69C6D] text-[#C69C6D] bg-[#0D1016]"
                : "border-transparent text-[#8E9299] hover:text-white"
            }`}
          >
            <Monitor className="w-4 h-4" /> GRAPHICS
          </button>
          <button
            id="tab_controls"
            onClick={() => { StarWarsSoundEngine.playClick(); setActiveTab("controls"); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "controls"
                ? "border-[#C69C6D] text-[#C69C6D] bg-[#0D1016]"
                : "border-transparent text-[#8E9299] hover:text-white"
            }`}
          >
            <Keyboard className="w-4 h-4" /> CONTROLS
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-neutral-200 bg-[#0A0B0E]/20">
          
          {/* Audio Tab */}
          {activeTab === "audio" && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium font-mono text-[#8E9299] font-bold">Master Holo Volume</label>
                  <span className="text-sm font-mono text-[#C69C6D] font-bold">{localSettings.masterVolume}%</span>
                </div>
                <input
                  id="range_master_volume"
                  type="range"
                  min="0"
                  max="100"
                  value={localSettings.masterVolume}
                  onChange={(e) => setLocalSettings({ ...localSettings, masterVolume: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[#1A1D23] border border-[#2D3139]/50 rounded-lg appearance-none cursor-pointer accent-[#C69C6D]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium font-mono text-[#8E9299] font-bold">Sound Effects (SFX)</label>
                  <span className="text-sm font-mono text-[#C69C6D] font-bold">{localSettings.sfxVolume}%</span>
                </div>
                <input
                  id="range_sfx_volume"
                  type="range"
                  min="0"
                  max="100"
                  value={localSettings.sfxVolume}
                  onChange={(e) => setLocalSettings({ ...localSettings, sfxVolume: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[#1A1D23] border border-[#2D3139]/50 rounded-lg appearance-none cursor-pointer accent-[#C69C6D]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium font-mono text-[#8E9299] font-bold">Cantina Music</label>
                  <span className="text-sm font-mono text-[#C69C6D] font-bold">{localSettings.musicVolume}%</span>
                </div>
                <input
                  id="range_music_volume"
                  type="range"
                  min="0"
                  max="100"
                  value={localSettings.musicVolume}
                  onChange={(e) => setLocalSettings({ ...localSettings, musicVolume: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[#1A1D23] border border-[#2D3139]/50 rounded-lg appearance-none cursor-pointer accent-[#C69C6D]"
                />
              </div>
            </div>
          )}

          {/* Graphics Tab */}
          {activeTab === "video" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium font-mono text-[#8E9299] font-bold mb-3">
                  Visual Engine Render Quality
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["low", "medium", "high", "ultra"] as const).map((q) => (
                    <button
                      id={`quality_${q}`}
                      key={q}
                      onClick={() => { StarWarsSoundEngine.playClick(); setLocalSettings({ ...localSettings, graphicsQuality: q }); }}
                      className={`py-3 px-2 rounded-lg text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                        localSettings.graphicsQuality === q
                          ? "bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]"
                          : "bg-[#0A0B0E] border-[#2D3139] text-[#8E9299] hover:bg-[#1A1D23] hover:text-white"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium font-mono text-[#8E9299] font-bold mb-2">
                  Device Orientation Lock
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["auto", "portrait", "landscape"] as const).map((o) => (
                    <button
                      id={`orientation_${o}`}
                      key={o}
                      onClick={() => { StarWarsSoundEngine.playClick(); setLocalSettings({ ...localSettings, screenOrientation: o }); }}
                      className={`py-3 px-2 rounded-lg text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                        localSettings.screenOrientation === o
                          ? "bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]"
                          : "bg-[#0A0B0E] border-[#2D3139] text-[#8E9299] hover:bg-[#1A1D23] hover:text-white"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0A0B0E]/60 rounded-lg border border-[#2D3139]">
                <div>
                  <h4 className="text-sm font-mono text-neutral-200 font-bold">Device Virtual Joystick</h4>
                  <p className="text-xs text-[#8E9299]">Enable HUD touchscreen controls overlays on mobile hardware</p>
                </div>
                <button
                  id="toggle_touch_controls"
                  onClick={() => {
                    StarWarsSoundEngine.playClick();
                    setLocalSettings({ ...localSettings, enableTouchControls: !localSettings.enableTouchControls });
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer focus:outline-none ${
                    localSettings.enableTouchControls ? "bg-[#C69C6D]" : "bg-[#1A1D23] border border-[#2D3139]"
                  }`}
                >
                  <div className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    localSettings.enableTouchControls ? "translate-x-6" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* Controls Tab */}
          {activeTab === "controls" && (
            <div className="space-y-4">
              <p className="text-xs text-[#8E9299] font-mono mb-4 font-bold">
                CLICK ACTIONS TO CUSTOMIZE HARDWARE KEYBOARD RE-BINDINGS:
              </p>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {Object.entries(localSettings.controlMap).map(([action, boundKey]) => (
                  <div key={action} className="flex justify-between items-center p-3 bg-[#0A0B0E]/40 rounded border border-[#2D3139]/50">
                    <span className="text-sm font-mono text-neutral-300 font-bold">{action}</span>
                    {editingKey === action ? (
                      <span className="text-xs font-mono text-[#C69C6D] animate-pulse bg-[#C69C6D]/10 px-3 py-1 rounded border border-[#C69C6D]/30 font-bold">
                        Press any key...
                        <input
                          id={`input_rebind_${action}`}
                          type="text"
                          className="absolute opacity-0 w-0 h-0"
                          autoFocus
                          onKeyDown={(e) => handleKeyDown(e, action)}
                          onBlur={() => setEditingKey(null)}
                        />
                      </span>
                    ) : (
                      <button
                        id={`btn_rebind_${action}`}
                        onClick={() => handleKeyEdit(action)}
                        className="font-mono text-xs text-[#8E9299] bg-black border border-[#2D3139] hover:bg-[#C69C6D]/10 hover:border-[#C69C6D] hover:text-[#C69C6D] px-3 py-1.5 rounded transition-all cursor-pointer"
                      >
                        {boundKey}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="border-t border-[#2D3139] p-4 bg-[#0D1016] flex gap-3 justify-end">
          <button
            id="settings_close"
            onClick={() => { StarWarsSoundEngine.playClick(); onClose(); }}
            className="px-4 py-2 rounded font-mono text-sm text-[#8E9299] hover:text-white transition-all cursor-pointer"
          >
            DISMISS
          </button>
          <button
            id="settings_save"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded border border-[#2D3139] bg-black hover:bg-[#1A1D23] hover:border-[#C69C6D] hover:text-[#C69C6D] text-white font-mono font-bold text-sm transition-all duration-300 cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" /> APPLY MODULES
          </button>
        </div>

      </div>
    </div>
  );
};
