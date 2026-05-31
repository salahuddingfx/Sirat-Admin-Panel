import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import "./Card.css";

export function Card({ children, className, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("card", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const Panel = Card;
