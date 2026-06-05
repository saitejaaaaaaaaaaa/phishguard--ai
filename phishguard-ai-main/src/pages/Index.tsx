import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import ScannerForm from "@/components/ScannerForm";
import ResultPanel from "@/components/ResultPanel";
import ScanAnimation from "@/components/ScanAnimation";
import AnalyticsChart from "@/components/AnalyticsChart";
import { detectPhishing, type DetectionResult } from "@/lib/detection-engine";
import { addScan } from "@/lib/scan-store";

const Index = () => {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [key, setKey] = useState(0); // force re-render stats

  const handleScan = useCallback((input: string, type: "url" | "email") => {
    setIsScanning(true);
    setResult(null);

    // Simulate pipeline delay
    setTimeout(() => {
      const detection = detectPhishing(input, type);
      addScan(detection);
      setResult(detection);
      setIsScanning(false);
      setKey(k => k + 1);
    }, 1800);
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
        <StatsCards key={`stats-${key}`} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScannerForm onScan={handleScan} isScanning={isScanning} />
          <AnimatePresence mode="wait">
            {isScanning ? (
              <ScanAnimation key="scanning" />
            ) : result ? (
              <ResultPanel key="result" result={result} />
            ) : (
              <div key="empty" className="rounded-lg border border-border bg-card/50 p-8 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">
                  Enter a URL or email content to begin analysis.<br />
                  <span className="text-xs">Results will appear here.</span>
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        <AnalyticsChart key={`chart-${key}`} />
      </main>
    </div>
  );
};

export default Index;
