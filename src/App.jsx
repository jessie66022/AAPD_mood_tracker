import { createBrowserRouter } from "react-router-dom";
import HomeScreen from "./HomeScreen";
import ReviewScreen from "./ReviewScreen";
import SettingsScreen from "./SettingsScreen";
import AskBearScreen from "./AskBearScreen";

// createBrowserRouter (not <BrowserRouter>/<Routes>) is required for Link's
// `viewTransition` prop to work — it wraps navigation in document.startViewTransition().
// The mood-record flow is not a route — it's a bottom sheet (see RecordMoodSheet.jsx /
// context/SheetContext.jsx), opened from Home's mood ring or the tab bar's FAB.
const router = createBrowserRouter([
  { path: "/AAPD_mood_tracker", element: <HomeScreen /> },
  { path: "/AAPD_mood_tracker/review", element: <ReviewScreen /> },
  { path: "/AAPD_mood_tracker/settings", element: <SettingsScreen /> },
  { path: "/AAPD_mood_tracker/ask-bear", element: <AskBearScreen /> },
]);

export default router;
