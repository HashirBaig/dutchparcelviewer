import { SIGNIFICANCE_LEVEL, SLOPE_UNIT_MM } from "../../constants/precip";
import { formatP, formatSigned } from "../../lib/regressionText";
import type { PeriodRegression } from "../../types/regression";

interface Props {
  periods: PeriodRegression[];
  activeId: string | null;
}

export function RegressionTable({ periods, activeId }: Props) {
  return (
    <table className="reg-table">
      <thead>
        <tr>
          <th>Period</th>
          <th>n</th>
          <th>r</th>
          <th>p</th>
          <th title="Correlation controlling for day of year">r (date-adj.)</th>
          <th>Slope /{SLOPE_UNIT_MM} mm</th>
        </tr>
      </thead>
      <tbody>
        {periods.map(({ id, label, result, points }) => {
          const significant =
            result?.p != null && result.p < SIGNIFICANCE_LEVEL;
          return (
            <tr
              key={id}
              className={id === activeId ? "reg-table__active" : undefined}
            >
              <td>{label}</td>
              <td>{points.length}</td>
              <td>{formatSigned(result?.r ?? null)}</td>
              <td className={significant ? "reg-table__sig" : undefined}>
                {formatP(result?.p ?? null)}
              </td>
              <td>{formatSigned(result?.adjustedR ?? null)}</td>
              <td>
                {result ? formatSigned(result.slope * SLOPE_UNIT_MM, 3) : "–"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
