import React, { useState } from 'react';
import {
  IMAGES,
  InventoryItem,
  LangMode,
  RoleMode,
  ScreenId,
  Ticket,
} from '../data/initialData';

interface SidebarShellProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId, ticketId?: string) => void;
  lang: LangMode;
  onToggleLang: (lang: LangMode) => void;
  role: RoleMode;
  onChangeRole: (role: RoleMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenReportModal: () => void;
  onOpenCommandPalette?: () => void;
  onOpenMasterDataModal?: (tab?: 'sites' | 'equipment' | 'tickets') => void;
  isAccessUnlocked?: boolean;
  onResetDemoData?: () => void;
  inventory: InventoryItem[];
  tickets?: Ticket[];
  selectedTicketId?: string;
  children: React.ReactNode;
}

export const SidebarShell: React.FC<SidebarShellProps> = ({
  activeScreen,
  onNavigate,
  lang,
  onToggleLang,
  role,
  onChangeRole,
  searchQuery,
  onSearchChange,
  onOpenReportModal,
  onOpenCommandPalette,
  onOpenMasterDataModal,
  isAccessUnlocked = false,
  onResetDemoData,
  inventory,
  tickets = [],
  selectedTicketId,
  children,
}) => {
  const isEn = lang === 'en';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const criticalItems = inventory.filter(
    (i) => i.quantity <= i.minThreshold || i.levelType === 'critical' || i.levelType === 'low'
  );
  const criticalCount = criticalItems.length;
  const pendingApprovalTickets = tickets.filter((t) => t.status === 'Pending Approval');
  const assignedTickets = tickets.filter((t) => t.status === 'Assigned');

  const roleLabel =
    role === 'supervisor'
      ? isEn
        ? 'Maintenance Supervisor'
        : 'Penyelia Penyelenggaraan'
      : role === 'finance'
      ? isEn
        ? 'Finance & Audit (Read-Only)'
        : 'Kewangan & Audit (Baca-Sahaja)'
      : isEn
      ? 'External Contractor'
      : 'Kontraktor Luar';

  const navItems: Array<{
    id: ScreenId;
    icon: string;
    code: string;
    labelMs: string;
    labelEn: string;
    count?: number;
  }> = [
    {
      id: 's02-mint',
      icon: 'space_dashboard',
      code: 'S02',
      labelMs: 'Dashboard & Tiket',
      labelEn: 'Dashboard & Tickets',
      count: tickets.length,
    },
    {
      id: 's01-hub',
      icon: 'hub',
      code: 'S01',
      labelMs: 'Hab Operasi Sistem',
      labelEn: 'System Operations Hub',
    },
    {
      id: 'f01-inventory',
      icon: 'inventory_2',
      code: 'F01',
      labelMs: 'Inventori Elektrik',
      labelEn: 'Electrical Inventory',
      count: criticalCount > 0 ? criticalCount : undefined,
    },
    {
      id: 's03-contractor',
      icon: 'engineering',
      code: 'S03',
      labelMs: 'Portal Kontraktor',
      labelEn: 'Contractor Portal',
      count: assignedTickets.length > 0 ? assignedTickets.length : undefined,
    },
    {
      id: 's04-approval',
      icon: 'draw',
      code: 'S04',
      labelMs: 'Kelulusan & E-Sign',
      labelEn: 'Approvals & E-Sign',
      count: pendingApprovalTickets.length > 0 ? pendingApprovalTickets.length : undefined,
    },
    {
      id: 's05-finance',
      icon: 'receipt_long',
      code: 'S05',
      labelMs: 'Audit & Kewangan',
      labelEn: 'Audit & Finance',
    },
    {
      id: 'f06-logs',
      icon: 'verified_user',
      code: 'F06',
      labelMs: 'Log & Laporan Klien',
      labelEn: 'Logs & Client Reports',
    },
  ];

  const workflowStages: Array<{
    screen: ScreenId;
    step: string;
    titleMs: string;
    titleEn: string;
    descMs: string;
    descEn: string;
  }> = [
    {
      screen: 's02-mint',
      step: '01',
      titleMs: 'F01/F02 Tiket & Stok',
      titleEn: 'F01/F02 Ticket & Stock',
      descMs: 'Daftar kerosakan & pautan',
      descEn: 'Issue fault & token link',
    },
    {
      screen: 's03-contractor',
      step: '02',
      titleMs: 'F03 Kerja Kontraktor',
      titleEn: 'F03 Contractor Work',
      descMs: '3 foto bukti & komponen',
      descEn: '3 photo proofs & parts',
    },
    {
      screen: 's04-approval',
      step: '03',
      titleMs: 'F04 E-Sign Penyelia',
      titleEn: 'F04 Supervisor E-Sign',
      descMs: 'Semakan & tandatangan',
      descEn: 'Verify & digital sign-off',
    },
    {
      screen: 's05-finance',
      step: '04',
      titleMs: 'F05 Audit & Invois',
      titleEn: 'F05 Finance Audit',
      descMs: 'Sijil JCC A4 & baucar',
      descEn: 'A4 JCC PDF & AP voucher',
    },
  ];

  const renderSidebarInner = () => (
    <>
      {/* Brand Header */}
      <div
        onClick={() => {
          onNavigate('s01-hub');
          setMobileMenuOpen(false);
        }}
        className="h-16 px-4 flex items-center justify-between border-b border-border-subtle bg-surface-panel cursor-pointer group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-navy-header flex items-center justify-center shrink-0 shadow-xs group-hover:bg-status-pending-amber transition-colors">
            <img
              alt="BillboardOps Logo"
              className="h-6 w-6 object-contain"
              src={IMAGES.logo}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-md text-title-md font-bold text-on-surface truncate tracking-tight">
              BillboardOps
            </span>
            <span className="font-code-metric text-[10px] text-secondary truncate uppercase tracking-wider">
              {isEn ? 'Electrical Grid & Asset ERP' : 'Sistem Aset & Elektrik'}
            </span>
          </div>
        </div>
        {mobileMenuOpen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(false);
            }}
            className="lg:hidden p-1.5 rounded-lg text-secondary hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* Role Switcher Segmented Control */}
      <div className="px-4 py-3 border-b border-border-subtle bg-surface-canvas">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-label-sm text-[10px] text-secondary uppercase tracking-wider">
            {isEn ? 'Active Access Role' : 'Peranan Akses Aktif'}
          </span>
          <span className="font-code-metric text-[10px] text-status-approved-green font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-approved-green" />
            RBAC ACTIVE
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-lg border border-border-subtle">
          {(
            [
              { id: 'supervisor', labelMs: 'Penyelia', labelEn: 'Supervisor' },
              { id: 'contractor', labelMs: 'Kontraktor', labelEn: 'Contractor' },
              { id: 'finance', labelMs: 'Kewangan', labelEn: 'Finance' },
            ] as const
          ).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onChangeRole(r.id)}
              className={`py-1.5 px-1.5 rounded-md font-label-sm text-[11px] truncate transition-all cursor-pointer ${
                role === r.id
                  ? 'bg-navy-header text-white shadow-xs font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              {isEn ? r.labelEn : r.labelMs}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 font-label-sm text-[10px] text-secondary uppercase tracking-wider">
          {isEn ? 'Workspace Modules' : 'Modul Ruang Kerja'}
        </div>
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          const isAlertBadge = item.id === 'f01-inventory' || item.id === 's04-approval';
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-navy-header text-white shadow-xs font-semibold'
                  : 'text-secondary hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`material-symbols-outlined text-[19px] ${
                    isActive ? 'text-amber-400' : 'text-secondary'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-label-lg text-[13px] truncate">
                  {isEn ? item.labelEn : item.labelMs}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.count !== undefined && (
                  <span
                    className={`font-code-metric text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isActive
                        ? 'bg-amber-500 text-slate-950'
                        : isAlertBadge
                        ? 'bg-status-assigned-red-bg text-status-assigned-red'
                        : 'bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                <span
                  className={`font-code-metric text-[10px] ${
                    isActive ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {item.code}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Critical Stock & Demo Reset Widget */}
      <div className="p-3.5 border-t border-border-subtle bg-surface-panel space-y-2.5">
        <div
          onClick={() => {
            onNavigate('f01-inventory');
            setMobileMenuOpen(false);
          }}
          className="bg-surface-canvas border border-border-subtle rounded-lg p-3 cursor-pointer hover:border-status-assigned-red transition-colors"
        >
          <div className="flex items-center justify-between text-secondary mb-1.5">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold">
              {isEn ? 'Depot Stock Alert' : 'Amaran Stok Depoh'}
            </span>
            <span className="font-code-metric text-[11px] text-status-assigned-red font-bold">
              {criticalCount} {isEn ? 'Critical' : 'Kritikal'}
            </span>
          </div>
          <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-status-assigned-red h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(20, criticalCount * 35))}%` }}
            />
          </div>
          <span className="block font-body-sm text-[11px] text-secondary mt-1.5 truncate">
            {criticalItems.map((i) => i.name.split(' ')[0]).join(', ') ||
              (isEn ? 'All Stock Sufficient' : 'Semua Stok Mencukupi')}
          </span>
        </div>

        {onOpenMasterDataModal && (
          <button
            type="button"
            onClick={() => {
              onOpenMasterDataModal('sites');
              setMobileMenuOpen(false);
            }}
            className="w-full py-2 px-3 rounded-lg bg-navy-header hover:bg-slate-800 text-amber-400 font-label-sm text-[11px] font-bold flex items-center justify-between gap-1.5 cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="material-symbols-outlined text-[16px]">
                {isAccessUnlocked ? 'tune' : 'lock'}
              </span>
              <span className="truncate">
                {isEn ? 'Edit Sites & Equipment' : 'Kemas Kini Sites & Elektrik'}
              </span>
            </div>
            <span className="font-code-metric text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white shrink-0">
              1111
            </span>
          </button>
        )}

        {onResetDemoData && (
          <button
            type="button"
            onClick={onResetDemoData}
            className="w-full py-1.5 px-3 rounded-lg border border-border-subtle hover:bg-surface-container-low text-secondary hover:text-on-surface font-label-sm text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
            <span>{isEn ? 'Reset Demo Data' : 'Set Semula Data Demo'}</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="bg-surface-canvas font-body-md text-body-md text-on-surface min-h-screen">
      {/* Desktop Left Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-panel border-r border-border-subtle z-40 hidden lg:flex flex-col">
        {renderSidebarInner()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-surface-panel h-full flex flex-col z-10 shadow-2xl">
            {renderSidebarInner()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:pl-72">
        {/* Fixed Top Header */}
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-panel/95 backdrop-blur-md border-b border-border-subtle z-30 flex items-center justify-between px-4 lg:px-6 gap-3">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-border-subtle text-on-surface hover:bg-surface-container-low cursor-pointer"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>

            {/* Search Input + Command Palette Trigger */}
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[19px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-10 pl-9 pr-16 bg-surface-canvas border border-border-strong rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-status-pending-amber"
                placeholder={
                  isEn
                    ? 'Filter ticket, billboard (BB-084), contractor...'
                    : 'Cari tiket, papan iklan (BB-084), kontraktor...'
                }
                type="text"
              />
              {onOpenCommandPalette && (
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  title={isEn ? 'Open Quick Command Palette (Ctrl+K)' : 'Buka Palet Arahan Pantas (Ctrl+K)'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container-low border border-border-subtle font-code-metric text-[10px] text-secondary hover:text-on-surface hover:border-border-strong cursor-pointer"
                >
                  ⌘K
                </button>
              )}
            </div>

            {/* Active Role Indicator */}
            <div className="hidden xl:flex items-center gap-2 text-xs text-secondary shrink-0">
              <span>{isEn ? 'Role:' : 'Peranan:'}</span>
              <span className="font-semibold text-on-surface">{roleLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher BM / EN */}
            <div className="inline-flex items-center rounded-lg border border-border-strong bg-surface-canvas p-0.5">
              <button
                type="button"
                onClick={() => onToggleLang('ms')}
                className={`px-2.5 py-1 rounded-md text-label-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  !isEn
                    ? 'bg-navy-header text-on-primary shadow-2xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                BM
              </button>
              <button
                type="button"
                onClick={() => onToggleLang('en')}
                className={`px-2.5 py-1 rounded-md text-label-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  isEn
                    ? 'bg-navy-header text-on-primary shadow-2xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                EN
              </button>
            </div>

            {onOpenMasterDataModal && (
              <button
                type="button"
                onClick={() => onOpenMasterDataModal('sites')}
                className="inline-flex items-center gap-1.5 h-10 px-3 bg-navy-header hover:bg-slate-800 text-amber-400 rounded-lg font-code-metric text-xs font-bold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                title={
                  isEn
                    ? 'Edit Sites, Locations & Electrical Equipment (Access Code: 1111)'
                    : 'Kemas Kini Sites, Lokasi & Kelengkapan Elektrik (Kod Akses: 1111)'
                }
              >
                <span className="material-symbols-outlined text-[17px]">
                  {isAccessUnlocked ? 'lock_open' : 'pin'}
                </span>
                <span className="hidden md:inline">
                  {isEn ? 'Sites & Equipment' : 'Sites & Elektrik'}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold">
                  1111
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenReportModal}
              disabled={role === 'finance'}
              className={`inline-flex items-center gap-1.5 h-10 px-4 bg-status-pending-amber hover:bg-primary text-on-primary rounded-lg font-label-md text-label-md uppercase tracking-wider transition-colors shadow-xs cursor-pointer whitespace-nowrap ${
                role === 'finance' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add_alert</span>
              <span className="hidden sm:inline">
                {isEn ? '+ Report Fault' : '+ Lapor Kerosakan'}
              </span>
            </button>

            {/* Interactive Notification Bell & Popover */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                type="button"
                title={isEn ? 'Operations Notifications' : 'Notifikasi Operasi'}
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {(pendingApprovalTickets.length > 0 || criticalCount > 0) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-assigned-red" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-panel rounded-xl shadow-2xl border border-border-strong z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-navy-header text-white flex items-center justify-between">
                    <span className="font-headline-md text-label-lg font-bold">
                      {isEn ? 'Action Required' : 'Tindakan Segera Diperlukan'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-slate-300 hover:text-white cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                  <div className="divide-y divide-border-subtle max-h-80 overflow-y-auto">
                    {pendingApprovalTickets.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          onNavigate('s04-approval', t.id);
                        }}
                        className="w-full p-3.5 text-left hover:bg-surface-container-low transition-colors flex items-start gap-3 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-status-pending-amber mt-0.5">
                          draw
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-code-metric text-xs font-bold text-on-surface">
                              #{t.id} • {t.billboardCode}
                            </span>
                            <span className="text-[11px] font-semibold text-status-pending-amber">
                              {isEn ? 'Pending E-Sign' : 'Menunggu E-Sign'}
                            </span>
                          </div>
                          <p className="text-xs text-secondary truncate mt-0.5">{t.location}</p>
                        </div>
                      </button>
                    ))}
                    {criticalItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          onNavigate('f01-inventory');
                        }}
                        className="w-full p-3.5 text-left hover:bg-surface-container-low transition-colors flex items-start gap-3 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-status-assigned-red mt-0.5">
                          inventory_2
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-code-metric text-xs font-bold text-on-surface">
                              {item.sku}
                            </span>
                            <span className="font-code-metric text-[11px] font-bold text-status-assigned-red">
                              {item.quantity} / {item.minThreshold} {item.unit}
                            </span>
                          </div>
                          <p className="text-xs text-secondary truncate mt-0.5">{item.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative pl-2 border-l border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                title={isEn ? 'Account & Role Settings' : 'Tetapan Akaun & Peranan'}
              >
                <img
                  alt="Siti Zahara Profile"
                  className="w-8 h-8 rounded-full object-cover border border-border-strong"
                  src={IMAGES.avatarSidebar}
                  referrerPolicy="no-referrer"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="font-label-md text-label-md font-semibold text-on-surface leading-tight">
                    Siti Zahara
                  </span>
                  <span className="font-label-sm text-[11px] text-secondary leading-tight">
                    {isEn ? 'Head of Technical Ops' : 'Ketua Operasi Teknikal'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-secondary text-[16px] hidden sm:inline">
                  expand_more
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-surface-panel rounded-xl shadow-2xl border border-border-strong z-50 overflow-hidden">
                  <div className="p-3.5 bg-navy-header text-white">
                    <div className="font-headline-md text-sm font-bold">
                      Siti Zahara binti Kamaruddin
                    </div>
                    <div className="font-code-metric text-[11px] text-slate-300 mt-0.5">
                      ID: ST-9022 • {roleLabel}
                    </div>
                  </div>
                  <div className="p-2 divide-y divide-border-subtle text-xs">
                    <div className="pb-2 space-y-1">
                      <div className="px-2 py-1 text-[10px] font-label-sm uppercase text-secondary">
                        {isEn ? 'Switch Active Role (RBAC)' : 'Tukar Peranan Aktif (RBAC)'}
                      </div>
                      {(
                        [
                          { id: 'supervisor', label: isEn ? 'Maintenance Supervisor' : 'Penyelia Penyelenggaraan' },
                          { id: 'contractor', label: isEn ? 'External Contractor' : 'Kontraktor Luar' },
                          { id: 'finance', label: isEn ? 'Finance & Audit (Read-Only)' : 'Kewangan & Audit' },
                        ] as const
                      ).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            onChangeRole(r.id);
                            setProfileOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between cursor-pointer ${
                            role === r.id
                              ? 'bg-status-pending-amber/15 text-primary font-bold'
                              : 'hover:bg-surface-container-low text-on-surface'
                          }`}
                        >
                          <span>{r.label}</span>
                          {role === r.id && (
                            <span className="material-symbols-outlined text-[15px]">check</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 space-y-1">
                      {onOpenCommandPalette && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            onOpenCommandPalette();
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer"
                        >
                          <span>{isEn ? 'Command Palette' : 'Palet Arahan Pantas'}</span>
                          <span className="font-code-metric text-[10px] text-secondary">⌘K</span>
                        </button>
                      )}
                      {onResetDemoData && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            onResetDemoData();
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-status-assigned-red-bg text-status-assigned-red flex items-center gap-1.5 font-semibold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                          <span>{isEn ? 'Reset All Demo Data' : 'Set Semula Data Demo'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Main Content with Interactive End-to-End Lifecycle Stepper Bar */}
        <main className="w-full pt-16 bg-surface-canvas min-h-screen pb-16">
          {/* Interactive End-to-End Lifecycle Stepper Bar */}
          <div className="bg-surface-panel border-b border-border-subtle px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {workflowStages.map((st, idx) => {
                const isCurrent = activeScreen === st.screen;
                return (
                  <React.Fragment key={st.screen}>
                    <button
                      type="button"
                      onClick={() => onNavigate(st.screen, selectedTicketId)}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap ${
                        isCurrent
                          ? 'bg-navy-header text-white shadow-2xs'
                          : 'hover:bg-surface-container-low text-secondary hover:text-on-surface'
                      }`}
                    >
                      <span
                        className={`font-code-metric text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-surface-container-high text-secondary'
                        }`}
                      >
                        {st.step}
                      </span>
                      <div>
                        <div className="font-label-md text-xs font-bold leading-tight">
                          {isEn ? st.titleEn : st.titleMs}
                        </div>
                        <div
                          className={`text-[10px] leading-tight hidden sm:block ${
                            isCurrent ? 'text-slate-300' : 'text-secondary'
                          }`}
                        >
                          {isEn ? st.descEn : st.descMs}
                        </div>
                      </div>
                    </button>
                    {idx < workflowStages.length - 1 && (
                      <span className="material-symbols-outlined text-border-strong text-[16px] shrink-0">
                        chevron_right
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {selectedTicketId && (
              <div className="hidden xl:flex items-center gap-2 text-xs text-secondary">
                <span>{isEn ? 'Active Context:' : 'Tiket Aktif:'}</span>
                <span className="font-code-metric font-bold text-on-surface">
                  #{selectedTicketId}
                </span>
              </div>
            )}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};
