import { MOODS } from "../data/moods";
import { CALENDAR_WEEKS } from "../data/calendar";
import { THIS_WEEK_DAYS } from "../data/history";

// Average mood value across entries, skipping neutral "普通" logs (moodIndex null) so they
// don't crash the MOODS lookup or drag the tone. Returns 50 (neutral) when nothing is rated.
function averageMoodValue(entries) {
  const rated = entries.filter((entry) => entry.moodIndex != null);
  if (rated.length === 0) return 50;
  return rated.reduce((sum, entry) => sum + MOODS[entry.moodIndex].value, 0) / rated.length;
}

function toneLabel(avg) {
  return avg >= 60 ? "整體偏向愉快" : avg >= 40 ? "大致平穩" : "有點緊繃";
}

function topTags(entries, limit = 2) {
  const counts = {};
  entries.forEach((entry) => {
    entry.tags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, limit);
}

// Documentable days in the month so far: real day cells excluding out-of-month spacers
// ("hidden") and days that can't be logged yet ("future"). A numeric cell is a recorded
// mood; "empty"/"muted" are days that were left blank.
function monthCells() {
  return CALENDAR_WEEKS.flat().filter((cell) => cell !== "hidden" && cell !== "future");
}

export function weeklyMoodSummary() {
  const recorded = THIS_WEEK_DAYS.filter((day) => day.recorded);
  if (recorded.length === 0) {
    return "這週還沒有心情紀錄，點選首頁的心情圈開始記錄吧！";
  }
  const list = recorded.map((day) => `${day.date}「${day.moodText}」`).join("、");
  const tone = toneLabel(averageMoodValue(recorded));
  return `這週你記錄了 ${recorded.length} 天：${list}。${tone}，繼續留意自己的感受喔。`;
}

// Review page 週 tab summary. Computes the strip headline + bear narrative from the real
// THIS_WEEK_DAYS data. Returns { count: 0 } when nothing is recorded so the tab can show
// its empty state.
export function getWeeklyReview(days = THIS_WEEK_DAYS) {
  const recorded = days.filter((day) => day.recorded);
  if (recorded.length === 0) return { count: 0, tone: "", topTags: [], narrative: "" };
  const tone = toneLabel(averageMoodValue(recorded));
  const tags = topTags(recorded);
  const tagPart = tags.length ? `最常陪著你的是「${tags.join("」和「")}」，` : "";
  return {
    count: recorded.length,
    tone,
    topTags: tags,
    narrative: `這週你記錄了 ${recorded.length} 天，${tone}。${tagPart}繼續留意自己的感受喔。`,
  };
}

export function monthlyMoodBreakdown() {
  const recorded = monthCells().filter((cell) => typeof cell === "number");
  if (recorded.length === 0) {
    return "這個月還沒有心情紀錄呢，去記錄一下今天的感覺吧！";
  }
  const counts = {};
  recorded.forEach((moodIndex) => {
    counts[moodIndex] = (counts[moodIndex] || 0) + 1;
  });
  const topIndex = Object.keys(counts).reduce((a, b) => (counts[a] >= counts[b] ? a : b));
  const topMood = MOODS[topIndex];
  const percent = Math.round((counts[topIndex] / recorded.length) * 100);
  return `這個月共記錄了 ${recorded.length} 天，出現最多次的心情是「${topMood.label}」，佔了 ${percent}%。`;
}

export function topInfluenceTags() {
  const recorded = THIS_WEEK_DAYS.filter((day) => day.recorded);
  const top = topTags(recorded).join("、");
  if (!top) {
    return "還沒有足夠的標籤資料可以分析，記錄心情時試著加上標籤吧！";
  }
  return `最近最常和你的心情一起被記錄的是「${top}」，這些可能是最近影響你比較多的事喔。`;
}

export function monthlyRecordRate() {
  const cells = monthCells();
  const recorded = cells.filter((cell) => typeof cell === "number").length;
  const percent = Math.round((recorded / cells.length) * 100);
  return `這個月目前記錄了 ${recorded} / ${cells.length} 天（${percent}%）。持續記錄能幫助你更了解自己的情緒變化。`;
}

export function answerFreeText(text) {
  if (/這週|本週|禮拜/.test(text)) return weeklyMoodSummary();
  if (/這個月|上個月|月份|每月/.test(text)) return monthlyMoodBreakdown();
  if (/標籤|影響|原因|為什麼/.test(text)) return topInfluenceTags();
  if (/記錄|天數|幾天|頻率/.test(text)) return monthlyRecordRate();
  // Empathetic replies for free-form emotional chat (the mood → chat flow). Each reply follows
  // the same principle as the openers: acknowledge, then ask just one guiding question so the
  // conversation moves one step at a time. Negative feelings are matched before positive ones
  // so「不好」等否定語不會誤觸開心分支。
  if (/累|疲憊|好倦|沒力|沒精神/.test(text)) return "聽起來你真的辛苦了。今天是什麼讓你覺得特別累呢？";
  if (/壓力|焦慮|緊張|好煩|不安|擔心/.test(text)) return "有壓力的時候，別急著責備自己。你覺得這份壓力最主要是從哪裡來的呢？";
  if (/難過|傷心|想哭|低落|沮喪|失落/.test(text)) return "難過的感覺是可以被接住的。願意多說一點，是什麼讓你難過嗎？";
  if (/生氣|憤怒|不爽|討厭|火大/.test(text)) return "生氣很正常，它在提醒你有些界線被踩到了。是什麼事讓你這麼生氣呢？";
  if (/開心|快樂|高興|興奮|太好了|超讚/.test(text)) return "看到你這樣我也很開心！這份好心情是因為發生了什麼呢？";
  if (/謝謝|感謝/.test(text)) return "不客氣，能陪著你我很開心。現在的你，還想再多聊一點嗎？";
  return "我在這裡聽你說。可以多告訴我一點你現在的感受嗎？";
}
