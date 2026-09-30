import React, { useState } from 'react';
import {
  BILLBOARD_LOCATIONS,
  BillboardSite,
  IMAGES,
  InventoryItem,
  LangMode,
  RoleMode,
  ScreenId,
  Ticket,
} from '../data/initialData';

interface ScreenS02MintProps {
  lang?: LangMode;
  tickets: Ticket[];
  inventory: InventoryItem[];
  sites?: BillboardSite[];
  role: RoleMode;
  layoutStyle?: 'enterprise' | 'mint-classic';
  onToggleLayoutStyle?: (style: 'enterprise' | 'mint-classic') => void;
  onNavigate: (screen: ScreenId, ticketId?: string) => void;
  onCreateTicket: (data: {
    billboardCode: string;
    location: string;
    priority: 'Tinggi' | 'Sederhana' | 'Segera' | 'Rendah';
    contractor: string;
    faultDescription: string;
  }) => { ok: boolean; error?: string; ticket?: Ticket };
  onOpenReportModal: () => void;
  onOpenStockModal: () => void;
  onOpenMasterDataModal?: (tab?: 'sites' | 'equipment' | 'tickets') => void;
  onExportInventoryCsv: () => void;
  showToast: (title: string, message: string, isError?: boolean) => void;
}

export const ScreenS02Mint: React.FC<ScreenS02MintProps> = ({
  lang = 'en',
  tickets,
  inventory,
  sites = BILLBOARD_LOCATIONS,
  role,
  layoutStyle = 'enterprise',
  onToggleLayoutStyle,
  onNavigate,
  onCreateTicket,
  onOpenReportModal,
  onOpenStockModal,
  onOpenMasterDataModal,
  onExportInventoryCsv,
  showToast,
}) => {
  const isEn = lang === 'en';
  const isClassicMint = layoutStyle === 'mint-classic';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'Assigned' | 'Pending Approval' | 'Approved for Payment' | 'Archived'
  >('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrTicketModal, setQrTicketModal] = useState<Ticket | null>(null);

  // Quick inline form F02 state
  const [quickBillboard, setQuickBillboard] = useState('');
  const [customSiteMode, setCustomSiteMode] = useState(false);
  const [customSiteCode, setCustomSiteCode] = useState('BB-007');
  const [customSiteLocation, setCustomSiteLocation] = useState('');
  const [quickPriority, setQuickPriority] = useState<'Tinggi' | 'Sederhana' | 'Segera' | 'Rendah'>(
    'Sederhana'
  );
  const [quickContractor, setQuickContractor] = useState('MegaVolt Engineering Sdn Bhd');
  const [quickFault, setQuickFault] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const assignedCount = tickets.filter((t) => t.status === 'Assigned').length;
  const pendingCount = tickets.filter((t) => t.status === 'Pending Approval').length;
  const approvedCount = tickets.filter((t) => t.status === 'Approved for Payment').length;
  const criticalStockCount = inventory.filter(
    (item) =>
      item.quantity <= item.minThreshold ||
      item.levelType === 'critical' ||
      item.levelType === 'low'
  ).length;

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !searchQuery.trim() ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.locationEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.billboardCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'Archived') return t.status === 'Approved for Payment';
    return t.status === statusFilter;
  });

  const handleCopyLink = (url: string, ticketId: string) => {
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedId(ticketId);
    showToast(
      isEn ? 'Contractor Link Copied' : 'Pautan Disalin!',
      isEn
        ? 'Unique contractor portal URL copied to clipboard.'
        : 'Pautan Kontraktor berjaya disalin ke papan klip!'
    );
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (role === 'finance') {
      setFormError(
        isEn
          ? 'Access Denied: Finance (Read-Only) role cannot create new tickets.'
          : 'Akses Ditolak: Peranan Kewangan (Read-Only) tidak dibenarkan mencipta tiket baru.'
      );
      return;
    }

    if (!customSiteMode && !quickBillboard) {
      setFormError(
        isEn ? 'Please select a Billboard ID / Location.' : 'Sila pilih ID / Lokasi Papan Iklan.'
      );
      return;
    }

    if (customSiteMode && (!customSiteCode.trim() || !customSiteLocation.trim())) {
      setFormError(
        isEn
          ? 'Please enter both Custom Site ID and Location Name.'
          : 'Sila masukkan Kod Site dan Nama Lokasi.'
      );
      return;
    }

    if (!quickFault.trim()) {
      setFormError(
        isEn
          ? 'Please enter electrical fault details.'
          : 'Sila masukkan perincian kerosakan elektrik.'
      );
      return;
    }

    const foundLoc = sites.find((b) => b.code === quickBillboard);
    const finalCode = customSiteMode ? customSiteCode.trim().toUpperCase() : quickBillboard;
    const finalLocation = customSiteMode
      ? customSiteLocation.trim()
      : foundLoc
      ? foundLoc.shortNameEn
      : quickBillboard;

    const result = onCreateTicket({
      billboardCode: finalCode,
      location: finalLocation,
      priority: quickPriority,
      contractor: quickContractor,
      faultDescription: quickFault.trim(),
    });

    if (!result.ok) {
      setFormError(result.error || (isEn ? 'Failed to create ticket.' : 'Gagal mencipta tiket.'));
      return;
    }

    setQuickBillboard('');
    setCustomSiteLocation('');
    setQuickFault('');
  };

  return (
    <div
      className={
        isClassicMint
          ? 'bg-mint-surface font-body text-mint-on-surface antialiased min-h-screen flex flex-col'
          : 'bg-surface-canvas font-body text-on-surface antialiased flex flex-col'
      }
    >
      {/* TopNavBar when in S02 Classic Mint Mode */}
      {isClassicMint && (
        <div className="relative flex h-auto w-full flex-col bg-white group/design-root overflow-x-hidden border-b border-border-subtle">
          <div className="layout-container flex h-full grow flex-col">
            <div className="px-4 md:px-12 xl:px-24 flex flex-1 justify-center py-3">
              <div className="layout-content-container flex flex-col max-w-[1280px] flex-1">
                <header className="flex flex-wrap items-center justify-between gap-4 whitespace-nowrap border-b border-solid border-b-[#f2f3f2] px-4 lg:px-6 py-3">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div
                      onClick={() => onNavigate('s01-hub')}
                      className="flex items-center gap-3 text-[#141514] cursor-pointer"
                    >
                      <div className="size-5 text-[#141514]">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <h2 className="text-[#141514] text-base md:text-lg font-bold leading-tight tracking-[-0.015em]">
                        Billboard Maintenance &amp; Electrical Inventory
                      </h2>
                    </div>
                    <nav className="flex items-center gap-6 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onNavigate('s01-hub')}
                        className="text-[#141514] hover:text-mint-primary text-sm font-medium leading-normal transition-colors cursor-pointer"
                      >
                        {isEn ? 'Operations Hub' : 'Dashboard'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('f01-inventory')}
                        className="text-[#141514] hover:text-mint-primary text-sm font-medium leading-normal transition-colors cursor-pointer"
                      >
                        {isEn ? 'Inventory (F01)' : 'Inventori (F01)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('s02-mint')}
                        className="text-mint-primary font-bold border-b-2 border-mint-primary pb-0.5 text-sm leading-normal cursor-pointer"
                      >
                        {isEn ? 'Fault Tickets' : 'Tiket Kerosakan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('s04-approval', 'TKT-2024-084')}
                        className="text-[#141514] hover:text-mint-primary text-sm font-medium leading-normal transition-colors cursor-pointer"
                      >
                        {isEn ? 'Approvals & E-Sign' : 'Kelulusan & E-Sign'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('s05-finance', 'TKT-2024-084')}
                        className="text-[#141514] hover:text-mint-primary text-sm font-medium leading-normal transition-colors cursor-pointer"
                      >
                        {isEn ? 'Finance & Audit' : 'Kewangan & Audit'}
                      </button>
                    </nav>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    {onToggleLayoutStyle && (
                      <button
                        type="button"
                        onClick={() => onToggleLayoutStyle('enterprise')}
                        className="px-3 py-1.5 rounded-lg bg-navy-header text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[15px]">dock_to_right</span>
                        <span>{isEn ? 'Enterprise Pro Mode' : 'Mod Enterprise Pro'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onOpenReportModal}
                      disabled={role === 'finance'}
                      className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 px-4 bg-[#5d7e6b] hover:bg-[#4c6b59] text-white text-sm font-bold leading-normal tracking-[0.015em] transition ${
                        role === 'finance' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="truncate">
                        {isEn ? '+ Report Fault' : '+ Lapor Kerosakan'}
                      </span>
                    </button>
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-[#dfe1e0] shrink-0"
                      title="Siti Zahara — Head of Technical Operations"
                      style={{ backgroundImage: `url("${IMAGES.avatarS02}")` }}
                    />
                  </div>
                </header>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6 grow">
        {/* Executive Subheader + Layout Mode Switcher */}
        <div className="bg-surface-panel rounded-xl p-5 border border-border-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-secondary mb-1">
              <span>{isEn ? 'Operations Control Center' : 'Pusat Kawalan Operasi'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-code-metric font-semibold text-on-surface">S02 / F01 / F02</span>
              <span aria-hidden="true">·</span>
              <span className="text-status-approved-green font-semibold">
                {isEn ? '48 Active Highway Structures' : '48 Struktur Lebuhraya Aktif'}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              {isEn
                ? 'Billboard Fault Tickets & Field Dispatch Center'
                : 'Pengurusan Tiket Kerosakan & Agihan Kerja Kontraktor'}
            </h1>
            <p className="font-body-md text-secondary mt-0.5">
              {isEn
                ? 'Issue electrical maintenance work orders, dispatch tokenized contractor links, and monitor central depot spare parts.'
                : 'Keluarkan arahan kerja penyelenggaraan elektrik, jana pautan ber-token bagi kontraktor luar, dan pantau stok komponen depoh.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onToggleLayoutStyle && (
              <div className="inline-flex items-center p-1 rounded-lg bg-surface-container-low border border-border-subtle">
                <button
                  type="button"
                  onClick={() => onToggleLayoutStyle('enterprise')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                    !isClassicMint
                      ? 'bg-navy-header text-white shadow-2xs'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  {isEn ? 'Enterprise Sidebar' : 'Sidebar Korporat'}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleLayoutStyle('mint-classic')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                    isClassicMint
                      ? 'bg-mint-primary text-white shadow-2xs'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  {isEn ? 'S02 Mint Top-Nav' : 'S02 Mint Klasik'}
                </button>
              </div>
            )}

            {onOpenMasterDataModal && (
              <button
                type="button"
                onClick={() => onOpenMasterDataModal('sites')}
                className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg bg-navy-header hover:bg-slate-800 text-amber-400 font-code-metric text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">pin</span>
                <span>
                  {isEn
                    ? 'Edit Sites, Locations & Equipment (1111)'
                    : 'Kemas Kini Sites, Lokasi & Elektrik (1111)'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenReportModal}
              disabled={role === 'finance'}
              className={`inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-status-pending-amber hover:bg-primary text-on-primary font-label-md uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                role === 'finance' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>
                {isEn ? 'Report New Fault (F02)' : 'Buka Borang Laporan Segera (F02)'}
              </span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Cards (Clean single-elevation metric strip with tabular numerals) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onOpenMasterDataModal && onOpenMasterDataModal('sites')}
            className="bg-surface-panel rounded-xl p-5 border border-border-subtle hover:border-primary cursor-pointer flex flex-col justify-between transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-secondary">
              <span className="font-semibold uppercase tracking-wider">
                {isEn ? 'Active Billboards & Sites' : 'Papan Iklan & Sites Aktif'}
              </span>
              <span className="font-code-metric text-status-approved-green font-bold">
                {isEn ? 'EDIT (1111)' : 'UBAH (1111)'}
              </span>
            </div>
            <div className="mt-2 font-code-metric text-2xl font-bold text-on-surface">
              {isEn ? '48 Sites (98%)' : '48 Lokasi (98%)'}
            </div>
            <div className="mt-1 text-xs text-secondary">
              {isEn
                ? 'Click to update Sites, Locations & Electrical Spec'
                : 'Klik untuk kemas kini Sites, Lokasi & Elektrik'}
            </div>
          </div>

          <div className="bg-surface-panel rounded-xl p-5 border border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-secondary">
              <span className="font-semibold uppercase tracking-wider">
                {isEn ? 'Active Work Orders' : 'Tiket Kerosakan Aktif'}
              </span>
              <span className="font-code-metric text-status-pending-amber font-bold">
                {assignedCount + pendingCount} Open
              </span>
            </div>
            <div className="mt-2 font-code-metric text-2xl font-bold text-on-surface">
              {tickets.length} {isEn ? 'Total Tickets' : 'Dalam Tindakan'}
            </div>
            <div className="mt-1 text-xs text-secondary">
              {assignedCount} {isEn ? 'Assigned' : 'Ditugaskan'} · {pendingCount}{' '}
              {isEn ? 'Pending E-Sign' : 'Menunggu E-Sign'}
            </div>
          </div>

          <div
            onClick={() => onNavigate('f01-inventory')}
            className="bg-surface-panel rounded-xl p-5 border border-border-subtle hover:border-status-assigned-red cursor-pointer flex flex-col justify-between transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-secondary">
              <span className="font-semibold uppercase tracking-wider">
                {isEn ? 'Critical / Low Stock' : 'Stok Kritikal / Rendah'}
              </span>
              <span className="font-code-metric text-status-assigned-red font-bold">
                {isEn ? 'REORDER' : 'PESAN SEGERA'}
              </span>
            </div>
            <div className="mt-2 font-code-metric text-2xl font-bold text-status-assigned-red">
              {criticalStockCount} {isEn ? 'Urgent SKUs' : 'Item Segera'}
            </div>
            <div className="mt-1 text-xs text-secondary">
              MCB 32A Schneider · Contactor 40A
            </div>
          </div>

          <div
            onClick={() => onNavigate('s05-finance', 'TKT-2024-084')}
            className="bg-surface-panel rounded-xl p-5 border border-border-subtle hover:border-status-approved-green cursor-pointer flex flex-col justify-between transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-secondary">
              <span className="font-semibold uppercase tracking-wider">
                {isEn ? 'Approved This Week' : 'Kelulusan Minggu Ini'}
              </span>
              <span className="font-code-metric text-status-approved-green font-bold">
                100% E-Signed
              </span>
            </div>
            <div className="mt-2 font-code-metric text-2xl font-bold text-on-surface">
              14 {isEn ? 'Completed Jobs' : 'Pekerjaan'}
            </div>
            <div className="mt-1 text-xs text-secondary">
              {isEn ? 'Verified for Finance AP Ledger' : 'Disahkan untuk Lejar Audit Kewangan'}
            </div>
          </div>
        </div>

        {/* Filter Bar & Search Controls */}
        <div className="bg-surface-panel p-4 rounded-xl border border-border-subtle flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Interactive Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-container-low rounded-lg border border-border-subtle">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-navy-header text-white shadow-2xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              {isEn ? 'All Tickets' : 'Semua'} ({tickets.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Assigned')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'Assigned'
                  ? 'bg-status-assigned-red text-white shadow-2xs'
                  : 'text-status-assigned-red hover:bg-status-assigned-red-bg'
              }`}
            >
              <span className="size-1.5 rounded-full bg-current" />
              <span>
                {isEn ? 'Assigned' : 'Ditugaskan'} ({assignedCount})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Pending Approval')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'Pending Approval'
                  ? 'bg-status-pending-amber text-white shadow-2xs'
                  : 'text-status-pending-amber hover:bg-status-pending-amber-bg'
              }`}
            >
              <span className="size-1.5 rounded-full bg-current" />
              <span>
                {isEn ? 'Pending E-Sign' : 'Menunggu Kelulusan'} ({pendingCount})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Approved for Payment')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'Approved for Payment'
                  ? 'bg-status-approved-green text-white shadow-2xs'
                  : 'text-status-approved-green hover:bg-status-approved-green-bg'
              }`}
            >
              <span className="size-1.5 rounded-full bg-current" />
              <span>
                {isEn ? 'Approved for Payment' : 'Diluluskan untuk Pembayaran'} ({approvedCount})
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Local Search / QR Input */}
            <div className="relative flex-1 sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                qr_code_2
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isEn
                    ? 'Search Ticket ID, Billboard, Contractor...'
                    : 'Cari No. Tiket, Lokasi Billboard atau Kontraktor...'
                }
                className="w-full h-9 pl-9 pr-8 rounded-lg bg-surface-canvas border border-border-strong text-xs text-on-surface focus:outline-none focus:border-status-pending-amber"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="inline-flex items-center p-1 rounded-lg bg-surface-container-low border border-border-subtle">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-surface-panel text-on-surface shadow-2xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
                title="Grid View"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-surface-panel text-on-surface shadow-2xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
                title="High-Density Table View"
              >
                <span className="material-symbols-outlined text-[18px]">table_rows</span>
              </button>
            </div>
          </div>
        </div>

        {/* Split Layout (8/12 Tickets & F02 Form, 4/12 Inventory F01 & Live Feed) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Column (8/12 cols) */}
          <section className="lg:col-span-8 flex flex-col gap-5">
            {filteredTickets.length === 0 ? (
              <div className="bg-surface-panel rounded-xl border border-border-subtle p-10 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-secondary">
                  search_off
                </span>
                <h3 className="font-headline-md text-title-md text-on-surface font-bold">
                  {isEn ? 'No matching work orders found' : 'Tiada tiket kerosakan ditemui'}
                </h3>
                <p className="text-xs text-secondary max-w-md mx-auto">
                  {isEn
                    ? 'Try clearing your search query or switching the status filter above.'
                    : 'Cuba kosongkan kata kunci carian atau tukar penapis status di atas.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="px-4 py-2 rounded-lg bg-navy-header text-white text-xs font-semibold cursor-pointer"
                >
                  {isEn ? 'Reset Filters' : 'Set Semula Penapis'}
                </button>
              </div>
            ) : viewMode === 'table' ? (
              <div className="bg-surface-panel rounded-xl border border-border-subtle overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-header text-white uppercase font-code-metric">
                    <tr>
                      <th className="py-3 px-4">{isEn ? 'Ticket ID' : 'No. Tiket'}</th>
                      <th className="py-3 px-4">{isEn ? 'Billboard Location' : 'Lokasi Papan Iklan'}</th>
                      <th className="py-3 px-4">{isEn ? 'Contractor' : 'Kontraktor'}</th>
                      <th className="py-3 px-4 text-right">{isEn ? 'Cost (RM)' : 'Kos (RM)'}</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">{isEn ? 'Action' : 'Tindakan'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {filteredTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-surface-container-low/60">
                        <td className="py-3 px-4 font-bold font-code-metric text-on-surface">
                          #{t.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-on-surface">
                            {isEn ? t.locationEn : t.location}
                          </div>
                          <div className="font-code-metric text-[11px] text-secondary">
                            {t.billboardCode} · {t.jccNumber}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-secondary">{t.contractor}</td>
                        <td className="py-3 px-4 text-right font-code-metric font-bold text-on-surface">
                          {t.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold ${
                              t.status === 'Assigned'
                                ? 'text-status-assigned-red'
                                : t.status === 'Pending Approval'
                                ? 'text-status-pending-amber'
                                : 'text-status-approved-green'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {t.status === 'Assigned' && (
                            <button
                              type="button"
                              onClick={() => onNavigate('s03-contractor', t.id)}
                              className="px-3 py-1.5 rounded-lg bg-navy-header text-white font-semibold cursor-pointer whitespace-nowrap"
                            >
                              {isEn ? 'Open Form (S03)' : 'Buka Borang (S03)'}
                            </button>
                          )}
                          {t.status === 'Pending Approval' && (
                            <button
                              type="button"
                              onClick={() => onNavigate('s04-approval', t.id)}
                              className="px-3 py-1.5 rounded-lg bg-status-pending-amber text-white font-semibold cursor-pointer whitespace-nowrap"
                            >
                              E-Sign (S04)
                            </button>
                          )}
                          {t.status === 'Approved for Payment' && (
                            <button
                              type="button"
                              onClick={() => onNavigate('s05-finance', t.id)}
                              className="px-3 py-1.5 rounded-lg bg-status-approved-green text-white font-semibold cursor-pointer whitespace-nowrap"
                            >
                              {isEn ? 'Audit PDF (S05)' : 'Sijil PDF (S05)'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => {
                  const isAssigned = ticket.status === 'Assigned';
                  const isPending = ticket.status === 'Pending Approval';
                  const isApproved = ticket.status === 'Approved for Payment';

                  return (
                    <article
                      key={ticket.id}
                      className="bg-surface-panel rounded-xl border border-border-subtle p-5 flex flex-col gap-4 relative overflow-hidden hover:border-border-strong transition-colors"
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          isAssigned
                            ? 'bg-status-assigned-red'
                            : isPending
                            ? 'bg-status-pending-amber'
                            : 'bg-status-approved-green'
                        }`}
                      />

                      {/* Top Metadata Row */}
                      <div className="flex flex-wrap items-start justify-between gap-3 pl-1">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-code-metric font-bold text-on-surface text-sm">
                              #{ticket.id}
                            </span>
                            <span className="text-border-strong" aria-hidden="true">
                              ·
                            </span>
                            <span className="font-code-metric font-semibold text-secondary">
                              {ticket.billboardCode}
                            </span>
                            <span className="text-border-strong" aria-hidden="true">
                              ·
                            </span>
                            <span
                              className={`font-semibold ${
                                ticket.priority === 'Tinggi' || ticket.priority === 'Segera'
                                  ? 'text-status-assigned-red'
                                  : 'text-status-pending-amber'
                              }`}
                            >
                              {isEn
                                ? `${ticket.priorityEn} Priority`
                                : `Keutamaan ${ticket.priority}`}
                            </span>
                            <span className="text-border-strong" aria-hidden="true">
                              ·
                            </span>
                            {isAssigned && (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-status-assigned-red">
                                <span className="size-2 rounded-full bg-status-assigned-red" />
                                {isEn ? 'Assigned to Contractor' : 'Ditugaskan ke Kontraktor'}
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-status-pending-amber">
                                <span className="size-2 rounded-full bg-status-pending-amber" />
                                {isEn ? 'Pending Supervisor E-Sign' : 'Menunggu Kelulusan E-Sign'}
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-status-approved-green">
                                <span className="size-2 rounded-full bg-status-approved-green" />
                                {isEn ? 'Approved for Payment' : 'Diluluskan untuk Pembayaran'}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-on-surface font-headline">
                            {isEn ? ticket.locationEn : ticket.location}
                          </h3>
                        </div>

                        <div className="text-right text-xs text-secondary">
                          <span className="font-code-metric">
                            {isEn ? ticket.registeredTimeEn : ticket.registeredTime}
                          </span>
                          <p className="font-semibold text-on-surface mt-0.5">
                            {isApproved
                              ? `${isEn ? 'Verified by:' : 'Penyelia:'} ${ticket.approvedBy}`
                              : `${isEn ? 'Contractor:' : 'Kontraktor:'} ${ticket.contractor}`}
                          </p>
                        </div>
                      </div>

                      {/* 4-Step Interactive Lifecycle Progress Bar */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1 pl-1">
                        <div className="flex flex-col gap-1">
                          <div className="h-1.5 rounded-full bg-status-approved-green" />
                          <span className="text-[10px] font-semibold text-on-surface truncate">
                            {isEn ? '1. Ticket Issued (F02)' : '1. Tiket Dijana (F02)'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              isAssigned
                                ? 'bg-status-assigned-red animate-pulse'
                                : 'bg-status-approved-green'
                            }`}
                          />
                          <span className="text-[10px] font-semibold text-on-surface truncate">
                            {isEn ? '2. Field Report (F03)' : '2. Laporan Tapak (F03)'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              isApproved
                                ? 'bg-status-approved-green'
                                : isPending
                                ? 'bg-status-pending-amber animate-pulse'
                                : 'bg-border-subtle'
                            }`}
                          />
                          <span className="text-[10px] font-semibold text-secondary truncate">
                            {isEn ? '3. Supervisor E-Sign (F04)' : '3. E-Sign Penyelia (F04)'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              isApproved ? 'bg-status-approved-green' : 'bg-border-subtle'
                            }`}
                          />
                          <span className="text-[10px] font-semibold text-secondary truncate">
                            {isEn ? '4. JCC Audit Cert (F05)' : '4. Sijil Audit JCC (F05)'}
                          </span>
                        </div>
                      </div>

                      {/* Description box */}
                      <div className="bg-surface-canvas p-3.5 rounded-lg border border-border-subtle text-xs text-on-surface flex items-start justify-between gap-4 ml-1">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-on-surface">
                            {isAssigned
                              ? isEn
                                ? 'Reported Electrical Fault:'
                                : 'Kerosakan Dilaporkan:'
                              : isPending
                              ? isEn
                                ? 'Contractor Repair & Test Summary:'
                                : 'Laporan Kerosakan & Pembaikan Selesai:'
                              : isEn
                              ? 'Verified Resolution Summary:'
                              : 'Penyelesaian Kerosakan Disahkan:'}
                          </p>
                          <p className="text-secondary leading-relaxed">
                            "
                            {isAssigned
                              ? isEn
                                ? ticket.faultDescriptionEn
                                : ticket.faultDescription
                              : isEn
                              ? ticket.repairSummaryEn
                              : ticket.repairSummary}
                            "
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block text-[10px] text-secondary uppercase">
                            {isEn ? 'Claim / Estimate' : 'Anggaran / Tuntutan'}
                          </span>
                          <span className="font-code-metric text-sm font-bold text-on-surface">
                            RM {ticket.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Assigned Ticket Footer: Contractor Link & Actions */}
                      {isAssigned && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle pl-1">
                          <div className="flex items-center gap-2 bg-surface-canvas px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-code-metric text-secondary grow max-w-lg overflow-hidden">
                            <span className="material-symbols-outlined text-[16px] text-status-pending-amber shrink-0">
                              link
                            </span>
                            <span className="truncate">{ticket.contractorUrl}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setQrTicketModal(ticket)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-low text-on-surface hover:bg-surface-container-high border border-border-subtle cursor-pointer whitespace-nowrap"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                qr_code_2
                              </span>
                              <span>QR Token</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(ticket.contractorUrl, ticket.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-low text-on-surface hover:bg-surface-container-high border border-border-subtle cursor-pointer whitespace-nowrap"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {copiedId === ticket.id ? 'check' : 'content_copy'}
                              </span>
                              <span>
                                {copiedId === ticket.id
                                  ? isEn
                                    ? 'Copied!'
                                    : 'Disalin!'
                                  : isEn
                                  ? 'Copy Link'
                                  : 'Salin Pautan'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onNavigate('s03-contractor', ticket.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-navy-header text-white hover:bg-slate-800 transition cursor-pointer whitespace-nowrap"
                            >
                              <span>
                                {isEn ? 'Open Contractor Form (S03)' : 'Isi Borang Kontraktor (S03)'}
                              </span>
                              <span className="material-symbols-outlined text-[15px]">
                                arrow_forward
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Pending Approval Ticket Footer: Photo Proof Thumbnail & Parts + E-Sign CTA */}
                      {isPending && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-surface-canvas p-3.5 rounded-lg border border-border-subtle ml-1">
                            <div className="flex items-center gap-3">
                              <div className="size-14 rounded-lg overflow-hidden border border-border-subtle shrink-0 bg-surface-container-low">
                                <img
                                  className="size-full object-cover"
                                  alt="Completion Photo Proof"
                                  src={
                                    ticket.id === 'TKT-2024-084'
                                      ? IMAGES.s02Thumb084
                                      : ticket.photos[0]?.url || IMAGES.s02Thumb084
                                  }
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-on-surface">
                                  {isEn ? 'Completion Photo Proof' : 'Bukti Foto Penyiapan'}
                                </p>
                                <p className="text-secondary text-[11px]">
                                  {ticket.photos.length}{' '}
                                  {isEn
                                    ? 'GPS photos uploaded by contractor'
                                    : 'Foto GPS dimuat naik oleh kontraktor'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => onNavigate('s04-approval', ticket.id)}
                                  className="text-primary hover:underline text-[11px] font-semibold inline-flex items-center gap-0.5 cursor-pointer mt-0.5"
                                >
                                  {isEn ? 'Inspect full resolution & EXIF' : 'Semak resolusi penuh & EXIF'}{' '}
                                  <span className="material-symbols-outlined text-[12px]">
                                    open_in_new
                                  </span>
                                </button>
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-on-surface">
                                {isEn ? 'Spare Parts Consumed (F01):' : 'Alat Ganti Digunakan (F01):'}
                              </p>
                              <ul className="list-disc list-inside text-secondary text-[11px] space-y-0.5 mt-0.5">
                                {ticket.partsUsed.map((part) => (
                                  <li key={part.id}>
                                    {part.name} (
                                    <span className="font-code-metric font-semibold">
                                      {part.qty} {part.unit}
                                    </span>
                                    )
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle pl-1">
                            <span className="text-xs text-secondary">
                              {isEn
                                ? 'Requires Supervisor digital e-signature to unlock Finance invoice clearance.'
                                : 'Perlu semakan e-tandatangan Penyelia untuk pelepasan invois kewangan.'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onNavigate('s04-approval', ticket.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-status-pending-amber hover:bg-primary text-white shadow-xs transition cursor-pointer whitespace-nowrap"
                              >
                                <span className="material-symbols-outlined text-[16px]">draw</span>
                                <span>
                                  {isEn ? 'Verify & E-Sign (F04)' : 'Semak & Tandatangan (F04)'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Approved Ticket Footer: Export PDF & Client Summary */}
                      {isApproved && (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle text-xs pl-1">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-status-approved-green text-[18px]">
                              verified_user
                            </span>
                            <span className="text-secondary">
                              {isEn
                                ? 'Digitally signed by Supervisor Siti Zahara (Ref: '
                                : 'Telah ditandatangani digital oleh Penyelia Siti Zahara (Ref: '}
                              <span className="font-code-metric font-semibold text-on-surface">
                                {ticket.signatureRef}
                              </span>
                              )
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onNavigate('s05-finance', ticket.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-status-approved-green hover:bg-status-approved-green/90 text-white transition cursor-pointer whitespace-nowrap"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                picture_as_pdf
                              </span>
                              <span>
                                {isEn ? 'Export Audit PDF (F05)' : 'Eksport PDF Audit (F05)'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onNavigate('f06-logs', ticket.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-low text-on-surface hover:bg-surface-container-high border border-border-subtle transition cursor-pointer whitespace-nowrap"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                summarize
                              </span>
                              <span>{isEn ? 'Client Log (F06)' : 'Log Klien (F06)'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            {/* Quick Form Inline Card (PRD Feature F02) */}
            <div className="bg-surface-panel rounded-xl border border-border-subtle p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-status-pending-amber-bg text-status-pending-amber">
                    <span className="material-symbols-outlined text-[22px]">assignment_add</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-on-surface text-base">
                      {isEn
                        ? 'Register New Fault Ticket (Quick Dispatch F02)'
                        : 'Daftar Tiket Aduan Baru (Mod Pantas F02)'}
                    </h4>
                    <p className="text-xs text-secondary">
                      {isEn
                        ? 'Generate an instant zero-login contractor reporting link.'
                        : 'Jana pautan laporan kontraktor serta-merta tanpa perlu login akaun luar.'}
                    </p>
                  </div>
                </div>
                <span className="font-code-metric text-xs font-semibold text-secondary">
                  AUTO-TOKEN GENERATOR
                </span>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-status-assigned-red-bg border border-status-assigned-red-border text-xs text-status-assigned-red flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{formError}</span>
                </div>
              )}

              <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleQuickSubmit}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-on-surface">
                      {isEn ? 'Billboard ID / Location *' : 'ID / Lokasi Papan Iklan *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomSiteMode((prev) => !prev)}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      {customSiteMode
                        ? isEn
                          ? 'Select from List'
                          : 'Pilih dari Senarai'
                        : isEn
                        ? '+ Custom Site / Location'
                        : '+ Taip Site / Lokasi Baru'}
                    </button>
                  </div>
                  {customSiteMode ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      <input
                        type="text"
                        value={customSiteCode}
                        onChange={(e) => setCustomSiteCode(e.target.value)}
                        placeholder="BB-007"
                        className="col-span-1 text-xs rounded-lg border border-primary bg-surface-canvas font-code-metric font-bold text-on-surface p-2.5"
                      />
                      <input
                        type="text"
                        value={customSiteLocation}
                        onChange={(e) => setCustomSiteLocation(e.target.value)}
                        placeholder={
                          isEn ? 'Enter exact location...' : 'Masukkan lokasi sebenar...'
                        }
                        className="col-span-2 text-xs rounded-lg border border-primary bg-surface-canvas text-on-surface p-2.5"
                      />
                    </div>
                  ) : (
                    <select
                      value={quickBillboard}
                      onChange={(e) => setQuickBillboard(e.target.value)}
                      className="w-full text-xs rounded-lg border border-border-strong bg-surface-canvas text-on-surface p-2.5"
                    >
                      <option value="">
                        {isEn ? 'Select Billboard Location...' : 'Pilih Lokasi Billboard...'}
                      </option>
                      {sites.map((loc) => (
                        <option key={loc.code} value={loc.code}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    {isEn ? 'Priority Level *' : 'Tahap Keutamaan *'}
                  </label>
                  <select
                    value={quickPriority}
                    onChange={(e) =>
                      setQuickPriority(
                        e.target.value as 'Tinggi' | 'Sederhana' | 'Segera' | 'Rendah'
                      )
                    }
                    className="w-full text-xs rounded-lg border border-border-strong bg-surface-canvas text-on-surface p-2.5"
                  >
                    <option value="Tinggi">
                      {isEn ? 'High (Critical / Lights Unlit)' : 'Tinggi (Kritikal / Lampu Terpadam)'}
                    </option>
                    <option value="Segera">
                      {isEn ? 'Urgent (Electrical Hazard / Cable)' : 'Segera (Bahaya Pendawaian/Kabel)'}
                    </option>
                    <option value="Sederhana">
                      {isEn ? 'Medium (Scheduled Maintenance)' : 'Sederhana (Penyelenggaraan Berjadual)'}
                    </option>
                    <option value="Rendah">
                      {isEn ? 'Low (Cosmetic Inspection)' : 'Rendah (Pemeriksaan Kosmetik)'}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    {isEn ? 'Assigned Contractor *' : 'Pilih Kontraktor Ditugaskan *'}
                  </label>
                  <select
                    value={quickContractor}
                    onChange={(e) => setQuickContractor(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border-strong bg-surface-canvas text-on-surface p-2.5"
                  >
                    <option value="MegaVolt Engineering Sdn Bhd">
                      MegaVolt Engineering Sdn Bhd
                    </option>
                    <option value="Apex Power Works">Apex Power Works</option>
                    <option value="Southern Bright Electrical">Southern Bright Electrical</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    {isEn ? 'Electrical Fault Description *' : 'Perincian Kerosakan Elektrik *'}
                  </label>
                  <textarea
                    value={quickFault}
                    onChange={(e) => setQuickFault(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border-strong bg-surface-canvas text-on-surface p-2.5"
                    placeholder={
                      isEn
                        ? 'Example: Right-side 400W LED floodlights unlit, 32A MCB breaker trips immediately upon reset...'
                        : 'Contoh: Lampu spotlight sebelah kanan padam, breaker MCB 32A trip sebaik dihidupkan...'
                    }
                    rows={2}
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickBillboard('');
                      setQuickFault('');
                      setFormError(null);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface-container-low text-secondary hover:text-on-surface transition cursor-pointer"
                  >
                    {isEn ? 'Reset' : 'Set Semula'}
                  </button>
                  <button
                    type="submit"
                    disabled={role === 'finance'}
                    className={`px-5 py-2 rounded-lg text-xs font-bold bg-navy-header text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer ${
                      role === 'finance' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>
                      {isEn ? 'Generate Token Link & Issue Ticket' : 'Jana Pautan & Cipta Tiket'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Right Column (4/12 cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-5">
            {/* Inventory Summary Card (F01) */}
            <div className="bg-surface-panel rounded-xl border border-border-subtle p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-status-pending-amber text-[22px]">
                    inventory_2
                  </span>
                  <div>
                    <h3 className="font-headline font-bold text-sm text-on-surface">
                      {isEn ? 'Spare Parts Inventory (F01)' : 'Inventori Alat Ganti (F01)'}
                    </h3>
                    <p className="text-[11px] text-secondary">
                      {isEn ? 'Central Depot Electrical Stock' : 'Stok Komponen Elektrik Depoh Pusat'}
                    </p>
                  </div>
                </div>
                <span className="font-code-metric text-xs font-bold text-status-assigned-red">
                  {criticalStockCount} {isEn ? 'Low Stock' : 'Perlu Pesanan'}
                </span>
              </div>

              {/* Stock List with Level Bars */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {inventory.map((item) => {
                  const pct = Math.min(
                    100,
                    Math.max(10, Math.round((item.quantity / item.maxCapacity) * 100))
                  );
                  const isCrit = item.levelType === 'critical' || item.quantity <= item.minThreshold;
                  const isLow = item.levelType === 'low';

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col gap-1.5 p-3 rounded-lg border ${
                        isCrit
                          ? 'bg-status-assigned-red-bg/50 border-status-assigned-red-border'
                          : isLow
                          ? 'bg-status-pending-amber-bg/50 border-status-pending-amber-border'
                          : 'bg-surface-canvas border-border-subtle'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-on-surface">{item.name}</span>
                        <span
                          className={`font-bold font-code-metric ${
                            isCrit
                              ? 'text-status-assigned-red'
                              : isLow
                              ? 'text-status-pending-amber'
                              : 'text-status-approved-green'
                          }`}
                        >
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="w-full rounded-full h-1.5 overflow-hidden bg-border-subtle">
                        <div
                          className={`h-1.5 rounded-full ${
                            isCrit
                              ? 'bg-status-assigned-red'
                              : isLow
                              ? 'bg-status-pending-amber'
                              : 'bg-status-approved-green'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-secondary">
                        <span className="font-code-metric">
                          Min: {item.minThreshold} {item.unit} · {item.sku}
                        </span>
                        <span
                          className={`font-semibold ${
                            isCrit
                              ? 'text-status-assigned-red'
                              : isLow
                              ? 'text-status-pending-amber'
                              : 'text-status-approved-green'
                          }`}
                        >
                          {isEn ? item.statusLabelEn : item.statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inventory Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={onOpenStockModal}
                  disabled={role === 'finance'}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold bg-navy-header text-white hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'finance' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">add_box</span>
                  <span>
                    {isEn ? '+ Adjust / Restock Inventory' : '+ Tambah / Kemaskini Stok'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onExportInventoryCsv}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-surface-container-low text-on-surface hover:bg-surface-container-high border border-border-subtle transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>
                    {isEn ? 'Export Inventory Ledger (CSV)' : 'Eksport Laporan Inventori (CSV)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Recent Contractor Submissions Activity Feed (F03) */}
            <div className="bg-surface-panel rounded-xl border border-border-subtle p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
                <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-on-surface">
                  {isEn
                    ? 'Recent Field Verification Feed (F03/F04)'
                    : 'Log Pengesahan & Bukti Bergambar (F03/F04)'}
                </h4>
                <span className="text-[11px] text-secondary font-code-metric">LIVE</span>
              </div>
              <div className="space-y-2.5">
                <div
                  onClick={() => onNavigate('s04-approval', 'TKT-2024-084')}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-container-low transition border border-transparent hover:border-border-subtle cursor-pointer"
                >
                  <div className="size-11 rounded-lg overflow-hidden shrink-0 border border-border-subtle bg-surface-container-low">
                    <img
                      className="size-full object-cover"
                      alt="Apex Power Works"
                      src={IMAGES.s02Feed1}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-on-surface leading-tight">Apex Power Works</p>
                    <p className="text-[11px] text-secondary leading-snug mt-0.5">
                      {isEn
                        ? 'Uploaded 3 timer switch replacement photos (#TKT-2024-084)'
                        : 'Memuat naik 3 foto penggantian timer switch (#TKT-2024-084)'}
                    </p>
                    <span className="text-[10px] text-status-pending-amber font-semibold mt-0.5 inline-block">
                      {isEn ? '12 mins ago · Click to E-Sign' : '12 minit yang lalu · Klik untuk E-Sign'}
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('s05-finance', 'TKT-2024-079')}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-container-low transition border border-transparent hover:border-border-subtle cursor-pointer"
                >
                  <div className="size-11 rounded-lg overflow-hidden shrink-0 border border-border-subtle bg-surface-container-low">
                    <img
                      className="size-full object-cover"
                      alt="MegaVolt Engineering"
                      src={IMAGES.s02Feed2}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-on-surface leading-tight">MegaVolt Engineering</p>
                    <p className="text-[11px] text-secondary leading-snug mt-0.5">
                      {isEn
                        ? 'Logged replacement parts: 1x 63A 3-Phase Contactor (#TKT-2024-079)'
                        : 'Mengisi senarai komponen gantian: 1x Contactor 63A (#TKT-2024-079)'}
                    </p>
                    <span className="text-[10px] text-status-approved-green font-semibold mt-0.5 inline-block">
                      {isEn ? '1 hour ago · Invoice Approved' : '1 jam yang lalu · Lulus Invois'}
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('s03-contractor', 'TKT-2024-089')}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-container-low transition border border-transparent hover:border-border-subtle cursor-pointer"
                >
                  <div className="size-11 rounded-lg overflow-hidden shrink-0 border border-border-subtle bg-surface-container-low">
                    <img
                      className="size-full object-cover"
                      alt="MegaVolt PLUS Site"
                      src={IMAGES.s02Feed3}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-on-surface leading-tight">
                      MegaVolt Engineering (PLUS Site)
                    </p>
                    <p className="text-[11px] text-secondary leading-snug mt-0.5">
                      {isEn
                        ? 'Dispatched site inspection token for KM 24.5 (#TKT-2024-089)'
                        : 'Menjana pautan siasatan tapak KM 24.5 (#TKT-2024-089)'}
                    </p>
                    <span className="text-[10px] text-secondary font-medium mt-0.5 inline-block">
                      {isEn ? '2 hours ago · Open S03 Form' : '2 jam yang lalu · Buka Borang S03'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Interactive QR Token & Contractor Dispatch Modal */}
      {qrTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-panel rounded-xl max-w-md w-full p-6 border border-border-strong shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="font-code-metric text-[11px] text-status-pending-amber font-bold uppercase">
                  PUBLIC TOKEN ACCESS (F02 → F03)
                </span>
                <h3 className="font-headline-md text-title-md font-bold text-on-surface">
                  {isEn
                    ? `Contractor QR & Token Link #${qrTicketModal.id}`
                    : `Pautan & QR Kontraktor #${qrTicketModal.id}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQrTicketModal(null)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Crisp SVG QR Code */}
            <div className="bg-surface-canvas p-5 rounded-xl border border-border-subtle flex flex-col items-center text-center">
              <div className="w-40 h-40 bg-white p-3 rounded-lg border border-border-strong shadow-2xs flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                  <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="13" y="13" width="12" height="12" fill="currentColor" />
                  <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="75" y="13" width="12" height="12" fill="currentColor" />
                  <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="13" y="75" width="12" height="12" fill="currentColor" />
                  <rect x="42" y="10" width="6" height="6" fill="currentColor" />
                  <rect x="52" y="18" width="6" height="12" fill="currentColor" />
                  <rect x="42" y="38" width="18" height="6" fill="currentColor" />
                  <rect x="10" y="44" width="14" height="6" fill="currentColor" />
                  <rect x="38" y="52" width="10" height="10" fill="currentColor" />
                  <rect x="56" y="48" width="8" height="16" fill="currentColor" />
                  <rect x="74" y="44" width="16" height="6" fill="currentColor" />
                  <rect x="44" y="72" width="12" height="6" fill="currentColor" />
                  <rect x="64" y="68" width="10" height="10" fill="currentColor" />
                  <rect x="82" y="78" width="12" height="12" fill="currentColor" />
                  <rect x="52" y="84" width="18" height="6" fill="currentColor" />
                </svg>
              </div>
              <p className="font-bold text-on-surface text-xs mt-3">
                {isEn ? qrTicketModal.locationEn : qrTicketModal.location}
              </p>
              <p className="text-[11px] text-secondary mt-0.5">
                {isEn ? 'Contractor:' : 'Kontraktor:'} {qrTicketModal.contractor} (
                {qrTicketModal.technician})
              </p>
              <div className="mt-3 w-full p-2 rounded bg-white border border-border-subtle font-code-metric text-[11px] text-secondary truncate">
                {qrTicketModal.contractorUrl}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCopyLink(qrTicketModal.contractorUrl, qrTicketModal.id)}
                className="py-2.5 px-3 rounded-lg border border-border-strong text-on-surface font-label-md text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-low cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>{isEn ? 'Copy Token URL' : 'Salin URL Token'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = qrTicketModal.id;
                  setQrTicketModal(null);
                  onNavigate('s03-contractor', id);
                }}
                className="py-2.5 px-3 rounded-lg bg-status-pending-amber hover:bg-primary text-white font-label-md text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>{isEn ? 'Open Form (S03)' : 'Buka Borang (S03)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
