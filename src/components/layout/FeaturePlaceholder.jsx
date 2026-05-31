import { Card, SectionHeader } from "../../../components/ui";
import { motion } from "framer-motion";

export function FeaturePlaceholder({ title, description, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader
        title={title}
        description={description}
      />
      <Card className="placeholder-card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '5rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.5)',
        borderStyle: 'dashed'
      }}>
        {Icon && <Icon size={48} style={{ color: 'var(--color-border-strong)', marginBottom: '1.5rem' }} />}
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
          The {title.toLowerCase()} management module is being prepared for the next release.
        </p>
      </Card>
    </motion.div>
  );
}
