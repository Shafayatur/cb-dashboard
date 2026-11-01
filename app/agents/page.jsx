"use client";
import { useState, Fragment } from "react";
import D from "@/data/data.json";
import { useHub } from "@/components/Shell";
import { C, sx, T, Lab, Kpi, Foot, Key, Svg, spread, fmtDate, dimmed } from "@/components/kit";
const SF = D.staffing_forecast;
const WEEKS = [...new Set(SF.map(r => r.week_start))];
const G = Object.fromEntries(SF.map(r => [r.hub_id + r.week_start, r.staffing_gap]));
const short = (rows, w) => rows.filter(r => r.week_start === w).reduce((s, r) => s + Math.max(r.staffing_gap, 0), 0); // CASE WHEN gap>0 THEN gap ELSE 0
const PEAK = WEEKS.reduce((b, w) => (short(SF, w) > short(SF, b) ? w : b), WEEKS[0]);
const cell = g => g > 0 ? { background: `rgba(179,38,30,${Math.min(0.15 + 0.3 * g, 0.9)})`, color: g >= 2 ? "#fff" : C.ink } : g < 0 ? { background: `rgba(43,108,176,${Math.min(0.1 + 0.08 * -g, 0.5)})` } : { color: C.mut };
const series = id => WEEKS.map(w => { const f = s => D.util_forecast.find(r => r.hub_id === id && r.week_start === w && r.scenario === s).utilisation_pct; return { n: f("Nothing done"), p: f("With the plan") }; });

function Mini({ h, sel }) {
  const d = series(h.hub_id), l = d[d.length - 1], g = h.peak_gap_agents;
  return (
    <div style={{ opacity: dimmed(sel, h.hub_id) }}>
      <div className="mh"><b>{h.hub_id} {h.hub_name}</b><span style={{ color: g > 0 ? C.red : g < 0 ? C.blue : C.mut }}>{g > 0 ? `+${g} short` : g < 0 ? `${-g} spare` : "balanced"}</span></div>
      <Svg h={118}>{w => {
        const x = i => 6 + (i * (w - 60)) / (d.length - 1), y = sx(40, 105, 110, 8);
        const P = k => d.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v[k])}`).join("");
        const nc = l.n > 85 ? C.red : C.mut, [yn, yp] = spread([y(l.n), y(l.p)], 13);
        return (<>
          <line x1={0} x2={w - 54} y1={y(85)} y2={y(85)} stroke={C.mut} strokeDasharray="3 3" />
          <path d={P("n")} fill="none" stroke={nc} strokeWidth={2} /><path d={P("p")} fill="none" stroke={C.ink} strokeWidth={2} />
          <T x={x(d.length - 1) + 8} y={yn + 4} c={nc}>{l.n}</T>{l.p !== l.n && <T x={x(d.length - 1) + 8} y={yp + 4} c={C.ink}>{l.p}</T>}
        </>);
      }}</Svg>
      <div className="cap">{l.p === l.n ? "no change with plan" : `${fmtDate(WEEKS[WEEKS.length - 1])}: ${l.n}% to ${l.p}% with plan`}</div>
    </div>
  );
}

export default function Page() {
  const { hub } = useHub();
  const [wk, setWk] = useState(PEAK);
  const sf = SF.filter(r => hub === "All" || r.hub_id === hub);
  const coverage = [
    [G["H01" + PEAK], "covered by moving agents from H02 to H01"],
    [G["H03" + PEAK], "covered by the H03 hold programme"],
    [G["H04" + PEAK], "covered by hires at H04"],
  ].filter(([value]) => value > 0).map(([value, description]) => `${value} agents ${description}`);
  return (
    <>
      <h1>Eight were requested; the data supports two hires.</h1>
      <div className="layout">
        <div className="hero">
          <Lab>Forecast utilisation by hub, %, four weeks from 27 Oct</Lab>
          <Key items={[["Nothing done (red if above target)", C.red], ["With the plan", C.ink], ["Target 85%", C.mut]]} />
          <div className="minis">{D.hub_summary.map(h => <Mini key={h.hub_id} h={h} sel={hub} />)}</div>
        </div>
        <aside className="rail">
          <div>
            <Kpi n={short(sf, wk)} l={`agents short, week of ${fmtDate(wk)}, ${hub === "All" ? "all hubs" : hub}`} r />
            <p className="ann">Peak shortage is {short(SF, PEAK)} agents, not the 8 requested.</p>
            <p className="cap">Before the plan: {coverage.length ? coverage.join(", ") : "no peak shortage is covered by these plan components"}.</p>
          </div>
          <div>
            <Lab>Staffing gap, agents. Red = short, blue = spare</Lab>
            <div className="heat" style={{ gridTemplateColumns: `38px repeat(${WEEKS.length},1fr)` }}>
              <span />{WEEKS.map(w => <button key={w} className={w === wk ? "on" : ""} onClick={() => setWk(w)}>{fmtDate(w)}</button>)}
              {D.hub_summary.map(h => (
                <Fragment key={h.hub_id}>
                  <span style={{ textAlign: "left", opacity: dimmed(hub, h.hub_id) }}>{h.hub_id}</span>
                  {WEEKS.map(w => { const g = G[h.hub_id + w]; return <span key={w} style={{ ...cell(g), opacity: dimmed(hub, h.hub_id), outline: w === wk ? `1px solid ${C.ink}` : "none" }}>{g > 0 ? "+" : ""}{g}</span>; })}
                </Fragment>))}
            </div>
            <p className="cap" style={{ marginTop: 10 }}>Click a date to change the week.</p>
          </div>
        </aside>
      </div>
      <Foot>Gap = agents required - agents available. Agents short counts only positive gaps. Plan = 2 agents H02 to H01, 2 hires at H04 (60% speed in week 1), H03 hold programme (50% cut in agent-side holds over 14 days).</Foot>
    </>
  );
}
