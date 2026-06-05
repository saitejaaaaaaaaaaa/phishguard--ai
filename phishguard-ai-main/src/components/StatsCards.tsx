import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import { getStats } from "@/lib/scan-store";

export default function StatsCards() {
  const stats = getStats();

  const cards = [
    { label: "Total Scans", value: stats.total, icon: Activity, variant: "primary" as const },
    { label: "High Risk", value: stats.high, icon: ShieldAlert, variant: "danger" as const },
    { label: "Suspicious", value: stats.suspicious, icon: AlertTriangle, variant: "warning" as const },
    { label: "Avg Risk Score", value: `${stats.avgScore}%`, icon: ShieldCheck, variant: "success" as const },
  ];

  const variantStyles = {
    primary: "border-primary/20 glow-primary",
    danger: "border-destructive/20 glow-danger",
    warning: "border-warning/20 glow-warning",
    success: "border-success/20 glow-success",
  };

  const iconStyles = {
    primary: "text-primary",
    danger: "text-destructive",
    warning: "text-warning",
    success: "text-success",
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`rounded-lg border bg-card p-4 ${variantStyles[card.variant]}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</span>
            <card.icon className={`h-4 w-4 ${iconStyles[card.variant]}`} />
          </div>
          <p className="text-2xl font-bold font-mono">{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
