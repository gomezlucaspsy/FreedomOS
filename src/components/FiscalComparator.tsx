'use client';

import { useMemo, useState } from 'react';
import {
  compareCountries,
  formatMoney,
  formatPct,
  REGIONS,
  type CountryComparison,
  type Region,
} from '../core/CountryFiscalProfile';

// Código ISO en lugar de emoji de bandera: Windows no renderiza banderas emoji.
function IsoTag({ code }: { code: string }) {
  return <span className="iso-tag" aria-hidden="true">{code}</span>;
}

type SortKey = 'net' | 'ppp' | 'rate' | 'col' | 'gdp' | 'unemployment' | 'inflation' | 'hdi';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'net', label: 'Neto anual (USD)' },
  { key: 'ppp', label: 'Poder de compra' },
  { key: 'rate', label: 'Menor tasa efectiva' },
  { key: 'col', label: 'Menor costo de vida' },
  { key: 'gdp', label: 'PIB per cápita' },
  { key: 'unemployment', label: 'Menor desempleo' },
  { key: 'inflation', label: 'Menor inflación' },
  { key: 'hdi', label: 'IDH' },
];

function sortValue(c: CountryComparison, key: SortKey): number {
  switch (key) {
    case 'net': return c.netUSD;
    case 'ppp': return c.netPPP;
    case 'rate': return -c.best.effectiveRate;
    case 'col': return -c.profile.eco.col;
    case 'gdp': return c.profile.eco.gdpPcUSD;
    case 'unemployment': return -c.profile.eco.unemployment;
    case 'inflation': return -c.profile.eco.inflation;
    case 'hdi': return c.profile.eco.hdi;
  }
}

const usd = (v: number) => formatMoney(v, 'USD');

interface Tip { x: number; y: number; c: CountryComparison }

export function FiscalComparator() {
  const [mode, setMode] = useState<'fixed' | 'local'>('fixed');
  const [salary, setSalary] = useState('60000');
  const [useRegimes, setUseRegimes] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('net');
  const [regions, setRegions] = useState<Set<Region>>(new Set(REGIONS));
  const [showTable, setShowTable] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  const grossUSD = mode === 'fixed' ? Math.max(0, Number(salary) || 0) : null;

  const rows = useMemo(() => {
    const all = compareCountries(grossUSD, useRegimes).filter(c => regions.has(c.profile.region));
    return all.sort((a, b) => sortValue(b, sortKey) - sortValue(a, sortKey));
  }, [grossUSD, useRegimes, regions, sortKey]);

  const usePPP = sortKey === 'ppp';
  const maxBar = Math.max(1, ...rows.map(r => (usePPP ? r.netPPP : r.best.gross / r.profile.fx)));

  const bestNet = rows.reduce<CountryComparison | null>((a, c) => (!a || c.netUSD > a.netUSD ? c : a), null);
  const bestPPP = rows.reduce<CountryComparison | null>((a, c) => (!a || c.netPPP > a.netPPP ? c : a), null);
  const lowestRate = rows
    .filter(c => c.best.effectiveRate > 0.001)
    .reduce<CountryComparison | null>((a, c) => (!a || c.best.effectiveRate < a.best.effectiveRate ? c : a), null);
  const noTax = rows.filter(c => c.profile.residency.basis === 'sin IRPF' || c.profile.residency.basis === 'territorial').length;

  const toggleRegion = (r: Region) => {
    setRegions(prev => {
      const next = new Set(prev);
      if (next.has(r) && next.size > 1) next.delete(r); else next.add(r);
      return next;
    });
  };

  return (
    <section className="social-sankey-screen fiscal-compare">
      <div className="social-sankey-head">
        <h2>Comparador Fiscal Internacional</h2>
        <p>
          Cuánto te queda en el bolsillo en {rows.length} países: impuesto a la renta, seguridad social, regímenes
          para recién llegados y costo de vida. Pasa el cursor por una barra para ver el detalle.
        </p>
      </div>

      <div className="fiscal-compare-controls">
        <div className="fiscal-seg-control" role="group" aria-label="Escenario salarial">
          <button type="button" className={mode === 'fixed' ? 'active' : ''} onClick={() => setMode('fixed')}>
            Mismo salario (remoto)
          </button>
          <button type="button" className={mode === 'local' ? 'active' : ''} onClick={() => setMode('local')}>
            Salario promedio local
          </button>
        </div>
        {mode === 'fixed' && (
          <label className="fiscal-field fiscal-field-inline">
            <span>Bruto anual USD</span>
            <input
              type="number"
              min={0}
              step={5000}
              value={salary}
              onChange={e => setSalary(e.target.value)}
              className="fiscal-input"
            />
          </label>
        )}
        <label className="fiscal-field fiscal-field-inline">
          <span>Ordenar por</span>
          <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)} className="fiscal-input">
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </label>
        <label className="fiscal-check">
          <input type="checkbox" checked={useRegimes} onChange={e => setUseRegimes(e.target.checked)} />
          Aplicar regímenes para recién llegados
        </label>
      </div>

      <div className="fiscal-chips">
        {REGIONS.map(r => (
          <button
            key={r}
            type="button"
            className={`fiscal-chip ${regions.has(r) ? 'active' : ''}`}
            onClick={() => toggleRegion(r)}
            aria-pressed={regions.has(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="social-sankey-kpis">
        {bestNet && (
          <div className="social-sankey-kpi">
            <span>Mayor neto</span>
            <strong><IsoTag code={bestNet.profile.iso2} />{bestNet.profile.country}</strong>
            <em>{usd(bestNet.netUSD)}/año</em>
          </div>
        )}
        {bestPPP && (
          <div className="social-sankey-kpi">
            <span>Mayor poder de compra</span>
            <strong><IsoTag code={bestPPP.profile.iso2} />{bestPPP.profile.country}</strong>
            <em>{usd(bestPPP.netPPP)} equiv. NYC</em>
          </div>
        )}
        {lowestRate && (
          <div className="social-sankey-kpi">
            <span>Menor carga (con impuesto)</span>
            <strong><IsoTag code={lowestRate.profile.iso2} />{lowestRate.profile.country}</strong>
            <em>{formatPct(lowestRate.best.effectiveRate)} efectiva</em>
          </div>
        )}
        <div className="social-sankey-kpi">
          <span>Territoriales o sin IRPF</span>
          <strong>{noTax} países</strong>
          <em>rentas extranjeras no gravadas</em>
        </div>
      </div>

      <div className="fiscal-rank-head">
        <ul className="fiscal-legend fiscal-legend-inline">
          <li><i className="fiscal-seg-net" /><span>{usePPP ? 'Neto ajustado por costo de vida' : 'Neto'}</span></li>
          {!usePPP && <li><i className="fiscal-seg-tax" /><span>Impuesto a la renta</span></li>}
          {!usePPP && <li><i className="fiscal-seg-social" /><span>Seg. social y otras cargas</span></li>}
        </ul>
        <button type="button" className="fiscal-link-button" onClick={() => setShowTable(s => !s)}>
          {showTable ? 'Ver gráfico' : 'Ver tabla completa'}
        </button>
      </div>

      {!showTable ? (
        <div className="fiscal-rank" onMouseLeave={() => setTip(null)}>
          {rows.map((c, i) => {
            const fx = c.profile.fx;
            const grossU = c.best.gross / fx;
            const netU = c.best.net / fx;
            const taxU = c.best.incomeTax / fx;
            const socU = (c.best.social + c.best.levies) / fx;
            const total = usePPP ? c.netPPP : grossU;
            return (
              <div
                key={c.profile.country}
                className="fiscal-rank-row"
                onMouseMove={e => setTip({ x: e.clientX, y: e.clientY, c })}
                tabIndex={0}
                onFocus={e => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setTip({ x: r.left + r.width / 2, y: r.top, c });
                }}
                onBlur={() => setTip(null)}
              >
                <span className="fiscal-rank-pos">{i + 1}</span>
                <span className="fiscal-rank-name">
                  <IsoTag code={c.profile.iso2} />{c.profile.country}
                  {c.best.regimeApplied && <sup title={c.best.regimeApplied}>★</sup>}
                </span>
                <div className="fiscal-rank-track">
                  <div className="fiscal-rank-bar" style={{ width: `${(total / maxBar) * 100}%` }}>
                    {usePPP ? (
                      <div className="fiscal-bar-seg fiscal-seg-net" style={{ flexGrow: 1 }} />
                    ) : (
                      <>
                        <div className="fiscal-bar-seg fiscal-seg-net" style={{ flexGrow: netU }} />
                        {taxU > 0 && <div className="fiscal-bar-seg fiscal-seg-tax" style={{ flexGrow: taxU }} />}
                        {socU > 0 && <div className="fiscal-bar-seg fiscal-seg-social" style={{ flexGrow: socU }} />}
                      </>
                    )}
                  </div>
                </div>
                <span className="fiscal-rank-value">
                  {usd(usePPP ? c.netPPP : netU)}
                  <small>{formatPct(c.best.effectiveRate, 0)}</small>
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <FiscalTable rows={rows} />
      )}

      {tip && !showTable && (
        <div
          className="sankey-tooltip fiscal-tooltip"
          style={{
            left: Math.min(tip.x + 14, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 280),
            top: tip.y + 14,
          }}
        >
          <strong><IsoTag code={tip.c.profile.iso2} />{tip.c.profile.country} · {tip.c.profile.region}</strong>
          <span>Bruto: {usd(tip.c.best.gross / tip.c.profile.fx)} ({formatMoney(tip.c.best.gross, tip.c.profile.currency)})</span>
          <span>Neto: {usd(tip.c.netUSD)} · {formatMoney(tip.c.best.net / 12, tip.c.profile.currency)}/mes</span>
          <span>Impuesto: {usd(tip.c.best.incomeTax / tip.c.profile.fx)} · Seg. social: {usd((tip.c.best.social + tip.c.best.levies) / tip.c.profile.fx)}</span>
          <span>Tasa efectiva: {formatPct(tip.c.best.effectiveRate)}{tip.c.best.regimeApplied ? ` (${tip.c.best.regimeApplied})` : ''}</span>
          <span>Costo de vida: {tip.c.profile.eco.col} · Poder de compra: {usd(tip.c.netPPP)}</span>
          <span>Residencia fiscal: {tip.c.profile.residency.days ? `${tip.c.profile.residency.days} días` : 'por vínculos'} · {tip.c.profile.residency.basis}</span>
        </div>
      )}

      <p className="social-sankey-footnote">
        ★ = se aplicó el régimen para recién llegados más favorable disponible para asalariados. Poder de compra = neto
        ÷ índice de costo de vida (Nueva York = 100). Datos aproximados: FMI WEO, Banco Mundial, OCDE, autoridades
        fiscales y Numbeo (2025–2026). Modelo simplificado para persona soltera sin hijos; no es asesoría fiscal.
      </p>
    </section>
  );
}

type Col = { key: string; label: string; get: (c: CountryComparison) => number | string; fmt?: (v: number) => string };

const COLUMNS: Col[] = [
  { key: 'country', label: 'País', get: c => c.profile.country },
  { key: 'net', label: 'Neto USD', get: c => c.netUSD, fmt: usd },
  { key: 'ppp', label: 'Poder compra', get: c => c.netPPP, fmt: usd },
  { key: 'rate', label: 'Tasa efect.', get: c => c.best.effectiveRate, fmt: v => formatPct(v) },
  { key: 'vat', label: 'IVA', get: c => c.profile.vat, fmt: v => `${v}%` },
  { key: 'corp', label: 'Sociedades', get: c => c.profile.corpTax, fmt: v => `${v}%` },
  { key: 'days', label: 'Días resid.', get: c => c.profile.residency.days ?? 0, fmt: v => (v ? String(v) : 'vínculos') },
  { key: 'basis', label: 'Base', get: c => c.profile.residency.basis },
  { key: 'gdp', label: 'PIB pc', get: c => c.profile.eco.gdpPcUSD, fmt: usd },
  { key: 'infl', label: 'Inflación', get: c => c.profile.eco.inflation, fmt: v => `${v}%` },
  { key: 'unemp', label: 'Desempleo', get: c => c.profile.eco.unemployment, fmt: v => `${v}%` },
  { key: 'minw', label: 'Mínimo/mes', get: c => c.profile.eco.minWageMonthlyUSD ?? 0, fmt: v => (v ? usd(v) : '—') },
  { key: 'col', label: 'Costo vida', get: c => c.profile.eco.col, fmt: v => String(v) },
  { key: 'hdi', label: 'IDH', get: c => c.profile.eco.hdi, fmt: v => v.toFixed(3) },
  { key: 'pr', label: 'Resid. permanente', get: c => c.profile.path.permanent },
  { key: 'cit', label: 'Ciudadanía', get: c => c.profile.path.citizenship },
];

function FiscalTable({ rows }: { rows: CountryComparison[] }) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: 'net', dir: -1 });
  const col = COLUMNS.find(c => c.key === sort.key)!;
  const sorted = [...rows].sort((a, b) => {
    const va = col.get(a);
    const vb = col.get(b);
    const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es');
    return cmp * sort.dir;
  });

  return (
    <div className="fiscal-table-wrap">
      <table className="fiscal-table">
        <thead>
          <tr>
            {COLUMNS.map(c => (
              <th
                key={c.key}
                onClick={() => setSort(s => ({ key: c.key, dir: s.key === c.key ? (s.dir === 1 ? -1 : 1) : -1 }))}
                aria-sort={sort.key === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
              >
                {c.label}{sort.key === c.key ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => (
            <tr key={r.profile.country}>
              {COLUMNS.map(c => {
                const v = c.get(r);
                return (
                  <td key={c.key}>
                    {c.key === 'country' ? <><IsoTag code={r.profile.iso2} />{v}</> : typeof v === 'number' && c.fmt ? c.fmt(v) : v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
