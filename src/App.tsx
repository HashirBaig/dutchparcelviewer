import { useCallback, useState } from "react";
import { AppHeader } from "./components/layout/AppHeader";
import { MapView } from "./components/map/MapView";
import { ParcelPanel } from "./components/parcel/ParcelPanel";
import { useDateRange } from "./hooks/useDateRange";
import { useNdviMap } from "./hooks/useNdviMap";
import { useParcelAnalysis } from "./hooks/useParcelAnalysis";
import type { Parcel } from "./types/parcel";

function App() {
  const [selected, setSelected] = useState<Parcel | null>(null);

  const analysis = useParcelAnalysis(selected);
  const year = selected?.year ?? new Date().getFullYear();
  const dateRange = useDateRange(year, selected?.id ?? null);
  const ndviMap = useNdviMap(selected, analysis, dateRange.range);

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
            analysis={analysis}
            dateRange={dateRange}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
