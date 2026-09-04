/**
 * Every line the app can say on your behalf.
 *
 * The voice here is deliberately low-key: plain sentences, no declarations, no
 * pet names, nothing that would make either of you wince. ⭐ carries whatever
 * needs carrying — it is the one bit of shorthand this space uses.
 *
 * Pulls are random and non-repeating within a session, and nothing is
 * generated at runtime (the app is a static export — no server, no API key).
 */

export interface PromptCategory {
  id: string;
  emoji: string;
  label: string;
  lines: string[];
}

export const MESSAGE_CATEGORIES: PromptCategory[] = [
  {
    id: "small",
    emoji: "⭐",
    label: "Small",
    lines: [
      "Thought about you. That's the whole message.",
      "Hope today is being easy on you.",
      "No reason. Just showing up here.",
      "Wanted to talk but didn't know how to start.",
      "⭐",
      "Tell me one small thing about your day.",
      "Consider this a tap on your shoulder.",
      "Saw something today and wanted to tell you.",
      "Passing through. Carry on.",
      "Checking you're still out there.",
    ],
  },
  {
    id: "morning",
    emoji: "☀️",
    label: "Morning",
    lines: [
      "Good morning. Hope today is kind to you.",
      "Morning. Water before anything else.",
      "First thought of the day, as usual.",
      "Good morning — no pressure to reply.",
      "Wake up slowly. The day can wait.",
      "Morning. Whatever today asks, you've handled worse.",
      "A quiet, easy morning to you.",
    ],
  },
  {
    id: "night",
    emoji: "🌙",
    label: "Night",
    lines: [
      "Good night. Sleep well.",
      "Put the phone down and rest.",
      "Whatever today was, it's over now.",
      "Good night. Talk tomorrow.",
      "Hope tonight is quiet in your head.",
      "Sleep. I'll be here in the morning.",
      "Last thought of the day, same as the first.",
    ],
  },
  {
    id: "random",
    emoji: "😂",
    label: "Random",
    lines: [
      "Random question: what would you name a pet crow?",
      "Just remembered something embarrassing from years ago. Anyway, hi.",
      "If we were criminals, what would our crime be?",
      "What's the last thing that made you laugh out loud?",
      "Rate today out of 10. No context needed.",
      "Send me a photo of whatever is closest to you.",
      "Unimportant thought I'm sharing anyway:",
      "Bet you were thinking about me. Don't lie.",
      "Guess what I'm doing right now.",
      "Describe me in three words, no cheating.",
      "I'm winning today. At what? Unclear.",
    ],
  },
  {
    id: "honest",
    emoji: "🥹",
    label: "Honest",
    lines: [
      "Not great with words today, but I'm here.",
      "Thank you for being easy to be around.",
      "You don't have to perform for me. Ever.",
      "Some days are heavy. I'd take some of yours.",
      "You're one of the few people I don't have to explain myself to.",
      "Whatever you're carrying today, I'm on your side.",
      "I'm glad it's you.",
      "You handled something hard recently and I noticed.",
      "Thanks for being patient with me.",
      "You're kinder than you give yourself credit for.",
      "You make quiet feel comfortable instead of awkward.",
      "I like who I am around you.",
    ],
  },
  {
    id: "start",
    emoji: "🗣️",
    label: "Start something",
    lines: [
      "Hey. What's happening in your head today?",
      "Tell me something that happened today — big or tiny.",
      "How's your energy today, honestly?",
      "What are you working on right now?",
      "Give me one sentence about your day.",
      "What's the plan for tonight?",
    ],
  },
];

export const CONVERSATION_STARTERS: string[] = [
  "What was the best part of your day?",
  "What are you thinking about right now?",
  "If we could disappear somewhere for one day, where would we go?",
  "What's one thing you want us to do together?",
  "What's something small that made you smile today?",
  "What's something you've never told me?",
  "If today had a soundtrack, what song would it be?",
  "What should we do next time we meet?",
  "Describe your perfect lazy Sunday.",
  "What is one thing you want me to remember?",
  "What's the most annoying thing that happened today?",
  "What did you eat, and was it worth it?",
  "What's a small habit of yours you actually like?",
  "What's the last thing you looked up online?",
  "Which part of the day do you like most?",
  "What would you do with a completely free week?",
  "What's something you're quietly proud of?",
  "What do you wish more people understood about you?",
  "What's a place you want to see once before you're old?",
  "If we had a house, which room would you care about most?",
  "What's something you find beautiful that others find boring?",
  "What made today different from yesterday?",
  "What's the nicest thing anyone has done for you recently?",
  "What do you think you'll remember about this year?",
  "What's a food you could eat for the rest of your life?",
  "Anything you've been meaning to say but haven't?",
  "What's something you've changed your mind about recently?",
  "What does a good life look like to you, honestly?",
  "What are you most afraid of about the future?",
  "What's something you want me to understand about you?",
  "When do you feel most like yourself?",
  "What would you want a normal week for us to look like?",
];

export const THIS_OR_THAT: { prompt: string; options: [string, string] }[] = [
  { prompt: "Tea or coffee?", options: ["☕ Tea", "☕ Coffee"] },
  { prompt: "Beach or mountains?", options: ["🏖️ Beach", "⛰️ Mountains"] },
  { prompt: "Morning or night?", options: ["🌅 Morning", "🌙 Night"] },
  { prompt: "Movie or series?", options: ["🎬 Movie", "📺 Series"] },
  { prompt: "Call or text?", options: ["📞 Call", "💬 Text"] },
  { prompt: "Talk it out or sit quietly?", options: ["🗣️ Talk", "🤫 Quiet"] },
  { prompt: "Stay in or go out?", options: ["🏠 Stay in", "🚗 Go out"] },
  { prompt: "Rain or sunshine?", options: ["🌧️ Rain", "☀️ Sunshine"] },
  { prompt: "Sweet or spicy?", options: ["🍮 Sweet", "🌶️ Spicy"] },
  { prompt: "Plan everything or figure it out?", options: ["🗒️ Plan", "🎲 Wing it"] },
  { prompt: "Long drive or long walk?", options: ["🚙 Long drive", "🚶 Long walk"] },
  { prompt: "City lights or village quiet?", options: ["🌆 City", "🌾 Village"] },
  { prompt: "Early flight or late train?", options: ["✈️ Early flight", "🚆 Late train"] },
  { prompt: "Books or podcasts?", options: ["📚 Books", "🎧 Podcasts"] },
  { prompt: "Cooking together or ordering in?", options: ["🍳 Cook", "🛵 Order"] },
  { prompt: "Winter or monsoon?", options: ["❄️ Winter", "🌧️ Monsoon"] },
];

export const WOULD_YOU_RATHER: { prompt: string; options: [string, string] }[] = [
  {
    prompt: "Would you rather…",
    options: ["Never be stuck in traffic again", "Never wait in a queue again"],
  },
  { prompt: "Would you rather…", options: ["Read minds", "Be invisible"] },
  {
    prompt: "Would you rather…",
    options: ["One long holiday a year", "A day off every week"],
  },
  { prompt: "Would you rather…", options: ["Live by the sea", "Live in the hills"] },
  {
    prompt: "Would you rather…",
    options: ["Always know the truth", "Always be blissfully unaware"],
  },
  { prompt: "Would you rather…", options: ["Time travel to the past", "See the future"] },
  {
    prompt: "Would you rather…",
    options: ["Give up sweets forever", "Give up chai/coffee forever"],
  },
  {
    prompt: "Would you rather…",
    options: ["A tiny house that's perfect", "A big house that needs work"],
  },
  { prompt: "Would you rather…", options: ["Sing in public", "Dance in public"] },
  { prompt: "Would you rather…", options: ["Text all day", "One long call at night"] },
];

export const DAILY_CHECK_INS: string[] = [
  "How was your day from 1 to 10?",
  "What made you smile today?",
  "What are you looking forward to tomorrow?",
  "What do you need today — talking, distraction, or quiet?",
  "What took the most energy out of you today?",
  "One word for today?",
  "Did anything go better than you expected?",
  "What's one thing you'd redo about today?",
  "How did you sleep last night, honestly?",
  "What's the smallest good thing that happened today?",
];

export const MOODS: { emoji: string; label: string }[] = [
  { emoji: "😌", label: "Calm" },
  { emoji: "🙂", label: "Okay" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😭", label: "Heavy" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "⭐", label: "Good" },
  { emoji: "🥹", label: "Emotional" },
  { emoji: "🤯", label: "Overwhelmed" },
  { emoji: "😂", label: "Silly" },
  { emoji: "🫠", label: "Melting" },
  { emoji: "🤒", label: "Unwell" },
  { emoji: "🫥", label: "Quiet" },
];

export const STATUSES: { key: string; emoji: string; label: string }[] = [
  { key: "starting-my-day", emoji: "☀️", label: "Starting my day" },
  { key: "busy", emoji: "💻", label: "Busy" },
  { key: "break", emoji: "🍵", label: "Taking a break" },
  { key: "free-to-talk", emoji: "💬", label: "Free to talk" },
  { key: "thinking", emoji: "💭", label: "Thinking" },
  { key: "missing-you", emoji: "⭐", label: "Missing you" },
  { key: "going-to-sleep", emoji: "🌙", label: "Going to sleep" },
  { key: "asleep", emoji: "😴", label: "Already asleep" },
];

export const MORNING_LINES: string[] = [
  "Good morning ⭐",
  "Good morning. Hope you slept well.",
  "Morning. First thought of the day is yours.",
  "Good morning — take it slow today.",
];

export const NIGHT_LINES: string[] = [
  "Good night. Sleep well ⭐",
  "Good night. Don't stay awake too late.",
  "Sleep well. Talk tomorrow.",
  "Good night — the day is over, put it down.",
];

export const MORNING_REPLIES = [
  "Good morning ☀️",
  "Morninggg",
  "You too ⭐",
  "Have a good day",
  "Still sleepy 😴",
];

export const NIGHT_REPLIES = [
  "Good night ⭐",
  "Sleep well",
  "Sweet dreams",
  "Don't stay awake too late",
  "Talk tomorrow",
];

/** Generic quick replies offered under any incoming message. */
export const QUICK_REPLIES = [
  "⭐",
  "Same here",
  "Tell me more",
  "That's so you 😂",
  "I'm listening",
  "Long day here",
  "Call later?",
];

export const COMPLIMENTS: string[] = [
  "You're the calmest part of my day.",
  "You explain things patiently. That's rarer than you think.",
  "You have a quiet kind of confidence.",
  "You notice small things about people. I've noticed.",
  "You're funnier than you let on.",
  "You make hard days feel survivable.",
  "You're steady. I don't take that for granted.",
];

export const CHALLENGES: string[] = [
  "Send a picture of what you're doing right now.",
  "Tell them one thing you noticed about them this week.",
  "Draw the first thing that comes to mind.",
  "Ask where they'd take you if you had one free day.",
  "Send a voice note, even a five-second one.",
  "Share one photo from your camera roll from this week.",
  "Tell them a memory of yours they don't know about.",
  "Ask one question you've never asked before.",
  "Say the thing you keep not saying.",
];

export const DRAWING_PROMPTS: string[] = [
  "Draw how your day felt.",
  "Draw the two of us, badly.",
  "Draw your current mood as a shape.",
  "Draw what you had for lunch.",
  "Draw a house you'd want us to live in.",
  "Draw something only they'd understand.",
];

export const THOUGHT_PLACEHOLDERS: string[] = [
  "Randomly thinking about you.",
  "Just remembered something funny.",
  "Today felt long.",
  "I want to go somewhere with you.",
  "Nothing important. Just leaving this here.",
];

export const JUST_BE_HERE_LINES: string[] = [
  "Nothing specific. Just wanted to talk to you.",
  "No agenda. Just checking in.",
  "Nothing to say, I just wanted you to know I'm around.",
  "Just saying hi. That's all this is.",
  "⭐",
];

/** Words that quietly set something off when they're sent. */
export const EASTER_EGG_WORDS: { match: string; effect: string }[] = [
  { match: "⭐", effect: "stars" },
  { match: "miss you", effect: "stars" },
  { match: "good night", effect: "stars" },
  { match: "good morning", effect: "sun" },
  { match: "congrats", effect: "confetti" },
  { match: "congratulations", effect: "confetti" },
  { match: "yay", effect: "confetti" },
  { match: "sorry", effect: "petals" },
  { match: "rain", effect: "rain" },
  { match: "coffee", effect: "steam" },
  { match: "chai", effect: "steam" },
];

export const REACTIONS: { emoji: string; label: string }[] = [
  { emoji: "⭐", label: "Star" },
  { emoji: "🥹", label: "Aww" },
  { emoji: "😂", label: "Funny" },
  { emoji: "😌", label: "Nice" },
  { emoji: "😭", label: "Too much" },
  { emoji: "👀", label: "Noted" },
];

export const SECRET_MOON_MESSAGES: string[] = [
  "You found it. Hi.",
  "Still clicking? Fair enough.",
  "⭐",
  "Okay, last one: thanks for being here.",
];

/** Deterministic-ish random pick that avoids repeating the previous value. */
export function pickRandom<T>(list: readonly T[], avoid?: T): T {
  if (list.length === 0) throw new Error("pickRandom called with an empty list");
  if (list.length === 1) return list[0];
  let choice = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (avoid !== undefined && choice === avoid && guard < 8) {
    choice = list[Math.floor(Math.random() * list.length)];
    guard += 1;
  }
  return choice;
}

export function pickSome<T>(list: readonly T[], count: number): T[] {
  const pool = [...list];
  const out: T[] = [];
  while (pool.length > 0 && out.length < count) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}
