import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

let confirmCallback = null;

export const triggerAdminConfirm = (message, onConfirm) => {
  if (confirmCallback) {
    confirmCallback(message, onConfirm);
  } else {
    console.warn("AdminConfirm component not mounted");
  }
};

export default function AdminConfirm() {
  const [state, setState] = useState({ show: false, message: "", onConfirm: null });

  useEffect(() => {
    confirmCallback = (message, onConfirm) => {
      setState({ show: true, message, onConfirm });
    };
    return () => { confirmCallback = null; };
  }, []);

  const handleCancel = () => setState({ show: false, message: "", onConfirm: null });
  const handleConfirm = () => {
    if (state.onConfirm) state.onConfirm();
    handleCancel();
  };

  return (
    <AnimatePresence>
      {state.show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, backdropFilter: 'blur(2px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--sirat-surface)",
              border: "1px solid var(--sirat-border)",
              padding: "2rem",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              zIndex: 10001,
              minWidth: "320px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            <div style={{ color: "var(--sirat-error)" }}>
              <AlertTriangle size={32} />
            </div>
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600" }}>{state.message}</p>
            <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
              <button
                onClick={handleCancel}
                style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--sirat-border)", background: "none", color: "var(--sirat-text-main)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "none", background: "var(--sirat-error)", color: "#fff", fontWeight: "600", cursor: "pointer" }}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
