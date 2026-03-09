import { useState, useRef, useEffect } from "react";

const COL_ACCENT = ["#c9922a", "#4a9eca", "#e05c3a", "#7ec87e"];

function useIsPortrait() {
  const [portrait, setPortrait] = useState(() => window.innerHeight > window.innerWidth);
  useEffect(() => {
    const check = () => setPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => { window.removeEventListener("resize", check); window.removeEventListener("orientationchange", check); };
  }, []);
  return portrait;
}


  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

// Derive font sizes from actual screen height
function useFontSizes() {
  const { h } = useScreenSize();
  const rowH = (h - 60) / 3; // approx cell height after header/toggle
  return {
    label:  Math.max(8,  Math.round(rowH * 0.10)),
    bigval: Math.max(18, Math.round(rowH * 0.28)),
    biglg:  Math.max(32, Math.round(rowH * 0.48)),
  };
}

const STATS = [
  { id: "maxHp",       label: "Max HP",       col: 0 },
  { id: "longPower",   label: "Long Power",   col: 1 },
  { id: "grapeArmor",  label: "Grape Armor",  col: 2 },
  { id: "grapeMod",    label: "Grape Mod",    col: 3 },
  { id: "fortuneDice", label: "Fortune Dice", col: 0 },
  { id: "medPower",    label: "Med Power",    col: 1 },
  { id: "roundArmor",  label: "Round Armor",  col: 2 },
  { id: "roundMod",    label: "Round Mod",    col: 3 },
  { id: "infamy",      label: "Infamy",       col: 0 },
  { id: "closePower",  label: "Close Power",  col: 1 },
  { id: "chainArmor",  label: "Chain Armor",  col: 2 },
  { id: "chainMod",    label: "Chain Mod",    col: 3 },
];

const initialConfig = Object.fromEntries(STATS.map(s => [s.id, 0]));

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    width: 100%;
    height: 100dvh;
    overflow: hidden;
    background: #0d1117;
  }

  .rt-app {
    width: 100%;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }

  .rt-screen {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .rt-header {
    padding: 8px 14px 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ffffff10;
    flex-shrink: 0;
  }

  .rt-grid {
    flex: 1;
    min-height: 0;
    margin: 5px 10px 6px;
    border-radius: 7px;
    overflow: hidden;
    border: 1px solid #ffffff0e;
    box-shadow: 0 4px 30px #00000045;
  }

  .rt-footer {
    padding: 3px 0 5px;
    text-align: center;
    font-size: 7px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #ffffff15;
    flex-shrink: 0;
    font-family: 'Cinzel', Georgia, serif;
  }

  .rt-toggle {
    padding: 5px 0 3px;
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-shrink: 0;
  }

  .rt-toggle button {
    padding: 3px 12px;
    font-size: 8px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    border-radius: 3px;
    cursor: pointer;
    font-family: 'Cinzel', Georgia, serif;
  }

  .rt-label {
    font-size: clamp(6px, 1.6dvh, 10px);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-family: 'Cinzel', Georgia, serif;
    margin-bottom: 2px;
  }

  .rt-bigval {
    font-size: clamp(13px, 3.8dvh, 28px);
    font-weight: 700;
    font-family: 'Cinzel', Georgia, serif;
    line-height: 1;
  }

  .rt-bigval-lg {
    font-size: clamp(20px, 6.5dvh, 46px);
    font-weight: 700;
    font-family: 'Cinzel', Georgia, serif;
    line-height: 1;
  }

  /* Tablet — larger caps */
  @media (min-height: 600px) {
    .rt-label     { font-size: clamp(12px, 4dvh, 32px) !important; }
    .rt-bigval    { font-size: clamp(30px, 13dvh, 120px) !important; }
    .rt-bigval-lg { font-size: clamp(56px, 22dvh, 220px) !important; }
  }

  /* Large tablet / iPad Pro */
  @media (min-height: 900px) {
    .rt-label     { font-size: clamp(14px, 4dvh, 36px) !important; }
    .rt-bigval    { font-size: clamp(36px, 13dvh, 150px) !important; }
    .rt-bigval-lg { font-size: clamp(70px, 22dvh, 280px) !important; }
    .rt-header    { padding: 14px 20px 12px !important; }
    .rt-grid      { margin: 8px 14px 10px !important; border-radius: 10px !important; }
    .rt-toggle button { padding: 5px 18px; font-size: 11px; }
  }

  @keyframes rt-rotate-hint {
    0%   { transform: rotate(0deg);   opacity: 0.5; }
    40%  { transform: rotate(-90deg); opacity: 1;   }
    60%  { transform: rotate(-90deg); opacity: 1;   }
    100% { transform: rotate(0deg);   opacity: 0.5; }
  }

  @keyframes vanquished-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .rt-vanquished {
    animation: vanquished-pulse 1.4s ease-in-out infinite;
  }
    .rt-header { padding: 3px 12px !important; }
    .rt-grid   { margin: 2px 8px !important; }
    .rt-footer { display: none; }
    .rt-toggle { padding: 2px 0 1px; }
    .rt-toggle button { padding: 2px 10px; font-size: 7px; }
    .rt-label  { font-size: clamp(7px, 2dvh, 11px) !important; margin-bottom: 1px !important; }
    .rt-bigval    { font-size: clamp(16px, 7dvh, 34px) !important; }
    .rt-bigval-lg { font-size: clamp(28px, 11dvh, 56px) !important; }
    .rt-pips   { margin-top: 2px !important; }
    .rt-round-sub { display: none !important; }
  }

  @media (orientation: landscape) and (max-height: 380px) {
    .rt-header { padding: 2px 10px !important; }
    .rt-grid   { margin: 1px 6px !important; }
    .rt-label  { font-size: clamp(6px, 1.8dvh, 9px) !important; }
    .rt-bigval    { font-size: clamp(13px, 6dvh, 26px) !important; }
    .rt-bigval-lg { font-size: clamp(22px, 9.5dvh, 42px) !important; }
  }
`;

function Label({ children, color = "#ffffff35", size }) {
  return <div className="rt-label" style={{ color, ...(size ? { fontSize: size } : {}) }}>{children}</div>;
}

function useTapSplit({ value, min, max, onChange }) {
  const [flash, setFlash] = useState(null);
  const touchStartX = useRef(null);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = Math.abs(touchStartX.current - e.changedTouches[0].clientX);
    if (diff > 10) { touchStartX.current = null; return; }
    touchStartX.current = null;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.changedTouches[0].clientX - rect.left;
    const right = x > rect.width / 2;
    if (right && value < max)       { onChange(value + 1); setFlash("inc"); }
    else if (!right && value > min) { onChange(value - 1); setFlash("dec"); }
    else setFlash("block");
    setTimeout(() => setFlash(null), 180);
  };

  const onClick = (e) => {
    if ('ontouchstart' in window) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const right = x > rect.width / 2;
    if (right && value < max)       { onChange(value + 1); setFlash("inc"); }
    else if (!right && value > min) { onChange(value - 1); setFlash("dec"); }
    else setFlash("block");
    setTimeout(() => setFlash(null), 180);
  };

  const bg = flash === "inc" ? "#ffffff18" : flash === "dec" ? "#ffffff0e" : flash === "block" ? "#ff000012" : "transparent";
  return { onTouchStart, onTouchEnd, onClick, bg };
}

// ── Config screen ──────────────────────────────────────────────

function ConfigCell({ stat, value, onChange, fs = {} }) {
  const accent = COL_ACCENT[stat.col];
  const { onTouchStart, onTouchEnd, onClick, bg } = useTapSplit({ value, min: 0, max: 99, onChange });
  return (
    <div onClick={onClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", userSelect: "none", background: bg, transition: "background 0.18s", borderRight: "1px solid #ffffff0d", borderBottom: "1px solid #ffffff0d", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 14, color: "#ffffff20", fontFamily: "serif" }}>−</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6, fontSize: 14, color: `${accent}55`, fontFamily: "serif" }}>+</div>
      </div>
      <div style={{ fontSize: Math.min(fs.label ?? 10, 13), letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Cinzel',Georgia,serif", marginBottom: 2, color: accent, whiteSpace: "nowrap" }}>{stat.label}</div>
      <div style={{ fontSize: fs.bigval ?? "clamp(13px,3.8dvh,28px)", fontWeight: 700, fontFamily: "'Cinzel',Georgia,serif", lineHeight: 1, color: value === 0 ? "#ffffff28" : accent }}>{value}</div>
    </div>
  );
}

function ConfigScreen({ config, setConfig }) {
  const fs = useFontSizes();
  return (
    <div className="rt-screen" style={{ fontFamily: "'Cinzel',Georgia,serif" }}>
      <div className="rt-header">
        <div style={{ fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9922a", fontWeight: 700 }}>Red Tides</div>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#ffffff30" }}>Ship Configuration</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {[["Cannon",1],["Armor",2],["Mods",3]].map(([l,i]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8, color: "#ffffff40", letterSpacing: "0.1em" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: COL_ACCENT[i] }} />{l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "3px 10px 0", flexShrink: 0 }}>
        {["General","Cannon Power","Armor","Modifiers"].map((h,i) => (
          <div key={h} style={{ textAlign: "center", fontSize: 7, letterSpacing: "0.16em", textTransform: "uppercase", color: `${COL_ACCENT[i]}60`, paddingBottom: 3, borderBottom: `1px solid ${COL_ACCENT[i]}25` }}>{h}</div>
        ))}
      </div>

      <div className="rt-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridTemplateRows: "repeat(3,1fr)" }}>
        {STATS.map(stat => (
          <ConfigCell key={stat.id} stat={stat} value={config[stat.id]} onChange={val => setConfig(prev => ({ ...prev, [stat.id]: val }))} fs={fs} />
        ))}
      </div>

      <div className="rt-footer">Tap left · decrease &nbsp;·&nbsp; Tap right · increase</div>
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────

function roundColor(r) { return r >= 9 ? "#e05c3a" : r >= 8 ? "#c9922a" : "#f0e6c8"; }
function roundGlow(r)  { return r >= 9 ? "0 0 16px #e05c3a70" : r >= 8 ? "0 0 16px #c9922a70" : "none"; }
function hpColor(hp, max) {
  if (hp === 0) return "#ff2020";
  if (max === 0) return "#f0e6c8";
  const pct = hp / max;
  if (pct <= 0.15) return "#e05c3a";
  if (pct <= 0.25) return "#c9922a";
  return "#f0e6c8";
}

function AdjustCell({ value, min, max, onChange, label, sub, subVal, accent = "#f0e6c8", hpMode = false, fs = {} }) {
  const { onTouchStart, onTouchEnd, onClick, bg } = useTapSplit({ value, min, max, onChange });
  const valColor = hpMode ? hpColor(value, max) : (value === 0 ? "#ffffff28" : "#f0e6c8");
  return (
    <div onClick={onClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", userSelect: "none", background: bg, transition: "background 0.18s", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: 14, fontSize: 20, color: "#ffffff18", fontFamily: "serif" }}>−</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 14, fontSize: 20, color: `${accent}45`, fontFamily: "serif" }}>+</div>
      </div>
      <Label color={`${accent}90`} size={fs.label}>{label}</Label>
      <div style={{ fontSize: fs.biglg ?? "clamp(20px,6.5dvh,46px)", fontWeight: 700, fontFamily: "'Cinzel',Georgia,serif", lineHeight: 1, color: valColor, transition: "color 0.3s", zIndex: 1 }}>{value}</div>
      {hpMode && value === 0 && (
        <div className="rt-vanquished" style={{ fontSize: fs.label, letterSpacing: "0.28em", textTransform: "uppercase", color: "#ff2020", fontFamily: "'Cinzel',Georgia,serif", fontWeight: 700, marginTop: 4, zIndex: 1, textShadow: "0 0 12px #ff202080" }}>
          Vanquished!
        </div>
      )}
      {sub && value !== 0 && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginTop: 3, zIndex: 1 }}>
          <div style={{ fontSize: fs.label ? fs.label * 0.7 : 8, color: "#ffffff28", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Cinzel',Georgia,serif" }}>{sub}</div>
          <div style={{ fontSize: fs.label ? fs.label * 0.9 : 12, color: "#ffffff38", fontFamily: "'Cinzel',Georgia,serif", fontWeight: 600 }}>{subVal}</div>
        </div>
      )}
    </div>
  );
}

function PairCell({ aLabel, aVal, bLabel, bVal, accent, fs = {} }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      {[[aLabel, aVal],[bLabel, bVal]].map(([lbl, val], i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: i === 0 ? "1px solid #ffffff08" : "none" }}>
          <Label color={`${accent}70`} size={fs.label}>{lbl}</Label>
          <div style={{ fontSize: fs.bigval ?? "clamp(13px,3.8dvh,28px)", fontWeight: 700, fontFamily: "'Cinzel',Georgia,serif", lineHeight: 1, color: val === 0 ? "#ffffff28" : accent }}>{val}</div>
        </div>
      ))}
    </div>
  );
}

function CannonCell({ close, med, long, fs = {} }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Label color="#ffffff28" size={fs.label}>Cannon Power</Label>
      <div style={{ display: "flex", width: "100%" }}>
        {[["C",close,"#7ec87e"],["M",med,"#c9922a"],["L",long,"#e05c3a"]].map(([l,v,clr],i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: i < 2 ? "1px solid #ffffff08" : "none" }}>
            <Label color={`${clr}65`} size={fs.label}>{l}</Label>
            <div style={{ fontSize: fs.bigval ?? "clamp(13px,3.8dvh,28px)", fontWeight: 700, fontFamily: "'Cinzel',Georgia,serif", lineHeight: 1, color: v === 0 ? "#ffffff28" : clr }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoundCell({ round, onChange, fs = {} }) {
  const color = roundColor(round);
  const { onTouchStart, onTouchEnd, onClick, bg } = useTapSplit({ value: round, min: 1, max: 10, onChange });
  return (
    <div onClick={onClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", userSelect: "none", background: bg, transition: "background 0.18s", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: 8, fontSize: 14, color: "#ffffff18", fontFamily: "serif" }}>−</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, fontSize: 14, color: `${color}55`, fontFamily: "serif" }}>+</div>
      </div>
      <Label color={`${color}80`} size={fs.label}>Round</Label>
      <div style={{ fontSize: fs.bigval ?? "clamp(13px,3.8dvh,28px)", fontWeight: 700, fontFamily: "'Cinzel',Georgia,serif", lineHeight: 1, color, textShadow: roundGlow(round), transition: "color 0.3s, text-shadow 0.3s", zIndex: 1 }}>{round}</div>
      <div className="rt-round-sub" style={{ fontSize: fs.label ? fs.label * 0.7 : 7, color: "#ffffff20", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'Cinzel',Georgia,serif", marginTop: 2, zIndex: 1 }}>of 10</div>
      <div className="rt-pips" style={{ display: "flex", gap: 2, marginTop: 4, zIndex: 1 }}>
        {Array.from({ length: 10 }, (_,i) => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: i < round ? (i >= 8 ? "#e05c3a" : i >= 7 ? "#c9922a" : "#f0e6c855") : "#ffffff12", transition: "background 0.2s" }} />
        ))}
      </div>
    </div>
  );
}

function DisplayCell({ label, value, accent = "#f0e6c8", warn, warnLabel, fs = {} }) {
  const color = warn ? "#e05c3a" : value === 0 ? "#ffffff28" : accent;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Label color="#ffffff30" size={fs.label}>{label}</Label>
      <div style={{ fontSize: fs.bigval ?? "clamp(13px,3.8dvh,28px)", fontWeight: 700, fontFamily: "'Cinzel',Georgia,serif", lineHeight: 1, color, transition: "color 0.2s" }}>{value}</div>
      {warn && <div style={{ fontSize: fs.label ? fs.label * 0.8 : 8, color: "#e05c3a", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Cinzel',Georgia,serif", marginTop: 3 }}>{warnLabel}</div>}
    </div>
  );
}

function MainScreen({ config, hp, maneuver, round, onHpChange, onManChange, onRoundChange }) {
  const fs = useFontSizes();
  const maxHp = config.maxHp ?? 0;

  const s = {
    grapeArmor:  config.grapeArmor  ?? 0, grapeMod:    config.grapeMod    ?? 0,
    roundArmor:  config.roundArmor  ?? 0, roundMod:    config.roundMod    ?? 0,
    chainArmor:  config.chainArmor  ?? 0, chainMod:    config.chainMod    ?? 0,
    closePower:  config.closePower  ?? 0, medPower:    config.medPower    ?? 0,
    longPower:   config.longPower   ?? 0, fortuneDice: config.fortuneDice ?? 0,
    infamy:      config.infamy      ?? 0,
  };

  return (
    <div className="rt-screen" style={{ fontFamily: "'Cinzel',Georgia,serif" }}>
      <div className="rt-header">
        <div style={{ fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9922a", fontWeight: 700 }}>Red Tides</div>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#ffffff30" }}>Ship Status</div>
        <div style={{ fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ffffff20" }}>Configure ⟶</div>
      </div>

      <div className="rt-grid" style={{ display: "grid", gridTemplateColumns: "25% 50% 25%", gridTemplateRows: "repeat(3,1fr)" }}>
        <div style={{ border: "1px solid #ffffff0d", display: "flex" }}>
          <PairCell aLabel="Grp Arm" aVal={s.grapeArmor} bLabel="Grp Mod" bVal={s.grapeMod} accent={COL_ACCENT[2]} fs={fs} />
        </div>
        <div style={{ border: "1px solid #ffffff0d" }}>
          <AdjustCell value={hp} min={0} max={maxHp} onChange={onHpChange} label="Hull Points" sub="max" subVal={maxHp} accent="#f0e6c8" hpMode={true} fs={fs} />
        </div>
        <div style={{ border: "1px solid #ffffff0d" }}>
          <RoundCell round={round} onChange={onRoundChange} fs={fs} />
        </div>

        <div style={{ border: "1px solid #ffffff0d", display: "flex" }}>
          <PairCell aLabel="Rnd Arm" aVal={s.roundArmor} bLabel="Rnd Mod" bVal={s.roundMod} accent={COL_ACCENT[1]} fs={fs} />
        </div>
        <div style={{ border: "1px solid #ffffff0d" }}>
          <AdjustCell value={maneuver} min={0} max={99} onChange={onManChange} label="Maneuver" accent="#4a9eca" fs={fs} />
        </div>
        <div style={{ border: "1px solid #ffffff0d" }}>
          <DisplayCell label="Fortune" value={s.fortuneDice} accent={COL_ACCENT[0]} fs={fs} />
        </div>

        <div style={{ border: "1px solid #ffffff0d", display: "flex" }}>
          <PairCell aLabel="Chn Arm" aVal={s.chainArmor} bLabel="Chn Mod" bVal={s.chainMod} accent={COL_ACCENT[3]} fs={fs} />
        </div>
        <div style={{ border: "1px solid #ffffff0d" }}>
          <CannonCell close={s.closePower} med={s.medPower} long={s.longPower} fs={fs} />
        </div>
        <div style={{ border: "1px solid #ffffff0d" }}>
          <DisplayCell label="Infamy" value={s.infamy} warn={s.infamy >= 10} warnLabel="Jealousy!" fs={fs} />
        </div>
      </div>

      <div className="rt-footer">Tap left · decrease &nbsp;·&nbsp; Tap right · increase</div>
    </div>
  );
}

// ── Faction presets ────────────────────────────────────────────

const FACTIONS = [
  {
    id: "pirate",
    name: "Pirate",
    color: "#c9922a",
    description: "Classic Caribbean corsair",
    stats: {
      maxHp: 20, fortuneDice: 2, infamy: 0,
      longPower: 4, medPower: 4, closePower: 4,
      grapeArmor: 0, roundArmor: 0, chainArmor: 0,
      grapeMod: 0, roundMod: 0, chainMod: 0,
    },
    initialManeuver: 6,
  },
  {
    id: "azteca",
    name: "Azteca",
    color: "#e05c3a",
    description: "Warriors of the Flower War",
    stats: {
      maxHp: 15, fortuneDice: 2, infamy: 0,
      longPower: 4, medPower: 4, closePower: 4,
      grapeArmor: 0, roundArmor: 1, chainArmor: 1,
      grapeMod: 0, roundMod: 0, chainMod: 0,
    },
    initialManeuver: 5,
  },
];

function FactionScreen({ onSelect, isDirty, activeFactionId }) {
  const [pendingFaction, setPendingFaction] = useState(null);

  const handleTap = (faction) => {
    if (isDirty && faction.id !== activeFactionId) {
      setPendingFaction(faction);
    } else {
      onSelect(faction);
    }
  };

  return (
    <div className="rt-screen" style={{ fontFamily: "'Cinzel',Georgia,serif", position: "relative" }}>
      <div className="rt-header">
        <div style={{ fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9922a", fontWeight: 700 }}>Red Tides</div>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#ffffff30" }}>Choose Your Faction</div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "12px 16px" }}>
        {FACTIONS.map(faction => {
          const isActive = faction.id === activeFactionId;
          return (
            <div
              key={faction.id}
              onClick={() => handleTap(faction)}
              onTouchEnd={(e) => { e.preventDefault(); handleTap(faction); }}
              style={{
                flex: 1,
                maxWidth: 320,
                height: "100%",
                maxHeight: 280,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                border: `1px solid ${isActive ? faction.color : faction.color + "40"}`,
                borderRadius: 10,
                background: isActive ? `${faction.color}18` : `${faction.color}08`,
                cursor: "pointer",
                userSelect: "none",
                transition: "background 0.2s, border-color 0.2s",
                padding: 20,
                position: "relative",
              }}
            >
              {isActive && (
                <div style={{ position: "absolute", top: 8, right: 10, fontSize: "clamp(6px,1.2dvh,8px)", letterSpacing: "0.18em", textTransform: "uppercase", color: faction.color, fontFamily: "'Cinzel',Georgia,serif" }}>Active</div>
              )}
              <div style={{ fontSize: "clamp(18px, 4dvh, 36px)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: faction.color, fontFamily: "'Cinzel',Georgia,serif" }}>{faction.name}</div>
              <div style={{ width: "60%", height: 1, background: `${faction.color}40` }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 18px", width: "100%" }}>
                {[
                  ["HP", faction.stats.maxHp],
                  ["Maneuver", faction.initialManeuver],
                  ["Fortune", faction.stats.fortuneDice],
                  ["Power C/M/L", `${faction.stats.closePower}/${faction.stats.medPower}/${faction.stats.longPower}`],
                  ...(faction.stats.roundArmor > 0 ? [["Round Armor", faction.stats.roundArmor]] : []),
                  ...(faction.stats.chainArmor > 0 ? [["Chain Armor", faction.stats.chainArmor]] : []),
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <div style={{ fontSize: "clamp(7px, 1.5dvh, 11px)", letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffffff35", fontFamily: "'Cinzel',Georgia,serif", whiteSpace: "nowrap" }}>{label}</div>
                    <div style={{ fontSize: "clamp(9px, 2dvh, 15px)", fontWeight: 700, color: faction.color, fontFamily: "'Cinzel',Georgia,serif" }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "clamp(6px, 1.2dvh, 9px)", letterSpacing: "0.2em", textTransform: "uppercase", color: `${faction.color}50`, fontFamily: "'Cinzel',Georgia,serif", marginTop: 4 }}>
                {isActive ? "Currently Active" : "Tap to Select"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation modal */}
      {pendingFaction && (
        <div style={{
          position: "absolute", inset: 0,
          background: "#0d1117ee",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100,
        }}>
          <div style={{
            background: "#111820",
            border: `1px solid ${pendingFaction.color}50`,
            borderRadius: 10,
            padding: "28px 32px",
            maxWidth: 340,
            width: "80%",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            boxShadow: `0 0 40px ${pendingFaction.color}20`,
          }}>
            <div style={{ fontSize: "clamp(13px,2.5dvh,18px)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: pendingFaction.color, fontFamily: "'Cinzel',Georgia,serif" }}>
              {pendingFaction.name}
            </div>
            <div style={{ fontSize: "clamp(9px,1.8dvh,13px)", color: "#ffffff60", textAlign: "center", letterSpacing: "0.1em", lineHeight: 1.6, fontFamily: "'Cinzel',Georgia,serif" }}>
              You've made changes to your current setup. Selecting a new faction will erase all stats and reset to defaults.
            </div>
            <div style={{ fontSize: "clamp(10px,2dvh,14px)", color: "#ffffff90", letterSpacing: "0.12em", fontFamily: "'Cinzel',Georgia,serif" }}>
              Are you sure?
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button
                onClick={() => { onSelect(pendingFaction); setPendingFaction(null); }}
                style={{
                  background: `${pendingFaction.color}22`,
                  border: `1px solid ${pendingFaction.color}70`,
                  color: pendingFaction.color,
                  padding: "6px 20px", borderRadius: 4, cursor: "pointer",
                  fontSize: "clamp(8px,1.6dvh,11px)", letterSpacing: "0.18em", textTransform: "uppercase",
                  fontFamily: "'Cinzel',Georgia,serif",
                }}>
                Confirm
              </button>
              <button
                onClick={() => setPendingFaction(null)}
                style={{
                  background: "transparent",
                  border: "1px solid #ffffff20",
                  color: "#ffffff40",
                  padding: "6px 20px", borderRadius: 4, cursor: "pointer",
                  fontSize: "clamp(8px,1.6dvh,11px)", letterSpacing: "0.18em", textTransform: "uppercase",
                  fontFamily: "'Cinzel',Georgia,serif",
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── App shell ──────────────────────────────────────────────────

export default function App() {
  const isPortrait = useIsPortrait();
  const [config, setConfig]           = useState(initialConfig);
  const [hp, setHp]                   = useState(initialConfig.maxHp ?? 0);
  const [maneuver, setManeuver]       = useState(0);
  const [round, setRound]             = useState(1);
  const [factionKey, setFactionKey]   = useState(null);
  const [activeFactionId, setActiveFactionId] = useState(null);
  const [isDirty, setIsDirty]         = useState(false);
  const [screen, setScreen]           = useState(2);
  const touchStart = useRef(null);

  const markDirty = (fn) => (...args) => { fn(...args); setIsDirty(true); };

  const handleHpChange     = markDirty(setHp);
  const handleManChange    = markDirty(setManeuver);
  const handleRoundChange  = markDirty(setRound);
  const handleConfigChange = (newConfig) => {
    const maxHp = newConfig.maxHp ?? 0;
    setConfig(newConfig);
    setHp(prev => Math.min(prev, maxHp));
    setIsDirty(true);
  };

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) setScreen(s => Math.min(s + 1, 2)); // swipe left → next
      else          setScreen(s => Math.max(s - 1, 0)); // swipe right → prev
    }
    touchStart.current = null;
  };

  const handleFactionSelect = (faction) => {
    setConfig({ ...faction.stats });
    setHp(faction.stats.maxHp ?? 0);
    setManeuver(faction.initialManeuver ?? 0);
    setRound(1);
    setActiveFactionId(faction.id);
    setFactionKey(faction.id + Date.now());
    setIsDirty(false);
    setScreen(0);
  };

  return (
    <div className="rt-app"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        background: "#0d1117",
        backgroundImage: `radial-gradient(ellipse at 15% 50%, #0d2235 0%, transparent 55%), radial-gradient(ellipse at 85% 50%, #1a0d08 0%, transparent 55%)`,
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {isPortrait && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "#0d1117",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24,
        }}>
          <div style={{ fontSize: 48, lineHeight: 1, animation: "rt-rotate-hint 2s ease-in-out infinite" }}>⟳</div>
          <div style={{ fontFamily: "'Cinzel',Georgia,serif", fontSize: "clamp(14px,4vw,20px)", letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9922a", fontWeight: 700 }}>
            Rotate Device
          </div>
          <div style={{ fontFamily: "'Cinzel',Georgia,serif", fontSize: "clamp(9px,2.5vw,13px)", letterSpacing: "0.14em", color: "#ffffff40", textAlign: "center", maxWidth: 220, lineHeight: 1.7 }}>
            Red Tides requires landscape orientation
          </div>
        </div>
      )}

      <div className="rt-toggle">
        {[["Status", 0], ["Configure", 1], ["Faction", 2]].map(([label, i]) => (
          <button key={i} onClick={() => setScreen(i)} style={{
            background: screen === i ? "#c9922a22" : "transparent",
            border: `1px solid ${screen === i ? "#c9922a60" : "#ffffff18"}`,
            color: screen === i ? "#c9922a" : "#ffffff35",
          }}>{label}</button>
        ))}
      </div>

      {screen === 0 && <MainScreen config={config} hp={hp} maneuver={maneuver} round={round} onHpChange={handleHpChange} onManChange={handleManChange} onRoundChange={handleRoundChange} />}
      {screen === 1 && <ConfigScreen config={config} setConfig={handleConfigChange} />}
      {screen === 2 && <FactionScreen onSelect={handleFactionSelect} isDirty={isDirty} activeFactionId={activeFactionId} />}
    </div>
  );
}
