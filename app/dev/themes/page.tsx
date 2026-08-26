import { HeroSection } from "@/components/sections/HeroSection";
import { LetterSection } from "@/components/sections/LetterSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { MapSection } from "@/components/sections/MapSection";
import ThemeProvider from "@/components/theme/ThemeProvider";
import AuthNav from "@/components/site/AuthNav";
import { themes } from "@/lib/themes";

const names = ["Anna", "Igor"];
const eventDate = "September 12, 2026";

const timelineEvents = [
  { time: "12:00", title: "Wedding ceremony" },
  {
    time: "12:30",
    title: "Cocktail hour",
    description: "Light bites and champagne in the garden",
  },
  { time: "14:00", title: "Reception dinner" },
  {
    time: "19:00",
    title: "Dancing till dawn",
    description: "Live music and a DJ",
  },
];

export default function ThemesPage() {
  return (
    <>
      <AuthNav />
      {Object.values(themes).map((theme) => (
        <div key={theme.id}>
          <p className="bg-gray-900 py-6 text-center text-base font-semibold uppercase tracking-widest text-white">
            — {theme.name} —
          </p>

          <ThemeProvider theme={theme}>
            <HeroSection
              variant="photo-full-bleed"
              names={names}
              eventDate={eventDate}
              photoUrl="/hero-placeholder.svg"
            />

            <LetterSection
              variant="centered-card"
              title="Dear guest!"
              body={`We're so happy you'll be with us on this important day.\n\nEverything you need to know about our wedding — the time, the place, and the schedule — will be here soon. For now, just save the date and celebrate the moment with us.`}
              quote="Love is when two people become one, without ceasing to be themselves"
            />

            <TimelineSection
              variant="vertical-line"
              title="Wedding Day Schedule"
              events={timelineEvents}
            />

            <MapSection
              variant="embed-static"
              title="How to get there"
              venues={[{ name: "Ulbrokas Pērle", address: "Institūta iela 3, Rīga" }]}
            />
          </ThemeProvider>
        </div>
      ))}
    </>
  );
}
