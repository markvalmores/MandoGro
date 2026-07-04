/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SaveData, GameSettings, CharacterClass } from "./types";
import { createDefaultSaveData, defaultSettings, StarWarsSoundEngine } from "./utils";

// Views
import { TitleScreen } from "./components/TitleScreen";
import { GameConsole } from "./components/GameConsole";
import { SettingsMenu } from "./components/SettingsMenu";
import { ArmorCustomization } from "./components/ArmorCustomization";
import { SkillTree } from "./components/SkillTree";
import { SaveManager } from "./components/SaveManager";
import { SocialHub } from "./components/SocialHub";
import { MiniGamesMode } from "./components/MiniGamesMode";
import { StoryMode } from "./components/StoryMode";
import { StarWarsCodex } from "./components/StarWarsCodex";
import { CardBattleMode } from "./components/CardBattleMode";

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);

  // Modal active flags including "codex"
  const [activeModal, setActiveModal] = useState<
    "settings" | "armor" | "skills" | "saves" | "social" | "minigames" | "story" | "codex" | "cardbattle" | null
  >(null);

  // Initialize defaults
  useEffect(() => {
    // Generate a default save state with random initials
    const dSave = createDefaultSaveData("Mando-Foundling", CharacterClass.WARRIOR);
    setSaveData(dSave);
  }, []);

  // Keep sound engine volumes synced with user settings
  useEffect(() => {
    StarWarsSoundEngine.setVolumes(settings.masterVolume, settings.sfxVolume, settings.musicVolume);
  }, [settings]);

  // Starting game from title screen
  const handleStartGame = (playerName: string, chosenClass: CharacterClass) => {
    const freshSave = createDefaultSaveData(playerName, chosenClass);
    setSaveData(freshSave);
    setGameStarted(true);
  };

  // Synchronized callback routines
  const handleUpdateSave = (updated: SaveData) => {
    setSaveData(updated);
  };

  const handleUpdateSettings = (updated: GameSettings) => {
    setSettings(updated);
  };

  // Reward credits utility helper
  const handleRewardCredits = (amount: number) => {
    if (!saveData) return;
    setSaveData({
      ...saveData,
      credits: saveData.credits + amount,
    });
  };

  // Sync choices history helper
  const handleUpdateChoicesHistory = (history: string[]) => {
    if (!saveData) return;
    setSaveData({
      ...saveData,
      choicesHistory: history,
    });
  };

  // Travel planet helper
  const handleTravelPlanet = (planet: string) => {
    if (!saveData) return;
    setSaveData({
      ...saveData,
      currentPlanet: planet,
    });
  };

  // Render title screen before game launches
  if (!gameStarted || !saveData) {
    return (
      <TitleScreen
        onStartGame={handleStartGame}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col relative">
      
      {/* Central HUD Command Console */}
      <GameConsole
        saveData={saveData}
        settings={settings}
        onUpdateSave={handleUpdateSave}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => { StarWarsSoundEngine.playClick(); setActiveModal("settings"); }}
        onOpenArmor={() => { StarWarsSoundEngine.playClick(); setActiveModal("armor"); }}
        onOpenSkills={() => { StarWarsSoundEngine.playClick(); setActiveModal("skills"); }}
        onOpenSaves={() => { StarWarsSoundEngine.playClick(); setActiveModal("saves"); }}
        onOpenSocial={() => { StarWarsSoundEngine.playClick(); setActiveModal("social"); }}
        onOpenMiniGames={() => { StarWarsSoundEngine.playClick(); setActiveModal("minigames"); }}
        onOpenStory={() => { StarWarsSoundEngine.playClick(); setActiveModal("story"); }}
        onOpenCodex={() => { StarWarsSoundEngine.playClick(); setActiveModal("codex"); }}
        onOpenCardBattle={() => { StarWarsSoundEngine.playClick(); setActiveModal("cardbattle"); }}
      />

      {/* OVERLAY MODALS */}
      {activeModal === "settings" && (
        <SettingsMenu
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "armor" && (
        <ArmorCustomization
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "skills" && (
        <SkillTree
          character={saveData.character}
          onUpdateCharacter={(updatedChar) => {
            setSaveData({ ...saveData, character: updatedChar });
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "saves" && (
        <SaveManager
          saveData={saveData}
          onLoadSave={(loaded) => {
            setSaveData(loaded);
            setGameStarted(true);
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "social" && (
        <SocialHub
          playerName={saveData.character.name}
          playerFaction={saveData.character.class}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "minigames" && (
        <MiniGamesMode
          playerName={saveData.character.name}
          onRewardCredits={handleRewardCredits}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "cardbattle" && (
        <CardBattleMode
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "story" && (
        <StoryMode
          character={saveData.character}
          currentPlanet={saveData.currentPlanet}
          credits={saveData.credits}
          choicesHistory={saveData.choicesHistory}
          onRewardCredits={handleRewardCredits}
          onUpdateChoicesHistory={handleUpdateChoicesHistory}
          onTravelPlanet={handleTravelPlanet}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "codex" && (
        <StarWarsCodex
          onClose={() => setActiveModal(null)}
          onSummonEnemy={(enemy) => {
            setSaveData({
              ...saveData,
              summonedEnemy: enemy,
            });
          }}
          onSummonCompanion={(companion) => {
            setSaveData({
              ...saveData,
              summonedCompanion: companion,
            });
          }}
          onApplyPortrait={(portraitUrl) => {
            setSaveData({
              ...saveData,
              character: {
                ...saveData.character,
                activePortrait: portraitUrl,
              }
            });
          }}
          onTravelPlanet={(planetName) => {
            setSaveData({
              ...saveData,
              currentPlanet: planetName,
            });
          }}
          onEquipShip={(ship) => {
            setSaveData({
              ...saveData,
              customShipLoadout: {
                ...saveData.customShipLoadout,
                weapon: ship.weapon,
                hull: ship.hull,
              }
            });
          }}
        />
      )}

    </div>
  );
}
