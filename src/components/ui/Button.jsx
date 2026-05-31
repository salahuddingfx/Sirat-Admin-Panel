import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import "./Button.css";

export function Button({ 
  children, 
  variant = "primary", 
  className, 
  type = "button",
  ...props 
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      className={cn("btn", `btn--${variant}`, className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
