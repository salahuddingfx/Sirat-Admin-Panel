import { motion } from "framer-motion";
import { Card } from "./Card";
import "./MetricCard.css";

export function MetricCard({ label, value, delta, icon: Icon }) {
  const isPositive = delta?.includes("+");
  
  return (
    <Card className="metric-card">
      <div className="metric-card__header">
        <span className="metric-card__label">{label}</span>
        {Icon && <Icon size={18} className="metric-card__icon" />}
      </div>
      <div className="metric-card__body">
        <h3 className="metric-card__value">{value}</h3>
        {delta && (
          <span className={`metric-card__delta ${isPositive ? 'positive' : ''}`}>
            {delta}
          </span>
        )}
      </div>
    </Card>
  );
}
