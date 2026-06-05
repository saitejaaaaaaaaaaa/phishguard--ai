// ========== TYPES ==========
export interface RiskFeature {
  name: string;
  score: number;
  impact: "high" | "medium" | "low";
  explanation: string;
}

export interface DetectionResult {
  inputType: "url" | "email";
  input: string;
  riskScore: number;
  rawProbability: number;
  calibratedProbability: number;
  riskLevel: "low" | "suspicious" | "high";
  riskLabel: string;
  features: RiskFeature[];
  summary: string;
  timestamp: Date;
}

// ========== CONSTANTS ==========
const SUSPICIOUS_TLDS = [".xyz", ".top", ".tk", ".gq", ".ml", ".buzz", ".club", ".icu", ".info", ".work"];
const BRAND_KEYWORDS = ["paypal", "apple", "google", "microsoft", "amazon", "netflix", "facebook", "instagram", "bank", "chase", "wellsfargo", "citi", "amex"];
const URL_SHORTENERS = ["bit.ly", "tinyurl.com", "cutt.ly", "t.co", "goo.gl", "ow.ly", "is.gd", "rb.gy"];
const SUSPICIOUS_PATH_KEYWORDS = ["login", "secure", "verify", "update", "account", "confirm", "signin", "authenticate", "password", "credential"];
const HOMOGRAPH_PATTERNS = [/paypa[l1]/i, /g[o0]{2}gle/i, /amaz[o0]n/i, /micr[o0]s[o0]ft/i, /faceb[o0]{2}k/i, /app[l1]e/i, /netf[l1]ix/i];

const URGENCY_PHRASES = ["act now", "immediately", "urgent", "suspended", "locked", "expire", "within 24 hours", "action required", "last warning", "final notice", "account will be", "verify now"];
const CREDENTIAL_PHRASES = ["enter your password", "confirm your identity", "update your payment", "verify your account", "social security", "credit card number", "bank account", "login credentials", "ssn", "pin number"];
const EMOTIONAL_PHRASES = ["congratulations", "you've won", "selected winner", "claim your prize", "fear of missing", "limited time", "exclusive offer", "act fast"];
const TRUSTED_DOMAINS = [
  "google.com",
  "github.com",
  "microsoft.com",
  "amazon.com",
  "gov.in",
  "edu"
];

// ========== SIGMOID ==========
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ========== URL ANALYSIS ==========
function analyzeUrl(url: string): RiskFeature[] {
  const features: RiskFeature[] = [];
  const lower = url.toLowerCase();

  let hostname = "";
  try {
    const u = new URL(lower.startsWith("http") ? lower : "http://" + lower);
    hostname = u.hostname;
  } catch {
    hostname = lower.split("/")[0];
  }

  // Suspicious TLD
  for (const tld of SUSPICIOUS_TLDS) {
    if (hostname.endsWith(tld)) {
      features.push({ name: "Suspicious TLD", score: 30, impact: "high", explanation: `Domain uses high-risk TLD "${tld}" commonly associated with phishing` });
      break;
    }
  }

  // Brand impersonation
  for (const brand of BRAND_KEYWORDS) {

  const isOfficial =
    hostname.endsWith(`${brand}.com`) ||
    hostname.endsWith(`.${brand}.com`) ||
    hostname.endsWith(`${brand}.org`) ||
    hostname.endsWith(`.${brand}.org`) ||
    hostname.endsWith(`${brand}.co`) ||
    hostname.endsWith(`.${brand}.co`);

  if (
    hostname.includes(brand) &&
    !isOfficial
  ) {
    features.push({
      name: "Brand Impersonation",
      score: 30,
      impact: "high",
      explanation: `Domain appears to impersonate "${brand}"`
    });

    break;
  }
}
  // IP address
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(hostname)) {
    features.push({ name: "IP Address Domain", score: 25, impact: "high", explanation: "Uses IP address instead of domain name — common in phishing" });
  }

  // Homograph
  for (const pattern of HOMOGRAPH_PATTERNS) {
    if (pattern.test(hostname)) {
      const match = hostname.match(pattern)?.[0];
      if (match && !BRAND_KEYWORDS.some(b => hostname.includes(b + "."))) {
        features.push({ name: "Homograph Attack", score: 25, impact: "high", explanation: `Potential lookalike characters detected in "${match}"` });
        break;
      }
    }
  }

  // URL shortener
  for (const shortener of URL_SHORTENERS) {
    if (hostname.includes(shortener)) {
      features.push({ name: "URL Shortener", score: 20, impact: "high", explanation: `Uses URL shortener "${shortener}" to mask true destination` });
      break;
    }
  }

  // Encoded characters
  if (/%[0-9a-f]{2}/i.test(url) || /base64/i.test(url)) {
    features.push({ name: "Encoded Characters", score: 20, impact: "high", explanation: "Contains encoded or obfuscated characters in URL" });
  }

  // Simulated low domain popularity
  if (hostname.length > 20 || /[0-9]{4,}/.test(hostname)) {
    features.push({ name: "Low Domain Popularity", score: 20, impact: "high", explanation: "Domain appears to have very low traffic — typical of disposable phishing domains" });
  }

  // Simulated ASN risk
  if (hostname.includes("free") || hostname.includes("host") || hostname.includes("000")) {
    features.push({ name: "Risky Hosting Provider", score: 15, impact: "high", explanation: "Domain appears hosted on low-cost infrastructure often used for phishing" });
  }

  // Simulated recent DNS
  if (/\d{6,}/.test(hostname) || hostname.split(".").length > 3) {
    features.push({ name: "Recent DNS Changes", score: 15, impact: "high", explanation: "Domain shows signs of recent registration or DNS changes" });
  }
  
  // SSL issues
  if (!lower.startsWith("https")) {
  features.push({
    name: "No HTTPS",
    score: 5,
    impact: "low",
    explanation: "Connection is not encrypted — missing HTTPS"
  });
  }

  // Subdomains
  const subdomainCount = hostname.split(".").length - 2;
  if (subdomainCount > 3) {
    features.push({ name: "Excessive Subdomains", score: 15, impact: "medium", explanation: `${subdomainCount} subdomains detected — used to confuse users` });
  }

  // URL length
  if (url.length > 75) {
    features.push({ name: "Long URL", score: 15, impact: "medium", explanation: `URL length (${url.length} chars) exceeds safe threshold` });
  }

  // Hyphens
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount > 2) {
    features.push({ name: "Excessive Hyphens", score: 10, impact: "medium", explanation: `${hyphenCount} hyphens in domain — common in phishing URLs` });
  }

  // Suspicious path keywords
  for (const keyword of SUSPICIOUS_PATH_KEYWORDS) {
    if (lower.includes(keyword)) {
      features.push({ name: "Suspicious Path Keywords", score: 10, impact: "medium", explanation: `Path contains "${keyword}" — common in credential-harvesting pages` });
      break;
    }
  }

  // Redirect patterns
  if ((url.match(/\/\//g) || []).length > 1) {
    features.push({ name: "Redirect Chain", score: 10, impact: "medium", explanation: "Multiple redirect patterns detected in URL" });
  }

  // Non-standard port
  if (/:(\d+)/.test(url)) {
    const port = url.match(/:(\d+)/)?.[1];
    if (port && !["80", "443"].includes(port)) {
      features.push({ name: "Non-Standard Port", score: 5, impact: "low", explanation: `Uses non-standard port :${port}` });
    }
  }

  // Random strings
  if (/[a-z]{2,}[0-9]{3,}[a-z]/i.test(hostname)) {
    features.push({ name: "Random String Pattern", score: 5, impact: "low", explanation: "Domain contains random-looking character patterns" });
  }

  return features;
}

// ========== EMAIL ANALYSIS ==========
function analyzeEmail(email: string): RiskFeature[] {
  const features: RiskFeature[] = [];
  const lower = email.toLowerCase();

  // Credential request
  for (const phrase of CREDENTIAL_PHRASES) {
    if (lower.includes(phrase)) {
      features.push({ name: "Credential Request", score: 30, impact: "high", explanation: `Contains "${phrase}" — a strong phishing indicator` });
      break;
    }
  }

  // Urgency
  for (const phrase of URGENCY_PHRASES) {
    if (lower.includes(phrase)) {
      features.push({ name: "Urgent Language", score: 25, impact: "high", explanation: `Contains urgency phrase "${phrase}" — common social engineering tactic` });
      break;
    }
  }

  // Suspicious links
  const urlPattern = /(https?:\/\/[^\s]+|bit\.ly|tinyurl|cutt\.ly)/gi;
  const urls = lower.match(urlPattern);
  if (urls) {
    const hasSuspiciousLink = urls.some(u => URL_SHORTENERS.some(s => u.includes(s)) || SUSPICIOUS_TLDS.some(t => u.includes(t)));
    if (hasSuspiciousLink) {
      features.push({ name: "Suspicious Link", score: 25, impact: "high", explanation: "Email contains suspicious or shortened URLs" });
    }
  }

  // SPF/DKIM simulation
  if (lower.includes("noreply") || lower.includes("no-reply") || lower.includes("donotreply")) {
    features.push({ name: "Authentication Warning", score: 25, impact: "high", explanation: "Sender pattern suggests potential SPF/DKIM authentication issues (simulated)" });
  }

  // Lookalike domain
  for (const pattern of HOMOGRAPH_PATTERNS) {
    if (pattern.test(lower)) {
      features.push({ name: "Lookalike Sender Domain", score: 20, impact: "high", explanation: "Sender appears to use a lookalike domain mimicking a known brand" });
      break;
    }
  }

  // Free email for business
  const freeProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"];
  if (freeProviders.some(p => lower.includes(p)) && (lower.includes("invoice") || lower.includes("payment") || lower.includes("account"))) {
    features.push({ name: "Free Email for Business", score: 15, impact: "high", explanation: "Uses free email provider for business-related communication" });
  }

  // Emotional manipulation
  for (const phrase of EMOTIONAL_PHRASES) {
    if (lower.includes(phrase)) {
      features.push({ name: "Emotional Manipulation", score: 20, impact: "high", explanation: `Contains emotional trigger "${phrase}"` });
      break;
    }
  }

  // Financial urgency
  if (lower.includes("wire transfer") || lower.includes("bitcoin") || lower.includes("gift card") || lower.includes("payment overdue")) {
    features.push({ name: "Financial Urgency", score: 15, impact: "high", explanation: "Contains financial urgency language often used in phishing" });
  }

  // Executable attachment mention
  if (lower.includes(".exe") || lower.includes(".zip") || lower.includes("macro") || lower.includes(".docm") || lower.includes("enable content")) {
    features.push({ name: "Dangerous Attachment", score: 20, impact: "high", explanation: "Mentions executable or macro-enabled attachments" });
  }

  // Multiple links
  if (urls && urls.length > 3) {
    features.push({ name: "Multiple Links", score: 10, impact: "medium", explanation: `Contains ${urls.length} links — excessive for typical communication` });
  }

  // Sender mismatch (simulated)
  if (lower.includes("from:") && lower.includes("reply-to:")) {
    features.push({ name: "Sender Mismatch", score: 15, impact: "medium", explanation: "From and Reply-To addresses appear different (simulated)" });
  }

  // Attachment mention
  if (lower.includes("attachment") || lower.includes("attached") || lower.includes("download")) {
    features.push({ name: "Attachment Reference", score: 15, impact: "medium", explanation: "References attachments or downloads" });
  }

  // Grammar heuristic
  const grammarIssues = (lower.match(/\b(kindly|dear sir|dear customer|dear user|valued customer)\b/g) || []).length;
  if (grammarIssues > 0) {
    features.push({ name: "Grammar Anomaly", score: 10, impact: "low", explanation: "Contains generic/formulaic language typical of phishing emails" });
  }

  // Generic greeting
  if (/dear (sir|madam|customer|user|valued|account holder)/i.test(lower)) {
    features.push({ name: "Generic Greeting", score: 5, impact: "low", explanation: "Uses generic greeting instead of personal name" });
  }

  // Repetitive CTA
  const ctaCount = (lower.match(/(click here|click now|click below|verify now|update now)/g) || []).length;
  if (ctaCount > 1) {
    features.push({ name: "Repetitive CTA", score: 10, impact: "medium", explanation: `${ctaCount} repetitive call-to-action phrases detected` });
  }

  return features;
}

// ========== MAIN DETECTION FUNCTION ==========
export function detectPhishing(input: string, type: "url" | "email"): DetectionResult {
  const features = type === "url" ? analyzeUrl(input) : analyzeEmail(input);
let hostname = "";

if (type === "url") {
  try {
    hostname = new URL(
      input.startsWith("http") ? input : "http://" + input
    ).hostname;
  } catch {}
}
  // Step 2: Rule risk score
  const riskScore = Math.min(100, Math.max(0, features.reduce((sum, f) => sum + f.score, 0)));

// Step 3: ML probability simulation
const weightedSum = features.reduce((sum, f) => {
  const weight = f.impact === "high" ? 1.5 : f.impact === "medium" ? 1.0 : 0.5;
  return sum + f.score * weight;
}, 0);

// ✅ FIX OPTION 1 APPLIED HERE
const rawProbability = sigmoid((weightedSum - 45) / 15) * 100;
  // Step 4: Calibration
  let calibratedProbability = rawProbability;

  const hasHighRisk = features.some(f => f.impact === "high" && f.score >= 25);
  const hasMediumOnly = !hasHighRisk && features.some(f => f.impact === "medium");
const highRiskCount = features.filter(
  f => f.impact === "high" && f.score >= 20
).length;

const mediumRiskCount = features.filter(
  f => f.impact === "medium"
).length;

if (highRiskCount >= 3) {
  calibratedProbability += 20;
}
else if (highRiskCount === 2) {
  calibratedProbability += 10;
}
else if (highRiskCount === 1) {
  calibratedProbability += 3;
}

if (mediumRiskCount >= 3) {
  calibratedProbability += 5;
}

  // Hard rules
  const hasBrandImpersonation = features.some(f => f.name === "Brand Impersonation" || f.name === "Homograph Attack");
  const hasShortenerWithKeywords = features.some(f => f.name === "URL Shortener") && features.some(f => f.name === "Suspicious Path Keywords");
  const hasCredentialRequest = features.some(f => f.name === "Credential Request");

  if (hasBrandImpersonation || hasCredentialRequest) {
    calibratedProbability = Math.max(calibratedProbability, 75);
  }
  if (hasShortenerWithKeywords) {
    calibratedProbability = Math.max(calibratedProbability, 65);
  }

  if (
  features.length <= 1 &&
  riskScore < 25
) {
  calibratedProbability *= 0.5;
}

  const isTrusted = TRUSTED_DOMAINS.some(domain =>
  hostname.includes(domain)
);

if (isTrusted) {
  calibratedProbability -= 25;
}
calibratedProbability = Math.min(100, Math.round(calibratedProbability));

// ✅ FIX OPTION 2 (right here)
if (features.length === 0) {
  calibratedProbability = 5;
}

  // Step 5: Classification
  let riskLevel: "low" | "suspicious" | "high";
  let riskLabel: string;

if (
  calibratedProbability >= 75 &&
  highRiskCount >= 2
) {
  riskLevel = "high";
  riskLabel = "High Risk — Likely Phishing";
}
else if (
  calibratedProbability >= 45
) {
  riskLevel = "suspicious";
  riskLabel = "Suspicious — Needs Verification";
}
else {
  riskLevel = "low";
  riskLabel = "Likely Safe";
}

  // If any features exist and score is low, be conservative
if (riskLevel === "low" && riskScore > 35){
    riskLevel = "suspicious";
    riskLabel = "Suspicious — Needs Verification";
    calibratedProbability = Math.max(calibratedProbability, 30);
  }

  // Summary
  const topFeatures = features.filter(f => f.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  const summary = topFeatures.length > 0
    ? topFeatures.map(f => f.explanation).join(". ") + "."
    : "No significant risk indicators found in the input.";

  return {
    inputType: type,
    input,
    riskScore,
    rawProbability: Math.round(rawProbability),
    calibratedProbability,
    riskLevel,
    riskLabel,
    features: features.sort((a, b) => b.score - a.score),
    summary,
    timestamp: new Date(),
  };
}

// ========== EXAMPLE TEST INPUTS ==========
export const EXAMPLE_INPUTS = {
  urls: [
    { label: "Obvious Phishing", value: "http://paypa1-secure-login.xyz/verify?id=a3f2b" },
    { label: "URL Shortener", value: "https://bit.ly/secure-verify-account-now" },
    { label: "IP-Based URL", value: "http://192.168.1.100:8080/login/secure/update" },
    { label: "Legitimate-Looking", value: "https://www.google.com/search?q=weather" },
    { label: "Subtle Phishing", value: "https://secure-amaz0n-verification.top/account/login" },
  ],
  emails: [
    {
      label: "Credential Phishing",
      value: "Dear Customer, Your account has been suspended. Please verify your account by entering your password at http://secure-bank-login.xyz/verify. Act now or your account will be locked within 24 hours."
    },
    {
      label: "Prize Scam",
      value: "Congratulations! You've won a $1000 gift card! Click here to claim your prize: http://bit.ly/claim-prize-now. Limited time offer - act fast!"
    },
    {
      label: "Legitimate Email",
      value: "Hi John, just following up on our meeting yesterday. Please find the project timeline attached. Let me know if you have any questions. Best regards, Sarah."
    },
    {
      label: "Invoice Scam",
      value: "Dear valued customer, kindly find attached invoice #INV-2024. Payment overdue. Please wire transfer immediately to avoid account suspension. Download the .exe attachment."
    },
  ],
};
