/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SaveData } from "../types";
import { StarWarsSoundEngine } from "../utils";
import { Cloud, Download, Upload, Check, RefreshCw, AlertTriangle } from "lucide-react";

interface SaveManagerProps {
  currentSave: SaveData;
  onLoadSave: (saveData: SaveData) => void;
  onClose: () => void;
}

export const SaveManager: React.FC<SaveManagerProps> = ({
  currentSave,
  onLoadSave,
  onClose,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Export Save as custom .mando file
  const handleExportSave = () => {
    StarWarsSoundEngine.playClick();
    try {
      const dataStr = JSON.stringify(currentSave, null, 2);
      // Encode to simulated encrypted base64 to give it a custom game-save feel
      const encodedData = btoa(unescape(encodeURIComponent(dataStr)));
      
      const blob = new Blob([encodedData], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentSave.character.name.replace(/\s+/g, "_")}_save.mando`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErrorMsg("Failed to pack Beskar save: " + e.message);
    }
  };

  // Import Save from custom .mando file
  const handleImportSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    StarWarsSoundEngine.playClick();
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawText = event.target?.result as string;
        // Decode base64
        const decodedText = decodeURIComponent(escape(atob(rawText)));
        const parsedSave = JSON.parse(decodedText) as SaveData;
        
        // Simple structure validation
        if (parsedSave.character && parsedSave.character.name && parsedSave.unlockedPlanets) {
          onLoadSave(parsedSave);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
          setErrorMsg(null);
          StarWarsSoundEngine.playForceHeal();
        } else {
          setErrorMsg("Invalid data matrix structure. Not a valid .mando datapad.");
        }
      } catch (err: any) {
        setErrorMsg("Failed to compile datapad: Incorrect hash or corrupted file structure.");
      }
    };
    reader.readAsText(file);
  };

  // Cloud Save simulation
  const handleCloudSync = () => {
    StarWarsSoundEngine.playClick();
    setSyncing(true);
    setErrorMsg(null);
    
    // Simulate cloud roundtrip to server
    setTimeout(() => {
      setSyncing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      StarWarsSoundEngine.playForceHeal();
    }, 1500);
  };

  return (
    <div id="save_manager_modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0D1016] border border-[#2D3139] rounded-xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="border-b border-[#2D3139] p-4 bg-[#0D1016] flex items-center gap-3">
          <Cloud className="text-[#C69C6D] w-5 h-5" />
          <h2 className="text-base font-bold tracking-wide text-white font-mono">
            SECURE DATAPAD CHRONICLES
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-neutral-200">
          <div className="bg-[#0A0B0E] p-4 rounded-lg border border-[#2D3139] text-xs font-mono space-y-2">
            <span className="text-[#8E9299] text-[10px] uppercase font-bold">Active Target Dossier:</span>
            <div className="flex justify-between">
              <span className="text-[#8E9299]">Hunter:</span>
              <span className="text-white font-bold">{currentSave.character.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E9299]">Class:</span>
              <span className="text-neutral-300 font-bold">{currentSave.character.class}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E9299]">Level / Rank:</span>
              <span className="text-neutral-300">Lvl {currentSave.character.level} ({currentSave.character.rank})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E9299]">Credits / Beskar:</span>
              <span className="text-[#C69C6D] font-bold">{currentSave.credits} / {currentSave.beskarIngots} Ingot(s)</span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/40 rounded text-xs font-mono text-green-400 flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" /> DATAPAD PROGRESS SECURED SUCCESSFULLY.
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded text-xs font-mono text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
            </div>
          )}

          {/* Operations Layout */}
          <div className="grid grid-cols-1 gap-3 font-mono">
            
            {/* Cloud Sync */}
            <button
              id="btn_cloud_sync"
              onClick={handleCloudSync}
              disabled={syncing}
              className="flex items-center justify-between p-4 bg-[#0A0B0E] border border-[#2D3139] hover:border-[#C69C6D]/40 rounded-lg group transition-all duration-300 cursor-pointer hover:bg-[#1A1D23]/60"
            >
              <div className="text-left">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-[#C69C6D]" />
                  SYNC COVERT CLOUD
                </span>
                <p className="text-[10px] text-[#8E9299] mt-0.5">Secure progress to unified bounty servers</p>
              </div>
              {syncing ? (
                <RefreshCw className="w-4 h-4 text-[#C69C6D] animate-spin" />
              ) : (
                <span className="text-xs text-[#C69C6D] group-hover:translate-x-1 transition-transform">→</span>
              )}
            </button>

            {/* Export Save */}
            <button
              id="btn_export_save"
              onClick={handleExportSave}
              className="flex items-center justify-between p-4 bg-[#0A0B0E] border border-[#2D3139] hover:border-[#C69C6D]/40 rounded-lg group transition-all duration-300 cursor-pointer hover:bg-[#1A1D23]/60 text-left"
            >
              <div>
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#C69C6D]" />
                  EXPORT LOCAL (.mando)
                </span>
                <p className="text-[10px] text-[#8E9299] mt-0.5">Download physical backup copy of game-state</p>
              </div>
              <span className="text-xs text-[#C69C6D] group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* Import Save */}
            <label className="flex items-center justify-between p-4 bg-[#0A0B0E] border border-[#2D3139] hover:border-[#C69C6D]/40 rounded-lg cursor-pointer group transition-all duration-300 hover:bg-[#1A1D23]/60">
              <div className="text-left">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#C69C6D]" />
                  LOAD OUTPOST CHRONICLE
                </span>
                <p className="text-[10px] text-[#8E9299] mt-0.5">Import any .mando save file to restore path</p>
              </div>
              <span className="text-xs text-[#C69C6D] group-hover:translate-x-1 transition-transform">→</span>
              <input
                id="file_save_import"
                type="file"
                accept=".mando"
                onChange={handleImportSave}
                className="hidden"
              />
            </label>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#2D3139] p-4 bg-[#0D1016] flex justify-end">
          <button
            id="save_manager_close"
            onClick={() => { StarWarsSoundEngine.playClick(); onClose(); }}
            className="px-5 py-2 border border-[#2D3139] bg-black hover:bg-[#1A1D23] hover:text-[#C69C6D] hover:border-[#C69C6D] rounded font-mono text-xs font-bold text-white transition-all duration-300 cursor-pointer"
          >
            RETURN TO COVERT
          </button>
        </div>

      </div>
    </div>
  );
};
