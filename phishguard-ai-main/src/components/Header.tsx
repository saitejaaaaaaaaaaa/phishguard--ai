import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="relative">
            <Shield className="h-8 w-8 text-primary" />
            <div className="absolute inset-0 h-8 w-8 text-primary blur-md opacity-50">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              PHISHGUARD <span className="text-primary text-glow">ELITE</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Explainable Phishing Detection
            </p>
          </div>
        </motion.div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
            System Active
          </span>
        </div>
      </div>
    </header>
  );
}
