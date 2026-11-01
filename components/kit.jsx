"use client";
import { useRef, useState, useEffect } from "react";
export const C = { bg: "#FFFFFF", ink: "#16233A", mut: "#5F6B7A", line: "#D9DDE3", dim: "#D3D8DF", mid: "#B4BCC7", red: "#B3261E", blue: "#2B6CB0" };
export const sx = (a, b, c, d) => v => c + ((v - a) / (b - a)) * (d - c);
export const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
export const num = v => Number(v).toLocaleString("en-US");
export const dimmed = (sel, id) => (sel && sel !== "All" && sel !== id ? 0.3 : 1);
export const T = ({ c = C.mut, s, b, ...p }) => <text fill={c} style={{ fontSize: s, fontWeight: b ? 600 : undefined }} {...p} />;
export const Lab = ({ children }) => <div className="lab">{children}</div>;
export const Kpi = ({ n, l, r }) => <div><div className={"n" + (r ? " r" : "")}>{n}</div><div className="kl">{l}</div></div>;
export const Foot = ({ children }) => <p className="foot">{children}</p>;
export const Key = ({ items }) => <div className="key">{items.map(([l, c, stroke]) => <span key={l}><i style={{ background: c, border: stroke ? `1px solid ${stroke}` : undefined }} />{l}</span>)}</div>;
export function Svg({ h, children }) {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => { const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width))); ro.observe(ref.current); return () => ro.disconnect(); }, []);
  return <div ref={ref}>{w > 0 && <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>{children(w)}</svg>}</div>;
}
// pushes labels apart so they never overlap
export function spread(v, gap = 14) {
  const o = v.map((y, i) => [y, i]).sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < o.length; i++) if (o[i][0] - o[i - 1][0] < gap) o[i][0] = o[i - 1][0] + gap;
  const r = []; o.forEach(([y, i]) => (r[i] = y)); return r;
}
// horizontal (stacked) bars. rows: {id,label,parts:[{v,c,t}],end,ec,hub}
export function Stack({ rows, max, row = 34, lw = 130, rw = 70, fmt = v => v, sel, pick }) {
  return (
    <Svg h={rows.length * row}>{w => {
      const leftWidth = w < 480 ? Math.min(lw, w * 0.3) : lw;
      const rightWidth = w < 480 ? Math.min(rw, w * 0.2) : rw;
      const x = sx(0, max, 0, w - leftWidth - rightWidth);
      return rows.map((r, i) => {
        let o = 0; const y = i * row, m = y + row / 2;
        return (
          <g key={r.id} role={r.hub && pick ? "button" : undefined} tabIndex={r.hub && pick ? 0 : undefined} aria-label={r.hub && pick ? r.id : undefined} opacity={r.hub ? dimmed(sel, r.id) : 1} onClick={() => r.hub && pick && pick(r.id)} onKeyDown={e => { if (r.hub && pick && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(r.id); } }} style={{ cursor: r.hub ? "pointer" : "default" }}>
            <T x={0} y={m + 4} c={C.ink}>{r.label}</T>
            {r.parts.map((p, j) => { const x0 = leftWidth + x(o), wd = x(p.v); o += p.v;
              return <g key={j}><rect x={x0} y={y + 5} width={wd} height={row - 10} fill={p.c} stroke={p.stroke} strokeWidth={p.stroke ? 1 : undefined} />{wd > 24 && <T x={x0 + wd / 2} y={m + 4} textAnchor="middle" c={p.t || C.bg}>{fmt(p.v)}</T>}</g>; })}
            {r.end && <T x={leftWidth + x(o) + 8} y={m + 4} c={r.ec || C.mut} b={!!r.ec}>{r.end}</T>}
          </g>);
      });
    }}</Svg>
  );
}
