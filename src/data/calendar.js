// Sample month data for the Review calendar, mirroring the Figma mock. Today is 2026-07-19.
// Each week is 7 cells:
//   - a MOODS index (0–5): a recorded entry, shown as a colored mood bear
//   - "empty": a past/today day with no entry — shows the dashed "add" cell (can still log)
//   - "muted": a past/today day left blank — flat gray bear, not an add prompt
//   - "future": a day that can't be documented yet (after today) — faint bear, non-interactive
//   - "hidden": spacer cell for days outside this month
// Days 1–18 are all filled with recorded moods; day 19 (today) starts "empty" and fills in once
// the user completes a record — see TODAY_CELL below and its use in ReviewScreen's MonthTab.
export const CALENDAR_MONTH_LABEL = "2026 年 7 月";
export const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

export const CALENDAR_WEEKS = [
  ["hidden", "hidden", 1, 0, 3, 4, 2],
  [4, 4, 2, 3, 4, 5, 1],
  [2, 3, 5, 4, 1, 3, "empty"],
  ["future", "future", "future", "future", "future", "future", "future"],
  ["future", "future", "future", "future", "future", "hidden", "hidden"],
];

// Grid position (row, col) of today, 2026-07-19 — the cell the record flow fills on completion.
export const TODAY_CELL = { row: 2, col: 6 };

// Day-of-month number for each CALENDAR_WEEKS cell (same 5x7 shape). Leading days from the
// previous month are `muted: true` (shown in --color-text-muted); trailing days from next
// month are `hidden: true` (rendered invisible — just holding the grid's spacing).
export const CALENDAR_DATES = [
  [
    { day: 29, muted: true },
    { day: 30, muted: true },
    { day: 1 },
    { day: 2 },
    { day: 3 },
    { day: 4 },
    { day: 5 },
  ],
  [{ day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 }, { day: 12 }],
  [{ day: 13 }, { day: 14 }, { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 }],
  [{ day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25 }, { day: 26 }],
  [
    { day: 27 },
    { day: 28 },
    { day: 29 },
    { day: 30 },
    { day: 31 },
    { day: 4, hidden: true },
    { day: 5, hidden: true },
  ],
];
