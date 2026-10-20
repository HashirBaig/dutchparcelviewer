import { STATUS_COLORS, STATUS_LABELS } from "../../constants/markers";
import type { MarkerStatus } from "../../types/marker";

export function StatusBadge({ status }: { status: MarkerStatus }) {
  return (
    <span className="badge" style={{ backgroundColor: STATUS_COLORS[status] }}>
      {STATUS_LABELS[status]}
    </span>
  );
}
