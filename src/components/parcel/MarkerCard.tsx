import type { MarkerResult } from "../../types/marker";
import { StatusBadge } from "../ui/StatusBadge";

export function MarkerCard({ marker }: { marker: MarkerResult }) {
  return (
    <section className="card">
      <header className="card__header">
        <h3>{marker.name}</h3>
        <StatusBadge status={marker.status} />
      </header>
      <p>{marker.summary}</p>
      {marker.events.length > 0 && (
        <ul className="events">
          {marker.events.map((event) => (
            <li key={`${event.date}-${event.label}`}>
              <time>{event.date}</time> {event.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
