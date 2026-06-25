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
            padding: "1rem 1.5rem 1rem 1.75rem",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            zIndex: 9999,
            minWidth: "300px",
            overflow: "hidden"
          }}
        >
          {/* Left accent border with matching rounded corner */}
          <div 
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              background: toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : toast.type === 'warning' ? '#F59E0B' : 'var(--sirat-gold)',
              borderRadius: "12px 0 0 12px"
            }}
          />

          {/* Bottom progress bar with matching rounded corners */}
          <motion.div 
            key={toast.message}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3.5, ease: "linear" }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "3px",
              background: toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : toast.type === 'warning' ? '#F59E0B' : 'var(--sirat-gold)',
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px"
            }}
          />

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
