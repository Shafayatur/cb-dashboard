"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import D from "@/data/data.json";
const Ctx = createContext({ hub: "All", setHub: () => {} });
export const useHub = () => useContext(Ctx);
const PAGES = [["/", "Where do we act?"], ["/holds", "Why are hubs holding orders?"], ["/agents", "Do we have enough agents?"], ["/cost", "What does it cost?"]];
export default function Shell({ children }) {
  const [hub, setHub] = useState("All");
  const path = usePathname();
  return (
    <Ctx.Provider value={{ hub, setHub }}>
      <header className="top">
        <div className="brand">Delivery - On The Go<small>Hub performance report, 13-26 Oct 2026</small></div>
        <nav className="tabs">{PAGES.map(([h, t], i) => <Link key={h} href={h} className={path === h ? "on" : ""}><i>0{i + 1}</i>{t}</Link>)}</nav>
        <div className="chips">{["All", ...D.hub_summary.map(r => r.hub_id)].map(id => (
          <button key={id} className={hub === id ? "on" : ""} title={D.hub_summary.find(r => r.hub_id === id)?.hub_name} onClick={() => setHub(id)}>{id}</button>))}
        </div>
      </header>
      <main>{children}</main>
    </Ctx.Provider>
  );
}
