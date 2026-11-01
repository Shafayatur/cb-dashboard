"use client";
import D from "@/data/data.json";
import { useHub } from "@/components/Shell";
import { C, Lab, Foot, Key, Stack } from "@/components/kit";
const H = D.hub_summary;
const side = (id, s) => D.holds_w2.find(r => r.hub_id === id && r.side === s).holds;
const holds = H.map(h => { const a = side(h.hub_id, "Agent-side"), c = side(h.hub_id, "Customer-side"), t = a + c, p = Math.round((a / t) * 100);
  return { id: h.hub_id, hub: true, label: `${h.hub_id} ${h.hub_name}`, tot: t, a, parts: [{ v: a, c: C.red }, { v: c, c: C.mid, t: C.ink }], end: `${p}% agent-side`, ec: p > 50 ? C.red : null }; }).sort((a, b) => b.tot - a.tot);
const reasons = [...D.h03_hold_reasons].sort((a, b) => b.holds - a.holds).map(r => ({ id: r.hold_reason, label: r.hold_reason, parts: [{ v: r.holds, c: r.side === "Agent-side" ? C.red : C.mid, t: r.side === "Agent-side" ? C.bg : C.ink }] }));
const outcomes = H.map(h => ({ id: h.hub_id, hub: true, label: h.hub_id, parts: ["Delivered", "Returned", "Still on hold"].map((o, i) => ({ v: D.held_outcomes.find(r => r.hub_id === h.hub_id && r.outcome === o).share_pct, c: [C.mid, C.ink, C.bg][i], t: i === 0 || i === 2 ? C.ink : C.bg, ...(i === 2 ? { stroke: C.mid } : {}) })) }));
const ret = D.return_ratio_w2.map(r => ({ id: r.hub_id, hub: true, label: r.hub_id, parts: [{ v: r.return_ratio_pct, c: r.hub_id === "H05" ? C.red : C.mid, t: r.hub_id === "H05" ? C.bg : C.ink }], end: r.return_ratio_pct + "%", ec: r.hub_id === "H05" ? C.red : null }));
export default function Page() {
  const { hub, setHub } = useHub();
  const pick = id => setHub(h => (h === id ? "All" : id));
  const top = holds[0];
  const agents = D.high_return_agents.filter(a => hub === "All" || a.hub_id === hub);
  return (
    <>
      <h1>Riverside is busy because it keeps re-trying orders.</h1>
      <div className="layout">
        <div className="hero">
          <div>
            <Lab>Hold events by hub, week 2</Lab>
            <Key items={[["Agent-side", C.red], ["Customer-side", C.mid]]} />
            <Stack rows={holds} max={top.tot} row={46} lw={130} rw={110} sel={hub} pick={pick} />
            <p className="ann">Riverside: {Math.round((top.a / top.tot) * 100)}% of holds are agent-side ({top.a} of {top.tot}).</p>
          </div>
          <div>
            <Lab>Why Riverside (H03) holds orders</Lab>
            <Stack rows={reasons} max={reasons[0].parts[0].v} row={40} lw={150} rw={20} />
          </div>
        </div>
        <aside className="rail">
          <div><Lab>What happens to held orders, %</Lab>
            <Key items={[["Delivered", C.mid], ["Returned", C.ink], ["Still on hold", C.bg, C.mid]]} />
            <Stack rows={outcomes} max={100} row={28} lw={34} rw={4} fmt={v => Math.round(v)} sel={hub} pick={pick} /></div>
          <div><Lab>Return ratio, week 2</Lab><Stack rows={ret} max={12} row={26} lw={34} rw={50} sel={hub} pick={pick} /></div>
          <div><Lab>High-return agents</Lab>
            {agents.length ? agents.map(a => <div key={a.agent_id} className="led"><i className="sq" style={{ background: C.red }} /><b>{a.hub_id}</b><span>{a.agent_name} ({a.salary_type})</span><em>{Number(a.return_ratio_pct).toFixed(1) + "%"}</em></div>) : <div className="cap">None in this hub</div>}</div>
        </aside>
      </div>
      <Foot>Hold event = an attempt that ended in a hold; one order can be held more than once. Agent-side = Late Dispatch, Not Attempted, Agent Time Shortage. Return ratio = returns / attempts. Outcomes = what finally happened to orders that were held at least once.</Foot>
    </>
  );
}
