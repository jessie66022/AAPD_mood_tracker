import { SLIDER_MOODS } from "./moods";

export const GREETING = "嗨 Jessie，我是熊熊！";
export const GREETING_SUBTEXT = "問我關於你最近心情的任何問題，我會從你的紀錄裡找答案。";

// The bear's opening line when a chat starts straight from the mood slider — keyed by the
// selected mood's label so the greeting acknowledges what the user just recorded.
// Principle: one message = one gentle, guiding question (只問一件事), never a stack of them.
const MOOD_OPENERS = {
  非常緊繃: "看到你現在非常緊繃，我在這裡陪你。願意先跟我說說，是什麼讓你這麼緊繃嗎？",
  緊繃: "感覺你有點緊繃。最近有什麼事一直放在你心上呢？",
  平靜: "你現在很平靜，真好。今天發生了什麼讓你覺得平靜的事呢？",
  普通: "普通的一天也很值得被記錄。今天有沒有哪個時刻讓你印象比較深？",
  愉快: "你剛剛記錄了「愉快」，是什麼讓你有這種感覺呢？",
  開心: "你看起來很開心！今天發生了什麼好事呢？",
  非常愉快: "哇，非常愉快！是什麼事讓你這麼開心呢？",
};

export function moodOpening(moodIndex) {
  const label = SLIDER_MOODS[moodIndex]?.label;
  return MOOD_OPENERS[label] ?? `你剛剛記錄了「${label}」，想聊聊嗎？`;
}

export const SUGGESTIONS = [
  { key: "week", label: "我這週心情怎麼樣？" },
  { key: "month", label: "這個月最常出現的情緒是？" },
  { key: "tags", label: "什麼最常影響我的心情？" },
  { key: "rate", label: "這個月我記錄了幾天？" },
];

// Guided micro-exercises the bear can walk the user through, one step per turn. Each answer the
// user gives advances to the next `prompt`; after `steps` answers the bear closes with `done`.
// (`prompts` holds the questions for steps 2..n; step 1 is `intro`.) Only 著地 (grounding) is
// wired for this prototype — add more entries here to grow the library.
export const PRACTICES = {
  grounding: {
    id: "grounding",
    steps: 3,
    intro: "好，我們一起做個小小的「著地」練習 🌱 先深呼吸一口氣，然後看看四周——告訴我，你現在看到的第 1 樣東西是什麼？",
    prompts: [
      "很好，我看見了。那第 2 樣呢？",
      "嗯，還有最後一個。第 3 樣是什麼？",
    ],
    done: "太棒了，你完成了 🎉 慢慢把注意力帶回身體。有沒有覺得跟此刻、跟這個空間更靠近了一點呢？",
  },
};

// The universal "practice" chip, appended under every bear message so a小練習 is always one tap
// away (the mood → chat flow). Currently launches the only implemented exercise, 著地.
export const PRACTICE_CHIP = { label: "🌱 給我一個小練習", userText: "給我一個小練習", kind: "practice", practiceId: "grounding" };

// Scripted guided trees for the mood → chat flow, one per mood group (see chat-quick-replies.md).
// Each chip carries an action:
//   { to }         → advance to nodes[to] (bear asks the next question, its chips follow)
//   { kind:"practice", practiceId } → launch a practice from PRACTICES
//   { reply }      → bear says `reply`, chips stay (invite to keep talking / 幫我打氣 / 記下感覺)
//   { end }        → bear says `end`, then the chat closes and returns Home (收尾籤)
// `userText` overrides the bubble text shown for the tap (defaults to `label`). Every node keeps
// to 3–4 contextual chips + the appended practice chip; the chip row scrolls horizontally.
export const CHAT_SCRIPTS = {
  // A — 緊繃 / 非常緊繃
  A: {
    rootChips: [
      { label: "工作或金錢", to: "work" },
      { label: "人際關係", to: "people" },
      { label: "身體或睡眠", to: "body" },
      { label: "說不上來", to: "unsure" },
    ],
    nodes: {
      work: {
        text: "這方面的壓力常常很實際。是事情太多，還是對結果沒把握呢？",
        chips: [
          { label: "事情太多", to: "converge" },
          { label: "怕做不好", to: "converge" },
          { label: "說不上來", to: "converge" },
        ],
      },
      people: {
        text: "和人有關的心事最磨人了。是和誰之間讓你比較在意呢？",
        chips: [
          { label: "家人", to: "converge" },
          { label: "朋友或伴侶", to: "converge" },
          { label: "同事", to: "converge" },
        ],
      },
      body: {
        text: "身體的疲累也會壓著心情。最近睡得好嗎？",
        chips: [
          { label: "睡不太好", to: "converge" },
          { label: "很累", to: "converge" },
          { label: "還好", to: "converge" },
        ],
      },
      unsure: {
        text: "說不上來也很正常，不用勉強分類。要不要先一起深呼吸一下？",
        chips: [
          { label: "好啊", to: "converge" },
          { label: "我想自己靜一下", end: "嗯，那你先好好休息。我在這裡，隨時等你回來。" },
        ],
      },
      converge: {
        text: "謝謝你願意說出來，把心裡的事講出來，就已經是很勇敢的一步了。接下來，你想怎麼做呢？",
        chips: [
          { label: "🌱 給我一個小練習", userText: "給我一個小練習", kind: "practice", practiceId: "grounding" },
          { label: "再多說一點", reply: "好，你說，我在聽。😌" },
          { label: "我好一點了", end: "聽你這樣說我也放心了。今天願意跟我聊，你很棒。" },
        ],
      },
    },
  },

  // B — 平靜 / 普通
  B: {
    rootChips: [
      { label: "好好休息", to: "rest" },
      { label: "一個人的時間", to: "alone" },
      { label: "順利完成一件事", to: "done" },
      { label: "好像很普通", to: "plain" },
    ],
    nodes: {
      rest: {
        text: "能讓自己慢下來很不容易。是做了什麼讓你放鬆的呢？",
        chips: [
          { label: "睡飽了", to: "converge" },
          { label: "做喜歡的事", to: "converge" },
          { label: "什麼都沒做", to: "converge" },
        ],
      },
      alone: {
        text: "獨處的時光很珍貴。那段時間你在想些什麼呢？",
        chips: [
          { label: "放空", to: "converge" },
          { label: "想了一些事", to: "converge" },
          { label: "不想多說", to: "converge" },
        ],
      },
      done: {
        text: "完成一件事的踏實感很好。是什麼事呢？",
        chips: [
          { label: "工作或課業", to: "converge" },
          { label: "生活小事", to: "converge" },
          { label: "其他", to: "converge" },
        ],
      },
      plain: {
        text: "平淡的一天也值得記錄。那有沒有一個小小的、還不錯的瞬間？",
        chips: [
          { label: "好像有", to: "converge" },
          { label: "讓我想一下", to: "converge" },
          { label: "真的沒有", to: "converge" },
        ],
      },
      converge: {
        text: "把普通的日子過好，其實是一種很厲害的能力。接下來想做點什麼呢？",
        chips: [
          { label: "記下這份感覺", reply: "我幫你把這份平靜記下來了，下次低落時可以回來看看。想再聊聊嗎？" },
          { label: "再聊聊", reply: "好，你說，我在聽。😌" },
          { label: "謝謝你", end: "不客氣，能陪你我很開心。想我的時候隨時回來。" },
        ],
      },
    },
  },

  // C — 愉快 / 開心 / 非常愉快
  C: {
    rootChips: [
      { label: "和喜歡的人相處", to: "people" },
      { label: "完成了目標", to: "goal" },
      { label: "生活小確幸", to: "little" },
      { label: "說不清楚", to: "vague" },
    ],
    nodes: {
      people: {
        text: "和喜歡的人在一起最療癒了。是和誰呢？",
        chips: [
          { label: "家人", to: "converge" },
          { label: "朋友或伴侶", to: "converge" },
          { label: "寵物", to: "converge" },
        ],
      },
      goal: {
        text: "太棒了，你做到了！這件事對你來說重要嗎？",
        chips: [
          { label: "很重要", to: "converge" },
          { label: "小小的但開心", to: "converge" },
          { label: "還好", to: "converge" },
        ],
      },
      little: {
        text: "這些小小的好，最值得收藏。是什麼呢？",
        chips: [
          { label: "吃到好吃的", to: "converge" },
          { label: "天氣很好", to: "converge" },
          { label: "其他", to: "converge" },
        ],
      },
      vague: {
        text: "有時候好心情就是會自己冒出來。那就好好享受它吧，要記下來嗎？",
        chips: [
          { label: "好", to: "converge" },
          { label: "再聊聊", to: "converge" },
        ],
      },
      converge: {
        text: "我幫你把這份開心記下來了，下次低落時可以回來看看。想再做點什麼嗎？",
        chips: [
          { label: "幫我打氣", reply: "你已經做得很好了，光是願意好好感受此刻，就很不簡單。要為自己拍拍手嗎？👏" },
          { label: "就到這裡", end: "好，那我們今天就到這裡。記得，好心情值得被好好收藏。" },
          { label: "謝謝你", end: "不客氣，能陪你我很開心。想我的時候隨時回來。" },
        ],
      },
    },
  },
};

// Which guided tree an opener leads into, by the selected mood's label.
const GROUP_BY_LABEL = {
  非常緊繃: "A",
  緊繃: "A",
  平靜: "B",
  普通: "B",
  愉快: "C",
  開心: "C",
  非常愉快: "C",
};

export function chatScriptFor(moodIndex) {
  const label = SLIDER_MOODS[moodIndex]?.label;
  return CHAT_SCRIPTS[GROUP_BY_LABEL[label]] ?? null;
}

// Compose a one-line recap of the 和熊熊聊聊 conversation from what happened in it: the mood, the
// topics the user tapped through the guided tree, whether they did a practice, and whether they
// typed freely. Scripted (prototype) — stands in for an LLM summary.
export function composeChatSummary(moodIndex, { topics = [], didPractice = false, freeTexted = false } = {}) {
  const mood = SLIDER_MOODS[moodIndex]?.label ?? "";
  const parts = [`今天的心情是「${mood}」。`];
  if (topics.length) parts.push(`聊到了${topics.join("、")}。`);
  else if (freeTexted) parts.push("和熊熊說了一些心裡的話。");
  if (didPractice) parts.push("也一起做了著地小練習，讓自己回到當下。");
  return parts.join("");
}
