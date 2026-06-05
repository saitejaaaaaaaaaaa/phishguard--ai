import { DetectionResult } from "./detection-engine";

let scanHistory: DetectionResult[] = [];

export function addScan(result: DetectionResult) {
  scanHistory = [result, ...scanHistory].slice(0, 100);
}

export function getHistory(): DetectionResult[] {
  return scanHistory;
}

export function getStats() {
  const total = scanHistory.length;
  const high = scanHistory.filter(s => s.riskLevel === "high").length;
  const suspicious = scanHistory.filter(s => s.riskLevel === "suspicious").length;
  const low = scanHistory.filter(s => s.riskLevel === "low").length;
  const avgScore = total > 0 ? Math.round(scanHistory.reduce((s, r) => s + r.calibratedProbability, 0) / total) : 0;
  return { total, high, suspicious, low, avgScore };
}
