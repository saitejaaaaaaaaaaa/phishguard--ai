import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, ChevronDown, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DetectionResult, RiskFeature } from "@/lib/detection-engine";

interface Props {
  result: DetectionResult;
}

const riskConfig = {
  high: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", glow: "glow-danger", barColor: "bg-destructive" },
  suspicious: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", glow: "glow-warning", barColor: "bg-warning" },
  low: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10", border: "border-success/30", glow: "glow-success", barColor: "bg-success" },
};

const impactColors = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

function FeatureRow({ feature }: { feature: RiskFeature }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{feature.name}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${impactColors[feature.impact]}`}>
            {feature.impact}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{feature.explanation}</p>
      </div>
      <span className={`font-mono text-sm font-bold ml-4 ${feature.score > 0 ? "text-destructive" : "text-success"}`}>
        {feature.score > 0 ? "+" : ""}{feature.score}
      </span>
    </div>
  );
}

export default function ResultPanel({ result }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const cfg = riskConfig[result.riskLevel];
  const Icon = cfg.icon;

  const handleCopy = () => {
    const report = `PHISHGUARD ELITE — Scan Report
Input: ${result.input}
Type: ${result.inputType.toUpperCase()}
Risk Level: ${result.riskLabel}
Probability: ${result.calibratedProbability}%
Rule Score: ${result.riskScore}/100

Features:
${result.features.map(f => `  [${f.impact.toUpperCase()}] ${f.name}: ${f.score > 0 ? "+" : ""}${f.score} — ${f.explanation}`).join("\n")}

Summary: ${result.summary}
Timestamp: ${result.timestamp.toISOString()}`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border ${cfg.border} ${cfg.glow} bg-card overflow-hidden`}
    >
      {/* Warning banner */}
      {result.riskLevel !== "low" && (
        <div className={`${cfg.bg} px-4 py-2 flex items-center gap-2 border-b ${cfg.border}`}>
          <Icon className={`h-4 w-4 ${cfg.color}`} />
          <span className={`text-sm font-medium ${cfg.color}`}>
            {result.riskLevel === "high" ? "⚠ This input shows strong phishing indicators" : "⚠ This input requires further verification"}
          </span>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Risk level header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full ${cfg.bg} p-3`}>
              <Icon className={`h-6 w-6 ${cfg.color}`} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${cfg.color}`}>{result.riskLabel}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{result.inputType.toUpperCase()} Analysis</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
            {copied ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy Report"}
          </Button>
        </div>

        {/* Probability bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Calibrated Probability</span>
            <span className="font-mono font-bold text-foreground">{result.calibratedProbability}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.calibratedProbability}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${cfg.barColor}`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Rule Score: {result.riskScore}/100</span>
            <span>Raw ML: {result.rawProbability}%</span>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-md bg-muted/50 border border-border p-3">
          <p className="text-sm text-muted-foreground">{result.summary}</p>
        </div>

        {/* Expandable details */}
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
            Why this result? ({result.features.filter(f => f.score > 0).length} indicators found)
          </button>
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-md border border-border bg-muted/30 p-4">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Feature Contribution Analysis</h4>
                  {result.features.map((f, i) => (
                    <FeatureRow key={i} feature={f} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
