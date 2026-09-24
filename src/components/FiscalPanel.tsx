'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import {
  FISCAL_COUNTRIES,
  computeTax,
  formatMoney,
  formatPct,
  getFiscalProfile,
} from '../core/CountryFiscalProfile';
import type { MigrantPerson } from '../models/MigrantPerson';

interface Props {
  migrant: MigrantPerson | null;
}

const BASIS_LABEL = {
  mundial: 'Renta mundial',
  territorial: 'Territorial (solo fuente local)',
  remesa: 'Base de remesa (extranjera solo si se trae)',
  'sin IRPF': 'Sin impuesto a la renta personal',
} as const;

export function FiscalPanel({ migrant }: Props) {
  const [country, setCountry] = useState('España');
  const [currencyMode, setCurrencyMode] = useState<'local' | 'usd'>('usd');
  const [grossInput, setGrossInput] = useState('50000');
  const [regimeName, setRegimeName] = useState('');

  const profile = getFiscalProfile(country)!;
  const gross = Math.max(0, Number(grossInput) || 0);
  const grossLocal = currencyMode === 'usd' ? gross * profile.fx : gross;
  const regime = profile.regimes.find(r => r.name === regimeName) ?? null;

  const standard = useMemo(() => computeTax(profile, grossLocal), [profile, grossLocal]);
  const withRegime = useMemo(
    () => (regime?.model ? computeTax(profile, grossLocal, regime) : null),
    [profile, grossLocal, regime],
  );
  const result = withRegime?.regimeApplied ? withRegime : standard;
  const saving = withRegime?.regimeApplied ? withRegime.net - standard.net : 0;

  const money = (v: number) => formatMoney(v, profile.currency);
  const usd = (v: number) => formatMoney(v / profile.fx, 'USD');
  const pct = (v: number) => (result.gross > 0 ? (v / result.gross) * 100 : 0);
  const otherCharges = result.social + result.levies;

  const segments = [
    { key: 'net', label: 'Neto', value: result.net, className: 'fiscal-seg-net' },
    { key: 'tax', label: 'Impuesto a la renta', value: result.incomeTax, className: 'fiscal-seg-tax' },
    { key: 'social', label: 'Seg. social y otras cargas', value: otherCharges, className: 'fiscal-seg-social' },
  ];

  const minWageRatio = profile.eco.minWageMonthlyUSD
    ? (result.net / profile.fx / 12) / profile.eco.minWageMonthlyUSD
    : null;

  return (
    <div className="fiscal-panel">
      <div className="fiscal-controls">
        <label className="fiscal-field">
          <span>País</span>
          <select
            value={country}
            onChange={e => { setCountry(e.target.value); setRegimeName(''); }}
            className="fiscal-input"
          >
            {FISCAL_COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="fiscal-field">
          <span>Salario bruto anual</span>
          <div className="fiscal-input-group">
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={grossInput}
              onChange={e => setGrossInput(e.target.value)}
              className="fiscal-input"
            />
            <button
              type="button"
              className="fiscal-toggle"
              onClick={() => {
                // Convierte el monto al cambiar de moneda para no alterar el escenario.
                const next = currencyMode === 'usd' ? 'local' : 'usd';
                const converted = next === 'local' ? gross * profile.fx : gross / profile.fx;
                setGrossInput(String(Math.round(converted)));
                setCurrencyMode(next);
              }}
              title="Cambiar moneda"
            >
              {currencyMode === 'usd' ? 'USD' : profile.currency}
            </button>
          </div>
        </label>
      </div>

      {profile.regimes.some(r => r.model) && (
        <label className="fiscal-field">
          <span>Régimen para nuevos residentes</span>
          <select value={regimeName} onChange={e => setRegimeName(e.target.value)} className="fiscal-input">
            <option value="">Régimen general</option>
            {profile.regimes.filter(r => r.model).map(r => (
              <option key={r.name} value={r.name}>{r.name}</option>
            ))}
          </select>
        </label>
      )}

      <div className="fiscal-hero">
        <div>
          <span className="fiscal-hero-label">Neto mensual estimado</span>
          <strong className="fiscal-hero-value">{money(result.net / 12)}</strong>
          <span className="fiscal-hero-sub">
            {profile.currency !== 'USD' && <>{usd(result.net / 12)} · </>}
            {money(result.net)} al año
          </span>
        </div>
        <div className="fiscal-hero-side">
          <span className="fiscal-hero-label">Tasa efectiva</span>
          <strong className="fiscal-hero-rate">{formatPct(result.effectiveRate)}</strong>
          <span className="fiscal-hero-sub">marginal {formatPct(result.marginalRate, 0)}</span>
        </div>
      </div>

      {regime && regime.model && !withRegime?.regimeApplied && (
        <p className="fiscal-note">
          Este régimen requiere un bruto mínimo de {money(regime.model.minGross ?? 0)}; se muestra el régimen general.
        </p>
      )}
      {saving > 0 && (
        <p className="fiscal-saving">
          {regime!.name}: ahorras {money(saving)} al año ({usd(saving)}) frente al régimen general.
        </p>
      )}

      <div className="fiscal-bar" role="img" aria-label="Distribución del salario bruto">
        {segments.map(s => s.value > 0 && (
          <div
            key={s.key}
            className={`fiscal-bar-seg ${s.className}`}
            style={{ flexGrow: s.value }}
            title={`${s.label}: ${money(s.value)} (${pct(s.value).toFixed(1)}%)`}
          />
        ))}
      </div>
      <ul className="fiscal-legend">
        {segments.map(s => (
          <li key={s.key}>
            <i className={s.className} />
            <span>{s.label}</span>
            <strong>{money(s.value)}</strong>
            <em>{pct(s.value).toFixed(1)}%</em>
          </li>
        ))}
      </ul>

      <div className="fiscal-stats">
        <div><span>IVA / consumo</span><strong>{profile.vat}%</strong></div>
        <div><span>Sociedades</span><strong>{profile.corpTax}%</strong></div>
        <div><span>Costo de vida</span><strong>{profile.eco.col} <small>NYC=100</small></strong></div>
        <div><span>PIB per cápita</span><strong>{formatMoney(profile.eco.gdpPcUSD, 'USD')}</strong></div>
        <div><span>Inflación</span><strong>{profile.eco.inflation}%</strong></div>
        <div><span>Desempleo</span><strong>{profile.eco.unemployment}%</strong></div>
        <div>
          <span>Salario mínimo</span>
          <strong>{profile.eco.minWageMonthlyUSD ? `${formatMoney(profile.eco.minWageMonthlyUSD, 'USD')}/mes` : 'Por convenio'}</strong>
        </div>
        <div>
          <span>Tu neto vs mínimo</span>
          <strong>{minWageRatio ? `${minWageRatio.toFixed(1)}×` : '—'}</strong>
        </div>
      </div>

      <div className="fiscal-section">
        <h3>Residencia fiscal</h3>
        <p>
          <strong>{profile.residency.days ? `${profile.residency.days} días` : 'Por vínculos'}</strong> · {profile.residency.rule}
        </p>
        <p className="fiscal-muted">Base imponible: {BASIS_LABEL[profile.residency.basis]} · Ganancias de capital: {profile.capitalGains}</p>
      </div>

      <div className="fiscal-section">
        <h3>Beneficios y regímenes para recién llegados</h3>
        <ul className="fiscal-regimes">
          {profile.regimes.map(r => (
            <li key={r.name}>
              <strong>{r.name}</strong>
              <span>{r.benefit}</span>
              <em>{r.duration} · {r.who}</em>
            </li>
          ))}
        </ul>
      </div>

      <div className="fiscal-section fiscal-path">
        <div><span>Residencia permanente</span><strong>{profile.path.permanent}</strong></div>
        <div><span>Ciudadanía</span><strong>{profile.path.citizenship}</strong></div>
        <div><span>Doble nacionalidad</span><strong>{profile.path.dualCitizenship}</strong></div>
      </div>

      {migrant?.originCountry && migrant.originCountry !== 'Desconocido' && migrant.originCountry !== country && (
        <p className="fiscal-muted">
          Revisa si existe convenio de doble imposición entre {migrant.originCountry} y {country}, y cómo
          dar de baja tu residencia fiscal de origen antes de mudarte.
        </p>
      )}

      {profile.tax.note && <p className="fiscal-muted">Modelo: {profile.tax.note}</p>}

      <div className="fiscal-actions">
        <Link href="/fiscal" className="route-link-button">Comparar {FISCAL_COUNTRIES.length} países</Link>
        <a href={profile.authorityUrl} target="_blank" rel="noreferrer" className="fiscal-link">
          Autoridad fiscal <ExternalLink size={12} />
        </a>
      </div>
      <p className="fiscal-disclaimer">
        Estimación simplificada (persona soltera, asalariada, sin hijos; reglas 2025–2026). No es asesoría fiscal.
      </p>
    </div>
  );
}
