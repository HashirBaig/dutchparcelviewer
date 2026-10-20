import { useCallback, useState } from "react";
import { AppHeader } from "./components/layout/AppHeader";
import { MapView } from "./components/map/MapView";
import { ParcelPanel } from "./components/parcel/ParcelPanel";
import type { Parcel } from "./types/parcel";

function App() {
  const [selected, setSelected] = useState<Parcel | null>(null);

  const handleSelect = useCallback((parcel: Parcel) => {
    setSelected((prev) => (prev?.id === parcel.id ? prev : parcel));
  }, []);

  return (
    <div className="app">
      <AppHeader />
      <main className="app__main">
        <MapView selectedId={selected?.id ?? null} onSelect={handleSelect} />
        <aside className="app__side">
          <ParcelPanel parcel={selected} />
        </aside>
      </main>
    </div>
  );
}

export default App;
