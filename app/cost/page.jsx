"use client";
import D from "@/data/data.json";
import { useHub } from "@/components/Shell";
import { C, sx, T, Lab, Foot, Key, Svg, Stack, spread, fmtDate, num } from "@/components/kit";
const H = D.hub_summary;
const cpd = H.map(h => { const f = w => D.cost_per_delivered.find(r => r.hub_id === h.hub_id && r.week === w).cost_per_delivered_bdt; return { id: h.hub_id, name: `${h.hub_id} ${h.hub_name}`, a: f(1), b: f(2) }; });
const comps = ["Agent pay", "Hold cost", "Return cost"], cc = [C.mid, C.red, C.mut], ct = [C.ink, C.bg, C.bg];
const brk = H.map(h => { const v = comps.map(c => D.cost_breakdown_w2.find(r => r.hub_id === h.hub_id && r.component === c).bdt_per_delivered); const t = v.reduce((a, b) => a + b, 0);
  return { id: h.hub_id, hub: true, label: h.hub_id, parts: v.map((x, i) => ({ v: x, c: cc[i], t: ct[i] })), end: t.toFixed(1), ec: null }; });
const budget = D.budget.map(b => ({ id: b.item, label: b.item.startsWith("2 Fixed hires") ? "2 hires (H04)" : b.item.startsWith("Move 2 agents") ? "Move 2: H02 to H01" : b.item.startsWith("H03 hold") ? "H03 programme" : b.item.startsWith("Reserve") ? "Reserve" : b.item, parts: [{ v: b.amount_bdt, c: b.type === "Spend" ? C.ink : C.dim }], end: num(b.amount_bdt) }));

function Slope({ focus, pick }) {
  const h = 400;
  return (
    <Svg h={h}>{w => {
      const narrow = w < 520;
      const x1 = narrow ? 56 : 190, x2 = narrow ? w - 128 : w - 230, y = sx(24, 54, h - 20, 40);
      const ya = spread(cpd.map(r => y(r.a)), 15), yb = spread(cpd.map(r => y(r.b)), 15);
      return (<>
        <T x={x1} y={14} textAnchor="middle">WEEK 1</T><T x={x2} y={14} textAnchor="middle">WEEK 2</T>
        {cpd.map((r, i) => { const f = r.id === focus, c = f ? C.red : C.mut, d = r.b - r.a;
          return (
            <g key={r.id} role="button" tabIndex={0} aria-label={r.id} opacity={f ? 1 : 0.8} onClick={() => pick(r.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(r.id); } }} style={{ cursor: "pointer" }}>
              <line x1={x1} x2={x2} y1={y(r.a)} y2={y(r.b)} stroke={c} strokeWidth={f ? 4 : 1.5} />
              <circle cx={x1} cy={y(r.a)} r={f ? 6 : 3.5} fill={c} /><circle cx={x2} cy={y(r.b)} r={f ? 6 : 3.5} fill={c} />
              <T x={x1 - 14} y={ya[i] + 4} textAnchor="end" c={f ? C.red : C.ink} b={f}>{narrow ? r.a.toFixed(2) : `${r.name}  ${r.a.toFixed(2)}`}</T>
              <T x={x2 + 14} y={yb[i] + 4} c={f ? C.red : C.ink} b={f}>{narrow ? `${r.id} ${r.b.toFixed(2)} (${d > 0 ? "+" : ""}${d.toFixed(1)})` : `${r.b.toFixed(2)}  ${r.id}  (${d > 0 ? "+" : ""}${d.toFixed(1)})`}</T>
            </g>);
        })}
      </>);
    }}</Svg>
  );
}

function Savings({ rows }) {
  const pay = rows.findIndex(r => r.cumulative_savings_bdt >= r.programme_cost_bdt);
  return (
    <Svg h={230}>{w => {
      const bw = (w - 10) / rows.length, y = sx(0, 30000, 196, 28);
      return (<>
        <line x1={0} x2={w} y1={y(15000)} y2={y(15000)} stroke={C.mut} strokeDasharray="4 3" /><T x={0} y={y(15000) - 6}>programme cost 15,000</T>
        {rows.map((r, i) => { const v = r.cumulative_savings_bdt, x0 = i * bw + bw * 0.22, m = x0 + bw * 0.28;
          return (<g key={i}>
            <rect x={x0} y={y(v)} width={bw * 0.56} height={196 - y(v)} fill={i >= pay ? C.ink : C.mid} />
            <T x={m} y={y(v) - 6} textAnchor="middle" c={C.ink}>{num(v)}</T>
            {i === pay && <T x={m} y={y(v) - 22} textAnchor="middle" c={C.ink} b>pays back</T>}
            <T x={m} y={214} textAnchor="middle">Wk {i + 1}, {fmtDate(r.week_start)}</T>
          </g>); })}
      </>);
    }}</Svg>
  );
}

export default function Page() {
  const { hub, setHub } = useHub();
  const pick = id => setHub(h => (h === id ? "All" : id));
  const focus = hub === "All" ? "H03" : hub;
  const s = D.h03_savings, p = s.findIndex(r => r.cumulative_savings_bdt >= r.programme_cost_bdt);
  return (
    <>
      <h1>Riverside costs BDT 46 a delivery; payback comes in week 3.</h1>
      <div className="layout">
        <div className="hero">
          <div><Lab>Cost per delivered order, BDT, week 1 to week 2</Lab><Slope focus={focus} pick={pick} /></div>
          <div><Lab>H03 hold programme: cumulative savings vs cost, BDT</Lab><Savings rows={s} />
            <p className="ann">Week {p + 1}: savings of {num(s[p].cumulative_savings_bdt)} pass the {num(s[p].programme_cost_bdt)} programme cost.</p></div>
        </div>
        <aside className="rail">
          <div><Lab>Week 2 cost per delivered, by component</Lab><Key items={[["Agent pay", C.mid], ["Hold cost", C.red], ["Return cost", C.mut]]} />
            <Stack rows={brk} max={46} row={32} lw={36} rw={44} fmt={v => v.toFixed(1)} sel={hub} pick={pick} /></div>
          <div><Lab>Budget, BDT. Spend 62,800 of 70,000</Lab><Stack rows={budget} max={43800} row={34} lw={120} rw={56} fmt={() => ""} /></div>
        </aside>
      </div>
      <Foot>Cost per delivered = (agent pay + BDT 30 per hold + BDT 55 per return) / deliveries. Savings are forecast, not actuals. Click a hub to highlight it.</Foot>
    </>
  );
}
