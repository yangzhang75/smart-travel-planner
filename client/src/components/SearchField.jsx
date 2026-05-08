import { forwardRef } from "react";

// ───── Calendar helpers ─────
export function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export function fmtDateRange(start, end) {
  if (start && end) return `${fmtDate(start)} \u2013 ${fmtDate(end)}`;
  if (start) return `${fmtDate(start)} \u2192 \u2026`;
  return "";
}
export function fmtBudget(n) {
  if (n === "" || n == null) return "";
  const num = Number(n);
  if (Number.isNaN(num) || num <= 0) return "";
  return "$" + num.toLocaleString("en-US");
}
export function todayDate() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
export function isoFromDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
export function shiftMonth(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }

// ───── Month Component ─────
export function MonthView({ monthDate, start, end, onPick }) {
  const year = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const monthName = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const today = todayDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ empty: true, key: "e" + i });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const cellDate = new Date(year, m, d);
    const past = cellDate < today;
    const isStart = iso === start;
    const isEnd = iso === end;
    const inRange = start && end && iso > start && iso < end;
    cells.push({ d, iso, past, isStart, isEnd, inRange, key: iso });
  }
  return (
    <div className="month">
      <div className="monthName">{monthName}</div>
      <div className="dayHeads">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="dayGrid">
        {cells.map((c) => {
          if (c.empty) return <span key={c.key} className="dayCell empty"></span>;
          let cls = "dayCell";
          if (c.isStart || c.isEnd) cls += " selected";
          if (c.isStart) cls += " start";
          if (c.isEnd) cls += " end";
          if (c.inRange) cls += " inRange";
          return <button key={c.key} className={cls} disabled={c.past} onClick={() => onPick(c.iso)}>{c.d}</button>;
        })}
      </div>
    </div>
  );
}

// ───── Search Field (forwardRef for highlight measurement) ─────
const SearchField = forwardRef(function SearchField(
  { label, value, placeholder, isOpen, onOpen, popoverClass, children },
  ref
) {
  const hasValue = !!value;
  return (
    <div
      ref={ref}
      className={`searchField ${isOpen ? "is-open" : ""} ${hasValue ? "has-value" : ""}`}
      tabIndex="0"
      onClick={(e) => { e.stopPropagation(); onOpen(); }}
    >
      <div className="label">{label}</div>
      <div className="value">{hasValue ? value : placeholder}</div>
      {isOpen && (
        <div className={`popover ${popoverClass || ""}`} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  );
});

export default SearchField;
