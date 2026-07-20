// The current week (Mon–Sun) — the single source of truth for the Review page's 週/日 tabs
// and lib/insights. Each day is either recorded (`recorded: true`, with a moodIndex 0–5 or
// `null` for a neutral "普通" log, plus tags and a one-line reflection `note`) or not yet
// logged (`recorded: false`). The spectrum strip colors each day by its moodIndex (null →
// muted), and the entry list / summary count only the recorded days.
export const WEEK_RANGE_LABEL = "7月6日 - 7月12日";

export const THIS_WEEK_DAYS = [
  { id: 1, weekday: "一", date: "7月6日（一）", recorded: true, moodIndex: 2, moodText: "平靜", tags: ["睡眠"], note: "睡飽後整個人鬆了下來，一天的步調都慢慢的。" },
  { id: 2, weekday: "二", date: "7月7日（二）", recorded: true, moodIndex: 3, moodText: "愉快", tags: ["運動", "朋友"], note: "下班和朋友去跑步，流完汗心情特別輕鬆。" },
  { id: 3, weekday: "三", date: "7月8日（三）", recorded: true, moodIndex: 4, moodText: "開心", tags: ["自我照顧"], note: "給自己放了一個小假，看了想看很久的電影。" },
  { id: 4, weekday: "四", date: "7月9日（四）", recorded: false, moodIndex: null, moodText: "", tags: [], note: "" },
  { id: 5, weekday: "五", date: "7月10日（五）", recorded: true, moodIndex: null, moodText: "普通", tags: ["金錢", "伴侶"], note: "平平的一天，跟伴侶聊了一下最近的開銷。" },
  { id: 6, weekday: "六", date: "7月11日（六）", recorded: true, moodIndex: 5, moodText: "非常愉快", tags: ["興趣愛好", "自我照顧", "伴侶"], note: "和伴侶一起做了喜歡的事，是很滿足的一天。" },
  { id: 7, weekday: "日", date: "7月12日（日）", recorded: false, moodIndex: null, moodText: "", tags: [], note: "" },
];
