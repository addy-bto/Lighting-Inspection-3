import React, { useState } from 'react';
import { BILLBOARD_LOCATIONS, BillboardSite, LangMode, ScreenId, Ticket } from '../data/initialData';

interface ScreenF06LogsProps {
  lang: LangMode;
  tickets: Ticket[];
  sites?: BillboardSite[];
  onExportCsv: () => void;
  onNavigate: (screen: ScreenId, ticketId?: string) => void;
  showToast: (title: string, message: string, isError?: boolean) => void;
}

export const ScreenF06Logs: React.FC<ScreenF06LogsProps> = ({
  lang,
  tickets,
  sites = BILLBOARD_LOCATIONS,
  onExportCsv,
  onNavigate,
  showToast,
}) => {
  const isEn = lang === 'en';
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('all');
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);

  const filteredTickets = tickets.filter((t) => {
    if (selectedAssetFilter === 'all') return true;
    return t.billboardCode === selectedAssetFilter;
  });

  return (
    <div className="p-space-lg max-w-[1600px] mx-auto space-y-space-lg">
      {/* Top Banner */}
      <div className="bg-surface-panel rounded-xl p-space-lg border border-border-subtle shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-navy-header text-on-primary font-code-metric text-label-sm uppercase">
              {isEn
                ? 'MODULE F06 • CLIENT SUMMARY REPORTS & SAFETY LOGS'
                : 'MODUL F06 • LAPORAN RINGKASAN KLIEN & LOG KESELAMATAN'}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-status-approved-green-bg text-status-approved-green font-code-metric text-label-sm font-bold">
              MS IEC 60364 COMPLIANT
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            {isEn
              ? 'Client Summary Reports & Electrical Safety Logs (F06)'
              : 'Log Penyelenggaraan & Laporan Ringkasan Klien (F06)'}
          </h1>
          <p className="font-body-md text-secondary mt-0.5">
            {isEn
              ? 'Consolidated maintenance ledger by billboard asset, contractor turnaround SLA, and Suruhanjaya Tenaga insulation test logs.'
              : 'Lejar penyelenggaraan bersepadu mengikut aset papan iklan, SLA masa tindak balas kontraktor, dan log ujian penebatan Suruhanjaya Tenaga.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <select
            value={selectedAssetFilter}
            onChange={(e) => setSelectedAssetFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-surface-canvas border border-border-strong font-body-sm text-on-surface"
          >
            <option value="all">
              {isEn
                ? `All Billboard Assets (${sites.length} Sites)`
                : `Semua Aset Papan Iklan (${sites.length} Tapak)`}
            </option>
            {sites.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setSafetyModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-navy-header hover:bg-slate-800 text-white font-label-md uppercase tracking-wider shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>{isEn ? 'ST Safety Audit Certificate' : 'Sijil Audit Suruhanjaya Tenaga'}</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-status-pending-amber hover:bg-primary text-on-primary font-label-md uppercase tracking-wider shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{isEn ? 'Export Client Report (CSV)' : 'Eksport Laporan Klien (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Summary Ledger Table */}
      <div className="bg-surface-panel rounded-xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-space-md bg-navy-header text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-status-pending-amber">summarize</span>
            <h2 className="font-headline-md text-title-md uppercase tracking-wide">
              {isEn
                ? 'Master Billboard Maintenance & Electrical Compliance Log'
                : 'Jadual Induk Log Penyelenggaraan & Pematuhan Elektrik Papan Iklan'}
            </h2>
          </div>
          <span className="font-code-metric text-label-sm bg-white/10 px-2.5 py-1 rounded">
            {filteredTickets.length} {isEn ? 'RECORDS' : 'REKOD LOG'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border-subtle font-label-sm text-secondary uppercase">
                <th className="py-3 px-4">{isEn ? 'Ticket / JCC' : 'Tiket / Sijil JCC'}</th>
                <th className="py-3 px-4">{isEn ? 'Billboard Asset' : 'Aset Papan Iklan'}</th>
                <th className="py-3 px-4">{isEn ? 'Appointed Contractor' : 'Kontraktor Dilantik'}</th>
                <th className="py-3 px-4">
                  {isEn ? 'Electrical Work & Megger Log' : 'Ringkasan Kerja & Ujian Megger'}
                </th>
                <th className="py-3 px-4 text-center">{isEn ? 'SLA Turnaround' : 'Tempoh SLA'}</th>
                <th className="py-3 px-4 text-right">{isEn ? 'Claim Total' : 'Jumlah Tuntutan'}</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">{isEn ? 'Action' : 'Tindakan'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-body-sm">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-surface-canvas">
                  <td className="py-3.5 px-4">
                    <div className="font-code-metric font-bold text-on-surface">#{t.id}</div>
                    <div className="font-code-metric text-label-sm text-primary">{t.jccNumber}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-on-surface">
                      {isEn ? t.locationEn : t.location}
                    </div>
                    <div className="font-code-metric text-label-sm text-secondary">
                      {t.billboardCode} • {t.displayType}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-on-surface">{t.contractor}</div>
                    <div className="text-label-sm text-secondary">
                      {t.technician} ({t.cidbReg})
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="text-on-surface font-medium">
                      {isEn ? t.repairSummaryEn : t.repairSummary}
                    </div>
                    <div className="text-label-sm text-secondary mt-0.5">
                      {isEn ? t.technicalNotesEn : t.technicalNotes}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-code-metric text-label-sm">
                    {isEn ? t.slaTextEn : t.slaText}
                  </td>
                  <td className="py-3.5 px-4 text-right font-code-metric font-bold text-on-surface">
                    RM {t.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {t.status === 'Approved for Payment' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-approved-green-bg text-status-approved-green border border-status-approved-green-border font-code-metric text-label-sm font-bold">
                        APPROVED
                      </span>
                    ) : t.status === 'Pending Approval' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-pending-amber-bg text-status-pending-amber border border-status-pending-amber-border font-code-metric text-label-sm font-bold">
                        PENDING E-SIGN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-assigned-red-bg text-status-assigned-red border border-status-assigned-red-border font-code-metric text-label-sm font-bold">
                        ASSIGNED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (t.status === 'Approved for Payment') {
                            onNavigate('s05-finance', t.id);
                          } else if (t.status === 'Pending Approval') {
                            onNavigate('s04-approval', t.id);
                          } else {
                            onNavigate('s03-contractor', t.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm uppercase cursor-pointer"
                      >
                        {isEn ? 'Inspect' : 'Semak'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('s05-finance', t.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-navy-header text-white font-label-sm uppercase cursor-pointer"
                        title={isEn ? 'View JCC Certificate' : 'Lihat Sijil JCC'}
                      >
                        JCC
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Asset Uptime & Electrical Compliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div
          onClick={() => setSafetyModalOpen(true)}
          className="bg-surface-panel p-space-md rounded-xl border border-border-subtle shadow-xs hover:border-status-approved-green transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-secondary uppercase">
              {isEn ? 'Suruhanjaya Tenaga PW4 Compliance' : 'Pematuhan Pendawai PW4 Suruhanjaya Tenaga'}
            </span>
            <span className="material-symbols-outlined text-status-approved-green">verified_user</span>
          </div>
          <div className="font-headline-md text-title-md font-bold text-on-surface">
            100% Certified Wiremen
          </div>
          <p className="font-body-sm text-secondary mt-1">
            {isEn
              ? 'All field electrical interventions on 415V/240V outdoor DB enclosures are executed by certified PW4 chargemen/wiremen.'
              : 'Semua kerja pembaikan elektrik 415V/240V pada panel DB luar dikendalikan oleh pendawai bertauliah PW4.'}
          </p>
        </div>

        <div
          onClick={() => setSafetyModalOpen(true)}
          className="bg-surface-panel p-space-md rounded-xl border border-border-subtle shadow-xs hover:border-status-pending-amber transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-secondary uppercase">
              {isEn ? 'Network Illumination Uptime' : 'Ketersediaan Nyalaan Rangkaian (Uptime)'}
            </span>
            <span className="material-symbols-outlined text-status-pending-amber">bolt</span>
          </div>
          <div className="font-headline-md text-title-md font-bold text-on-surface">
            99.4% Night Illumination SLA
          </div>
          <p className="font-body-sm text-secondary mt-1">
            {isEn
              ? 'Astronomical timer switches & surge arresters (SPD Type 2 40kA) protect highway unipoles during monsoon storms.'
              : 'Suis pemasa astronomi & pelindung kilat (SPD Jenis 2 40kA) melindungi papan iklan lebuhraya semasa musim ribut.'}
          </p>
        </div>

        <div
          onClick={() => setSafetyModalOpen(true)}
          className="bg-surface-panel p-space-md rounded-xl border border-border-subtle shadow-xs hover:border-primary transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-secondary uppercase">
              {isEn ? 'Audit & Client Transparency' : 'Ketelusan Audit & Bukti Klien'}
            </span>
            <span className="material-symbols-outlined text-primary">fact_check</span>
          </div>
          <div className="font-headline-md text-title-md font-bold text-on-surface">
            3-Phase Photo &amp; GPS Proof
          </div>
          <p className="font-body-sm text-secondary mt-1">
            {isEn
              ? 'Every work order requires Before, During, and After photos with GPS coordinates and supervisor digital e-signature.'
              : 'Setiap tiket mewajibkan 3 foto (Sebelum, Semasa, Selepas) berserta koordinat GPS dan e-tandatangan penyelia.'}
          </p>
        </div>
      </div>

      {/* Suruhanjaya Tenaga & MS IEC 60364 Safety Audit Modal */}
      {safetyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-panel rounded-xl max-w-lg w-full p-space-lg border border-border-strong shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="font-code-metric text-xs text-status-approved-green font-bold uppercase">
                  SURUHANJAYA TENAGA • MS IEC 60364 AUDIT
                </span>
                <h3 className="font-headline-md text-title-md font-bold text-on-surface">
                  {isEn
                    ? 'Electrical Safety & Insulation Compliance Certificate'
                    : 'Sijil Pematuhan Keselamatan Elektrik & Penebatan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSafetyModalOpen(false)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-surface-canvas p-4 rounded-lg border border-border-subtle space-y-2.5 text-xs font-code-metric">
              <div className="flex justify-between">
                <span className="text-secondary">Standard Compliance:</span>
                <span className="text-status-approved-green font-bold">
                  MS IEC 60364 &amp; Electricity Regs 1994
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Megger Insulation Test (500V DC):</span>
                <span className="text-on-surface font-bold">&gt; 285 MΩ (PASS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Earth Electrode Resistance:</span>
                <span className="text-on-surface font-bold">1.8 Ω – 3.4 Ω (&lt; 10 Ω PASS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">RCD / ELCB 100mA Trip Time:</span>
                <span className="text-on-surface font-bold">18 ms (&lt; 40 ms PASS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Certified Chargeman / Wireman:</span>
                <span className="text-on-surface font-bold">PW4 &amp; A4 Certified</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSafetyModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border-strong text-secondary font-label-md text-xs cursor-pointer"
              >
                {isEn ? 'Close' : 'Tutup'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportCsv();
                  setSafetyModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-status-approved-green text-white font-label-md text-xs uppercase font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>{isEn ? 'Export Compliance CSV' : 'Eksport CSV Pematuhan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
