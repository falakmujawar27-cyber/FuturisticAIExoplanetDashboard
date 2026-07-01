import { useState, useId } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceArea, ReferenceLine, AreaChart, Area
} from "recharts";

// ── palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#050816", card: "#121B33", secondary: "#0D1326",
  cyan: "#00E5FF", green: "#5EF38C", orange: "#FFB547",
  fg: "#E8EEFF", muted: "#6B7FA8", border: "rgba(0,229,255,0.12)",
  red: "#FF4D6A",
};

// ── synthetic light curve ─────────────────────────────────────────────────────
function makeCurve(n = 200, noise = 0.003, transitDepth = 0.014) {
  const centers = [40, 120, 195];
  return Array.from({ length: n }, (_, i) => {
    let f = 1 + (Math.random() - 0.5) * noise;
    for (const c of centers) {
      const d = Math.abs(i - c);
      if (d < 9) f -= transitDepth * Math.cos((d / 9) * (Math.PI / 2)) ** 2;
    }
    return { t: parseFloat((i * 0.135).toFixed(2)), f: parseFloat(f.toFixed(5)) };
  });
}
const RAW = makeCurve(200, 0.004);
const SMOOTH = makeCurve(200, 0.001);

// ── shared atoms ──────────────────────────────────────────────────────────────
function WF({ children, className = "", style = {} }: { children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={className} style={style}>{children}</div>;
}
function WFBox({ label, h = 32, className = "" }: { label?: string; h?: number; className?: string }) {
  return (
    <div style={{ border: "1.5px solid #aaa", borderRadius: 3, height: h, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#666", padding: "0 6px", textAlign: "center" }} className={className}>
      {label}
    </div>
  );
}
function WFText({ s = 10, w = "100%", color = "#444", bold = false, style = {} }: { s?: number; w?: string | number; color?: string; bold?: boolean; style?: React.CSSProperties }) {
  return <div style={{ height: s + 2, background: "#ccc", borderRadius: 2, width: w, marginBottom: 4, opacity: bold ? 0.7 : 0.45, ...style }} />;
}
function WFGraph({ h = 80, label = "Graph" }: { h?: number; label?: string }) {
  return (
    <div style={{ border: "1.5px dashed #bbb", borderRadius: 3, height: h, background: "#f7f7f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#999", flexDirection: "column", gap: 4 }}>
      <div style={{ width: "85%", height: 1.5, background: "#bbb" }} />
      <span style={{ fontSize: 9, color: "#999" }}>{label}</span>
      <svg width="90%" height="40%" viewBox="0 0 200 40" style={{ overflow: "visible" }}>
        <polyline points="0,30 20,28 35,29 50,27 65,10 75,8 85,27 100,28 115,29 130,27 145,8 155,7 165,27 180,29 200,28" fill="none" stroke="#bbb" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function Card({ children, style = {}, className = "" }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={className} style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, ...style }}>{children}</div>;
}
function HFBadge({ label, color = C.cyan }: { label: string; color?: string }) {
  return <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 20, background: `${color}18`, color, border: `1px solid ${color}40`, fontFamily: "JetBrains Mono, monospace", display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />{label}</span>;
}
function Dot({ color = C.cyan, size = 5 }: { color?: string; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: color, display: "inline-block", boxShadow: `0 0 4px ${color}` }} />;
}

// ── WIREFRAME SCREENS ─────────────────────────────────────────────────────────

function WF_Landing() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", padding: 10, fontFamily: "sans-serif", boxSizing: "border-box" }}>
      {/* nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #ddd", paddingBottom: 6, marginBottom: 8 }}>
        <WFBox label="LOGO" h={18} className="" />
        <div style={{ display: "flex", gap: 6 }}>
          {["Nav 1", "Nav 2", "Nav 3"].map(n => <WFBox key={n} label={n} h={18} />)}
          <WFBox label="Upload Dataset" h={18} />
        </div>
      </div>
      {/* hero */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div style={{ paddingTop: 4 }}>
          <WFText s={6} w="60%" bold />
          <WFText s={14} w="90%" bold style={{ marginBottom: 6 }} />
          <WFText s={9} w="95%" />
          <WFText s={9} w="80%" />
          <WFText s={9} w="70%" />
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <WFBox label="Upload Dataset" h={22} />
            <WFBox label="Try Demo" h={22} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            {["Stars\nAnalysed", "Candidates\nFound", "Model\nAccuracy", "Avg\nTime"].map(s => (
              <div key={s} style={{ textAlign: "center" }}>
                <WFText s={10} w={40} bold style={{ margin: "0 auto 3px" }} />
                <div style={{ fontSize: 7, color: "#999", whiteSpace: "pre-line", textAlign: "center" }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
        <WFBox label="[ Telescope / Planet Illustration ]" h={120} />
      </div>
      {/* pipeline */}
      <div style={{ borderTop: "1px solid #ddd", paddingTop: 6 }}>
        <div style={{ fontSize: 7, color: "#999", marginBottom: 4, textAlign: "center" }}>AI PIPELINE OVERVIEW</div>
        <div style={{ display: "flex", gap: 4 }}>
          {["Noise\nReduction", "Transit\nDetection", "Classification", "Parameter\nEstimation", "Visualization"].map((s, i) => (
            <div key={i} style={{ flex: 1, border: "1.5px solid #ccc", borderRadius: 3, padding: "4px 2px", textAlign: "center" }}>
              <WFBox label="" h={14} />
              <div style={{ fontSize: 7, color: "#666", marginTop: 3, whiteSpace: "pre-line" }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WF_Upload() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", padding: 10, fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <WFText s={11} w="50%" bold style={{ marginBottom: 6 }} />
      <div style={{ border: "2px dashed #bbb", borderRadius: 4, padding: 18, textAlign: "center", marginBottom: 8 }}>
        <WFBox label="[ Upload Icon ]" h={28} className="" />
        <div style={{ fontSize: 8, color: "#888", marginTop: 4 }}>Drag & Drop TESS .fits / .csv files here</div>
        <WFBox label="Browse Files" h={18} className="" style={{ width: 80, margin: "6px auto 0" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        {["FITS format", "CSV format", "HDF5 format"].map(f => <WFBox key={f} label={f} h={40} />)}
      </div>
      <WFText s={8} w="60%" bold style={{ marginBottom: 4 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <WFBox label="Filename.fits · 82MB" h={18} className="" style={{ flex: 1 }} />
        <WFBox label="✓" h={18} className="" style={{ width: 24 }} />
      </div>
      <div style={{ height: 6, background: "#ddd", borderRadius: 3, marginBottom: 8, position: "relative" }}>
        <div style={{ width: "72%", height: "100%", background: "#999", borderRadius: 3 }} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <WFBox label="Start Analysis" h={22} />
        <WFBox label="Configure Parameters" h={22} />
      </div>
    </div>
  );
}

function WF_Processing() {
  const steps = ["Upload", "Noise Reduction", "Transit Detection", "Classification", "Parameter Estimation", "Visualization"];
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", padding: 10, fontFamily: "sans-serif", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
      <div>
        <WFText s={9} w="80%" bold style={{ marginBottom: 6 }} />
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            <WFBox label={i < 3 ? "✓" : i === 3 ? "…" : ""} h={18} className="" style={{ width: 18, flexShrink: 0 }} />
            <div style={{ fontSize: 8, color: i < 3 ? "#555" : i === 3 ? "#222" : "#bbb", fontWeight: i === 3 ? "bold" : "normal" }}>{s}</div>
            {i < steps.length - 1 && <div style={{ display: "none" }} />}
          </div>
        ))}
        <div style={{ height: 1, background: "#eee", margin: "6px 0" }} />
        {["Data Points", "Cadence", "Sectors"].map(m => (
          <div key={m} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <div style={{ fontSize: 7, color: "#999" }}>{m}</div>
            <WFText s={7} w={40} style={{ margin: 0 }} />
          </div>
        ))}
      </div>
      <div>
        <WFText s={9} w="70%" bold style={{ marginBottom: 4 }} />
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <div style={{ fontSize: 7, color: "#888" }}>Overall Progress</div>
            <div style={{ fontSize: 7, color: "#888" }}>58%</div>
          </div>
          <div style={{ height: 6, background: "#ddd", borderRadius: 3 }}>
            <div style={{ width: "58%", height: "100%", background: "#999", borderRadius: 3 }} />
          </div>
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 3, padding: 6, height: 110, overflow: "hidden", background: "#f9f9f9" }}>
          <div style={{ fontSize: 7, color: "#bbb", marginBottom: 4 }}>pipeline.log</div>
          {["[INFO] Loading FITS file…", "[INFO] Applying S-G detrending…", "[INFO] BLS periodogram running…", "[INFO] CNN inference…", "[INFO] MCMC sampling…"].map((l, i) => (
            <div key={i} style={{ fontSize: 6.5, color: i < 3 ? "#888" : "#bbb", marginBottom: 2 }}>&gt; {l}</div>
          ))}
          <div style={{ fontSize: 6.5, color: "#bbb" }}>&gt; _</div>
        </div>
      </div>
    </div>
  );
}

function WF_Dashboard() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", padding: 10, fontFamily: "sans-serif", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 6 }}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5 }}>
        {["Stars Analysed", "Candidate Exoplanets", "Avg Confidence", "Avg SNR"].map(k => (
          <div key={k} style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 6 }}>
            <div style={{ fontSize: 6.5, color: "#aaa", marginBottom: 3 }}>{k}</div>
            <WFText s={12} w="70%" bold style={{ margin: 0 }} />
          </div>
        ))}
      </div>
      {/* main grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 220px", gap: 6, minHeight: 0 }}>
        {/* light curve — HERO */}
        <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 6, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontSize: 7, color: "#888" }}>TESS Light Curve — TIC xxxxxxx</div>
            <WFBox label="3 Transits Detected" h={14} />
          </div>
          <WFGraph h={90} label="[ LIGHT CURVE — PRIMARY VISUALIZATION ]" />
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 6.5, color: "#aaa", marginBottom: 3 }}>Recent Targets</div>
            <div style={{ display: "flex", gap: 2, flexDirection: "column" }}>
              {["TIC 307210830", "TIC 260647166", "TIC 141527579"].map(t => (
                <div key={t} style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                  <div style={{ fontSize: 6.5, color: "#aaa" }}>{t}</div>
                  <WFText s={6} w={80} style={{ margin: 0 }} />
                  <WFBox label="Status" h={10} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* right panel */}
        <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 6 }}>
          <div style={{ fontSize: 7, color: "#888", marginBottom: 5 }}>SELECTED CANDIDATE</div>
          {["TIC ID", "Predicted Class", "Confidence", "Orbital Period", "Transit Duration", "Transit Depth", "SNR"].map(k => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: 3, marginBottom: 3 }}>
              <div style={{ fontSize: 6.5, color: "#aaa" }}>{k}</div>
              <WFText s={6} w={60} style={{ margin: 0 }} />
            </div>
          ))}
          <div style={{ marginTop: 4 }}>
            <WFBox label="[ Confidence Gauge ]" h={50} />
          </div>
          <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
            <WFBox label="Classify" h={18} className="" style={{ flex: 1 }} />
            <WFBox label="Report" h={18} className="" style={{ flex: 1 }} />
          </div>
        </div>
      </div>
      {/* timeline */}
      <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 5 }}>
        <div style={{ fontSize: 6.5, color: "#aaa", marginBottom: 3 }}>Detected Events Timeline</div>
        <div style={{ height: 18, background: "#f5f5f5", borderRadius: 2, position: "relative", overflow: "hidden" }}>
          {[15, 42, 72].map(p => (
            <div key={p} style={{ position: "absolute", left: `${p}%`, top: 2, width: 4, height: 14, background: "#bbb", borderRadius: 1 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WF_Classification() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", padding: 10, fontFamily: "sans-serif", boxSizing: "border-box", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 6 }}>
          <div style={{ fontSize: 7, color: "#888", marginBottom: 4 }}>PREDICTION</div>
          <WFText s={10} w="70%" bold />
          <WFBox label="[ Confidence Gauge ]" h={70} />
          <div style={{ fontSize: 7, color: "#aaa", textAlign: "center", marginTop: 3 }}>87.4% — Transit</div>
        </div>
        <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 6 }}>
          <div style={{ fontSize: 7, color: "#888", marginBottom: 3 }}>MODEL ENSEMBLE</div>
          {["CNN ResNet-50", "Transformer", "SVM Baseline"].map(m => (
            <div key={m} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <div style={{ fontSize: 6.5, color: "#888" }}>{m}</div>
              <WFText s={6} w={30} style={{ margin: 0 }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 6 }}>
          <div style={{ fontSize: 7, color: "#888", marginBottom: 6 }}>PROBABILITY DISTRIBUTION</div>
          {["Transit", "Eclipsing Binary", "Stellar Blend", "Noise"].map((l, i) => (
            <div key={l} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <div style={{ fontSize: 7, color: "#666" }}>{l}</div>
                <div style={{ fontSize: 7, color: "#888" }}>{[87, 7, 3, 2][i]}%</div>
              </div>
              <div style={{ height: 5, background: "#eee", borderRadius: 3 }}>
                <div style={{ width: `${[87, 7, 3, 2][i]}%`, height: "100%", background: "#ccc", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 6 }}>
          <div style={{ fontSize: 7, color: "#888", marginBottom: 5 }}>AI DECISION CHECKLIST</div>
          {["Periodicity Signal", "Transit Shape", "Signal Quality", "Centroid Check", "Odd-Even Test"].map(f => (
            <div key={f} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
              <WFBox label="✓" h={14} className="" style={{ width: 14, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 7, color: "#555" }}>{f}</div>
                <WFText s={5.5} w="90%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WF_Transit() {
  const panels = ["Raw Light Curve", "Denoised Curve", "Detected Transit", "Best-Fit Model", "Residual Plot"];
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", padding: 10, fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <WFText s={9} w="50%" bold style={{ marginBottom: 6 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {panels.map((p, i) => (
          <div key={p} style={{ gridColumn: i === 4 ? "1 / -1" : undefined, border: "1.5px solid #ddd", borderRadius: 3, padding: 5 }}>
            <div style={{ fontSize: 6.5, color: "#888", marginBottom: 3 }}>{String(i + 1).padStart(2, "0")} · {p}</div>
            <WFGraph h={i === 4 ? 40 : 60} label={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

function WF_Parameters() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", padding: 10, fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <WFText s={9} w="50%" bold style={{ marginBottom: 6 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginBottom: 8 }}>
        {["Orbital Period", "Transit Duration", "Transit Depth", "SNR", "Confidence"].map(m => (
          <div key={m} style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 6 }}>
            <WFBox label="" h={18} />
            <WFText s={12} w="80%" bold style={{ marginTop: 4 }} />
            <div style={{ fontSize: 6.5, color: "#aaa" }}>{m}</div>
            <WFText s={5.5} w="100%" />
            <WFText s={5.5} w="80%" />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 5 }}>
          <div style={{ fontSize: 6.5, color: "#888", marginBottom: 3 }}>Period Posterior Distribution</div>
          <WFGraph h={70} label="P = 5.71 ± 0.0008 d" />
        </div>
        <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 5 }}>
          <div style={{ fontSize: 6.5, color: "#888", marginBottom: 3 }}>Parameter Uncertainties (1σ)</div>
          {["Period", "Duration", "Depth", "Impact Param", "Rp/Rs"].map(p => (
            <div key={p} style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 6, color: "#aaa", width: 50 }}>{p}</div>
              <div style={{ flex: 1, height: 4, background: "#eee", borderRadius: 2 }}>
                <div style={{ width: `${Math.random() * 30 + 5}%`, height: "100%", background: "#ccc", borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WF_Report() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", padding: 10, fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <WFText s={6} w={80} />
          <WFText s={11} w={160} bold />
          <div style={{ display: "flex", gap: 4 }}>
            {["Potential Exoplanet", "Conf: 87.4%", "Sector 27"].map(b => <WFBox key={b} label={b} h={14} />)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <WFBox label="PDF" h={20} />
          <WFBox label="CSV" h={20} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 6 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 5 }}>
            <div style={{ fontSize: 6.5, color: "#888", marginBottom: 3 }}>STAR INFORMATION</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
              {["TIC ID", "RA/Dec", "Stellar Type", "Stellar Radius", "Mag", "Observation"].map(f => (
                <div key={f} style={{ border: "1px solid #eee", borderRadius: 2, padding: 4 }}>
                  <div style={{ fontSize: 5.5, color: "#aaa" }}>{f}</div>
                  <WFText s={6} w="80%" style={{ margin: 0 }} />
                </div>
              ))}
            </div>
          </div>
          <WFGraph h={65} label="Light Curve Summary" />
          <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 5 }}>
            <div style={{ fontSize: 6.5, color: "#888", marginBottom: 3 }}>AI PREDICTION SUMMARY</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <div>
                {["Transit", "Eclipsing Binary", "Stellar Blend", "Noise"].map(c => (
                  <div key={c} style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 3 }}>
                    <div style={{ fontSize: 6, color: "#aaa", width: 60 }}>{c}</div>
                    <div style={{ flex: 1, height: 3, background: "#eee", borderRadius: 2 }} />
                  </div>
                ))}
              </div>
              <WFBox label="Verdict: Potential Exoplanet" h={50} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 5 }}>
            <div style={{ fontSize: 6.5, color: "#888", marginBottom: 4 }}>ESTIMATED PARAMETERS</div>
            {["Orbital Period", "Transit Duration", "Transit Depth", "Planet Radius", "Semi-major Axis", "Eq. Temperature", "SNR"].map(p => (
              <div key={p} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: 2, marginBottom: 2 }}>
                <div style={{ fontSize: 6, color: "#aaa" }}>{p}</div>
                <WFText s={6} w={50} style={{ margin: 0 }} />
              </div>
            ))}
          </div>
          <div style={{ border: "1.5px solid #ddd", borderRadius: 3, padding: 5 }}>
            <div style={{ fontSize: 6.5, color: "#888", marginBottom: 4 }}>FOLLOW-UP REC.</div>
            {["Radial Velocity Follow-up", "CHEOPS Photometry", "AO Imaging"].map(r => (
              <div key={r} style={{ border: "1px solid #eee", borderRadius: 2, padding: 4, marginBottom: 3 }}>
                <div style={{ fontSize: 6.5, color: "#555" }}>{r}</div>
                <WFText s={5.5} w="90%" />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <WFBox label="PDF" h={22} className="" style={{ flex: 1 }} />
            <WFBox label="CSV" h={22} className="" style={{ flex: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HI-FI SCREENS ─────────────────────────────────────────────────────────────

const HF_NAV = () => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, padding: "6px 12px", background: "rgba(5,8,22,0.95)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: `radial-gradient(circle, ${C.cyan}50, ${C.bg})`, boxShadow: `0 0 6px ${C.cyan}` }} />
      <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10, fontWeight: 600, color: C.fg }}>CelestiQ</span>
    </div>
    <div style={{ display: "flex", gap: 12 }}>
      {["Dashboard", "Detection", "Analytics", "Reports", "Documentation"].map(n => (
        <span key={n} style={{ fontSize: 8, color: C.muted, fontFamily: "Inter, sans-serif" }}>{n}</span>
      ))}
    </div>
    <div style={{ display: "flex", gap: 5 }}>
      <span style={{ fontSize: 8, padding: "3px 8px", borderRadius: 8, background: C.cyan, color: C.bg, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>Upload Dataset</span>
      <span style={{ fontSize: 8, padding: "3px 8px", borderRadius: 8, border: `1px solid ${C.border}`, color: C.fg }}>Start Detection</span>
    </div>
  </div>
);

function HF_Landing() {
  return (
    <div style={{ width: "100%", height: "100%", background: C.bg, boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <HF_NAV />
      {/* star field */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 50% at 65% 50%, rgba(0,229,255,0.05) 0%, transparent 70%)` }} />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", padding: "0 16px", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, border: `1px solid ${C.border}`, background: `rgba(0,229,255,0.06)`, marginBottom: 8 }}>
            <Dot color={C.green} size={4} />
            <span style={{ fontSize: 7, color: C.cyan, fontFamily: "JetBrains Mono, monospace" }}>TESS Mission Integration · Sector 1–65</span>
          </div>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 24, fontWeight: 700, color: C.fg, lineHeight: 1.1, marginBottom: 6 }}>
            AI-Powered<br /><span style={{ color: C.cyan }}>Exoplanet</span><br />Detection
          </h1>
          <p style={{ fontSize: 8.5, color: C.muted, fontFamily: "Inter, sans-serif", lineHeight: 1.6, maxWidth: 220, marginBottom: 12 }}>
            Upload TESS photometric data and let our ensemble neural network identify planetary transit signals with observatory-grade precision.
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 8, padding: "5px 12px", borderRadius: 10, background: C.cyan, color: C.bg, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>Upload Dataset</span>
            <span style={{ fontSize: 8, padding: "5px 12px", borderRadius: 10, border: `1px solid ${C.border}`, color: C.fg }}>Try Demo</span>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
            {[["12,847", "Stars Analysed"], ["1,203", "Candidates"], ["94.2%", "Accuracy"], ["< 3 min", "Avg Process"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, color: C.fg }}>{v}</div>
                <div style={{ fontSize: 7, color: C.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* illustration */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", height: 200 }}>
          {/* star */}
          <div style={{ position: "absolute", top: "15%", right: "20%", width: 22, height: 22, borderRadius: "50%", background: "radial-gradient(circle, #FFF6D6, #FFB547)", boxShadow: "0 0 14px rgba(255,181,71,0.6)" }} />
          {/* orbital rings */}
          {[110, 145, 175].map((r, i) => (
            <div key={r} style={{ position: "absolute", left: "50%", top: "50%", width: r * 2, height: r * 2, borderRadius: "50%", border: `1px solid rgba(0,229,255,${0.08 - i * 0.02})`, transform: "translate(-50%,-50%)" }} />
          ))}
          {/* planet */}
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #1A4F7A, #050816)", boxShadow: `0 0 30px rgba(0,229,255,0.2), 0 0 60px rgba(0,229,255,0.06)`, zIndex: 2 }} />
          {/* ring */}
          <div style={{ position: "absolute", width: 110, height: 18, borderRadius: "50%", border: `1.5px solid rgba(0,229,255,0.2)`, background: "transparent", transform: "rotate(-15deg)", zIndex: 1 }} />
          {/* satellite */}
          <div style={{ position: "absolute", bottom: "22%", left: "12%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 20, height: 10, background: "#1A2744", border: `1px solid ${C.border}`, borderRadius: 2 }} />
            <div style={{ width: 30, height: 2, background: `rgba(0,229,255,0.3)`, marginTop: 2 }} />
          </div>
          {/* light curve mini */}
          <div style={{ position: "absolute", bottom: "8%", right: "4%", background: "rgba(18,27,51,0.8)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 6px", backdropFilter: "blur(4px)" }}>
            <svg width="70" height="24" viewBox="0 0 70 24">
              <polyline points="0,12 8,11 14,12 20,11 25,4 28,3 31,11 38,12 44,11 50,4 53,3 56,11 64,12 70,11" fill="none" stroke={C.cyan} strokeWidth="1.2" />
              <rect x="22" y="1" width="12" height="14" fill={`${C.cyan}15`} stroke={`${C.cyan}40`} strokeWidth="0.5" />
              <rect x="46" y="1" width="12" height="14" fill={`${C.cyan}15`} stroke={`${C.cyan}40`} strokeWidth="0.5" />
            </svg>
            <div style={{ fontSize: 6, color: C.muted, fontFamily: "JetBrains Mono, monospace", textAlign: "center" }}>Transit signal</div>
          </div>
        </div>
      </div>
      {/* pipeline footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "6px 16px", display: "flex", gap: 4 }}>
        {["Noise Reduction", "Transit Detection", "Classification", "Parameter Estimation", "Visualization"].map((s, i) => (
          <div key={s} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 6px", textAlign: "center" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(0,229,255,0.1)", margin: "0 auto 3px" }} />
            <div style={{ fontSize: 7, color: C.fg, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>{s}</div>
            <div style={{ fontSize: 6, color: C.muted }}>Step 0{i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HF_Upload() {
  return (
    <div style={{ width: "100%", height: "100%", background: C.bg, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <HF_NAV />
      <div style={{ flex: 1, padding: 14, display: "flex", flexDirection: "column", gap: 8, overflow: "hidden" }}>
        <div style={{ fontSize: 14, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg }}>Dataset Upload</div>
        {/* drop zone */}
        <div style={{ border: `1.5px dashed ${C.cyan}50`, borderRadius: 14, padding: 20, textAlign: "center", background: "rgba(0,229,255,0.03)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,229,255,0.1)", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${C.cyan}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: `6px solid ${C.cyan}`, transform: "rotate(180deg)" }} />
            </div>
          </div>
          <div style={{ fontSize: 10, fontFamily: "Space Grotesk, sans-serif", color: C.fg, fontWeight: 600, marginBottom: 3 }}>Drag & drop your dataset</div>
          <div style={{ fontSize: 7.5, color: C.muted, marginBottom: 8 }}>Supports TESS .fits, .csv files — up to 2 GB</div>
          <span style={{ fontSize: 7.5, padding: "4px 10px", borderRadius: 8, border: `1px solid ${C.border}`, color: C.fg }}>Browse Files</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {[["FITS", C.cyan], ["CSV", C.green], ["HDF5", C.orange]].map(([f, col]) => (
            <div key={f as string} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: col as string, fontFamily: "Space Grotesk, sans-serif", marginBottom: 2 }}>{f}</div>
              <div style={{ fontSize: 7, color: C.muted }}>Light curve format</div>
            </div>
          ))}
        </div>
        {/* progress */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10, boxShadow: `0 0 16px rgba(0,229,255,0.08)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 8.5, color: C.fg, fontFamily: "Space Grotesk, sans-serif" }}>lc_TIC_260647166_s27.fits</div>
            <div style={{ fontSize: 7, color: C.green, fontFamily: "JetBrains Mono, monospace" }}>Upload complete</div>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.green})` }} />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 8, padding: "4px 10px", borderRadius: 8, background: C.cyan, color: C.bg, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>Start Analysis</span>
            <span style={{ fontSize: 8, padding: "4px 10px", borderRadius: 8, border: `1px solid ${C.border}`, color: C.fg }}>Configure</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HF_Processing() {
  const steps = [
    { label: "Noise Reduction", done: true },
    { label: "Transit Detection", done: true },
    { label: "Classification", active: true },
    { label: "Parameter Estimation", done: false },
    { label: "Visualization", done: false },
  ];
  return (
    <div style={{ width: "100%", height: "100%", background: C.bg, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <HF_NAV />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8, padding: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg, marginBottom: 2 }}>Pipeline Processing</div>
          {steps.map((s, i) => (
            <div key={s.label} style={{ background: (s as any).active ? `rgba(0,229,255,0.06)` : C.card, border: `1px solid ${(s as any).active ? C.cyan : C.border}`, borderRadius: 10, padding: "6px 8px", display: "flex", alignItems: "center", gap: 6, boxShadow: (s as any).active ? `0 0 12px rgba(0,229,255,0.1)` : "none" }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: s.done ? "rgba(94,243,140,0.12)" : (s as any).active ? "rgba(0,229,255,0.12)" : "rgba(107,127,168,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.done ? <span style={{ color: C.green, fontSize: 8 }}>✓</span> : (s as any).active ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan }} /> : null}
              </div>
              <div>
                <div style={{ fontSize: 7, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>Step 0{i + 1}</div>
                <div style={{ fontSize: 8, color: s.done || (s as any).active ? C.fg : C.muted, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 9, fontFamily: "Space Grotesk, sans-serif", color: C.fg, fontWeight: 600 }}>Mission Progress</span>
              <span style={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace", color: C.cyan }}>58%</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3 }}>
              <div style={{ width: "58%", height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${C.cyan}, ${C.green})`, boxShadow: `0 0 6px ${C.cyan}80` }} />
            </div>
          </div>
          <div style={{ background: C.secondary, border: `1px solid ${C.border}`, borderRadius: 12, flex: 1, overflow: "hidden" }}>
            <div style={{ padding: "5px 8px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 4 }}>
              {[C.red, C.orange, C.green].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />)}
              <span style={{ fontSize: 6.5, color: C.muted, fontFamily: "JetBrains Mono, monospace", marginLeft: 4 }}>pipeline.log</span>
            </div>
            <div style={{ padding: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 6.5 }}>
              {["[INFO] Loading FITS: lc_TIC_260647166_s27.fits", "[INFO] 18,243 data points · 2-min cadence", "[INFO] S-G detrending applied (window=51)", "[INFO] BLS peak at P=5.71 d (FAP<1e-9)", "[INFO] 3 transit candidates found", "[INFO] CNN inference running…"].map((l, i) => (
                <div key={i} style={{ color: i < 4 ? C.muted : C.cyan, marginBottom: 3 }}><span style={{ color: "#3B4D6B" }}>&gt; </span>{l}</div>
              ))}
              <div style={{ color: C.cyan }}>&gt; <span style={{ opacity: 0.5 }}>_</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniLineChart({ data, color, showRef = false, isResidual = false }: { data: any[]; color: string; showRef?: boolean; isResidual?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: -28 }}>
        <XAxis dataKey="t" tick={{ fill: C.muted, fontSize: 5, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} interval={39} />
        <YAxis tick={{ fill: C.muted, fontSize: 5, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
        {showRef && [{ t1: 5.1, t2: 6.5 }, { t1: 15.8, t2: 17.2 }, { t1: 26.2, t2: 27.5 }].map((w) => (
          <ReferenceArea key={`ra-${w.t1}-${w.t2}`} x1={w.t1} x2={w.t2} fill={`${C.cyan}12`} stroke={C.cyan} strokeOpacity={0.3} />
        ))}
        {isResidual && <ReferenceLine y={0} stroke={C.muted} strokeDasharray="3 3" strokeOpacity={0.4} />}
        <Line type="monotone" dataKey="f" stroke={color} strokeWidth={0.8} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function HF_Dashboard() {
  const posteriorData = Array.from({ length: 60 }, (_, i) => {
    const x = 5.65 + i * 0.003;
    const g = Math.exp(-((x - 5.7134) ** 2) / (2 * 0.01 ** 2));
    return { t: parseFloat(x.toFixed(3)), f: parseFloat((g + (Math.random() - 0.5) * 0.06).toFixed(4)) };
  });
  return (
    <div style={{ width: "100%", height: "100%", background: C.bg, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <HF_NAV />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 10px", gap: 6, overflow: "hidden", minHeight: 0 }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5, flexShrink: 0 }}>
          {[[`12,847`, "Stars Analysed", C.cyan], [`1,203`, "Candidates", C.green], [`82.4%`, "Avg Confidence", "#A78BFA"], [`14.7σ`, "Avg SNR", C.orange]].map(([v, l, c]) => (
            <div key={l as string} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "6px 8px" }}>
              <div style={{ fontSize: 6, fontFamily: "JetBrains Mono, monospace", color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 15, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg }}>{v}</div>
              <div style={{ width: 20, height: 2, borderRadius: 1, background: c as string, marginTop: 3, boxShadow: `0 0 4px ${c}` }} />
            </div>
          ))}
        </div>

        {/* main row */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 200px", gap: 6, minHeight: 0 }}>
          {/* light curve hero */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, minHeight: 0 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "8px 10px", flex: 1, display: "flex", flexDirection: "column", boxShadow: `0 0 20px rgba(0,229,255,0.07)`, minHeight: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 9, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg }}>TESS Light Curve — TIC 260647166</div>
                  <div style={{ fontSize: 6.5, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>Normalized flux · BJD offset · 2-min cadence</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <HFBadge label="3 Transits Detected" color={C.cyan} />
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <MiniLineChart data={RAW} color={C.cyan} showRef />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 3, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <div style={{ width: 14, height: 1.5, background: C.cyan }} />
                  <span style={{ fontSize: 6, color: C.muted }}>Flux</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: `${C.cyan}15`, border: `0.5px solid ${C.cyan}50` }} />
                  <span style={{ fontSize: 6, color: C.muted }}>Transit window</span>
                </div>
              </div>
            </div>
            {/* events timeline */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "5px 8px", flexShrink: 0 }}>
              <div style={{ fontSize: 6.5, color: C.muted, fontFamily: "JetBrains Mono, monospace", marginBottom: 3 }}>Detected Events Timeline</div>
              <div style={{ height: 14, background: C.secondary, borderRadius: 4, position: "relative" }}>
                {[13, 43, 73].map((p, i) => (
                  <div key={i} style={{ position: "absolute", left: `${p}%`, top: 1, bottom: 1, width: 5, background: `${C.cyan}50`, borderRadius: 1, border: `0.5px solid ${C.cyan}80`, boxShadow: `0 0 4px ${C.cyan}` }} />
                ))}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.02) 50%, transparent 100%)" }} />
              </div>
            </div>
          </div>

          {/* right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 8, boxShadow: `0 0 14px rgba(0,229,255,0.08)`, flex: 1 }}>
              <div style={{ fontSize: 6, fontFamily: "JetBrains Mono, monospace", color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Selected Candidate</div>
              {[["TIC ID", "TIC 260647166", C.cyan], ["Predicted Class", "Transit", C.fg], ["Confidence", "87.4%", C.green], ["Orbital Period", "5.71 d", C.fg], ["Transit Duration", "2.34 h", C.fg], ["Transit Depth", "1.47%", C.fg], ["SNR", "14.7 σ", C.fg]].map(([k, v, c]) => (
                <div key={k as string} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, paddingBottom: 3, marginBottom: 3 }}>
                  <span style={{ fontSize: 6.5, color: C.muted }}>{k}</span>
                  <span style={{ fontSize: 6.5, fontFamily: "JetBrains Mono, monospace", color: c as string }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 6 }}>
                <HFBadge label="Potential Exoplanet" color={C.green} />
              </div>
              {/* mini gauge */}
              <div style={{ position: "relative", height: 54, marginTop: 6 }}>
                <svg viewBox="0 0 100 54" style={{ width: "100%", height: "100%" }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeDasharray={`${Math.PI * 40 * 0.75} ${Math.PI * 40 * 0.25}`} strokeDashoffset="0" transform="rotate(-225 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke={C.cyan} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.PI * 40 * 0.75 * 0.874} ${Math.PI * 40}`} strokeDashoffset="0" transform="rotate(-225 50 50)" style={{ filter: `drop-shadow(0 0 3px ${C.cyan})` }} />
                  <text x="50" y="46" textAnchor="middle" fill={C.fg} fontSize="12" fontFamily="Space Grotesk, sans-serif" fontWeight="700">87.4%</text>
                  <text x="50" y="55" textAnchor="middle" fill={C.muted} fontSize="6" fontFamily="Inter, sans-serif">confidence</text>
                </svg>
              </div>
            </div>
            {/* AI Explainability */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 8 }}>
              <div style={{ fontSize: 6, fontFamily: "JetBrains Mono, monospace", color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>AI Explainability</div>
              {[["Periodic Transit Detected", true], ["High Signal-to-Noise Ratio", true], ["Transit Shape Match", true], ["Consistent Periodicity", true], ["No Secondary Eclipse", true]].map(([f, ok]) => (
                <div key={f as string} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                  <span style={{ color: C.green, fontSize: 7 }}>✓</span>
                  <span style={{ fontSize: 6.5, color: C.fg }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HF_Classification() {
  const probs = [["Transit", 87.4, C.cyan], ["Eclipsing Binary", 7.2, C.orange], ["Stellar Blend", 3.1, "#A78BFA"], ["Noise", 2.3, C.muted]];
  return (
    <div style={{ width: "100%", height: "100%", background: C.bg, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <HF_NAV />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8, padding: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10, boxShadow: `0 0 16px rgba(0,229,255,0.08)` }}>
            <div style={{ fontSize: 6.5, color: C.muted, fontFamily: "JetBrains Mono, monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Ensemble Confidence</div>
            <div style={{ position: "relative", height: 90 }}>
              <svg viewBox="0 0 120 70" style={{ width: "100%", height: "100%" }}>
                <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" strokeDasharray={`${Math.PI * 48 * 0.75} ${Math.PI * 48 * 0.25}`} strokeDashoffset="0" transform="rotate(-225 60 60)" />
                <circle cx="60" cy="60" r="48" fill="none" stroke={C.cyan} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${Math.PI * 48 * 0.75 * 0.874} ${Math.PI * 48}`} strokeDashoffset="0" transform="rotate(-225 60 60)" style={{ filter: `drop-shadow(0 0 4px ${C.cyan})` }} />
                <text x="60" y="56" textAnchor="middle" fill={C.fg} fontSize="14" fontFamily="Space Grotesk, sans-serif" fontWeight="700">87.4%</text>
                <text x="60" y="66" textAnchor="middle" fill={C.muted} fontSize="6" fontFamily="Inter">Transit Detected</text>
              </svg>
            </div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10 }}>
            <div style={{ fontSize: 6.5, color: C.muted, fontFamily: "JetBrains Mono, monospace", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>Model Ensemble</div>
            {[["CNN ResNet-50", "89.1%"], ["Transformer", "85.2%"], ["SVM Baseline", "76.8%"]].map(([m, c]) => (
              <div key={m} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, paddingBottom: 3, marginBottom: 3 }}>
                <span style={{ fontSize: 7, color: C.fg, fontFamily: "JetBrains Mono, monospace" }}>{m}</span>
                <span style={{ fontSize: 7, color: C.cyan, fontFamily: "JetBrains Mono, monospace" }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10 }}>
            <div style={{ fontSize: 9, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg, marginBottom: 10 }}>Probability Distribution</div>
            {probs.map(([label, value, color]) => (
              <div key={label as string} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 8, color: C.fg }}>{label}</span>
                  <span style={{ fontSize: 8, fontFamily: "JetBrains Mono, monospace", color: color as string }}>{value}%</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3 }}>
                  <div style={{ width: `${value}%`, height: "100%", borderRadius: 3, background: color as string, boxShadow: `0 0 5px ${color}60` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10, flex: 1 }}>
            <div style={{ fontSize: 9, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg, marginBottom: 8 }}>AI Reasoning — Explainability</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[["Periodicity Signal", 94, "Strong BLS peak at 5.71 d (FAP < 1e-9)"], ["Transit Shape", 88, "U-shaped profile consistent with planetary disk"], ["Signal Quality", 81, "SNR = 14.7σ above shot noise floor"], ["Centroid Check", 72, "No photocenter shift during transit"], ["Odd-Even Test", 62, "Depth consistent across all 3 events"]].map(([f, s, n]) => (
                <div key={f as string} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 7px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ color: C.green, fontSize: 7 }}>✓</span>
                      <span style={{ fontSize: 7.5, color: C.fg, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>{f}</span>
                    </div>
                    <span style={{ fontSize: 6.5, fontFamily: "JetBrains Mono, monospace", color: (s as number) > 80 ? C.green : C.orange }}>{s}% weight</span>
                  </div>
                  <p style={{ fontSize: 6.5, color: C.muted, fontFamily: "Inter, sans-serif", margin: 0 }}>{n}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HF_Transit() {
  const modelCurve = SMOOTH.map(d => {
    let f = 1.0;
    const centers = [5.4, 16.2, 26.4];
    for (const tc of centers) {
      const dist = Math.abs(d.t - tc);
      if (dist < 1.2) f -= 0.013 * Math.cos((dist / 1.2) * (Math.PI / 2)) ** 2;
    }
    return { t: d.t, f: parseFloat(f.toFixed(5)) };
  });
  const residual = SMOOTH.map((d, i) => ({ t: d.t, f: parseFloat((d.f - modelCurve[i].f).toFixed(6)) }));
  const panels = [
    { title: "Raw Light Curve", data: RAW, color: C.cyan, desc: "Original TESS photometry" },
    { title: "Denoised Curve", data: SMOOTH, color: C.green, desc: "S-G filter applied" },
    { title: "Detected Transit", data: RAW, color: C.orange, desc: "BLS-identified windows", showRef: true },
    { title: "Best-Fit Model", data: modelCurve, color: "#A78BFA", desc: "Mandel-Agol transit model" },
    { title: "Residual Plot", data: residual, color: C.muted, desc: "Observed minus model", isResidual: true, wide: true },
  ];
  return (
    <div style={{ width: "100%", height: "100%", background: C.bg, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <HF_NAV />
      <div style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5, overflow: "hidden" }}>
        <div style={{ fontSize: 11, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg }}>Transit Analysis</div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 5, minHeight: 0 }}>
          {panels.slice(0, 4).map(p => (
            <div key={p.title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "6px 8px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 8, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg }}>{p.title}</div>
                  <div style={{ fontSize: 6, color: C.muted }}>{p.desc}</div>
                </div>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, boxShadow: `0 0 5px ${p.color}`, marginTop: 2 }} />
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <MiniLineChart data={p.data} color={p.color} showRef={(p as any).showRef} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "6px 8px", flexShrink: 0, height: 70 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <div>
              <div style={{ fontSize: 8, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg }}>Residual Plot</div>
              <div style={{ fontSize: 6, color: C.muted }}>Observed minus model flux</div>
            </div>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, marginTop: 2 }} />
          </div>
          <div style={{ height: 36 }}>
            <MiniLineChart data={residual} color={C.muted} isResidual />
          </div>
        </div>
      </div>
    </div>
  );
}

function HF_Parameters() {
  const uid = useId();
  const gradId = `pg-${uid}`;
  const posteriorData = Array.from({ length: 60 }, (_, i) => {
    const x = 5.65 + i * 0.003;
    const g = Math.exp(-((x - 5.7134) ** 2) / (2 * 0.01 ** 2));
    return { t: parseFloat(x.toFixed(3)), f: parseFloat((g + (Math.random() - 0.5) * 0.04).toFixed(4)) };
  });
  const params = [
    { label: "Orbital Period", value: "5.7134", unit: "days", color: C.cyan, conf: 97 },
    { label: "Transit Duration", value: "2.34", unit: "hours", color: C.green, conf: 94 },
    { label: "Transit Depth", value: "1.47", unit: "%", color: C.orange, conf: 99 },
    { label: "Signal-to-Noise", value: "14.7", unit: "σ", color: "#A78BFA", conf: 100 },
    { label: "Confidence Score", value: "87.4", unit: "%", color: C.cyan, conf: 87 },
  ];
  return (
    <div style={{ width: "100%", height: "100%", background: C.bg, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <HF_NAV />
      <div style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6, overflow: "hidden" }}>
        <div style={{ fontSize: 11, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg }}>Parameter Estimation</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, flexShrink: 0 }}>
          {params.map(p => (
            <div key={p.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "8px 10px" }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: `${p.color}14`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: `${p.color}60` }} />
              </div>
              <div style={{ fontSize: 18, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg }}>{p.value}</div>
              <div style={{ fontSize: 7, color: C.muted, marginBottom: 3 }}>{p.unit}</div>
              <div style={{ fontSize: 7.5, color: p.color, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, marginBottom: 4 }}>{p.label}</div>
              <div style={{ height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1 }}>
                <div style={{ width: `${p.conf}%`, height: "100%", background: p.color, borderRadius: 1 }} />
              </div>
              <div style={{ fontSize: 6, color: C.muted, marginTop: 2 }}>{p.conf}% precision</div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, minHeight: 0 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 10px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 9, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg, marginBottom: 2 }}>Period Posterior Distribution</div>
            <div style={{ fontSize: 6.5, color: C.muted, fontFamily: "JetBrains Mono, monospace", marginBottom: 4 }}>P = 5.7134 ± 0.0008 d</div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={posteriorData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                  <XAxis dataKey="t" tick={{ fill: C.muted, fontSize: 5, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 5 }} tickLine={false} axisLine={false} />
                  <ReferenceLine x={5.7134} stroke={C.cyan} strokeDasharray="3 3" />
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.cyan} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={C.cyan} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="f" stroke={C.cyan} fill={`url(#${gradId})`} strokeWidth={1.2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg, marginBottom: 8 }}>Parameter Uncertainties (1σ)</div>
            {[["Period", "±0.0008 d", 2], ["Duration", "±0.082 h", 12], ["Depth", "±0.062%", 15], ["Impact Param", "±0.087", 35], ["Rp/Rs", "±0.0031", 10]].map(([k, v, w]) => (
              <div key={k as string} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <span style={{ fontSize: 6.5, fontFamily: "JetBrains Mono, monospace", color: C.muted, width: 60 }}>{k}</span>
                <span style={{ fontSize: 6.5, fontFamily: "JetBrains Mono, monospace", color: C.orange, width: 50 }}>{v}</span>
                <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                  <div style={{ width: `${w}%`, height: "100%", background: C.orange, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HF_Report() {
  return (
    <div style={{ width: "100%", height: "100%", background: C.bg, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <HF_NAV />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 6, padding: "8px 10px", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, minHeight: 0, overflow: "hidden" }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "8px 10px", flexShrink: 0, boxShadow: `0 0 20px rgba(0,229,255,0.07)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 6.5, color: C.muted, fontFamily: "JetBrains Mono, monospace", marginBottom: 3 }}>EXODETECT MISSION REPORT · REF: EXD-2026-0847</div>
                <div style={{ fontSize: 13, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg, marginBottom: 4 }}>TIC 260647166b — Candidate Exoplanet</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <HFBadge label="Potential Exoplanet" color={C.green} />
                  <HFBadge label="Confidence: 87.4%" color={C.cyan} />
                  <HFBadge label="TESS Sector 27" color={C.muted} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ fontSize: 7.5, padding: "3px 8px", borderRadius: 8, border: `1px solid ${C.border}`, color: C.fg }}>⬇ PDF</span>
                <span style={{ fontSize: 7.5, padding: "3px 8px", borderRadius: 8, background: C.cyan, color: C.bg, fontWeight: 600 }}>⬇ CSV</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
              {[["TIC ID", "TIC 260647166"], ["RA/Dec", "13h 42m / +7°"], ["Stellar Type", "G2V"], ["Stellar Radius", "1.02 R☉"], ["Magnitude", "11.34"], ["Observation", "Sector 27"]].map(([k, v]) => (
                <div key={k} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 5px" }}>
                  <div style={{ fontSize: 5.5, color: C.muted, marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 6.5, fontFamily: "JetBrains Mono, monospace", color: C.fg }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* chart */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "6px 8px", height: 90, flexShrink: 0 }}>
            <div style={{ fontSize: 8, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg, marginBottom: 2 }}>Light Curve Summary</div>
            <div style={{ height: 60 }}>
              <MiniLineChart data={SMOOTH} color={C.green} showRef />
            </div>
          </div>
          {/* prediction */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "6px 8px", flex: 1, minHeight: 0 }}>
            <div style={{ fontSize: 8, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg, marginBottom: 5 }}>AI Prediction Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <div>
                {[["Transit", 87.4, C.cyan], ["Eclipsing Binary", 7.2, C.orange], ["Stellar Blend", 3.1, "#A78BFA"], ["Noise", 2.3, C.muted]].map(([l, v, c]) => (
                  <div key={l as string} style={{ marginBottom: 5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 7, color: C.fg }}>{l}</span>
                      <span style={{ fontSize: 7, fontFamily: "JetBrains Mono, monospace", color: c as string }}>{v}%</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                      <div style={{ width: `${v}%`, height: "100%", background: c as string, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: `rgba(94,243,140,0.06)`, border: `1px solid rgba(94,243,140,0.2)`, borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 6.5, color: C.green, marginBottom: 3 }}>Verdict</div>
                <div style={{ fontSize: 9, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: C.fg, marginBottom: 4 }}>Potential Exoplanet</div>
                <p style={{ fontSize: 6.5, color: C.muted, fontFamily: "Inter, sans-serif", lineHeight: 1.5, margin: 0 }}>
                  High-confidence transit signal with strong periodicity. Recommended for RV follow-up.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5, overflow: "hidden" }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 8 }}>
            <div style={{ fontSize: 7, color: C.muted, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Estimated Parameters</div>
            {[["Orbital Period", "5.7134 ± 0.0008 d", C.cyan], ["Transit Duration", "2.34 ± 0.08 h", C.fg], ["Transit Depth", "1.47 ± 0.06%", C.fg], ["Planet Radius", "~1.41 R⊕", C.green], ["Semi-major Axis", "~0.057 AU", C.fg], ["Eq. Temperature", "~1280 K", C.orange], ["SNR", "14.7 σ", C.green], ["Impact Parameter", "0.341 ± 0.087", C.fg]].map(([k, v, c]) => (
              <div key={k as string} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, paddingBottom: 3, marginBottom: 3 }}>
                <span style={{ fontSize: 6.5, color: C.muted }}>{k}</span>
                <span style={{ fontSize: 6.5, fontFamily: "JetBrains Mono, monospace", color: c as string }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 8, flex: 1 }}>
            <div style={{ fontSize: 7, color: C.muted, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Follow-up Recommendations</div>
            {[["Radial Velocity", "High", "K~1.2 m/s via ESPRESSO"], ["CHEOPS Photometry", "Medium", "Refine params at 20 ppm"], ["AO Imaging", "Low", "Rule out BEB at <1″"]].map(([r, p, n]) => (
              <div key={r as string} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 6px", marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 7, color: C.fg, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>{r}</span>
                  <HFBadge label={p as string} color={p === "High" ? C.green : p === "Medium" ? C.cyan : C.muted} />
                </div>
                <div style={{ fontSize: 6.5, color: C.muted }}>{n}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={{ flex: 1, padding: "6px 0", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.fg, fontSize: 8, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, cursor: "pointer" }}>⬇ PDF</button>
            <button style={{ flex: 1, padding: "6px 0", borderRadius: 10, background: C.cyan, color: C.bg, fontSize: 8, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, cursor: "pointer", border: "none" }}>⬇ CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FRAME WRAPPER ──────────────────────────────────────────────────────────────

// ── LAYOUT PRIMITIVES ─────────────────────────────────────────────────────────

// Frame renders a screen at an explicit display width; canvas is always 640×400
// (or override canvasW/H). Scale is computed automatically — no more tiny previews.
function Frame({
  children, num, title, subtitle, canvasW = 640, canvasH = 400, displayW,
  isWF = false,
}: {
  children: React.ReactNode;
  num: string;
  title: string;
  subtitle?: string;
  canvasW?: number;
  canvasH?: number;
  displayW: number;
  isWF?: boolean;
}) {
  const scale = displayW / canvasW;
  const displayH = Math.round(canvasH * scale);

  const numBg = isWF ? "#e8e8e8" : "rgba(0,229,255,0.12)";
  const numColor = isWF ? "#555" : C.cyan;
  const titleColor = isWF ? "#222" : C.fg;
  const subtitleColor = isWF ? "#888" : C.muted;
  const frameBorder = isWF ? "1.5px solid #d0d0d0" : `1px solid ${C.border}`;
  const frameShadow = isWF
    ? "0 2px 12px rgba(0,0,0,0.08)"
    : `0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.06)`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, width: displayW }}>
      {/* screen chrome bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px",
        background: isWF ? "#f5f5f5" : "#0A1220",
        border: isWF ? "1.5px solid #d0d0d0" : `1px solid ${C.border}`,
        borderBottom: "none",
        borderRadius: "10px 10px 0 0",
      }}>
        {/* traffic lights */}
        <div style={{ display: "flex", gap: 4 }}>
          {[C.red, C.orange, C.green].map((c, i) => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: isWF ? ["#ff6b6b","#ffc94a","#69db7c"][i] : c, opacity: isWF ? 0.6 : 1 }} />
          ))}
        </div>
        {/* screen number */}
        <div style={{ padding: "1px 7px", borderRadius: 4, background: numBg, fontSize: 8, fontFamily: "JetBrains Mono, monospace", color: numColor, fontWeight: 600 }}>{num}</div>
        {/* title */}
        <span style={{ fontSize: 8.5, fontFamily: isWF ? "sans-serif" : "Space Grotesk, sans-serif", color: titleColor, fontWeight: 600, flex: 1 }}>{title}</span>
        {subtitle && <span style={{ fontSize: 7, fontFamily: "JetBrains Mono, monospace", color: subtitleColor }}>{subtitle}</span>}
      </div>
      {/* screen canvas */}
      <div style={{
        width: displayW,
        height: displayH,
        position: "relative",
        overflow: "hidden",
        borderRadius: "0 0 10px 10px",
        border: frameBorder,
        boxShadow: frameShadow,
      }}>
        <div style={{
          width: canvasW,
          height: canvasH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Full-width section separator with label and optional right-side metadata
function SectionDivider({ num, title, desc, dark = true }: { num: string; title: string; desc?: string; dark?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "10px 0", margin: "0 0 16px 0",
      borderBottom: `1px solid ${dark ? C.border : "#ddd"}`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: dark ? "rgba(0,229,255,0.1)" : "#e8e8e8",
        border: `1px solid ${dark ? C.border : "#ccc"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontFamily: "JetBrains Mono, monospace",
        color: dark ? C.cyan : "#555", fontWeight: 700,
      }}>{num}</div>
      <div>
        <div style={{ fontSize: 13, fontFamily: dark ? "Space Grotesk, sans-serif" : "sans-serif", fontWeight: 700, color: dark ? C.fg : "#222", lineHeight: 1 }}>{title}</div>
        {desc && <div style={{ fontSize: 9.5, color: dark ? C.muted : "#888", fontFamily: "Inter, sans-serif", marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flex: 1, height: 1, background: dark ? "linear-gradient(90deg, rgba(0,229,255,0.15), transparent)" : "linear-gradient(90deg, #ddd, transparent)", marginLeft: 4 }} />
    </div>
  );
}

// ── MAIN CASE STUDY ───────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<"hifi" | "wf">("hifi");


  // ── layout constants ──────────────────────────────────────────────────────
  // All widths are computed from a 1280px content column (32px side padding each side).
  // Canvas dims are always 640×400 unless overridden.
  // Scale = displayW / canvasW  →  displayH = canvasH × scale
  const CONTENT = 1280;   // content column
  const PAD     = 32;     // horizontal page padding
  const GAP     = 16;     // gap between frames
  const TOTAL   = CONTENT + PAD * 2;

  // Row 1: 3 columns
  const W3 = Math.floor((CONTENT - GAP * 2) / 3);       // ≈ 416 px
  const H3 = Math.round(400 * (W3 / 640));               // ≈ 260 px

  // Hero: full width
  const WH = CONTENT;                                    // 1280 px
  const HH = Math.round(400 * (WH / 640));               // 800 px

  // Row 2 / 3: 2 columns
  const W2 = Math.floor((CONTENT - GAP) / 2);           // ≈ 632 px
  const H2 = Math.round(400 * (W2 / 640));               // ≈ 395 px

  const isHifi = view === "hifi";

  return (
    <div style={{ background: "#040810", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>

      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER — compact, max 14% of first viewport
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        padding: `24px ${PAD}px 20px`,
        maxWidth: TOTAL, margin: "0 auto",
      }}>
        {/* top bar: logo + nav toggle + status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: `radial-gradient(circle, ${C.cyan}70, ${C.bg})`, boxShadow: `0 0 10px ${C.cyan}60` }} />
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 700, color: C.fg }}>CelestiQ</span>
            <div style={{ width: 1, height: 14, background: C.border, margin: "0 4px" }} />
            <span style={{ fontSize: 10, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>UX Case Study</span>
          </div>

          {/* board toggle */}
          <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, padding: 3 }}>
            {(["hifi", "wf"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "5px 14px", borderRadius: 7,
                background: view === v ? (v === "hifi" ? C.cyan : "#334") : "transparent",
                color: view === v ? (v === "hifi" ? C.bg : C.fg) : C.muted,
                border: "none", fontSize: 10.5,
                fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, cursor: "pointer",
              }}>
                {v === "hifi" ? "Hi-Fi Mockups" : "Wireframes"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.border}`, background: "rgba(94,243,140,0.06)" }}>
            <Dot size={5} color={C.green} />
            <span style={{ fontSize: 9.5, color: C.green, fontFamily: "JetBrains Mono, monospace" }}>HACKATHON 2026 · READY TO PRESENT</span>
          </div>
        </div>

        {/* title row + problem cards in one horizontal band */}
        <div style={{ display: "grid", gridTemplateColumns: "420px 1fr 1fr 1fr", gap: 14, alignItems: "start" }}>
          {/* title block */}
          <div>
            <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 28, fontWeight: 700, color: C.fg, lineHeight: 1.1, marginBottom: 6 }}>
              AI-Powered<br /><span style={{ color: C.cyan }}>Exoplanet Detection</span>
            </h1>
            <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.65, margin: "0 0 12px" }}>
              Full UX design process for an observatory-grade scientific dashboard — TESS light curve analysis, AI classification, and mission reporting.
            </p>
            {/* process flow badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {["Problem", "→", "User Flow", "→", "Wireframes", "→", "Hi-Fi", "→", "Report"].map((s, i) => (
                s === "→"
                  ? <span key={i} style={{ color: C.muted, fontSize: 11, lineHeight: "22px" }}>→</span>
                  : <span key={i} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 5, background: "rgba(0,229,255,0.08)", border: `1px solid ${C.border}`, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>{s}</span>
              ))}
            </div>
          </div>
          {/* 3 problem/solution/goal cards */}
          {[
            { label: "Problem", col: C.red, text: "Astronomers manually sifting thousands of TESS light curves for transit dips — slow and error-prone." },
            { label: "Solution", col: C.cyan, text: "BLS + CNN + Transformer ensemble pipeline: raw FITS in, vetted candidates with confidence scores out." },
            { label: "Design Goal", col: C.green, text: "Software that feels native to a scientific observatory — not a generic analytics dashboard." },
          ].map(b => (
            <div key={b.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace", color: b.col, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <Dot size={4} color={b.col} />{b.label}
              </div>
              <p style={{ fontSize: 10.5, color: C.muted, fontFamily: "Inter, sans-serif", lineHeight: 1.6, margin: 0 }}>{b.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN BOARD
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{
        maxWidth: TOTAL, margin: "0 auto",
        padding: `28px ${PAD}px 48px`,
        background: isHifi ? "#040B16" : "#f2f3f5",
      }}>

        {isHifi ? (
          /* ── HI-FI BOARD ───────────────────────────────────────────────── */
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* ── Section A: Discovery & Input ── */}
            <div>
              <SectionDivider num="A" title="Discovery & Input" desc="Landing experience, dataset ingestion, and pipeline initialisation" />
              <div style={{ display: "grid", gridTemplateColumns: `${W3}px ${W3}px ${W3}px`, gap: GAP }}>
                <Frame num="01" title="Landing Page" subtitle="Hero · Pipeline overview" displayW={W3}>
                  <HF_Landing />
                </Frame>
                <Frame num="02" title="Dataset Upload" subtitle="FITS / CSV ingest" displayW={W3}>
                  <HF_Upload />
                </Frame>
                <Frame num="03" title="Pipeline Processing" subtitle="5-step AI workflow" displayW={W3}>
                  <HF_Processing />
                </Frame>
              </div>
            </div>

            {/* ── Section B: Hero Dashboard ── */}
            <div>
              <SectionDivider num="B" title="Observatory Dashboard" desc="Hero screen — the primary scientific interface. Light curve visualization is the focal point." />
              <Frame num="04" title="Observatory Dashboard" subtitle="Hero Screen · Light Curve · Candidate Panel · AI Explainability" displayW={WH} canvasW={640} canvasH={400}>
                <HF_Dashboard />
              </Frame>
            </div>

            {/* ── Section C: AI Analysis Pipeline ── */}
            <div>
              <SectionDivider num="C" title="AI Analysis Pipeline" desc="Classification ensemble, confidence scoring, and multi-panel transit decomposition" />
              <div style={{ display: "grid", gridTemplateColumns: `${W2}px ${W2}px`, gap: GAP }}>
                <Frame num="05" title="AI Classification" subtitle="CNN + Transformer · Explainability" displayW={W2}>
                  <HF_Classification />
                </Frame>
                <Frame num="06" title="Transit Analysis" subtitle="5-panel photometric decomposition" displayW={W2}>
                  <HF_Transit />
                </Frame>
              </div>
            </div>

            {/* ── Section D: Results & Report ── */}
            <div>
              <SectionDivider num="D" title="Results & Mission Report" desc="MCMC parameter estimation and auto-generated scientific mission report with export" />
              <div style={{ display: "grid", gridTemplateColumns: `${W2}px ${W2}px`, gap: GAP }}>
                <Frame num="07" title="Parameter Estimation" subtitle="MCMC posterior · Orbital parameters" displayW={W2}>
                  <HF_Parameters />
                </Frame>
                <Frame num="08" title="Mission Report" subtitle="Auto-generated · PDF / CSV export" displayW={W2}>
                  <HF_Report />
                </Frame>
              </div>
            </div>

            {/* ── Design System (compact horizontal) ── */}
            <div>
              <SectionDivider num="DS" title="Design System" desc="Tokens, typography, and component rules" />
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 24px", display: "grid", gridTemplateColumns: "auto 1px auto 1px auto 1px auto", gap: "0 24px", alignItems: "start" }}>

                {/* Palette */}
                <div>
                  <div style={{ fontSize: 9, color: C.muted, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Colour Palette</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      [C.bg, "BG", "#050816"],
                      [C.card, "Card", "#121B33"],
                      [C.secondary, "Secondary", "#0D1326"],
                      [C.cyan, "Cyan", "#00E5FF"],
                      [C.green, "Green", "#5EF38C"],
                      [C.orange, "Orange", "#FFB547"],
                      [C.red, "Error", "#FF4D6A"],
                    ].map(([col, name, hex]) => (
                      <div key={hex as string} style={{ textAlign: "center" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: col as string, border: `1px solid ${C.border}`, marginBottom: 4 }} />
                        <div style={{ fontSize: 8.5, color: C.fg, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>{name}</div>
                        <div style={{ fontSize: 7.5, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>{hex}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* divider */}
                <div style={{ background: C.border, height: "100%" }} />

                {/* Typography */}
                <div>
                  <div style={{ fontSize: 9, color: C.muted, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Typography</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { font: "Space Grotesk", role: "Headings", weight: "700", sample: "Aa" },
                      { font: "Inter", role: "Body text", weight: "400 / 500", sample: "Aa" },
                      { font: "JetBrains Mono", role: "Data & labels", weight: "400", sample: "01" },
                    ].map(t => (
                      <div key={t.font} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontFamily: t.font + ", sans-serif", color: C.fg, fontWeight: t.font === "Space Grotesk" ? 700 : 400 }}>{t.sample}</div>
                        <div>
                          <div style={{ fontSize: 10, fontFamily: t.font + ", sans-serif", color: C.fg, fontWeight: t.font === "Space Grotesk" ? 700 : 400 }}>{t.font}</div>
                          <div style={{ fontSize: 8.5, color: C.muted }}>{t.role} · {t.weight}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* divider */}
                <div style={{ background: C.border, height: "100%" }} />

                {/* Spacing & Radius */}
                <div>
                  <div style={{ fontSize: 9, color: C.muted, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Spacing & Radius</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    {[4, 8, 12, 16, 24, 32].map(s => (
                      <div key={s} style={{ textAlign: "center" }}>
                        <div style={{ width: s, height: s, background: `${C.cyan}40`, borderRadius: 2, margin: "0 auto 3px" }} />
                        <div style={{ fontSize: 7.5, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>{s}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[4, 8, 12, 16].map(r => (
                      <div key={r} style={{ textAlign: "center" }}>
                        <div style={{ width: 28, height: 20, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: r, margin: "0 auto 3px" }} />
                        <div style={{ fontSize: 7.5, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>r{r}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* divider */}
                <div style={{ background: C.border, height: "100%" }} />

                {/* Component rules */}
                <div>
                  <div style={{ fontSize: 9, color: C.muted, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Component Rules</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      ["Cards", "16px radius · glassmorphism border · no heavy drop-shadows"],
                      ["Badges", "Pill shape · colour-coded · dot indicator"],
                      ["Charts", "Recharts · custom dark tooltip · subtle grid"],
                      ["Glows", "Accent elements only · drop-shadow at 30% opacity"],
                      ["Motion", "Subtle transitions · 200ms ease · no decorative animation"],
                    ].map(([k, v]) => (
                      <div key={k as string} style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 9, color: C.cyan, fontFamily: "JetBrains Mono, monospace", width: 60, flexShrink: 0 }}>{k}</span>
                        <span style={{ fontSize: 9, color: C.muted }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        ) : (
          /* ── WIREFRAME BOARD ───────────────────────────────────────────── */
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* legend */}
            <div style={{ display: "flex", gap: 16, padding: "10px 16px", background: "#fff", borderRadius: 10, border: "1px solid #ddd", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "#888", fontFamily: "monospace", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1 }}>Wireframe Conventions:</span>
              {[["Gray box", "UI component"], ["Dashed border", "Viz placeholder"], ["Light fill", "Content area"], ["Dark fill", "Primary CTA"]].map(([n, d]) => (
                <div key={n} style={{ fontSize: 9, color: "#888" }}><strong style={{ color: "#555" }}>{n}</strong> — {d}</div>
              ))}
            </div>

            <div>
              <SectionDivider num="A" title="Discovery & Input" desc="Landing · Upload · Processing" dark={false} />
              <div style={{ display: "grid", gridTemplateColumns: `${W3}px ${W3}px ${W3}px`, gap: GAP }}>
                <Frame num="01" title="Landing Page" subtitle="Hero · Pipeline" displayW={W3} isWF><WF_Landing /></Frame>
                <Frame num="02" title="Dataset Upload" subtitle="Drag & Drop · Progress" displayW={W3} isWF><WF_Upload /></Frame>
                <Frame num="03" title="Processing" subtitle="Pipeline steps · Log" displayW={W3} isWF><WF_Processing /></Frame>
              </div>
            </div>

            <div>
              <SectionDivider num="B" title="Observatory Dashboard" desc="Hero Screen — light curve as primary focal point" dark={false} />
              <Frame num="04" title="Observatory Dashboard" subtitle="KPIs · Light Curve · Candidate Panel · Timeline" displayW={WH} canvasW={640} canvasH={400} isWF>
                <WF_Dashboard />
              </Frame>
            </div>

            <div>
              <SectionDivider num="C" title="AI Analysis Pipeline" dark={false} desc="Classification · Transit decomposition" />
              <div style={{ display: "grid", gridTemplateColumns: `${W2}px ${W2}px`, gap: GAP }}>
                <Frame num="05" title="AI Classification" subtitle="Gauge · Probabilities · Explainability" displayW={W2} isWF><WF_Classification /></Frame>
                <Frame num="06" title="Transit Analysis" subtitle="5-panel decomposition" displayW={W2} isWF><WF_Transit /></Frame>
              </div>
            </div>

            <div>
              <SectionDivider num="D" title="Results & Mission Report" dark={false} desc="Parameters · Scientific report export" />
              <div style={{ display: "grid", gridTemplateColumns: `${W2}px ${W2}px`, gap: GAP }}>
                <Frame num="07" title="Parameter Estimation" subtitle="MCMC · Uncertainties" displayW={W2} isWF><WF_Parameters /></Frame>
                <Frame num="08" title="Mission Report" subtitle="Summary · Export" displayW={W2} isWF><WF_Report /></Frame>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        background: C.bg, borderTop: `1px solid ${C.border}`,
        padding: "14px 32px",
        maxWidth: TOTAL, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: `radial-gradient(circle, ${C.cyan}70, ${C.bg})`, boxShadow: `0 0 6px ${C.cyan}` }} />
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, color: C.fg }}>CelestiQ</span>
        </div>
        <span style={{ fontSize: 9, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>AI Exoplanet Detection System · UX Case Study · Hackathon 2026</span>
        <div style={{ display: "flex", gap: 12 }}>
          {["Behance", "PowerPoint", "PDF"].map(e => (
            <span key={e} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 5, border: `1px solid ${C.border}`, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>{e} ↗</span>
          ))}
        </div>
      </div>
    </div>
  );
}
