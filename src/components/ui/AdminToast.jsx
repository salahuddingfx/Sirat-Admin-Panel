import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, XCircle, X } from "lucide-react";

let toastCallback = null;

export const triggerAdminToast = (message, type = "success") => {
  if (toastCallback) {
    toastCallback(message, type);
  } else {
    console.warn("AdminToast component not mounted");
  }
};

export default function AdminToast() {
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    toastCallback = (message, type) => {
      setToast({ show: true, message, type });
      setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 3500);
    };
    return () => { toastCallback = null; };
  }, []);

  const icons = {
    success: <CheckCircle size={18} style={{ color: "#10B981" }} />,
    error: <XCircle size={18} style={{ color: "#EF4444" }} />,
    warning: <AlertCircle size={18} style={{ color: "#F59E0B" }} />,
    info: <Info size={18} style={{ color: "var(--sirat-gold)" }} />,
  };

  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          style={{
            position: "fixed",
            top: "2rem",
            right: "2rem",
            background: "var(--sirat-surface)",
            border: `1px solid var(--sirat-border)`,
            borderLeft: `4px solid ${toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : toast.type === 'warning' ? '#F59E0B' : 'var(--sirat-gold)'}`,
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            zIndex: 9999,
            minWidth: "300px"
          }}
        >
          {icons[toast.type]}
          <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "var(--sirat-text-main)" }}>
            {toast.message}
          </span>
          <button 
            onClick={() => setToast({ ...toast, show: false })}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--sirat-muted)", cursor: "pointer" }}
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
