import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getStats, getHistory } from "@/lib/scan-store";

const COLORS = {
  high: "hsl(0, 72%, 51%)",
  suspicious: "hsl(38, 92%, 50%)",
  low: "hsl(170, 50%, 40%)",
};

export default function AnalyticsChart() {
  const stats = getStats();
  const history = getHistory();

  const pieData = [
    { name: "High Risk", value: stats.high, color: COLORS.high },
    { name: "Suspicious", value: stats.suspicious, color: COLORS.suspicious },
    { name: "Low Risk", value: stats.low, color: COLORS.low },
  ].filter(d => d.value > 0);

  const recentTimeline = history.slice(0, 10).reverse().map((r, i) => ({
    name: `#${i + 1}`,
    score: r.calibratedProbability,
    fill: COLORS[r.riskLevel],
  }));

  if (stats.total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-border bg-card p-6 text-center"
      >
        <p className="text-muted-foreground text-sm">Run some scans to see analytics here.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Risk Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
              {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(225, 50%, 9%)", border: "1px solid hsl(225, 30%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210, 40%, 92%)" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          {pieData.map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name} ({d.value})
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-border bg-card p-4"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Recent Scan Timeline</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={recentTimeline}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(225, 50%, 9%)", border: "1px solid hsl(225, 30%, 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210, 40%, 92%)" }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {recentTimeline.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
