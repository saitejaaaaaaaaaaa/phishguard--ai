import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function ScanAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-lg border border-primary/20 bg-card p-8 flex flex-col items-center justify-center glow-primary overflow-hidden relative"
    >
      <div className="absolute inset-0 scan-line animate-scan opacity-50" />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Shield className="h-12 w-12 text-primary" />
      </motion.div>
      <p className="mt-4 text-sm text-primary font-mono animate-pulse-glow">Running detection pipeline...</p>
      <div className="flex gap-1 mt-3">
        {["Feature Extraction", "Risk Scoring", "ML Simulation", "Calibration", "Classification"].map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ delay: i * 0.4, duration: 2, repeat: Infinity }}
            className="text-[9px] text-muted-foreground bg-muted rounded px-2 py-0.5"
          >
            {step}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
