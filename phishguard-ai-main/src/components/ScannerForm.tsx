import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Link, Mail, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EXAMPLE_INPUTS } from "@/lib/detection-engine";

interface Props {
  onScan: (input: string, type: "url" | "email") => void;
  isScanning: boolean;
}

export default function ScannerForm({ onScan, isScanning }: Props) {
  const [type, setType] = useState<"url" | "email">("url");
  const [input, setInput] = useState("");

  const examples = type === "url" ? EXAMPLE_INPUTS.urls : EXAMPLE_INPUTS.emails;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onScan(input.trim(), type);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-lg border border-border bg-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Threat Scanner</h2>
      </div>

      <Tabs value={type} onValueChange={v => { setType(v as "url" | "email"); setInput(""); }}>
        <TabsList className="bg-muted mb-4 w-full">
          <TabsTrigger value="url" className="flex-1 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link className="h-3.5 w-3.5" /> URL Analysis
          </TabsTrigger>
          <TabsTrigger value="email" className="flex-1 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Mail className="h-3.5 w-3.5" /> Email Analysis
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "url" ? (
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter URL to analyze (e.g., https://suspicious-site.xyz/login)"
            className="w-full rounded-md border border-border bg-muted px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        ) : (
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste email content to analyze..."
            rows={4}
            className="w-full rounded-md border border-border bg-muted px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          />
        )}

        <Button type="submit" disabled={!input.trim() || isScanning} className="w-full gap-2">
          {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {isScanning ? "Analyzing..." : "Run Detection Pipeline"}
        </Button>
      </form>

      <div className="mt-4">
        <p className="text-xs text-muted-foreground mb-2">Quick test samples:</p>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {examples.map(ex => (
              <motion.button
                key={ex.label}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setInput(ex.value)}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                {ex.label}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
