import { useCallback, useState } from "react";
import { AppHeader } from "./components/layout/AppHeader";
import { MapView } from "./components/map/MapView";
import { ParcelPanel } from "./components/parcel/ParcelPanel";
import { ALL_DAYS } from "./constants/dateFilter";
import { useNdviMap } from "./hooks/useNdviMap";
import { useParcelAnalysis } from "./hooks/useParcelAnalysis";
import { usePeriod } from "./hooks/usePeriod";
import { useRecentAnalysis } from "./hooks/useRecentAnalysis";
import type { Parcel } from "./types/parcel";

function App() {
  const [selected, setSelected] = useState<Parcel | null>(null);
  const year = selected?.year ?? new Date().getFullYear();

  const period = usePeriod(year, selected?.id ?? null);

  // Quick view first; the full season starts once it has finished (or failed)
  const recent = useRecentAnalysis(selected);
  const season = useParcelAnalysis(
    selected,
    recent.phase === "done" || recent.phase === "error",
  );

  // The map follows whichever view is active
  const inRecentMode = period.mode === "recent";
  const ndviMap = useNdviMap(
    selected,
    inRecentMode ? recent : season,
    inRecentMode ? ALL_DAYS : period.dateRange.range,
  );

  const handleSelect = useCallback((parcel: Parcel) => {
    setSelected((prev) => (prev?.id === parcel.id ? prev : parcel));
  }, []);

  return (
    <div className="app">
      <AppHeader />
      <main className="app__main">
        <MapView parcel={selected} ndviMap={ndviMap} onSelect={handleSelect} />
        <aside className="app__side">
          <ParcelPanel
            parcel={selected}
            recent={recent}
            season={season}
            period={period}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
