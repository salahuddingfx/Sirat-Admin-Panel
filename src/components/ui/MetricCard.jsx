import { motion } from "framer-motion";
import { Card } from "./Card";
import "./MetricCard.css";

export function MetricCard({ label, value, delta, icon: Icon }) {
  const deltaIsString = typeof delta === "string" || typeof delta === "number";
  const isPositive = deltaIsString && String(delta).includes("+");
  const isNegative = deltaIsString && String(delta).includes("-");

  let deltaClass = "";
  if (isPositive) deltaClass = "positive";
  else if (isNegative) deltaClass = "negative";

  return (
    <Card className="metric-card">
      <div className="metric-card__header">
        <span className="metric-card__label">{label}</span>
        {Icon && <Icon size={18} className="metric-card__icon" />}
      </div>
      <div className="metric-card__body">
        <h3 className="metric-card__value">{value}</h3>
        {delta && (
          <span className={`metric-card__delta ${deltaClass}`}>
            {delta}
          </span>
        )}
      </div>
    </Card>
  );
}
