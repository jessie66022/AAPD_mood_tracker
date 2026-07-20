import calendarBearSvg from "../assets/review/bear-calendar.svg?raw";
import mediumBearSvg from "../assets/shared/bear-note-recolor.svg?raw";
import { MOODS } from "../data/moods";

const VARIANTS = {
  calendar: calendarBearSvg,
  medium: mediumBearSvg,
};

// A day with no recorded mood renders the same bear illustration flattened to a single
// muted tone (fill and stroke both `--color-primary-muted`), rather than a 7th color stop.
const MUTED_MOOD = { fill: "var(--color-primary-muted)", stroke: "var(--color-primary-muted)" };

export default function MoodBear({ moodIndex, variant = "calendar", className = "" }) {
  const mood = moodIndex == null ? MUTED_MOOD : MOODS[moodIndex];
  return (
    <div
      className={className}
      style={{ "--fill-0": mood.fill, "--stroke-0": mood.stroke }}
      dangerouslySetInnerHTML={{ __html: VARIANTS[variant] }}
    />
  );
}
