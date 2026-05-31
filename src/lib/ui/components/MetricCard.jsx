import { Panel } from "./Panel";

export function MetricCard({ label, value, delta }) {
  return (
    <Panel className="metric-card">
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      <span className="metric-card__delta">{delta}</span>
    </Panel>
  );
}
