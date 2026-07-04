/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ForumTopic, ChatGroup, LeaderboardEntry, CompanionFriend } from "../types";
import { StarWarsSoundEngine } from "../utils";
import { Users, MessageSquare, ThumbsUp, Send, Trophy, Plus, Compass, Sparkles, UserPlus } from "lucide-react";

interface SocialHubProps {
  playerName: string;
  playerFaction: string;
  onClose: () => void;
}

export const SocialHub: React.FC<SocialHubProps> = ({
  playerName,
  playerFaction,
  onClose,
}) => {
  const [activeView, setActiveView] = useState<"forum" | "messenger" | "leaderboard" | "factions">("forum");
  
  // Dynamic Synchronized Server States
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [chats, setChats] = useState<ChatGroup[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friends, setFriends] = useState<CompanionFriend[]>([]);
  const [politicalInfluence, setPoliticalInfluence] = useState<Record<string, Record<string, number>>>({});

  // Interaction selection state
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [showCreateTopic, setShowCreateTopic] = useState(false);

  const [selectedChatId, setSelectedChatId] = useState<string>("gc_clan");
  const [newMessageText, setNewMessageText] = useState("");
  const [newGcName, setNewGcName] = useState("");
  const [showCreateGc, setShowCreateGc] = useState(false);

  const [newFriendName, setNewFriendName] = useState("");
  const [friendFeedback, setFriendFeedback] = useState<string | null>(null);

  // Fetch server state
  const fetchState = async () => {
    try {
      const res = await fetch("/api/game-server/state");
      if (res.ok) {
        const data = await res.json();
        setTopics(data.forumTopics);
        setChats(data.chats);
        setLeaderboard(data.leaderboard);
        setFriends(data.friends);
        setPoliticalInfluence(data.politicalInfluence);
      }
    } catch (e) {
      console.error("Failed to load game server state", e);
    }
  };

  useEffect(() => {
    fetchState();
    // Poll every 8 seconds for dynamic simulated multiplayer updates
    const timer = setInterval(fetchState, 8000);
    return () => clearInterval(timer);
  }, []);

  // Upvote topic
  const handleUpvote = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StarWarsSoundEngine.playClick();
    try {
      const res = await fetch("/api/game-server/forum/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {}
  };

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTopicId) return;
    StarWarsSoundEngine.playClick();
    try {
      const res = await fetch("/api/game-server/forum/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicId,
          author: playerName,
          text: newCommentText
        })
      });
      if (res.ok) {
        setNewCommentText("");
        fetchState();
      }
    } catch (err) {}
  };

  // Create thread
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    StarWarsSoundEngine.playClick();
    try {
      const res = await fetch("/api/game-server/forum/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTopicTitle,
          author: playerName
        })
      });
      if (res.ok) {
        setNewTopicTitle("");
        setShowCreateTopic(false);
        fetchState();
      }
    } catch (err) {}
  };

  // Send Chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    StarWarsSoundEngine.playBlaster();
    try {
      const res = await fetch("/api/game-server/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChatId,
          sender: playerName,
          text: newMessageText
        })
      });
      if (res.ok) {
        setNewMessageText("");
        fetchState();
      }
    } catch (err) {}
  };

  // Create Custom GC
  const handleCreateGc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGcName.trim()) return;
    StarWarsSoundEngine.playClick();
    try {
      const res = await fetch("/api/game-server/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGcName,
          initialMembers: [playerName, "Grogu", "Boba Fett"]
        })
      });
      if (res.ok) {
        const data = await res.json();
        setNewGcName("");
        setShowCreateGc(false);
        setSelectedChatId(data.chat.id);
        fetchState();
      }
    } catch (err) {}
  };

  // Follow/Add friend
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    StarWarsSoundEngine.playClick();
    try {
      const res = await fetch("/api/game-server/friends/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFriendName,
          relation: "Ally"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFriendFeedback(data.message);
        setNewFriendName("");
        fetchState();
        setTimeout(() => setFriendFeedback(null), 3500);
      }
    } catch (err) {}
  };

  const activeChat = chats.find(c => c.id === selectedChatId);
  const activeTopic = topics.find(t => t.id === selectedTopicId);

  return (
    <div id="social_hub_modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0D1016] border border-[#2D3139] rounded-xl max-w-5xl w-full flex flex-col h-[90vh] shadow-2xl overflow-hidden font-sans">
        
        {/* Header Tabs */}
        <div className="border-b border-[#2D3139] p-4 bg-[#0D1016] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Users className="text-[#C69C6D] w-5 h-5 animate-pulse" />
            <h2 className="text-lg font-bold font-mono text-white tracking-wide uppercase">
              HOLONET SOCIAL HUB & COMMUNICATIONS
            </h2>
          </div>
          
          <div className="flex gap-1.5 bg-[#0A0B0E] p-1 rounded-lg border border-[#2D3139]">
            {(["forum", "messenger", "leaderboard", "factions"] as const).map((view) => (
              <button
                id={`social_tab_${view}`}
                key={view}
                onClick={() => { StarWarsSoundEngine.playClick(); setActiveView(view); }}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all ${
                  activeView === view
                    ? "bg-[#C69C6D] text-[#0A0B0E]"
                    : "text-[#8E9299] hover:text-[#E0E0E0]"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Content body split layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0A0B0E]/40">
          
          {/* Main Display Area */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col h-full border-r border-[#2D3139]/60">
            
            {/* 1. Holonet Reddit-Style Forum */}
            {activeView === "forum" && (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-mono text-[#C69C6D] font-bold tracking-wider">BOUNTY BOARDS & ADVICE (HOLONET R/MANDO)</h3>
                  <button
                    id="btn_create_topic"
                    onClick={() => { StarWarsSoundEngine.playClick(); setShowCreateTopic(!showCreateTopic); }}
                    className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C69C6D] bg-[#C69C6D]/10 px-3 py-1.5 rounded border border-[#C69C6D]/20 hover:bg-[#C69C6D] hover:text-[#0A0B0E] transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" /> BROADCAST COMPLAINT
                  </button>
                </div>

                {/* Create topic box */}
                {showCreateTopic && (
                  <form onSubmit={handleCreateTopic} className="bg-[#0A0B0E] p-4 rounded-lg border border-[#C69C6D]/30 space-y-3">
                    <label className="block text-xs font-mono text-[#8E9299] font-bold">Broadcasting Frequency Title:</label>
                    <input
                      id="input_new_topic_title"
                      type="text"
                      placeholder="e.g. Discovered carbonite freezing chamber coordinates on Nevarro!"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      className="w-full bg-[#0D1016] text-[#E0E0E0] border border-[#2D3139] rounded px-3 py-2 text-sm focus:border-[#C69C6D] focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 text-xs font-mono">
                      <button type="button" onClick={() => setShowCreateTopic(false)} className="text-[#8E9299] px-3 py-1.5 font-bold">CANCEL</button>
                      <button type="submit" className="border border-[#C69C6D] bg-black text-[#C69C6D] font-bold px-4 py-1.5 rounded hover:bg-[#C69C6D] hover:text-black duration-300">POST COMM</button>
                    </div>
                  </form>
                )}

                {/* Topics List or Selected thread view */}
                {!selectedTopicId ? (
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {topics.map((t) => (
                      <div
                        id={`topic_card_${t.id}`}
                        key={t.id}
                        onClick={() => { StarWarsSoundEngine.playClick(); setSelectedTopicId(t.id); }}
                        className="bg-[#0D1016]/40 hover:bg-[#0D1016] border border-[#2D3139]/80 p-4 rounded-xl cursor-pointer transition-all flex justify-between items-start"
                      >
                        <div className="space-y-2 max-w-[80%]">
                          <h4 className="text-sm font-semibold text-[#E0E0E0] tracking-wide font-mono hover:text-[#C69C6D] transition-colors">
                            {t.title}
                          </h4>
                          <div className="flex gap-3 text-[10px] text-[#8E9299] font-mono">
                            <span>Posted by r/{t.author}</span>
                            <span>•</span>
                            <span>{t.timestamp}</span>
                            <span>•</span>
                            <span className="text-[#C69C6D] font-semibold">{t.commentsCount} transponder reply(s)</span>
                          </div>
                        </div>
                        <button
                          id={`btn_upvote_${t.id}`}
                          onClick={(e) => handleUpvote(t.id, e)}
                          className="flex flex-col items-center gap-1.5 p-2 bg-[#0A0B0E] border border-[#2D3139] hover:border-[#C69C6D]/30 rounded text-[#8E9299] hover:text-[#C69C6D] transition-all"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="text-xs font-mono font-bold">{t.upvotes}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col h-full bg-[#0A0B0E]/30 rounded-xl border border-[#2D3139]/60 p-4 overflow-hidden">
                    <button id="btn_back_to_forum" onClick={() => setSelectedTopicId(null)} className="text-xs font-mono text-[#C69C6D] font-bold mb-4 hover:underline">
                      ← RETURN TO MAIN NETWORKS
                    </button>
                    
                    {activeTopic && (
                      <div className="flex-1 flex flex-col h-full overflow-hidden">
                        <div className="border-b border-[#2D3139]/60 pb-3 mb-4">
                          <h4 className="text-base font-semibold font-mono text-white">{activeTopic.title}</h4>
                          <span className="text-[10px] text-[#8E9299] font-mono block mt-1">
                            Started by r/{activeTopic.author} • {activeTopic.timestamp}
                          </span>
                        </div>

                        {/* Comments section */}
                        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                          {activeTopic.comments.length === 0 ? (
                            <p className="text-xs text-[#8E9299] italic font-mono text-center py-6">No secure transponder feedback received yet.</p>
                          ) : (
                            activeTopic.comments.map((comment, idx) => (
                              <div key={idx} className="bg-[#0D1016] p-3 rounded border border-[#2D3139]/60 text-xs">
                                <div className="flex justify-between text-[10px] text-[#C69C6D] font-mono mb-1">
                                  <span>r/{comment.author}</span>
                                  <span className="text-[#8E9299]/70">{comment.timestamp}</span>
                                </div>
                                <p className="text-[#E0E0E0] leading-relaxed font-mono">{comment.text}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Compose comment */}
                        <form onSubmit={handleSubmitComment} className="flex gap-2 border-t border-[#2D3139]/60 pt-3">
                          <input
                            id="input_new_comment"
                            type="text"
                            placeholder="Add encrypted Holonet reply..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            className="flex-1 bg-[#0A0B0E] text-[#E0E0E0] border border-[#2D3139] rounded-lg px-3 py-2 text-xs focus:border-[#C69C6D] focus:outline-none"
                          />
                          <button type="submit" className="border border-[#C69C6D] bg-black text-[#C69C6D] font-bold px-4 py-2 rounded-lg text-xs hover:bg-[#C69C6D] hover:text-black duration-300">
                            REPLY
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. Bounty Messenger (Facebook-Messenger Styled) */}
            {activeView === "messenger" && (
              <div className="h-full flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-mono text-[#C69C6D] font-bold tracking-wider">BOUNTYNET SECURE CHATS</h3>
                  <button
                    id="btn_create_gc"
                    onClick={() => { StarWarsSoundEngine.playClick(); setShowCreateGc(!showCreateGc); }}
                    className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C69C6D] bg-[#C69C6D]/10 px-3 py-1.5 rounded border border-[#C69C6D]/20 hover:bg-[#C69C6D] hover:text-[#0A0B0E] transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" /> CREATE SECURE GC
                  </button>
                </div>

                {/* Create Group Chat dialog */}
                {showCreateGc && (
                  <form onSubmit={handleCreateGc} className="bg-[#0A0B0E] p-4 rounded-lg border border-[#2D3139]/60 space-y-3 text-xs">
                    <label className="block font-mono text-[#8E9299] font-bold">Group Chat Codename Designation:</label>
                    <input
                      id="input_new_gc_name"
                      type="text"
                      placeholder="e.g. Mandalore Resistance Cell"
                      value={newGcName}
                      onChange={(e) => setNewGcName(e.target.value)}
                      className="w-full bg-[#0D1016] text-[#E0E0E0] border border-[#2D3139] rounded px-3 py-2 text-sm focus:border-[#C69C6D] focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 font-mono">
                      <button type="button" onClick={() => setShowCreateGc(false)} className="text-[#8E9299] px-3 py-1.5 font-bold">CANCEL</button>
                      <button type="submit" className="border border-[#C69C6D] bg-black text-[#C69C6D] font-bold px-4 py-1.5 rounded hover:bg-[#C69C6D] hover:text-black duration-300">INITIATE GC</button>
                    </div>
                  </form>
                )}

                {/* Messenger Area Split */}
                <div className="flex-1 flex overflow-hidden border border-[#2D3139] rounded-xl">
                  {/* Left Chats List */}
                  <div className="w-1/3 bg-[#0A0B0E]/80 border-r border-[#2D3139] overflow-y-auto">
                    {chats.map((c) => (
                      <div
                        id={`chat_tab_${c.id}`}
                        key={c.id}
                        onClick={() => { StarWarsSoundEngine.playClick(); setSelectedChatId(c.id); }}
                        className={`p-3.5 border-b border-[#2D3139]/40 cursor-pointer transition-all flex flex-col gap-1 ${
                          selectedChatId === c.id ? "bg-[#C69C6D]/10 border-l-4 border-l-[#C69C6D]" : "hover:bg-[#1A1D23]/40"
                        }`}
                      >
                        <span className="text-xs font-bold font-mono text-white block truncate">{c.name}</span>
                        <span className="text-[10px] text-[#8E9299] truncate font-mono">
                          {c.messages[c.messages.length - 1]?.sender}: {c.messages[c.messages.length - 1]?.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Right Active Chat Box */}
                  <div className="flex-1 flex flex-col bg-[#0A0B0E]/30 overflow-hidden">
                    {activeChat ? (
                      <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
                        {/* Chat Title bar */}
                        <div className="border-b border-[#2D3139] pb-2 mb-4">
                          <span className="text-xs font-bold font-mono text-[#C69C6D]">{activeChat.name}</span>
                          <span className="text-[9px] font-mono text-[#8E9299] block">TRANSPONDER: LIVE ENCRYPTED CHAT</span>
                        </div>

                        {/* Messages Box */}
                        <div className="flex-1 overflow-y-auto space-y-2.5 mb-4 pr-1">
                          {activeChat.messages.map((m, idx) => {
                            const isMe = m.sender === playerName;
                            return (
                              <div key={idx} className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}>
                                <span className="text-[8px] font-mono text-[#8E9299] mb-0.5">{m.sender}</span>
                                <div className={`p-2.5 rounded-xl text-xs font-mono leading-relaxed ${
                                  isMe
                                    ? "bg-[#C69C6D] text-[#0A0B0E] rounded-tr-none font-bold"
                                    : m.sender === "System"
                                    ? "bg-[#1A1D23] text-[#8E9299] italic text-center w-full"
                                    : "bg-[#0D1016] text-[#E0E0E0] rounded-tl-none border border-[#2D3139]/60"
                                }`}>
                                  {m.text}
                                </div>
                                <span className="text-[7px] font-mono text-[#8E9299]/70 mt-0.5">{m.timestamp}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Input Box */}
                        <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-[#2D3139] pt-3">
                          <input
                            id="input_chat_message"
                            type="text"
                            placeholder="Type secure tactical transmission..."
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            className="flex-1 bg-[#0A0B0E] text-[#E0E0E0] border border-[#2D3139] rounded-lg px-3 py-2 text-xs focus:border-[#C69C6D] focus:outline-none font-mono"
                          />
                          <button type="submit" className="bg-[#C69C6D] hover:bg-[#b08557] text-[#0A0B0E] font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 transition-colors">
                            <Send className="w-3 h-3" />
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex-grow flex items-center justify-center text-xs text-[#8E9299] italic font-mono">
                        Select a comm channel transponder.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Multiplayer Bounty Leaderboard */}
            {activeView === "leaderboard" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-mono text-[#C69C6D] font-bold tracking-wider uppercase">MULTIPLAYER BOUNTY LEADERBOARDS</h3>
                  <span className="text-xs font-mono text-[#8E9299] font-bold">SEASONAL REPUTATION CHALLENGE</span>
                </div>

                <div className="border border-[#2D3139] rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-[#0A0B0E] border-b border-[#2D3139] text-[#8E9299]">
                        <th className="p-3">RANK</th>
                        <th className="p-3">HUNTER CODENAME</th>
                        <th className="p-3">GUILD</th>
                        <th className="p-3">BOUNTIES</th>
                        <th className="p-3">REPUTATION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D3139]/40">
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.rank}
                          className={`hover:bg-[#0A0B0E]/60 ${
                            entry.name.includes(playerName) ? "bg-[#C69C6D]/10 text-[#C69C6D] font-bold" : "text-[#E0E0E0]"
                          }`}
                        >
                          <td className="p-3 flex items-center gap-2">
                            {entry.rank === 1 && <Trophy className="w-4 h-4 text-[#C69C6D] animate-bounce" />}
                            {entry.rank}
                          </td>
                          <td className="p-3">{entry.name}</td>
                          <td className="p-3 text-[#8E9299]">{entry.guild}</td>
                          <td className="p-3">{entry.bountyCount}</td>
                          <td className="p-3 text-[#C69C6D] font-bold">{entry.reputation} XP</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Real-time Faction alignments */}
            {activeView === "factions" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-mono text-[#C69C6D] font-bold tracking-wider">DYNAMIC PLANET-WIDE POLITICAL INFLUENCE SHIFTS</h3>
                  <p className="text-xs text-[#8E9299] mt-1">Real-time control statistics representing community activities on each Star Wars quadrant.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  {Object.entries(politicalInfluence).map(([planet, factions]) => (
                    <div key={planet} className="bg-[#0D1016] p-4 rounded-xl border border-[#2D3139]">
                      <div className="flex justify-between border-b border-[#2D3139] pb-2 mb-3">
                        <span className="text-[#C69C6D] font-bold text-sm tracking-wide">{planet.toUpperCase()} SYSTEM</span>
                        <span className="text-[#8E9299] text-[10px] font-bold">INFLUENCE INDEX</span>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(factions).map(([faction, percentage]) => (
                          <div key={faction} className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-[#8E9299] font-bold">{faction.toUpperCase()}</span>
                              <span className="text-[#E0E0E0] font-bold">{percentage}%</span>
                            </div>
                            <div className="h-2 bg-[#0A0B0E] rounded-full overflow-hidden">
                              <div
                                style={{ width: `${percentage}%` }}
                                className={`h-full rounded-full ${
                                  faction === "Empire"
                                    ? "bg-rose-600"
                                    : faction === "Republic"
                                    ? "bg-blue-500"
                                    : faction === "Syndicate"
                                    ? "bg-purple-700"
                                    : "bg-[#C69C6D]"
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Area: Companion Follow and active Friend list */}
          <div className="md:w-1/3 p-6 flex flex-col h-full bg-[#0A0B0E]/40">
            <h3 className="text-xs font-mono text-[#C69C6D] font-bold tracking-widest uppercase mb-4">COMPANIONS NETWORK</h3>

            {/* Follow Form */}
            <form onSubmit={handleAddFriend} className="space-y-2.5 mb-6 text-xs">
              <label className="block font-mono text-[#8E9299] font-bold">Search Holonet Transponder / Code:</label>
              <div className="flex gap-1.5">
                <input
                  id="friend_search_input"
                  type="text"
                  placeholder="e.g. Cobb_Vanth"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  className="flex-1 bg-[#0A0B0E] text-[#E0E0E0] border border-[#2D3139] rounded px-2.5 py-1.5 text-xs focus:border-[#C69C6D] focus:outline-none font-mono"
                />
                <button type="submit" className="bg-[#0A0B0E] border border-[#2D3139] hover:border-[#C69C6D] text-[#C69C6D] p-2 rounded cursor-pointer transition-colors">
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
              {friendFeedback && (
                <div className="p-1.5 bg-[#C69C6D]/10 border border-[#C69C6D]/20 rounded font-mono text-[10px] text-[#C69C6D] font-bold">
                  {friendFeedback}
                </div>
              )}
            </form>

            {/* Friend List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {friends.map((f) => (
                <div key={f.id} className="p-3 bg-[#0D1016] rounded-lg border border-[#2D3139]/80 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">{f.name}</span>
                      <span className="text-[9px] text-[#C69C6D] bg-[#C69C6D]/10 px-1 py-0.5 rounded border border-[#C69C6D]/25 font-bold">{f.relation}</span>
                    </div>
                    <span className="text-[10px] text-[#8E9299] mt-0.5 block truncate max-w-[150px]">{f.status}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${f.online ? "bg-green-500 animate-pulse" : "bg-neutral-700"}`} />
                    <span className="text-[8px] text-[#8E9299] uppercase font-bold">{f.online ? "Online" : "Away"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer controls */}
        <div className="border-t border-[#2D3139] p-4 bg-[#0D1016] flex justify-end">
          <button
            id="social_hub_close"
            onClick={() => { StarWarsSoundEngine.playClick(); onClose(); }}
            className="px-6 py-2.5 border border-[#2D3139] bg-black hover:bg-[#1A1D23] text-white rounded font-mono font-bold text-xs tracking-wider transition-colors duration-300"
          >
            DISCONNECT COMM TRANSMISSION
          </button>
        </div>

      </div>
    </div>
  );
};
