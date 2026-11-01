"use client";
import D from "@/data/data.json";
import { useHub } from "@/components/Shell";
import { C, sx, T, Lab, Kpi, Foot, Svg, num, dimmed } from "@/components/kit";
const REQUESTED = 8, HIRES = 2; // from the brief, not in the workbook
const rows = [...D.hub_summary].sort((a, b) => b.w2_util_pct - a.w2_util_pct);

function Dumbbell({ sel, pick }) {
  const RH = 56, top = 34, H = rows.length * RH;
  return (
    <Svg h={H + top + 24}>{w => {
      const x = sx(40, 105, 150, w - 60);
      return (<>
        <rect x={x(85)} y={top} width={x(105) - x(85)} height={H} fill={C.red} opacity=".09" />
        <rect x={x(40)} y={top} width={x(75) - x(40)} height={H} fill={C.blue} opacity=".09" />
        <T x={x(75) - 6} y={top - 10} textAnchor="end" c={C.blue}>CAN LEND (UNDER 75%)</T>
        <T x={x(85) + 6} y={top - 10} c={C.red}>ABOVE TARGET</T>
        {[50, 60, 70, 80, 90, 100].map(t => <g key={t}><line x1={x(t)} x2={x(t)} y1={top} y2={top + H} stroke={C.line} /><T x={x(t)} y={top + H + 16} textAnchor="middle">{t}</T></g>)}
        <line x1={x(85)} x2={x(85)} y1={top} y2={top + H} stroke={C.ink} strokeDasharray="4 3" />
        {rows.map((r, i) => {
          const y = top + i * RH + RH / 2, c = r.status === "Above target" ? C.red : r.w2_util_pct < 75 ? C.blue : C.ink;
          return (
            <g key={r.hub_id} role="button" tabIndex={0} aria-label={r.hub_id} opacity={dimmed(sel, r.hub_id)} onClick={() => pick(r.hub_id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(r.hub_id); } }} style={{ cursor: "pointer" }}>
              <T x={0} y={y + 4} c={C.ink} s={13}>{r.hub_id} {r.hub_name}</T>
              <line x1={x(r.w1_util_pct)} x2={x(r.w2_util_pct)} y1={y} y2={y} stroke={c} strokeWidth={3} />
              <circle cx={x(r.w1_util_pct)} cy={y} r={5} fill={C.bg} stroke={C.mut} strokeWidth={1.5} />
              <T x={x(r.w1_util_pct)} y={y - 12} textAnchor="middle">{r.w1_util_pct}</T>
              <circle cx={x(r.w2_util_pct)} cy={y} r={8} fill={c} />
              <T x={x(r.w2_util_pct) + 14} y={y + 4} c={c} s={13} b>{r.w2_util_pct}%</T>
              {i === 0 && <T x={x(r.w2_util_pct)} y={y + 26} textAnchor="end" c={C.red}>busiest hub, {r.peak_gap_agents} agents short at peak</T>}
            </g>);
        })}
      </>);
    }}</Svg>
  );
}

export default function Page() {
  const { hub, setHub } = useHub();
  const pick = id => setHub(h => (h === id ? "All" : id));
  const above = rows.filter(r => r.status === "Above target").length;
  const spend = D.budget.filter(b => b.type === "Spend").reduce((s, b) => s + b.amount_bdt, 0);
  return (
    <>
      <h1>Three hubs exceed 85%: the plan hires for one and fixes the other two.</h1>
      <div className="layout">
        <div className="hero">
          <Lab>Utilisation, week 1 (hollow) to week 2 (filled). Click a hub to focus.</Lab>
          <Dumbbell sel={hub} pick={pick} />
        </div>
        <aside className="rail">
          <div className="kpis">
            <Kpi n={`${above}/${rows.length}`} l="hubs above target" r />
            <Kpi n={REQUESTED} l="agents requested" />
            <Kpi n={HIRES} l="hires recommended (H04)" />
            <Kpi n={num(spend)} l="BDT spend of 70,000" />
          </div>
          <div>
            <Lab>Decision per hub. Red = short, blue = spare</Lab>
            {D.hub_summary.map(r => (
              <div key={r.hub_id} className="led" style={{ opacity: dimmed(hub, r.hub_id) }}>
                <i className="sq" style={{ background: r.peak_gap_agents > 0 ? C.red : r.peak_gap_agents < 0 ? C.blue : C.dim }} />
                <b>{r.hub_id}</b><span>{r.decision}</span><em>{r.decision_cost_bdt ? num(r.decision_cost_bdt) : "-"}</em>
              </div>))}
          </div>
        </aside>
      </div>
      <Foot>Utilisation = attempts / (agents x 7 x 40). Target 85%. Hubs under 75% can lend agents inside their cluster. Decision cost in BDT. Week 1 = 13-19 Oct, week 2 = 20-26 Oct 2026.</Foot>
    </>
  );
}
