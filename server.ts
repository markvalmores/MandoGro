import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "undefined" && apiKey !== "null" && apiKey.trim() !== "") {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } else {
    console.log("No valid GEMINI_API_KEY found. Procedural backup story generator will be used.");
  }
} catch (e) {
  console.error("Failed to initialize Gemini API:", e);
}

// Global In-Memory Shared State to simulate multiplayer community & real-time live events
const gameServerState = {
  // Planet-wide political influence alignments (Empire vs Republic vs Syndicate vs Mandalorians)
  politicalInfluence: {
    Tatooine: { Empire: 45, Republic: 10, Syndicate: 35, Mandalorians: 10 },
    Nevarro: { Empire: 15, Republic: 30, Syndicate: 15, Mandalorians: 40 },
    Coruscant: { Empire: 30, Republic: 55, Syndicate: 10, Mandalorians: 5 },
    Mandalore: { Empire: 5, Republic: 15, Syndicate: 10, Mandalorians: 70 },
  },
  // Bounty Hunter Leaderboard
  leaderboard: [
    { rank: 1, name: "Din Djarin (Mando)", guild: "Bounty Hunters' Guild", bountyCount: 142, faction: "Mandalorian", reputation: 9800 },
    { rank: 2, name: "Boba Fett", guild: "Daimyo Alliance", bountyCount: 135, faction: "Syndicate", reputation: 9500 },
    { rank: 3, name: "Fennec Shand", guild: "Daimyo Alliance", bountyCount: 98, faction: "Syndicate", reputation: 8200 },
    { rank: 4, name: "Bossk", guild: "Bounty Hunters' Guild", bountyCount: 88, faction: "Empire", reputation: 7100 },
    { rank: 5, name: "Cad Bane", guild: "Freelance", bountyCount: 85, faction: "Syndicate", reputation: 6900 },
    { rank: 6, name: "Krrsantan", guild: "Freelance", bountyCount: 74, faction: "Syndicate", reputation: 5900 },
    { rank: 7, name: "Cara Dune", guild: "New Republic Rangers", bountyCount: 62, faction: "Republic", reputation: 5200 },
    { rank: 8, name: "Greef Karga", guild: "Nevarro Magistrate", bountyCount: 45, faction: "Republic", reputation: 4100 }
  ],
  // Forum topics (Reddit-style)
  forumTopics: [
    {
      id: "topic_1",
      title: "Where is the best place to farm Beskar ingots?",
      author: "BeskarSmith",
      upvotes: 342,
      commentsCount: 18,
      timestamp: "2 hours ago",
      comments: [
        { author: "ArmorerApprentice", text: "Nevarro underground tunnels have remnants of the purge, look there!", timestamp: "1 hour ago" },
        { author: "KargaEnjoyer", text: "You can also exchange gold imperial medallions with Greef.", timestamp: "45 mins ago" }
      ]
    },
    {
      id: "topic_2",
      title: "Tactical tips on defeating the Moff Gideon final boss?",
      author: "MandoPro_99",
      upvotes: 512,
      commentsCount: 24,
      timestamp: "5 hours ago",
      comments: [
        { author: "DarksaberWielder", text: "Use Grogu's Force Shield when Gideon initiates his darksaber sweep. It blocks 100% damage!", timestamp: "4 hours ago" },
        { author: "BoKatan_Stan", text: "Make sure you equip high elemental flame resistance on your armor pieces.", timestamp: "3 hours ago" }
      ]
    },
    {
      id: "topic_3",
      title: "Speeder Racing championship - Nevarro Canyon Circuit is crazy hard!",
      author: "SwoopRacerX",
      upvotes: 189,
      commentsCount: 9,
      timestamp: "12 hours ago",
      comments: [
        { author: "SpeederFlyer", text: "Upgrade your stabilizer thrusters. You get +25% handling in sandstorms.", timestamp: "10 hours ago" }
      ]
    }
  ],
  // Real-time messenger chats (Facebook-messenger styled group chats and direct chats)
  chats: [
    {
      id: "gc_clan",
      name: "Mandalorian Clan Covert",
      isGroup: true,
      messages: [
        { sender: "The Armorer", text: "Beskar is the body. This is the Way.", timestamp: "07:01" },
        { sender: "Paz Vizsla", text: "Our covert must remain hidden. Stand ready.", timestamp: "07:02" },
        { sender: "Din Djarin", text: "I have returned with the child. We need reinforcements.", timestamp: "07:04" }
      ]
    },
    {
      id: "gc_guild",
      name: "Bounty Guild - Sector 4",
      isGroup: true,
      messages: [
        { sender: "Greef Karga", text: "I have some juicy pucks here. Top rates!", timestamp: "06:45" },
        { sender: "Bossk", text: "Sssscent of Beskar draws me to Nevarro...", timestamp: "06:48" },
        { sender: "Fennec Shand", text: "Leave the heavy lifting to the pros. Target is mine.", timestamp: "06:55" }
      ]
    }
  ],
  // Simulated online friends
  friends: [
    { id: "friend_grogu", name: "Grogu", online: true, status: "Eating cookies", relation: "Team Up" },
    { id: "friend_boba", name: "Boba Fett", online: true, status: "Reclaiming armor on Tatooine", relation: "Ally" },
    { id: "friend_bokatan", name: "Bo-Katan Kryze", online: false, status: "Offline", relation: "Ally" },
    { id: "friend_caradune", name: "Cara Dune", online: true, status: "Investigating outpost", relation: "Friend" },
    { id: "friend_armorer", name: "The Armorer", online: true, status: "Forging Beskar", relation: "Mentor" }
  ]
};

// --- API Endpoints ---

// Get all dynamic in-memory state
app.get("/api/game-server/state", (req, res) => {
  res.json(gameServerState);
});

// Update Faction alignment dynamically based on player actions
app.post("/api/game-server/influence", (req, res) => {
  const { planet, faction, amount } = req.body;
  if (gameServerState.politicalInfluence[planet] && gameServerState.politicalInfluence[planet][faction] !== undefined) {
    // Modify influence and normalize to total 100%
    const currentPlanet = gameServerState.politicalInfluence[planet];
    currentPlanet[faction] += amount;
    
    // Ensure no alignment goes below 0
    if (currentPlanet[faction] < 0) currentPlanet[faction] = 0;
    
    // Normalize so sum is exactly 100
    const total = (Object.values(currentPlanet) as number[]).reduce((a, b) => a + b, 0);
    for (const key of Object.keys(currentPlanet)) {
      currentPlanet[key] = Math.round(((currentPlanet[key] as number) / total) * 100);
    }
    
    res.json({ success: true, politicalInfluence: gameServerState.politicalInfluence });
  } else {
    res.status(400).json({ error: "Invalid planet or faction specified." });
  }
});

// Submit a custom high score or completed bounty to the dynamic leaderboard
app.post("/api/game-server/leaderboard", (req, res) => {
  const { name, faction, reputationChange, bountyChange } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const existing = gameServerState.leaderboard.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.bountyCount += (bountyChange || 1);
    existing.reputation += (reputationChange || 100);
  } else {
    gameServerState.leaderboard.push({
      rank: 9,
      name,
      guild: "Bounty Hunters' Guild",
      bountyCount: bountyChange || 1,
      faction: faction || "Mandalorian",
      reputation: reputationChange || 500
    });
  }

  // Sort and reassign ranks
  gameServerState.leaderboard.sort((a, b) => b.reputation - a.reputation);
  gameServerState.leaderboard.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  res.json({ success: true, leaderboard: gameServerState.leaderboard });
});

// Post a comment or thread to the Reddit-style community
app.post("/api/game-server/forum/topic", (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) return res.status(400).json({ error: "Title and author are required" });

  const newTopic = {
    id: `topic_${Date.now()}`,
    title,
    author,
    upvotes: 1,
    commentsCount: 0,
    timestamp: "Just now",
    comments: []
  };
  gameServerState.forumTopics.unshift(newTopic);
  res.json({ success: true, topics: gameServerState.forumTopics });
});

app.post("/api/game-server/forum/comment", (req, res) => {
  const { topicId, author, text } = req.body;
  const topic = gameServerState.forumTopics.find(t => t.id === topicId);
  if (topic && author && text) {
    topic.comments.push({ author, text, timestamp: "Just now" });
    topic.commentsCount = topic.comments.length;
    res.json({ success: true, topic });
  } else {
    res.status(400).json({ error: "Invalid topic ID or missing fields" });
  }
});

app.post("/api/game-server/forum/upvote", (req, res) => {
  const { topicId } = req.body;
  const topic = gameServerState.forumTopics.find(t => t.id === topicId);
  if (topic) {
    topic.upvotes += 1;
    res.json({ success: true, upvotes: topic.upvotes });
  } else {
    res.status(404).json({ error: "Topic not found" });
  }
});

// Add message to chat/GC
app.post("/api/game-server/chat/message", (req, res) => {
  const { chatId, sender, text } = req.body;
  const chat = gameServerState.chats.find(c => c.id === chatId);
  if (chat && sender && text) {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' });
    chat.messages.push({ sender, text, timestamp: time });
    res.json({ success: true, chat });
  } else {
    res.status(400).json({ error: "Invalid chat or missing fields" });
  }
});

// Create dynamic group chats (GC)
app.post("/api/game-server/chat/create", (req, res) => {
  const { name, initialMembers } = req.body;
  if (!name) return res.status(400).json({ error: "Group name is required" });

  const newChat = {
    id: `gc_${Date.now()}`,
    name,
    isGroup: true,
    messages: [
      { sender: "System", text: `Group chat "${name}" created with members: ${initialMembers ? initialMembers.join(", ") : "You"}.`, timestamp: "07:05" }
    ]
  };
  gameServerState.chats.push(newChat);
  res.json({ success: true, chat: newChat, allChats: gameServerState.chats });
});

// Follow/Add friends
app.post("/api/game-server/friends/add", (req, res) => {
  const { name, relation } = req.body;
  if (!name) return res.status(400).json({ error: "Friend name is required" });

  const existing = gameServerState.friends.find(f => f.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    res.json({ success: true, message: `${name} is already in your companion network.`, friends: gameServerState.friends });
  } else {
    const newFriend = {
      id: `friend_${Date.now()}`,
      name,
      online: Math.random() > 0.3,
      status: "Ready for contracts",
      relation: relation || "Ally"
    };
    gameServerState.friends.push(newFriend);
    res.json({ success: true, message: `Added ${name} to companion network!`, friends: gameServerState.friends });
  }
});

// Gemini Endpoint for Adaptive branching Star Wars narrative decisions!
app.post("/api/gemini/story", async (req, res) => {
  try {
    const { prompt, currentPlanet, choicesHistory, characterName } = req.body || {};
    
    const defaultStoryResponse = (p: string) => {
      return {
        dialogue: `Din Djarin stops and looks at you. "This is the Way," he remarks solemnly. The dust blows across the canyons of ${currentPlanet || "Tatooine"}. Grogu coos softly in his floating cradle, sensing the danger. "We must head to the cantina if we want to find the client's tracer."`,
        choices: [
          { text: "Agree and scout the cantina for targets", nextPrompt: "You walk into the dim cantina, music playing, eyes focusing on you. A bounty hunter is waiting at the corner table." },
          { text: "Refuse and scout the outskirts instead", nextPrompt: "You head out into the barren dunes. A sudden Tusken Raider patrol ambush triggers!" }
        ],
        elementalAffinity: "Physical",
        bountyReward: 1500
      };
    };

    if (!ai) {
      // Fallback if no API key is specified
      return res.json(defaultStoryResponse(prompt));
    }

    try {
      const systemPrompt = `You are a legendary Star Wars storytelling engine specifically for the 'MandoGro' turn-based game. 
      Format your response EXACTLY as a JSON object with:
      - 'dialogue': A highly authentic, thematic dialogue or event narration featuring characters like Din Djarin, Grogu, Boba Fett, Bo-Katan, Moff Gideon, or others. Ensure Star Wars-accurate terminology (Beskar, Darksaber, Mythosaur, Nevarro, etc.) is heavily woven. Max 4 sentences.
      - 'choices': An array of exactly 2 choice objects. Each choice must have 'text' (Max 60 chars) and 'nextPrompt' (a text prompt describing the aftermath, max 100 chars).
      - 'elementalAffinity': One of 'Beskar-Physical', 'Blaster-Energy', 'Force-Affiliation', 'Explosive-Thermal', or 'Cryo-Carbonite'.
      - 'bountyReward': A random number between 500 and 3000 representing credits.

      Keep it Star Wars-authentic. Provide ONLY the raw JSON object. Do not wrap in markdown blocks like \`\`\`json.`;

      const userPromptText = `The current player is a custom Bounty Hunter named ${characterName || "Mando-Apprentice"} currently on the planet ${currentPlanet || "Tatooine"}.
      Action history choices: ${JSON.stringify(choicesHistory || [])}.
      Current situation: ${prompt || "Landing at the planetary docking bay."}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPromptText,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        }
      });

      const text = response.text || "";
      try {
        const parsed = JSON.parse(text);
        res.json(parsed);
      } catch (parseError) {
        console.error("Gemini output parsing failed, raw was:", text);
        res.json(defaultStoryResponse(prompt));
      }
    } catch (err) {
      console.error("Gemini API request failed:", err);
      res.json(defaultStoryResponse(prompt));
    }
  } catch (globalErr) {
    console.error("Global story route exception caught safely:", globalErr);
    res.json({
      dialogue: `Din Djarin stops and looks at you. "This is the Way," he remarks solemnly. The dust blows across the canyons of Tatooine. Grogu coos softly in his floating cradle, sensing the danger. "We must head to the cantina if we want to find the client's tracer."`,
      choices: [
        { text: "Agree and scout the cantina for targets", nextPrompt: "You walk into the dim cantina, music playing, eyes focusing on you. A bounty hunter is waiting at the corner table." },
        { text: "Refuse and scout the outskirts instead", nextPrompt: "You head out into the barren dunes. A sudden Tusken Raider patrol ambush triggers!" }
      ],
      elementalAffinity: "Physical",
      bountyReward: 1500
    });
  }
});


// Configure Vite / Static asset server
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Mounted production static file serving.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
};

startServer();
