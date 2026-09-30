import React, { useState } from 'react';
import { LangMode, ScreenId, Ticket } from '../data/initialData';

interface ScreenS01HubProps {
  lang: LangMode;
  tickets: Ticket[];
  onNavigate: (screen: ScreenId, ticketId?: string) => void;
  showToast: (title: string, message: string, isError?: boolean) => void;
}

interface ZoneTelemetry {
  id: string;
  nameEn: string;
  nameMs: string;
  corridorsEn: string;
  corridorsMs: string;
  uptime: string;
  powerLoad: string;
  loadPct: number;
  billboards: number;
  statusTextEn: string;
  statusTextMs: string;
  isWarning?: boolean;
  voltage3Phase: string;
  earthOhms: string;
  spdStatus: string;
  contractor: string;
  wiremanCert: string;
  linkedTicketId?: string;
}

export const ScreenS01Hub: React.FC<ScreenS01HubProps> = ({
  lang,
  tickets,
  onNavigate,
  showToast,
}) => {
  const isEn = lang === 'en';
  const [zoneViewMode, setZoneViewMode] = useState<'cards' | 'telemetry'>('cards');
  const [execReportModalOpen, setExecReportModalOpen] = useState(false);
  const [selectedZoneModal, setSelectedZoneModal] = useState<ZoneTelemetry | null>(null);
  const [pingingZoneId, setPingingZoneId] = useState<string | null>(null);

  const activeRepairCount = tickets.filter((t) => t.status !== 'Approved for Payment').length;

  const zones: ZoneTelemetry[] = [
    {
      id: 'central',
      nameEn: 'Central Zone (Klang Valley)',
      nameMs: 'Zon Tengah (Lembah Klang)',
      corridorsEn: 'Federal Highway, NKVE, MEX & LDP. Highest lighting density with 22 units.',
      corridorsMs: 'Lebuhraya Persekutuan, NKVE, MEX & LDP. Ketumpatan pencahayaan tertinggi dengan 22 unit.',
      uptime: '98.0%',
      powerLoad: '164.2 kW',
      loadPct: 72,
      billboards: 22,
      statusTextEn: '1 Pending Ticket',
      statusTextMs: '1 Tiket Menunggu',
      isWarning: true,
      voltage3Phase: '415V / 240V (PF 0.96)',
      earthOhms: '2.1 Ω (Pass <10Ω)',
      spdStatus: 'SPD Type 2 Healthy',
      contractor: 'Apex Electrical Services Sdn Bhd',
      wiremanCert: 'ST Wireman PW4 (Rashid bin Osman)',
      linkedTicketId: 'TKT-2024-084',
    },
    {
      id: 'north',
      nameEn: 'Northern Zone (Penang & Perak)',
      nameMs: 'Zon Utara (P. Pinang & Perak)',
      corridorsEn: 'Penang Bridge 1 & 2, Ipoh South, Juru Toll Plaza.',
      corridorsMs: 'Jambatan Pulau Pinang 1 & 2, Ipoh Selatan, Plaza Tol Juru.',
      uptime: '100%',
      powerLoad: '86.4 kW',
      loadPct: 54,
      billboards: 12,
      statusTextEn: 'Zero Faults',
      statusTextMs: 'Tiada Kerosakan',
      voltage3Phase: '414V / 239V (PF 0.98)',
      earthOhms: '1.8 Ω (Pass <10Ω)',
      spdStatus: 'SPD Type 2 Healthy',
      contractor: 'Mega Power Volt Engineering',
      wiremanCert: 'ST Engineer A4 (Ahmad Taufiq)',
      linkedTicketId: 'TKT-2024-079',
    },
    {
      id: 'south',
      nameEn: 'Southern Zone (Melaka & Johor)',
      nameMs: 'Zon Selatan (Melaka & Johor)',
      corridorsEn: 'Kempas Highway, Skudai Corridor, Ayer Keroh, Iskandar Puteri.',
      corridorsMs: 'Lebuhraya Kempas, Koridor Skudai, Ayer Keroh, Iskandar Puteri.',
      uptime: '95.0%',
      powerLoad: '68.2 kW',
      loadPct: 45,
      billboards: 10,
      statusTextEn: '2 Maintenance Tickets',
      statusTextMs: '2 Tiket Penyelenggaraan',
      isWarning: true,
      voltage3Phase: '412V / 238V (PF 0.94)',
      earthOhms: '3.4 Ω (Pass <10Ω)',
      spdStatus: '1 Cartridge Replaced',
      contractor: 'CityLight Infra Tech Enterprise',
      wiremanCert: 'ST Wireman PW3 (Mohd Faizal)',
      linkedTicketId: 'TKT-2024-089',
    },
    {
      id: 'east',
      nameEn: 'Eastern Zone (Kuantan LPT)',
      nameMs: 'Zon Pantai Timur (LPT Kuantan)',
      corridorsEn: 'East Coast Expressway Gambang Interchange & Kuantan Bypass.',
      corridorsMs: 'Persimpangan Gambang LPT & Pintasan Kuantan.',
      uptime: '100%',
      powerLoad: '24.0 kW',
      loadPct: 20,
      billboards: 4,
      statusTextEn: 'Zero Faults',
      statusTextMs: 'Tiada Kerosakan',
      voltage3Phase: '416V / 241V (PF 0.99)',
      earthOhms: '1.9 Ω (Pass <10Ω)',
      spdStatus: 'SPD Type 2 Healthy',
      contractor: 'Borneo & East Coast Powergrid',
      wiremanCert: 'ST Wireman PW4 (Zulhilmi Daud)',
      linkedTicketId: 'TKT-2024-065',
    },
  ];

  const handleDownloadExecutiveCsv = () => {
    const headers = [
      'Zone ID',
      'Zone Name',
      'Billboards Count',
      'Uptime SLA',
      'Power Load',
      '3-Phase Voltage',
      'Earth Resistance',
      'Assigned Contractor',
    ];
    const rows = zones.map((z) => [
      z.id.toUpperCase(),
      `"${z.nameEn}"`,
      z.billboards,
      z.uptime,
      z.powerLoad,
      `"${z.voltage3Phase}"`,
      `"${z.earthOhms}"`,
      `"${z.contractor}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'BillboardOps_Executive_Report_Q4_2024.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      isEn ? 'Executive CSV Downloaded' : 'CSV Eksekutif Dimuat Turun',
      isEn
        ? 'Saved BillboardOps_Executive_Report_Q4_2024.csv to your device.'
        : 'Fail BillboardOps_Executive_Report_Q4_2024.csv telah disimpan.'
    );
  };

  const handleRunDiagnosticPing = (zone: ZoneTelemetry) => {
    setPingingZoneId(zone.id);
    setTimeout(() => {
      setPingingZoneId(null);
      showToast(
        isEn ? `Substation Telemetry Verified: ${zone.nameEn}` : `Telemetri Disahkan: ${zone.nameMs}`,
        isEn
          ? `Voltage: ${zone.voltage3Phase} • Earth: ${zone.earthOhms} • ${zone.spdStatus}`
          : `Voltan: ${zone.voltage3Phase} • Bumi: ${zone.earthOhms} • ${zone.spdStatus}`
      );
    }, 500);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="px-margin-mobile sm:px-margin py-space-lg space-y-space-xl max-w-[1600px] mx-auto w-full">
        {/* Executive Header & Real-time Grid Status Banner */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg shadow-xs border border-border-subtle">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
            <div className="space-y-space-xs max-w-3xl">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                  {isEn ? 'Corporate Operations Hub' : 'Hab Operasi Korporat'}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-outline" />
                <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-lg bg-surface-container-highest text-on-surface font-code-metric text-label-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> v1.0.4 Enterprise ST-IoT Link
                </span>
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-lg bg-status-approved-green-bg text-status-approved-green font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span>{' '}
                  {isEn
                    ? 'Suruhanjaya Tenaga (Energy Commission) Compliant'
                    : 'Mematuhi Piawaian Suruhanjaya Tenaga'}
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                {isEn
                  ? 'System Overview & Billboard Operations Hub'
                  : 'Gambaran Keseluruhan Sistem & Hab Operasi Papan Iklan'}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                {isEn
                  ? 'Centralized electrical telemetry and field maintenance monitoring for BillboardOps Malaysia. Managing 48 giant billboard structures across PLUS Expressway, Klang Valley, Penang Bridge & Johor Bahru corridors.'
                  : 'Telemetri elektrik berpusat dan pemantauan penyelenggaraan lapangan bagi BillboardOps Malaysia. Menguruskan 48 struktur papan iklan gergasi di koridor Lebuhraya PLUS, Lembah Klang, Jambatan Pulau Pinang & Johor Bahru.'}
              </p>
            </div>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap lg:flex-col xl:flex-row items-stretch gap-space-sm">
              <button
                type="button"
                onClick={() => setExecReportModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 h-10 px-space-md rounded-lg bg-primary text-on-primary hover:bg-primary-dim font-label-md text-label-md uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">assessment</span>
                <span>{isEn ? 'Generate Executive Report' : 'Jana Laporan Eksekutif'}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('f06-logs')}
                className="inline-flex items-center justify-center gap-2 h-10 px-space-md rounded-lg bg-surface-container-lowest text-secondary hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md border border-border-subtle cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                <span>
                  {isEn ? 'Energy Commission Safety Audit' : 'Audit Keselamatan Suruhanjaya Tenaga'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('s02-mint')}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container-lowest text-secondary hover:text-on-surface hover:bg-surface-container transition-all border border-border-subtle cursor-pointer"
                title={isEn ? 'Open S02 Tickets Dashboard' : 'Buka Paparan S02 Mint'}
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
          </div>

          {/* Telemetry Highlights Strip */}
          <div className="mt-space-lg pt-space-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-md">
            <div
              onClick={() => setSelectedZoneModal(zones[0])}
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle flex flex-col justify-between cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary uppercase">
                  {isEn ? 'Active Billboards / Structures' : 'Papan Iklan / Struktur Aktif'}
                </span>
                <span className="material-symbols-outlined text-secondary text-[20px]">ad_units</span>
              </div>
              <div className="mt-2 flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg text-on-surface font-code-metric">48</span>
                <span className="font-label-sm text-label-sm text-status-approved-green font-semibold">
                  {isEn ? '100% Licensed' : '100% Berlesen'}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {isEn ? '4 Highway Operating Zones (Click to Inspect)' : '4 Zon Operasi Lebuhraya'}
              </span>
            </div>

            <div
              onClick={() => setZoneViewMode('telemetry')}
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle flex flex-col justify-between cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary uppercase">
                  {isEn ? 'Direct Power Load' : 'Beban Kuasa Terus'}
                </span>
                <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
              </div>
              <div className="mt-2 flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg text-on-surface font-code-metric">
                  342.8
                </span>
                <span className="font-code-metric text-label-sm text-secondary">kW/h</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {isEn ? 'TNB Grid & Backup Inverter (View Telemetry)' : 'Grid TNB & Inverter Sandaran'}
              </span>
            </div>

            <div
              onClick={() => onNavigate('f06-logs')}
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle flex flex-col justify-between cursor-pointer hover:border-status-approved-green transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary uppercase">
                  {isEn ? 'Average System Uptime' : 'Purata Masa Aktif Sistem'}
                </span>
                <span className="material-symbols-outlined text-status-approved-green text-[20px]">
                  vital_signs
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg text-on-surface font-code-metric">
                  98.2%
                </span>
                <span className="font-label-sm text-label-sm text-status-approved-green font-semibold">
                  {isEn ? 'High' : 'Tinggi'}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                SLA Target: &gt;97.5%
              </span>
            </div>

            <div
              onClick={() => onNavigate('s02-mint')}
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle flex flex-col justify-between cursor-pointer hover:border-status-pending-amber transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary uppercase">
                  {isEn ? 'Active Repair Tickets' : 'Tiket Pembaikan Aktif'}
                </span>
                <span className="material-symbols-outlined text-status-assigned-red text-[20px]">
                  warning
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg text-on-surface font-code-metric">
                  {activeRepairCount || 3}
                </span>
                <span className="font-label-sm text-label-sm text-status-pending-amber font-semibold">
                  1 {isEn ? 'Critical' : 'Kritikal'}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {isEn ? '2 Contractor Teams Dispatched' : '2 Pasukan Kontraktor Digerakkan'}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Regional Network Grid & Map Visualizer */}
        <div className="space-y-space-md">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                {isEn
                  ? 'Geographic Infrastructure & Regional Allocation'
                  : 'Infrastruktur Geografi & Agihan Wilayah'}
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {isEn ? '4 Highway Billboard Zones Malaysia' : '4 Zon Papan Iklan Lebuhraya Malaysia'}
              </h2>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-lg border border-border-subtle">
              <button
                type="button"
                onClick={() => setZoneViewMode('cards')}
                className={`px-space-sm py-1.5 rounded-md font-label-sm text-label-sm transition-colors cursor-pointer ${
                  zoneViewMode === 'cards'
                    ? 'bg-navy-header text-white font-bold shadow-2xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {isEn ? 'Metric Cards' : 'Kad Metrik'}
              </button>
              <button
                type="button"
                onClick={() => setZoneViewMode('telemetry')}
                className={`px-space-sm py-1.5 rounded-md font-label-sm text-label-sm transition-colors cursor-pointer ${
                  zoneViewMode === 'telemetry'
                    ? 'bg-navy-header text-white font-bold shadow-2xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {isEn ? 'Full Telemetry' : 'Telemetri Penuh'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
            {/* Regional Cards or Live Telemetry Table (7 Cols) */}
            {zoneViewMode === 'cards' ? (
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {zones.map((z) => (
                  <div
                    key={z.id}
                    onClick={() => setSelectedZoneModal(z)}
                    className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle flex flex-col justify-between hover:shadow-md hover:border-primary transition-all cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-space-xs">
                        <span className="font-headline-md text-title-md text-on-surface">
                          {isEn ? z.nameEn : z.nameMs}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-space-xs py-0.5 rounded-lg font-label-sm text-label-sm ${
                            z.uptime === '100%'
                              ? 'bg-status-approved-green-bg text-status-approved-green'
                              : 'bg-status-pending-amber-bg text-status-pending-amber'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              z.uptime === '100%'
                                ? 'bg-status-approved-green'
                                : 'bg-status-pending-amber'
                            }`}
                          />{' '}
                          {z.uptime} Uptime
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                        {isEn ? z.corridorsEn : z.corridorsMs}
                      </p>
                      <div className="space-y-space-xs">
                        <div className="flex justify-between font-label-sm text-label-sm">
                          <span className="text-secondary">
                            {isEn ? 'Regional Power Load' : 'Beban Kuasa Wilayah'}
                          </span>
                          <span className="font-code-metric text-on-surface">{z.powerLoad}</span>
                        </div>
                        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${z.loadPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-space-md mt-space-md flex items-center justify-between text-secondary border-t border-border-subtle/60">
                      <span className="font-label-sm text-label-sm uppercase font-semibold">
                        {z.billboards} Billboards
                      </span>
                      <span
                        className={`font-body-sm text-body-sm font-medium flex items-center gap-1 ${
                          z.isWarning ? 'text-status-pending-amber' : 'text-status-approved-green'
                        }`}
                      >
                        <span>{isEn ? z.statusTextEn : z.statusTextMs}</span>
                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-headline-md text-title-md text-on-surface">
                      {isEn
                        ? 'Live Substation & 3-Phase DB Telemetry Matrix'
                        : 'Matriks Telemetri Pencawang & Kotak DB 3-Fasa'}
                    </h3>
                    <p className="text-xs text-secondary">
                      {isEn
                        ? 'Real-time voltage, earth loop impedance (MS IEC 60364), and remote diagnostic ping.'
                        : 'Voltan masa nyata, rintangan bumi (MS IEC 60364), dan ujian ping diagnostik jauh.'}
                    </p>
                  </div>
                  <span className="font-code-metric text-xs px-2 py-1 rounded bg-status-approved-green-bg text-status-approved-green font-bold">
                    4 SUBSTATIONS ONLINE
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-navy-header text-white font-label-sm uppercase">
                        <th className="py-2.5 px-3">{isEn ? 'Zone' : 'Zon'}</th>
                        <th className="py-2.5 px-3">{isEn ? '3-Phase Supply' : 'Bekalan 3-Fasa'}</th>
                        <th className="py-2.5 px-3">{isEn ? 'Earth Loop (Ω)' : 'Bumi (Ω)'}</th>
                        <th className="py-2.5 px-3">{isEn ? 'SPD Arrester' : 'Pelindung SPD'}</th>
                        <th className="py-2.5 px-3 text-right">{isEn ? 'Diagnostic' : 'Diagnostik'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {zones.map((z) => (
                        <tr key={z.id} className="hover:bg-surface-canvas">
                          <td className="py-3 px-3">
                            <div className="font-bold text-on-surface">
                              {isEn ? z.nameEn : z.nameMs}
                            </div>
                            <div className="font-code-metric text-[11px] text-secondary">
                              {z.billboards} Assets • {z.powerLoad}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-code-metric text-on-surface">
                            {z.voltage3Phase}
                          </td>
                          <td className="py-3 px-3 font-code-metric text-status-approved-green font-semibold">
                            {z.earthOhms}
                          </td>
                          <td className="py-3 px-3 font-code-metric text-secondary">
                            {z.spdStatus}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleRunDiagnosticPing(z)}
                                className="px-2.5 py-1 rounded bg-primary text-white font-label-sm uppercase cursor-pointer hover:opacity-90"
                              >
                                {pingingZoneId === z.id
                                  ? isEn
                                    ? 'Pinging...'
                                    : 'Menguji...'
                                  : isEn
                                  ? 'Ping DB'
                                  : 'Uji DB'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedZoneModal(z)}
                                className="px-2 py-1 rounded border border-border-strong text-on-surface font-label-sm cursor-pointer hover:bg-surface-container"
                              >
                                {isEn ? 'Inspect' : 'Semak'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Interactive Map Visual Container (5 Cols) */}
            <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      satellite_alt
                    </span>
                    <span className="font-headline-md text-title-md text-on-surface">
                      {isEn
                        ? 'Peninsular Malaysia Highway Corridor Map'
                        : 'Peta Koridor Lebuhraya Semenanjung Malaysia'}
                    </span>
                  </div>
                  <span className="font-code-metric text-label-sm text-secondary">
                    GPS / TNB Substation
                  </span>
                </div>
                <div className="relative w-full h-64 rounded-lg bg-surface-container overflow-hidden shadow-inner flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 via-transparent to-transparent pointer-events-none" />
                  {/* Penang Pin */}
                  <button
                    type="button"
                    onClick={() => setSelectedZoneModal(zones[1])}
                    className="absolute top-1/4 left-1/4 flex flex-col items-center group cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-status-approved-green ring-4 ring-status-approved-green-bg animate-bounce" />
                    <span className="mt-1 px-1.5 py-0.5 rounded bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px]">
                      Penang (12)
                    </span>
                  </button>
                  {/* Klang Valley Pin */}
                  <button
                    type="button"
                    onClick={() => setSelectedZoneModal(zones[0])}
                    className="absolute top-1/2 left-2/5 flex flex-col items-center group cursor-pointer"
                  >
                    <span className="w-4 h-4 rounded-full bg-primary ring-4 ring-secondary-container animate-pulse" />
                    <span className="mt-1 px-1.5 py-0.5 rounded bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px]">
                      KL &amp; Selangor (22)
                    </span>
                  </button>
                  {/* Kuantan Pin */}
                  <button
                    type="button"
                    onClick={() => setSelectedZoneModal(zones[3])}
                    className="absolute top-1/3 right-1/4 flex flex-col items-center group cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full bg-status-approved-green ring-4 ring-status-approved-green-bg" />
                    <span className="mt-1 px-1.5 py-0.5 rounded bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px]">
                      Kuantan (4)
                    </span>
                  </button>
                  {/* JB Pin */}
                  <button
                    type="button"
                    onClick={() => setSelectedZoneModal(zones[2])}
                    className="absolute bottom-1/4 right-1/3 flex flex-col items-center group cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-status-pending-amber ring-4 ring-status-pending-amber-bg" />
                    <span className="mt-1 px-1.5 py-0.5 rounded bg-inverse-surface text-inverse-on-surface font-label-sm text-[10px]">
                      JB (10)
                    </span>
                  </button>
                </div>
              </div>
              <div className="mt-space-md pt-space-sm grid grid-cols-2 gap-space-sm text-center">
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      isEn ? 'Weather & Lux Sensors Online' : 'Sensor Cuaca & Lux Aktif',
                      isEn
                        ? 'All 18 astronomical twilight & rain sensors operating within nominal parameters.'
                        : 'Kesemua 18 sensor cuaca dan cahaya beroperasi secara normal.'
                    )
                  }
                  className="p-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <span className="block font-label-sm text-label-sm text-secondary uppercase">
                    {isEn ? 'Active Weather Sensors' : 'Sensor Cuaca Aktif'}
                  </span>
                  <span className="font-headline-md text-title-md text-on-surface font-code-metric">
                    18 Units Active
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      isEn ? 'SPD Surge Protection Status' : 'Status Pelindung Kilat SPD',
                      isEn
                        ? '40kA Type-2 Surge Protection Devices verified across all 48 outdoor DB panels.'
                        : 'Peranti Pelindung Lonjakan 40kA Jenis-2 disahkan pada semua 48 panel DB luar.'
                    )
                  }
                  className="p-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <span className="block font-label-sm text-label-sm text-secondary uppercase">
                    Surge Protection (SPD)
                  </span>
                  <span className="font-headline-md text-title-md text-status-approved-green font-code-metric">
                    100% Operational
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Master Module Directory (5 Active Operating Engines) */}
        <div className="space-y-space-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                {isEn ? 'System Architecture' : 'Seni Bina Sistem'}
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {isEn
                  ? 'Integrated BillboardOps Module Directory'
                  : 'Direktori Modul Bersepadu BillboardOps'}
              </h2>
            </div>
            <span className="font-body-sm text-body-sm text-secondary">
              5 Active Operating Engines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-space-md">
            {/* Module 01 */}
            <div
              onClick={() => onNavigate('s02-mint')}
              className="group bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[24px]">grid_view</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase">Module 01</span>
                  <h3 className="font-headline-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Field &amp; Repair Tickets
                  </h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Prompt fault response, LED streetlight &amp; spotlight monitoring, real-time contractor dispatch.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center justify-between text-secondary group-hover:text-primary transition-colors">
                <span className="font-label-sm text-label-sm">Open Module</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Module 02 */}
            <div
              onClick={() => onNavigate('f01-inventory')}
              className="group bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase">Module 02</span>
                  <h3 className="font-headline-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Stock &amp; Electrical Inventory
                  </h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Central warehouse, critical spare parts threshold alerts, weatherproof XLPE cables &amp; meter units.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center justify-between text-secondary group-hover:text-primary transition-colors">
                <span className="font-label-sm text-label-sm">Open Module</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Module 03 */}
            <div
              onClick={() => onNavigate('s04-approval', 'TKT-2024-084')}
              className="group bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[24px]">draw</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase">Module 03</span>
                  <h3 className="font-headline-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Approvals &amp; E-Signature
                  </h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Contractor geotag photo evidence review, authorized supervisor digital signature &amp; sign-off.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center justify-between text-secondary group-hover:text-primary transition-colors">
                <span className="font-label-sm text-label-sm">Open Module</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Module 04 */}
            <div
              onClick={() => onNavigate('s05-finance', 'TKT-2024-084')}
              className="group bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase">Module 04</span>
                  <h3 className="font-headline-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Audit &amp; Payment Vouchers
                  </h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  SHA-256 verified financial ledger, vendor invoice tracking, claims settlement &amp; PDF export.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center justify-between text-secondary group-hover:text-primary transition-colors">
                <span className="font-label-sm text-label-sm">Open Module</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Module 05 */}
            <div
              onClick={() => onNavigate('f06-logs')}
              className="group bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[24px]">summarize</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase">Module 05</span>
                  <h3 className="font-headline-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    MS IEC 60364 Safety Logs
                  </h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Earth resistance test archives, lightning surge logs &amp; scheduled client audit reports.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center justify-between text-secondary group-hover:text-primary transition-colors">
                <span className="font-label-sm text-label-sm">Open Module</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Layout: Registered Contractors Directory & Real-time System Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Registered Contractors Directory (8 Cols) */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle space-y-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                  External Contractor Compliance
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Registered Contractors &amp; Certified Wiremen Directory
                </h2>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-lg bg-surface-container-high text-on-surface font-code-metric text-label-sm">
                  6 Active Contractors (CIDB G3-G7)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-inverse-surface text-inverse-on-surface font-label-md text-label-md uppercase tracking-wider">
                    <th className="py-2.5 px-3 rounded-l-lg">Contractor Company</th>
                    <th className="py-2.5 px-3">ST / Wireman Cert</th>
                    <th className="py-2.5 px-3 text-center">Active Tasks</th>
                    <th className="py-2.5 px-3 text-right">SLA Response Score</th>
                    <th className="py-2.5 px-3 rounded-r-lg text-right">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
                  <tr
                    onClick={() => setSelectedZoneModal(zones[0])}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3">
                      <div className="font-label-lg text-body-md text-on-surface">
                        Apex Electrical Services Sdn Bhd
                      </div>
                      <div className="font-body-sm text-body-sm text-secondary">
                        Central Zone (Klang Valley &amp; PLUS)
                      </div>
                    </td>
                    <td className="py-3 px-3 font-code-metric text-on-surface">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                        ST Wireman PW4
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-code-metric font-semibold text-on-surface">
                      1 Task
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-code-metric font-semibold text-status-approved-green">98.4%</div>
                      <div className="text-[10px] text-secondary">Avg 42 min</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-status-approved-green-bg text-status-approved-green font-label-sm text-label-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-approved-green" /> Compliant (Cert Issued)
                      </span>
                    </td>
                  </tr>

                  <tr
                    onClick={() => setSelectedZoneModal(zones[1])}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3">
                      <div className="font-label-lg text-body-md text-on-surface">
                        Mega Power Volt Engineering
                      </div>
                      <div className="font-body-sm text-body-sm text-secondary">
                        Northern Zone (Penang Bridge &amp; Ipoh)
                      </div>
                    </td>
                    <td className="py-3 px-3 font-code-metric text-on-surface">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                        ST Engineer A4
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-code-metric font-semibold text-on-surface">
                      2 Tasks
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-code-metric font-semibold text-status-approved-green">99.1%</div>
                      <div className="text-[10px] text-secondary">Avg 28 min</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-status-pending-amber-bg text-status-pending-amber font-label-sm text-label-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-pending-amber" /> Voucher Under Review
                      </span>
                    </td>
                  </tr>

                  <tr
                    onClick={() => setSelectedZoneModal(zones[2])}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3">
                      <div className="font-label-lg text-body-md text-on-surface">
                        CityLight Infra Tech Enterprise
                      </div>
                      <div className="font-body-sm text-body-sm text-secondary">
                        Southern Zone (Johor Bahru &amp; Melaka)
                      </div>
                    </td>
                    <td className="py-3 px-3 font-code-metric text-on-surface">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                        ST Wireman PW3
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-code-metric font-semibold text-on-surface">
                      0 Tasks
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-code-metric font-semibold text-secondary">94.8%</div>
                      <div className="text-[10px] text-secondary">Avg 55 min</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-status-approved-green-bg text-status-approved-green font-label-sm text-label-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-approved-green" /> Standby
                      </span>
                    </td>
                  </tr>

                  <tr
                    onClick={() => setSelectedZoneModal(zones[3])}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3">
                      <div className="font-label-lg text-body-md text-on-surface">
                        Borneo &amp; East Coast Powergrid
                      </div>
                      <div className="font-body-sm text-body-sm text-secondary">
                        Eastern Zone (LPT Kuantan)
                      </div>
                    </td>
                    <td className="py-3 px-3 font-code-metric text-on-surface">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                        ST Wireman PW4
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-code-metric font-semibold text-on-surface">
                      0 Tasks
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-code-metric font-semibold text-status-approved-green">97.5%</div>
                      <div className="text-[10px] text-secondary">Avg 38 min</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-status-approved-green-bg text-status-approved-green font-label-sm text-label-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-approved-green" /> Standby
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-space-xs flex flex-wrap items-center justify-between gap-2 text-secondary font-label-sm text-label-sm">
              <span>
                All contractors maintain active CIDB public liability insurance coverage of RM2,000,000.
              </span>
              <button
                type="button"
                onClick={() => onNavigate('s03-contractor', 'TKT-2024-089')}
                className="text-primary hover:text-primary-dim font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                Manage Contractors <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Real-Time System Audit Trail (4 Cols) */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-border-subtle space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  history_toggle_off
                </span>
                <h3 className="font-headline-md text-title-md text-on-surface">
                  Real-Time Activity Log
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-approved-green-bg text-status-approved-green font-code-metric text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-status-approved-green animate-pulse" /> LIVE
              </span>
            </div>

            <div className="space-y-space-sm relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
              <div
                onClick={() => onNavigate('s04-approval', 'TKT-2024-084')}
                className="relative pl-7 group cursor-pointer"
              >
                <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-lowest" />
                <div className="font-label-md text-label-md text-on-surface group-hover:text-primary">
                  Supervisor Digital E-Sign Completed
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Supervisor <span className="font-semibold text-on-surface">Siti Zahara</span> approved cable
                  replacement for ticket{' '}
                  <span className="font-code-metric text-primary">#TKT-2024-084</span> (Federal Highway KM12.4).
                </p>
                <span className="font-code-metric text-[10px] text-secondary">
                  3 mins ago • Geotag Hash 8b4f1a
                </span>
              </div>

              <div
                onClick={() => onNavigate('f01-inventory')}
                className="relative pl-7 group cursor-pointer"
              >
                <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-status-pending-amber ring-4 ring-surface-container-lowest" />
                <div className="font-label-md text-label-md text-on-surface group-hover:text-primary">
                  Central Warehouse Stock Dispatch
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  4C 6mm cable dispatched 12m from Shah Alam Stockroom to Mega Power Volt.
                </p>
                <span className="font-code-metric text-[10px] text-secondary">
                  19 mins ago • Inv SKU-CBL-4C6
                </span>
              </div>

              <div
                onClick={() => onNavigate('s03-contractor', 'TKT-2024-089')}
                className="relative pl-7 group cursor-pointer"
              >
                <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-secondary ring-4 ring-surface-container-lowest" />
                <div className="font-label-md text-label-md text-on-surface group-hover:text-primary">
                  Emergency Field Dispatch
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Emergency ticket <span className="font-code-metric text-primary">#TKT-2024-089</span> assigned
                  to Apex Electrical technician for Lightning SPD fault.
                </p>
                <span className="font-code-metric text-[10px] text-secondary">
                  42 mins ago • SLA Active 2 Hrs
                </span>
              </div>

              <div
                onClick={() => onNavigate('s05-finance', 'TKT-2024-084')}
                className="relative pl-7 group cursor-pointer"
              >
                <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-status-approved-green ring-4 ring-surface-container-lowest" />
                <div className="font-label-md text-label-md text-on-surface group-hover:text-primary">
                  Finance Voucher Clearance
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Payment voucher invoice <span className="font-code-metric">INV-2024-0312</span> digital
                  archive integrity confirmed (RM4,250.00).
                </p>
                <span className="font-code-metric text-[10px] text-secondary">
                  1 hr ago • Batch #992-FIN
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('f06-logs')}
              className="w-full py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors text-center cursor-pointer"
            >
              View All System Audit Logs (2,410 Records)
            </button>
          </div>
        </div>

        {/* Executive Footer Information Card */}
        <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md text-secondary border border-border-subtle">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[28px]">
              shield_with_heart
            </span>
            <div>
              <span className="font-label-md text-label-md text-on-surface block font-semibold">
                BillboardOps Infrastructure Resilience Standard
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                In compliance with Malaysian Energy Commission Standards (MS IEC 60364) &amp; Electricity
                Regulations 1994.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="text-right hidden sm:block">
              <span className="font-label-sm text-label-sm text-on-surface block font-code-metric">
                Data Integrity: SHA-256
              </span>
              <span className="font-body-sm text-body-sm text-secondary">
                Fully Encrypted Database
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('f06-logs')}
              className="px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-sm text-label-sm transition-colors shadow-xs border border-border-subtle cursor-pointer"
            >
              Safety Audit Review
            </button>
          </div>
        </div>
      </div>

      {/* Zone / Contractor Inspector Modal */}
      {selectedZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-panel rounded-xl max-w-lg w-full p-space-lg border border-border-strong shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="font-code-metric text-xs text-primary font-bold uppercase">
                  {isEn ? 'REGIONAL SUBSTATION & CONTRACTOR INSPECTOR' : 'PEMERIKSA ZON & KONTRAKTOR'}
                </span>
                <h3 className="font-headline-md text-title-md font-bold text-on-surface">
                  {isEn ? selectedZoneModal.nameEn : selectedZoneModal.nameMs}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedZoneModal(null)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-surface-canvas p-3.5 rounded-lg border border-border-subtle font-code-metric text-xs">
              <div>
                <span className="text-secondary block font-sans text-[11px] uppercase">
                  {isEn ? 'Active Billboards' : 'Papan Iklan Aktif'}
                </span>
                <span className="text-on-surface font-bold text-sm">
                  {selectedZoneModal.billboards} Structures
                </span>
              </div>
              <div>
                <span className="text-secondary block font-sans text-[11px] uppercase">
                  {isEn ? 'Power Load & Uptime' : 'Beban Kuasa & Uptime'}
                </span>
                <span className="text-status-approved-green font-bold text-sm">
                  {selectedZoneModal.powerLoad} ({selectedZoneModal.uptime})
                </span>
              </div>
              <div>
                <span className="text-secondary block font-sans text-[11px] uppercase">
                  {isEn ? '3-Phase Feeder Voltage' : 'Voltan 3-Fasa'}
                </span>
                <span className="text-on-surface font-semibold">
                  {selectedZoneModal.voltage3Phase}
                </span>
              </div>
              <div>
                <span className="text-secondary block font-sans text-[11px] uppercase">
                  {isEn ? 'Earth Resistance' : 'Rintangan Bumi'}
                </span>
                <span className="text-status-approved-green font-semibold">
                  {selectedZoneModal.earthOhms}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-border-subtle">
                <span className="text-secondary block font-sans text-[11px] uppercase">
                  {isEn ? 'Appointed Panel Contractor' : 'Kontraktor Panel Dilantik'}
                </span>
                <span className="text-on-surface font-bold block">
                  {selectedZoneModal.contractor}
                </span>
                <span className="text-secondary text-[11px]">
                  {selectedZoneModal.wiremanCert} • {selectedZoneModal.spdStatus}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleRunDiagnosticPing(selectedZoneModal)}
                className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs uppercase cursor-pointer"
              >
                {isEn ? 'Ping Substation DB' : 'Ping Kotak DB'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetTicket = selectedZoneModal.linkedTicketId || 'TKT-2024-089';
                  setSelectedZoneModal(null);
                  onNavigate('s03-contractor', targetTicket);
                }}
                className="px-4 py-2 rounded-lg bg-status-pending-amber text-white font-label-md text-xs uppercase font-bold cursor-pointer"
              >
                {isEn ? 'Open Contractor Portal (S03) →' : 'Buka Portal Kontraktor (S03) →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary Report Modal */}
      {execReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-panel rounded-xl max-w-xl w-full p-space-lg border border-border-strong shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="font-code-metric text-xs text-primary font-bold uppercase">
                  Q4 2024 • SURUHANJAYA TENAGA &amp; CORPORATE AUDIT
                </span>
                <h3 className="font-headline-md text-title-md font-bold text-on-surface">
                  {isEn
                    ? 'Executive Operations & Electrical Telemetry Report'
                    : 'Laporan Eksekutif Operasi & Telemetri Elektrik'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExecReportModalOpen(false)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {zones.map((z) => (
                <div
                  key={z.id}
                  className="p-3 rounded-lg bg-surface-canvas border border-border-subtle flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-on-surface">
                      {isEn ? z.nameEn : z.nameMs}
                    </div>
                    <div className="text-secondary font-code-metric text-[11px]">
                      {z.contractor} • {z.voltage3Phase}
                    </div>
                  </div>
                  <div className="text-right font-code-metric">
                    <div className="font-bold text-on-surface">{z.powerLoad}</div>
                    <div className="text-status-approved-green font-semibold">
                      {z.uptime} SLA
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExecReportModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border-strong text-secondary font-label-md text-xs cursor-pointer"
              >
                {isEn ? 'Close' : 'Tutup'}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadExecutiveCsv();
                  setExecReportModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white font-label-md text-xs uppercase font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>{isEn ? 'Download Executive CSV' : 'Muat Turun CSV Eksekutif'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
