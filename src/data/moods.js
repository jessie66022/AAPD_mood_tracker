import { deriveStroke, deriveTextColor } from "../lib/color";

// Stops mirror the 6-color spectrum used by the mood ring on the Home screen
// and the slider gradient on the Mood Record screen (purple -> teal -> green -> yellow -> orange -> pink).
export const MOODS = [
  { value: 0, fill: "#BAAFD6", stroke: "#7245E5", label: "非常緊繃" },
  { value: 20, fill: "#66CCED", stroke: "#2582A1", label: "緊繃" },
  { value: 40, fill: "#92D0A8", stroke: "#209E4D", label: "平靜" },
  { value: 60, fill: "#FACA78", stroke: "#E59812", label: "愉快" },
  { value: 80, fill: "#F6B386", label: "開心" },
  { value: 100, fill: "#F3A9B7", label: "非常愉快" },
].map((mood) => ({
  ...mood,
  stroke: mood.stroke ?? deriveStroke(mood.fill),
  // Legible on-background tone for the emotion label text (Tags step) — darker/desaturated
  // relative to `stroke`, which stays bright for the bear illustration's outline.
  text: mood.text ?? deriveTextColor(mood.fill),
}));

export function moodForValue(value) {
  return MOODS.reduce((closest, mood) =>
    Math.abs(mood.value - value) < Math.abs(closest.value - value) ? mood : closest
  );
}

// A neutral "普通" mood rendered as a coffee-brown gummy bear (咖啡色) — distinct from the
// muted gray used for un-recorded days. It exists only on the mood-record slider, not in the
// 6-color MOODS spectrum, so the Home ring / calendar / history keep their index-based mapping.
export const NEUTRAL_MOOD = {
  fill: "#C4A588",
  stroke: "var(--color-primary)",
  text: "var(--color-primary)",
  label: "普通",
};

// The 7 selectable stops on the mood-record slider: the 6 spectrum moods with 普通 dropped in
// at the exact center (index 3), so sliding to the middle gives a neutral coffee-brown bear.
export const SLIDER_MOODS = [MOODS[0], MOODS[1], MOODS[2], NEUTRAL_MOOD, MOODS[3], MOODS[4], MOODS[5]];

// Map a SLIDER_MOODS index to the value the calendar/history use for a day: a MOODS index (0–5)
// for a spectrum mood, or `null` for the neutral 普通 (rendered as a muted bear).
export function sliderMoodToCalendarCell(sliderIndex) {
  const index = MOODS.indexOf(SLIDER_MOODS[sliderIndex]);
  return index >= 0 ? index : null;
}
