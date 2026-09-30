import React, { useState } from 'react';
import { IMAGES, LangMode, Ticket } from '../data/initialData';

interface ScreenS05FinanceProps {
  lang: LangMode;
  tickets: Ticket[];
  selectedTicketId: string;
  onSelectTicketId: (id: string) => void;
  onExportCsv: () => void;
  showToast: (title: string, message: string, isError?: boolean) => void;
}

export const ScreenS05Finance: React.FC<ScreenS05FinanceProps> = ({
  lang,
  tickets,
  selectedTicketId,
  onSelectTicketId,
  onExportCsv,
  showToast,
}) => {
  const isEn = lang === 'en';

  const [dateFilter, setDateFilter] = useState('current_month');
  const [locationFilter, setLocationFilter] = useState('all');
  const [contractorFilter, setContractorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'approved' | 'all'>('approved');
  const [vendorInvoiceModalOpen, setVendorInvoiceModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // In S05 screenshot, #TKT-2024-084, #TKT-2024-079, #TKT-2024-071, #TKT-2024-065 are shown in the audit list
  const auditTickets = tickets.filter((t) => {
    if (statusFilter === 'approved') {
      // Include the 4 canonical S05 audit tickets plus any newly approved ones
      const isCanonicalS05 = ['TKT-2024-084', 'TKT-2024-079', 'TKT-2024-071', 'TKT-2024-065'].includes(t.id);
      if (!isCanonicalS05 && t.status !== 'Approved for Payment') return false;
    }
    if (locationFilter === 'bb' && !t.location.toLowerCase().includes('bukit bintang')) return false;
    if (locationFilter === 'plus' && !t.location.toLowerCase().includes('plus') && !t.id.includes('079')) return false;
    if (locationFilter === 'sprint' && !t.location.toLowerCase().includes('sprint')) return false;
    if (locationFilter === 'mrr2' && !t.location.toLowerCase().includes('mrr2')) return false;

    if (contractorFilter === 'apex' && !t.contractor.toLowerCase().includes('apex')) return false;
    if (contractorFilter === 'mega' && !t.contractor.toLowerCase().includes('mega')) return false;

    return true;
  });

  const activeTicket =
    auditTickets.find((t) => t.id === selectedTicketId) ||
    auditTickets.find((t) => t.id === 'TKT-2024-084') ||
    auditTickets[0] ||
    tickets[0];

  const isUnapprovedDraft =
    statusFilter === 'all' &&
    activeTicket.status !== 'Approved for Payment' &&
    !['TKT-2024-084', 'TKT-2024-079', 'TKT-2024-071', 'TKT-2024-065'].includes(activeTicket.id);

  const handlePrintPdf = () => {
    if (isUnapprovedDraft) {
      showToast(
        isEn ? 'Export Blocked (F05)' : 'Eksport Disekat (F05)',
        isEn
          ? 'PDF Export is disabled for unapproved or draft status tickets per PRD F05.'
          : 'Eksport PDF dinyahaktifkan bagi tiket yang belum diluluskan mengikut PRD F05.',
        true
      );
      return;
    }
    showToast(
      isEn ? 'Generating Official PDF' : 'Menjana PDF Rasmi',
      isEn
        ? `Downloading signed high-resolution audit certificate ${activeTicket.pdfFilename}...`
        : `Memuat turun fail sijil bertandatangan resolusi tinggi ${activeTicket.pdfFilename}...`
    );
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleBulkExport = () => {
    setBulkModalOpen(true);
  };

  const handleDownloadInvoiceTxt = () => {
    const content = [
      '============================================================',
      'BILLBOARDOPS — OFFICIAL VENDOR TAX INVOICE & AP VOUCHER COPY',
      '============================================================',
      `Invoice Ref    : ${activeTicket.invoiceNumber}`,
      `Ticket ID      : #${activeTicket.id}`,
      `JCC Cert No.   : ${activeTicket.jccNumber}`,
      `Contractor     : ${activeTicket.contractor} (${activeTicket.cidbReg})`,
      `Asset Location : ${activeTicket.locationEn}`,
      `Approved Date  : ${activeTicket.approvedDateEn}`,
      '------------------------------------------------------------',
      'SPARE PARTS & ELECTRICAL WORKS:',
      ...activeTicket.partsUsed.map(
        (p) => `- ${p.sku} | ${p.name} | ${p.qty} ${p.unit} x RM ${p.unitCost.toFixed(2)} = RM ${(p.qty * p.unitCost).toFixed(2)}`
      ),
      '------------------------------------------------------------',
      `VERIFIED GRAND TOTAL: RM ${activeTicket.grandTotal.toFixed(2)}`,
      '============================================================',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `Vendor_Invoice_${activeTicket.id}.txt`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(
      isEn ? 'Vendor Invoice Downloaded' : 'Invois Vendor Dimuat Turun',
      `Vendor_Invoice_${activeTicket.id}.txt`
    );
  };

  const handleResetFilters = () => {
    setDateFilter('current_month');
    setLocationFilter('all');
    setContractorFilter('all');
    setStatusFilter('approved');
    showToast(
      isEn ? 'Filters Reset' : 'Penapis Ditetapkan',
      isEn ? 'Filters reset to default view.' : 'Senarai dipulihkan ke paparan piawai.'
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Read-Only Context Notification Bar */}
      <div className="px-space-lg py-2.5 bg-navy-header text-inverse-on-surface flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-status-pending-amber/20 text-status-pending-amber">
            <span className="material-symbols-outlined text-[15px]">lock</span>
          </span>
          <span className="font-label-md text-label-md tracking-wide uppercase text-status-pending-amber">
            {isEn ? 'FINANCIAL SECURITY MODE ACTIVE' : 'Mod Keselamatan Kewangan Aktif'}
          </span>
          <span className="text-secondary-fixed-dim text-body-sm hidden sm:inline">•</span>
          <span className="font-body-sm text-body-sm text-surface-dim">
            {isEn
              ? 'Read-Only Access — Finance & Procurement HQ Team'
              : 'Akses Baca-Sahaja (Read-Only) — Pasukan Kewangan & Perolehan Ibu Pejabat'}
          </span>
        </div>
        <div className="flex items-center gap-space-sm text-secondary-fixed-dim font-code-metric text-label-sm">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-inverse-surface border border-secondary/30">
            <span className="w-2 h-2 rounded-full bg-status-approved-green animate-pulse" />
            LEDGER INTEGRITY VERIFIED (SHA-256)
          </span>
          <span className="text-surface-dim hidden md:inline">
            {isEn ? 'Last Synced: 24 Oct 2024, 17:30 MYT' : 'Kemas kini: 24 Okt 2024, 17:30 MYT'}
          </span>
        </div>
      </div>

      {/* Screen Subheader & Filter Toolkit */}
      <div className="p-space-lg bg-surface-panel shadow-xs border-b border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                {isEn
                  ? 'Contractor Invoice Audit & Payment Clearance'
                  : 'Audit & Pelepasan Invois Kontraktor'}
              </h1>
              <span className="px-2 py-0.5 rounded-lg bg-surface-container text-on-secondary-fixed font-code-metric text-label-sm uppercase">
                S05 / F05
              </span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-0.5">
              {isEn
                ? 'Audit portal for contractor completed works, spare parts DB/LED verification, and official job completion certificate generation for vendor payment vouchers.'
                : 'Portal semakan dokumentasi kerja siap, verifikasi alat ganti DB/LED, dan eksport sijil rasmi bagi baucar bayaran vendor.'}
            </p>
          </div>

          {/* Bulk Actions & Primary Export CTAs */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 h-10 px-space-md bg-surface-panel hover:bg-surface-container-low text-on-surface border border-border-strong rounded-lg font-label-md text-label-md uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">
                table_chart
              </span>
              <span>{isEn ? 'Export to Excel (CSV)' : 'Muat Turun Excel (CSV)'}</span>
            </button>
            <button
              onClick={handleBulkExport}
              className="inline-flex items-center gap-1.5 h-10 px-space-md bg-status-pending-amber hover:bg-primary text-on-primary rounded-lg font-label-md text-label-md uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">sim_card_download</span>
              <span>
                {isEn
                  ? 'Export All Approved Reports (Bulk PDF)'
                  : 'Eksport Semua Laporan (Bulk PDF)'}
              </span>
            </button>
          </div>
        </div>

        {/* Filters Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-sm p-space-sm bg-surface-canvas rounded-lg border border-border-subtle">
          <div className="flex flex-col">
            <label className="font-label-sm text-label-sm text-secondary uppercase mb-1">
              {isEn ? 'Date Range' : 'Tempoh Masa'}
            </label>
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-10 pl-3 pr-8 bg-surface-panel border border-border-subtle rounded-lg font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none focus:ring-1 focus:ring-status-pending-amber"
              >
                <option value="q3_2024">Q3 2024 (Jul - Sep)</option>
                <option value="current_month">
                  {isEn ? 'Current Month (October 2024)' : 'Bulan Semasa (Oktober 2024)'}
                </option>
                <option value="year_2024">
                  {isEn ? 'Full Year 2024' : 'Sepanjang Tahun 2024'}
                </option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">
                calendar_month
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-label-sm text-label-sm text-secondary uppercase mb-1">
              {isEn ? 'Billboard Location' : 'Lokasi Papan Iklan'}
            </label>
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full h-10 pl-3 pr-8 bg-surface-panel border border-border-subtle rounded-lg font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none focus:ring-1 focus:ring-status-pending-amber"
              >
                <option value="all">
                  {isEn ? 'All Locations / Grid (Selangor & KL)' : 'Semua Lokasi Grid (Selangor & KL)'}
                </option>
                <option value="bb">Bukit Bintang Corridor</option>
                <option value="plus">
                  {isEn ? 'PLUS Highway Mainline' : 'Lebuhraya PLUS Utama'}
                </option>
                <option value="sprint">Sprint Damansara Axis</option>
                <option value="mrr2">MRR2 Ring Road Ampang</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">
                pin_drop
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-label-sm text-label-sm text-secondary uppercase mb-1">
              {isEn ? 'Contractor Company' : 'Nama Kontraktor'}
            </label>
            <div className="relative">
              <select
                value={contractorFilter}
                onChange={(e) => setContractorFilter(e.target.value)}
                className="w-full h-10 pl-3 pr-8 bg-surface-panel border border-border-subtle rounded-lg font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none focus:ring-1 focus:ring-status-pending-amber"
              >
                <option value="all">
                  {isEn ? 'All Panel Contractors' : 'Semua Kontraktor Panel'}
                </option>
                <option value="apex">Apex Electrical Services Sdn Bhd</option>
                <option value="mega">Mega Grid Engineering Works</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">
                engineering
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-label-sm text-label-sm text-secondary uppercase mb-1">
              {isEn ? 'Approval Status' : 'Status Kelulusan'}
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'approved' | 'all')}
                className="w-full h-10 pl-3 pr-8 bg-surface-panel border border-border-subtle rounded-lg font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none focus:ring-1 focus:ring-status-pending-amber"
              >
                <option value="approved">
                  {isEn ? 'Approved Only' : 'Diluluskan Sahaja (Approved)'}
                </option>
                <option value="all">
                  {isEn ? 'All Archive Statuses (Test F05)' : 'Semua Status Arkib (Uji F05)'}
                </option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]">
                verified
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleResetFilters}
              className="h-10 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md text-label-md uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>{isEn ? 'Reset Filters' : 'Set Semula Penapis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Telemetry Grid */}
      <div className="p-space-lg grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Stat 1 */}
        <div className="bg-surface-panel p-space-md rounded-lg shadow-xs border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              {isEn ? 'Total Approved Value' : 'Jumlah Nilai Diluluskan'}
            </span>
            <span className="p-2 rounded-lg bg-status-approved-green-bg text-status-approved-green">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight font-code-metric">
              RM 42,850.00
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-status-approved-green font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>
                {isEn ? '+12.4% vs previous quarter' : '+12.4% berbanding suku lepas'}
              </span>
            </div>
          </div>
          <div className="mt-space-sm pt-2 bg-surface-container-low px-2 py-1 rounded">
            <span className="font-code-metric text-label-sm text-secondary">
              {isEn
                ? 'Accounts Payable (AP Ledger): 28 Vouchers'
                : 'Akaun Belum Bayar (AP Ledger): 28 Baucar'}
            </span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-surface-panel p-space-md rounded-lg shadow-xs border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              {isEn ? 'Jobs Ready with Sign-off' : 'Pekerjaan Siap Bertandatangan'}
            </span>
            <span className="p-2 rounded-lg bg-surface-container text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[20px]">
                assignment_turned_in
              </span>
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight font-code-metric">
                28 {isEn ? 'Tickets' : 'Tiket'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-status-approved-green-bg text-status-approved-green font-code-metric text-label-sm font-semibold">
                {isEn ? '100% COMPLETE' : '100% LENGKAP'}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-secondary font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[14px] text-status-approved-green">
                task_alt
              </span>
              <span>
                {isEn
                  ? '100% Complete with Photos & E-Signatures'
                  : '100% Dilengkapi Foto & E-Tandatangan'}
              </span>
            </div>
          </div>
          <div className="mt-space-sm w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-status-approved-green h-full w-full rounded-full" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-surface-panel p-space-md rounded-lg shadow-xs border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              {isEn ? 'Avg. Approval Turnaround' : 'Purata Tempoh Kelulusan'}
            </span>
            <span className="p-2 rounded-lg bg-status-pending-amber-bg text-status-pending-amber">
              <span className="material-symbols-outlined text-[20px]">speed</span>
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight font-code-metric">
                1.8 {isEn ? 'Days' : 'Hari'}
              </span>
              <span className="font-label-sm text-label-sm text-status-approved-green">
                SLA: &lt; 3.0 {isEn ? 'Days' : 'Hari'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-secondary font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>
                {isEn
                  ? 'Vendor payment cycle shortened'
                  : 'Kitaran bayaran vendor dipendekkan'}
              </span>
            </div>
          </div>
          <div className="mt-space-sm pt-2 bg-surface-container-low px-2 py-1 rounded">
            <span className="font-code-metric text-label-sm text-secondary">
              {isEn
                ? 'Contractor submission to e-sign'
                : 'Daripada penyerahan kontraktor ke e-sign'}
            </span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-surface-panel p-space-md rounded-lg shadow-xs border border-border-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              {isEn ? 'Direct Inventory Savings' : 'Penjimatan Inventori Dalaman'}
            </span>
            <span className="p-2 rounded-lg bg-surface-container text-tertiary">
              <span className="material-symbols-outlined text-[20px]">savings</span>
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight font-code-metric">
              RM 8,400.00
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-secondary font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[14px] text-tertiary">
                inventory_2
              </span>
              <span>
                {isEn
                  ? 'Supplied directly from central depot'
                  : 'Bekalan komponen terus dari depoh'}
              </span>
            </div>
          </div>
          <div className="mt-space-sm pt-2 bg-surface-container-low px-2 py-1 rounded">
            <span className="font-code-metric text-label-sm text-secondary">
              {isEn
                ? 'Supplied directly from central depot at zero markup'
                : 'Tiada tokokan kos pihak ke-3 (Zero Markup)'}
            </span>
          </div>
        </div>
      </div>

      {/* Split Screen Interactive Audit & Preview Matrix */}
      <div className="px-space-lg pb-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: Ready for Payment Work Order Tickets (6 cols) */}
          <section className="lg:col-span-6 flex flex-col gap-space-md">
            <div className="bg-surface-panel rounded-lg shadow-xs border border-border-subtle overflow-hidden">
              {/* Column Subheader */}
              <div className="p-space-md bg-navy-header text-inverse-on-surface flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-status-pending-amber">
                    receipt_long
                  </span>
                  <h2 className="font-headline-md text-title-md uppercase tracking-wider">
                    {isEn
                      ? 'TICKETS READY FOR PAYMENT CLEARANCE'
                      : 'Senarai Tiket Sedia untuk Pembayaran'}
                  </h2>
                </div>
                <span className="font-code-metric text-label-sm bg-inverse-surface text-surface-container px-2 py-0.5 rounded">
                  {auditTickets.length} {isEn ? 'Displayed' : 'Paparan Dipilih'}
                </span>
              </div>

              {/* Table Controls / Context */}
              <div className="px-space-md py-2.5 bg-surface-container-low flex items-center justify-between text-body-sm">
                <span className="text-secondary font-label-sm text-label-sm uppercase">
                  {isEn
                    ? 'Select row to review A4 audit document on the right pane'
                    : 'Pilih baris untuk menyemak dokumen A4 di sebelah kanan'}
                </span>
                <span className="font-code-metric text-secondary text-label-sm">
                  {isEn ? 'Sorted by: Approval Date' : 'Susunan: Tarikh Kelulusan Terbaru'}
                </span>
              </div>

              {/* Ticket Cards List */}
              <div className="divide-y divide-border-subtle">
                {auditTickets.map((ticket) => {
                  const isSelected = activeTicket.id === ticket.id;
                  const isCanonicalApproved = ['TKT-2024-084', 'TKT-2024-079', 'TKT-2024-071', 'TKT-2024-065'].includes(ticket.id);
                  const isApprovedStatus = ticket.status === 'Approved for Payment' || isCanonicalApproved;

                  const s05TitleMs =
                    ticket.id === 'TKT-2024-084'
                      ? 'Bukit Bintang LED Screen (Tiang Gergasi 4-Sisi)'
                      : ticket.id === 'TKT-2024-079'
                      ? 'PLUS KM 24.5 Arah Utara (Gantry Unipole)'
                      : ticket.location;

                  const s05Icon =
                    ticket.id === 'TKT-2024-084' ? 'featured_video' : ticket.iconType;

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => {
                        onSelectTicketId(ticket.id);
                        showToast(
                          isEn ? 'Document Switched' : 'Dokumen Ditukar',
                          `${isEn ? 'Loaded audit certificate for' : 'Memuatkan sijil audit bagi'} ${
                            ticket.jccNumber
                          }`
                        );
                      }}
                      role="button"
                      tabIndex={0}
                      className={`p-space-md transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-status-pending-amber-bg/40 border-l-4 border-status-pending-amber'
                          : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-space-sm mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-code-metric text-title-md font-bold text-on-surface">
                            #{ticket.id}
                          </span>
                          {isApprovedStatus ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-label-sm text-label-sm bg-status-approved-green-bg text-status-approved-green border border-status-approved-green-border font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-approved-green" />
                              APPROVED FOR PAYMENT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-label-sm text-label-sm bg-status-assigned-red-bg text-status-assigned-red border border-status-assigned-red-border font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-assigned-red" />
                              UNAPPROVED / DRAFT
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-code-metric text-title-md font-bold text-on-surface">
                            RM {ticket.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="block font-label-sm text-label-sm text-secondary uppercase">
                            {isEn
                              ? ticket.invoiceNumber.replace('Invois', 'Invoice')
                              : ticket.invoiceNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-on-surface font-title-md text-label-lg mb-1">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">
                          {s05Icon}
                        </span>
                        <span>{isEn ? ticket.locationEn : s05TitleMs}</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-secondary mb-3">
                        {isEn
                          ? `Fault: ${ticket.faultShortEn}`
                          : `Kerosakan: ${ticket.faultShort}`}
                      </p>

                      {/* Metatags and Auditor Verification Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 bg-surface-panel p-2 rounded">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-code-metric text-label-sm text-on-surface bg-surface-container-high px-2 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[14px] text-status-approved-green">
                              photo_camera
                            </span>
                            {ticket.id === 'TKT-2024-084'
                              ? isEn
                                ? '2 Photo proofs'
                                : '2 Bukti Foto Lampiran'
                              : ticket.id === 'TKT-2024-079'
                              ? isEn
                                ? '4 Photo proofs'
                                : '4 Bukti Foto Lampiran'
                              : ticket.id === 'TKT-2024-071'
                              ? isEn
                                ? '3 Photo proofs'
                                : '3 Bukti Foto Lampiran'
                              : isEn
                              ? '5 Photo proofs'
                              : '5 Bukti Foto Lampiran'}
                          </span>
                          <span className="inline-flex items-center gap-1 font-code-metric text-label-sm text-on-surface bg-surface-container-high px-2 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[14px] text-status-approved-green">
                              history_edu
                            </span>
                            {isEn
                              ? 'E-Signed: Siti Zahara'
                              : 'E-Signed: Siti Zahara (Penyelia)'}
                          </span>
                        </div>
                        <span className="font-code-metric text-label-sm text-secondary">
                          {isEn ? ticket.approvedDateEn : ticket.approvedDate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Summary of Column */}
              <div className="p-space-md bg-surface-canvas flex items-center justify-between border-t border-border-subtle">
                <span className="font-body-sm text-body-sm text-secondary">
                  {isEn
                    ? `Showing ${auditTickets.length} of 28 approved tickets`
                    : `Menunjukkan ${auditTickets.length} daripada 28 tiket kelulusan siap`}
                </span>
                <button
                  onClick={() => {
                    const nextStatus = statusFilter === 'approved' ? 'all' : 'approved';
                    setStatusFilter(nextStatus);
                    showToast(
                      isEn
                        ? nextStatus === 'all'
                          ? 'Full Archive Loaded'
                          : 'Showing Approved Only'
                        : nextStatus === 'all'
                        ? 'Semua Arkib Dimuatkan'
                        : 'Menunjukkan Diluluskan Sahaja',
                      isEn
                        ? nextStatus === 'all'
                          ? 'Displaying all tickets including pending & draft records.'
                          : 'Filtered back to approved payment vouchers only.'
                        : 'Senarai dikemas kini.'
                    );
                  }}
                  className="font-label-md text-label-md text-primary hover:text-primary-container flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <span>
                    {statusFilter === 'all'
                      ? isEn
                        ? 'Show Approved Only'
                        : 'Tunjuk Lulus Sahaja'
                      : isEn
                      ? 'Load Archived & All Statuses'
                      : 'Muat Arkib Terdahulu'}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Interactive PDF Document Preview Pane (6 cols) */}
          <section className="lg:col-span-6 flex flex-col gap-space-md sticky top-20">
            {/* Document Action Toolbar */}
            <div className="bg-surface-panel p-space-sm rounded-lg shadow-xs border border-border-subtle flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-status-approved-green-bg text-status-approved-green">
                  <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                </span>
                <div>
                  <span className="font-headline-md text-label-lg font-bold block text-on-surface">
                    {isEn
                      ? 'Preview Official Audit Document'
                      : 'Pratonton Dokumen Audit Rasmi'}
                  </span>
                  <span className="font-code-metric text-label-sm text-secondary">
                    {activeTicket.pdfFilename}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVendorInvoiceModalOpen(true)}
                  className="inline-flex items-center gap-1 h-9 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-label-md text-label-md transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  <span>{isEn ? 'Review Vendor Invoice' : 'Semak Invois Vendor'}</span>
                </button>
                <button
                  onClick={handlePrintPdf}
                  disabled={isUnapprovedDraft}
                  className={`inline-flex items-center gap-1.5 h-9 px-4 rounded font-label-md text-label-md uppercase tracking-wider transition-colors shadow-xs cursor-pointer ${
                    isUnapprovedDraft
                      ? 'bg-border-strong text-secondary cursor-not-allowed'
                      : 'bg-status-approved-green hover:bg-status-approved-green/90 text-on-primary'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>
                    {isEn ? 'PRINT / DOWNLOAD PDF' : 'Cetak / Muat Turun PDF'}
                  </span>
                </button>
              </div>
            </div>

            {/* Simulated A4 White Paper Container */}
            <div
              className="bg-surface-panel rounded-lg shadow-md border border-border-subtle p-space-lg lg:p-space-xl relative overflow-hidden"
              id="printable-voucher-area"
            >
              {/* Top Watermark & Header Grid */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-on-surface pb-space-md mb-space-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 bg-navy-header text-on-primary flex items-center justify-center rounded font-headline-md font-bold text-label-lg">
                      BO
                    </span>
                    <div>
                      <h3 className="font-headline-md text-label-lg font-bold uppercase tracking-tight text-on-surface">
                        BILLBOARDOPS ELECTRICAL ENGINEERING
                      </h3>
                      <p className="font-body-sm text-label-sm text-secondary">
                        {isEn
                          ? 'Technical Operations & Infrastructure Management Dept.'
                          : 'Jabatan Operasi Teknikal & Pengurusan Aset Infrastruktur'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-headline-md text-title-md font-bold text-navy-header uppercase block tracking-wide">
                      {isEn
                        ? 'JOB COMPLETION CERTIFICATE & ELECTRICAL VERIFICATION'
                        : 'SIJIL PENYELESAIAN KERJA & PENGESAHAN ELEKTRIK'}
                    </span>
                    <span className="font-body-sm text-label-sm text-secondary font-medium tracking-widest uppercase">
                      {isEn
                        ? '(FINANCE AUDIT COPY)'
                        : '(JOB COMPLETION CERTIFICATE - FINANCE AUDIT COPY)'}
                    </span>
                  </div>
                </div>

                {/* Reference Metadata Box */}
                <div className="bg-surface-canvas p-space-sm rounded text-right min-w-[190px]">
                  <div className="font-label-sm text-label-sm text-secondary uppercase">
                    {isEn ? 'AUDIT REF:' : 'No. Rujukan Audit:'}
                  </div>
                  <div className="font-code-metric text-label-lg font-bold text-primary">
                    {activeTicket.jccNumber}
                  </div>
                  <div className="mt-1 text-label-sm text-secondary">
                    {isEn ? 'Date: ' : 'Tarikh Sah: '}
                    <span className="font-code-metric font-semibold text-on-surface">
                      {isEn ? activeTicket.approvedDateEn : activeTicket.approvedDate}
                    </span>
                  </div>
                  <div className="text-label-sm text-secondary">
                    Status:{' '}
                    <span className="text-status-approved-green font-bold">
                      {isEn ? 'APPROVED FOR PAYMENT' : 'LULUS BAYAR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 1: Billboard Asset & Contractor Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mb-space-md bg-surface-canvas p-space-md rounded">
                <div>
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                    {isEn ? 'Billboard Specifications' : 'Spesifikasi Papan Iklan'}
                  </span>
                  <div className="font-headline-md text-label-lg font-bold text-on-surface">
                    {activeTicket.id === 'TKT-2024-084'
                      ? 'BB-084: Bukit Bintang Commercial LED'
                      : `${activeTicket.billboardCode}: ${activeTicket.locationEn}`}
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                    {isEn ? activeTicket.addressFullEn : activeTicket.addressFull}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-label-sm text-secondary">
                    <span className="font-semibold text-on-surface">
                      {isEn ? 'Display Type:' : 'Jenis Paparan:'}
                    </span>
                    <span className="font-code-metric">{activeTicket.displayType}</span>
                  </div>
                </div>
                <div className="md:border-l md:border-border-subtle md:pl-space-md">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block mb-1">
                    {isEn ? 'Appointed Contractor' : 'Kontraktor Dilantik'}
                  </span>
                  <div className="font-headline-md text-label-lg font-bold text-on-surface">
                    {activeTicket.id === 'TKT-2024-084'
                      ? 'Apex Electrical Services Sdn Bhd'
                      : activeTicket.contractor}
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                    {isEn
                      ? `CIDB / Energy Commission Reg: ${activeTicket.cidbReg}`
                      : `No. Pendaftaran CIDB / Suruhanjaya Tenaga: ${activeTicket.cidbReg}`}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-label-sm text-secondary">
                    <span className="font-semibold text-on-surface">
                      {isEn ? 'Lead Wireman:' : 'Ketua Juruteknik:'}
                    </span>
                    <span>Rashid bin Osman (PW4 Wireman)</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Replaced Spare Parts & Inventory Requisition Table */}
              <div className="mb-space-md">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-label-sm text-label-sm text-navy-header uppercase font-bold tracking-wide">
                    {isEn
                      ? 'Spare Parts Consumed Details'
                      : 'Butiran Alat Ganti Elektrik Digunakan'}
                  </span>
                  <span className="font-code-metric text-label-sm text-secondary">
                    {isEn ? 'Inventory Issue Code S01' : 'Pengeluaran Kod Inventori S01'}
                  </span>
                </div>
                <table className="w-full text-left bg-surface-panel rounded overflow-hidden">
                  <thead className="bg-navy-header text-on-primary font-label-sm text-label-sm uppercase">
                    <tr>
                      <th className="p-2">{isEn ? 'SKU CODE' : 'Kod SKU'}</th>
                      <th className="p-2">
                        {isEn ? 'COMPONENT DESCRIPTION' : 'Deskripsi Komponen'}
                      </th>
                      <th className="p-2 text-center">{isEn ? 'QTY' : 'Kuantiti'}</th>
                      <th className="p-2 text-right">{isEn ? 'UNIT COST' : 'Kos Unit'}</th>
                      <th className="p-2 text-right">{isEn ? 'TOTAL' : 'Jumlah'}</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm divide-y divide-border-subtle">
                    {activeTicket.partsUsed.map((part) => (
                      <tr key={part.id} className="hover:bg-surface-canvas">
                        <td className="p-2 font-code-metric font-semibold text-on-surface">
                          {part.sku}
                        </td>
                        <td className="p-2 text-on-surface">{part.name}</td>
                        <td className="p-2 text-center font-code-metric">
                          {part.qty} {part.unit}
                        </td>
                        <td className="p-2 text-right font-code-metric">
                          RM {part.unitCost.toFixed(2)}
                        </td>
                        <td className="p-2 text-right font-code-metric font-semibold">
                          RM {(part.qty * part.unitCost).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-surface-canvas font-code-metric font-bold text-on-surface border-t-2 border-border-strong">
                    <tr>
                      <td
                        className="p-2 text-right uppercase text-secondary font-label-md text-label-md"
                        colSpan={4}
                      >
                        {isEn
                          ? 'TOTAL CONTRACTOR CLAIM:'
                          : 'Jumlah Keseluruhan Tuntutan Kontraktor:'}
                      </td>
                      <td className="p-2 text-right text-title-md text-status-approved-green">
                        RM{' '}
                        {activeTicket.grandTotal.toLocaleString('en-MY', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Section 3: Photo Evidence Embedded Strip */}
              <div className="mb-space-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm text-navy-header uppercase font-bold tracking-wide">
                    {isEn
                      ? 'CONSOLIDATED PHOTO EVIDENCE (VERIFIED & AUDITED)'
                      : 'Bukti Bergambar Bersepadu (Photo Evidence Attached)'}
                  </span>
                  <span className="font-code-metric text-label-sm text-status-approved-green flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    {isEn ? 'Supervisor Verified' : 'Telah Disahkan oleh Penyelia'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-space-sm">
                  {/* Evidence 1 */}
                  <div className="relative rounded overflow-hidden aspect-video bg-navy-header flex flex-col justify-end">
                    <img
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Ujian Nyalaan Lampu Papan Iklan"
                      src={IMAGES.s05Evidence1}
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 p-2 bg-gradient-to-t from-navy-header via-navy-header/80 to-transparent flex items-center justify-between text-on-primary">
                      <span className="font-label-sm text-label-sm">
                        {isEn ? 'Night Burn-in Test' : 'Ujian Nyalaan Lampu Papan Iklan'}
                      </span>
                      <span className="font-code-metric text-label-sm text-secondary-fixed">
                        {isEn ? '24-OCT-2024 16:42' : '24-OKT-2024 16:42'}
                      </span>
                    </div>
                  </div>
                  {/* Evidence 2 */}
                  <div className="relative rounded overflow-hidden aspect-video bg-navy-header flex flex-col justify-end">
                    <img
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Pemasangan Timer & MCB di Panel DB"
                      src={IMAGES.s05Evidence2}
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 p-2 bg-gradient-to-t from-navy-header via-navy-header/80 to-transparent flex items-center justify-between text-on-primary">
                      <span className="font-label-sm text-label-sm">
                        {isEn
                          ? 'Panel Timer & MCB Installation'
                          : 'Pemasangan Timer & MCB di Panel DB'}
                      </span>
                      <span className="font-code-metric text-label-sm text-secondary-fixed">
                        {isEn ? '24-OCT-2024 16:15' : '24-OKT-2024 16:15'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Digital Approval Stamp, E-Signature & Audit Hash Box */}
              <div className="p-space-md bg-status-approved-green-bg/60 rounded border border-status-approved-green-border">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
                  {/* E-Signature Graphic */}
                  <div className="md:col-span-5 flex flex-col">
                    <span className="font-label-sm text-label-sm text-secondary uppercase mb-1">
                      {isEn
                        ? 'FIELD SUPERVISOR SIGNATURE'
                        : 'Tandatangan Digital Penyelia Tapak'}
                    </span>
                    <div className="h-20 bg-surface-panel rounded p-2 flex flex-col justify-between relative shadow-xs border border-border-subtle">
                      {activeTicket.signatureDataUrl ? (
                        <img
                          src={activeTicket.signatureDataUrl}
                          alt="Supervisor E-Signature"
                          className="h-10 object-contain mx-auto"
                        />
                      ) : (
                        <svg
                          className="w-full h-10 text-on-surface"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          viewBox="0 0 200 50"
                        >
                          <path d="M 15 35 Q 35 10 55 25 T 90 20 Q 110 40 135 15 T 170 30 Q 185 20 195 28" />
                          <path
                            d="M 40 45 L 140 40"
                            strokeDasharray="3 3"
                            strokeWidth="1.5"
                          />
                        </svg>
                      )}
                      <div className="flex items-center justify-between border-t border-border-subtle pt-1 font-body-sm text-label-sm text-secondary">
                        <span className="font-bold text-on-surface">
                          Siti Zahara binti Kamaruddin
                        </span>
                        <span>
                          {isEn ? 'Head of Technical Operations' : 'Ketua Operasi Teknikal'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Official Seal / Stamp */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-status-approved-green p-1 flex flex-col items-center justify-center bg-surface-panel shadow-xs">
                      <span className="material-symbols-outlined text-status-approved-green text-[22px]">
                        verified
                      </span>
                      <span className="font-headline-md font-bold text-[9px] leading-tight text-status-approved-green uppercase tracking-tighter">
                        APPROVED FOR PAYMENT
                      </span>
                      <span className="font-code-metric text-[8px] text-secondary mt-0.5">
                        BILLBOARDOPS HQ
                      </span>
                    </div>
                  </div>

                  {/* Verification Timestamp & Ledger SHA-256 Hash */}
                  <div className="md:col-span-4 flex flex-col font-code-metric text-label-sm text-secondary">
                    <span className="font-label-sm text-label-sm uppercase text-secondary font-sans font-semibold mb-0.5">
                      {isEn ? 'AUDIT INTEGRITY & TIME' : 'Integriti Audit & Masa'}
                    </span>
                    <div className="text-on-surface font-semibold">
                      {isEn
                        ? '24-OCT-2024 • 17:15:22 MYT'
                        : '24-OKT-2024 • 17:15:22 MYT'}
                    </div>
                    <div className="text-[11px] text-secondary mt-1">
                      {isEn ? 'Audit Ledger Hash (SHA-256):' : 'Audit Ledger Hash:'}
                    </div>
                    <div className="text-[10px] break-all bg-surface-panel p-1.5 rounded font-mono text-on-surface border border-border-subtle">
                      e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-status-approved-green text-[11px]">
                      <span className="material-symbols-outlined text-[14px]">lock_reset</span>
                      <span>Cryptographically Sealed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Compliance */}
              <div className="mt-space-md pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between text-secondary font-label-sm text-label-sm">
                <span>
                  {isEn
                    ? 'Billboard Maintenance Electrical Inventory System (v1.0.0) • Valid Financial Document under Procurement Act 2024'
                    : 'Billboard Maintenance Electrical Inventory System (v1.0.0) • Dokumen Kewangan Sah Di Bawah Akta Perolehan 2024'}
                </span>
                <span className="font-code-metric">
                  {isEn ? 'Page 1 of 1 (A4)' : 'Muka Surat 1 daripada 1 (A4)'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Vendor Invoice Modal */}
      {vendorInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-panel rounded-xl max-w-lg w-full p-space-lg shadow-2xl border border-border-strong space-y-space-md">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="font-label-sm text-secondary uppercase">
                  {isEn
                    ? 'Original Contractor Invoice Copy (Read-Only)'
                    : 'Salinan Invois Asal Kontraktor (Read-Only)'}
                </span>
                <h3 className="font-headline-md text-title-md text-on-surface font-bold">
                  {activeTicket.invoiceNumber} — {activeTicket.contractor}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVendorInvoiceModalOpen(false)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="bg-surface-canvas p-4 rounded-lg border border-border-subtle space-y-2 text-body-sm">
              <div className="flex justify-between">
                <span className="text-secondary">
                  {isEn ? 'Reference Ticket ID:' : 'No. Tiket Rujukan:'}
                </span>
                <span className="font-code-metric font-bold">#{activeTicket.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">
                  {isEn ? 'JCC Certificate No.:' : 'No. Sijil JCC:'}
                </span>
                <span className="font-code-metric font-bold text-primary">
                  {activeTicket.jccNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">
                  {isEn ? 'Asset Location:' : 'Lokasi Aset:'}
                </span>
                <span className="font-semibold text-right">
                  {isEn ? activeTicket.locationEn : activeTicket.location}
                </span>
              </div>
              <div className="flex justify-between border-t border-border-subtle pt-2">
                <span className="font-bold">
                  {isEn ? 'Verified Claim Total:' : 'Jumlah Tuntutan Disahkan:'}
                </span>
                <span className="font-code-metric font-bold text-status-approved-green text-title-md">
                  RM {activeTicket.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setVendorInvoiceModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border-strong text-secondary font-label-md cursor-pointer"
              >
                {isEn ? 'Close' : 'Tutup'}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadInvoiceTxt();
                  setVendorInvoiceModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-header text-white font-label-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>{isEn ? 'Download Invoice (.TXT)' : 'Muat Turun Invois (.TXT)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Export Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-panel rounded-xl max-w-lg w-full p-space-lg shadow-2xl border border-border-strong space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="font-code-metric text-xs text-status-approved-green font-bold uppercase">
                  BATCH EXPORT • SHA-256 VERIFIED
                </span>
                <h3 className="font-headline-md text-title-md text-on-surface font-bold">
                  {isEn
                    ? 'Bulk Job Completion Certificates (JCC) & AP Vouchers'
                    : 'Eksport Pukal Sijil JCC & Baucar Bayaran'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
              {auditTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-lg bg-surface-canvas border border-border-subtle flex items-center justify-between"
                >
                  <div>
                    <div className="font-code-metric font-bold text-on-surface">
                      #{t.id} • {t.jccNumber}
                    </div>
                    <div className="text-secondary">{t.contractor}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-code-metric font-bold text-status-approved-green">
                      RM {t.grandTotal.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTicketId(t.id);
                        setBulkModalOpen(false);
                      }}
                      className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high font-label-sm uppercase cursor-pointer"
                    >
                      {isEn ? 'Select' : 'Pilih'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border-strong text-secondary font-label-md text-xs cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Batal'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportCsv();
                  setBulkModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-header text-white font-label-md text-xs uppercase cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">table_chart</span>
                <span>{isEn ? 'Download Batch CSV' : 'Muat Turun CSV Pukal'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBulkModalOpen(false);
                  handlePrintPdf();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-status-approved-green text-white font-label-md text-xs uppercase font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>{isEn ? 'Print Current JCC PDF' : 'Cetak Sijil JCC Semasa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
