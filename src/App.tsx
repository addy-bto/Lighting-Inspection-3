/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  BILLBOARD_LOCATIONS,
  BillboardSite,
  IMAGES,
  INITIAL_INVENTORY,
  INITIAL_TICKETS,
  InventoryItem,
  LangMode,
  PartUsed,
  RoleMode,
  ScreenId,
  Ticket,
  TicketPhoto,
} from './data/initialData';
import { SidebarShell } from './components/SidebarShell';
import { ScreenS01Hub } from './components/ScreenS01Hub';
import { ScreenS02Mint } from './components/ScreenS02Mint';
import { ScreenS03Contractor } from './components/ScreenS03Contractor';
import { ScreenS04Approval } from './components/ScreenS04Approval';
import { ScreenS05Finance } from './components/ScreenS05Finance';
import { ScreenF01Inventory } from './components/ScreenF01Inventory';
import { ScreenF06Logs } from './components/ScreenF06Logs';
import { MasterDataModal } from './components/MasterDataModal';

const STORAGE_TICKETS_KEY = 'billboardops_tickets_v2_en';
const STORAGE_INVENTORY_KEY = 'billboardops_inventory_v2_en';
const STORAGE_SITES_KEY = 'billboardops_sites_v1';
const STORAGE_ACCESS_KEY = 'billboardops_access_1111_unlocked';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('s02-mint');
  const [s02LayoutStyle, setS02LayoutStyle] = useState<'enterprise' | 'mint-classic'>('enterprise');
  const [lang, setLang] = useState<LangMode>('en');
  const [role, setRole] = useState<RoleMode>('supervisor');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('TKT-2024-089');

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TICKETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to INITIAL_TICKETS
    }
    return INITIAL_TICKETS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INVENTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to INITIAL_INVENTORY
    }
    return INITIAL_INVENTORY;
  });

  const [sites, setSites] = useState<BillboardSite[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SITES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to BILLBOARD_LOCATIONS
    }
    return BILLBOARD_LOCATIONS;
  });

  const [isAccessUnlocked, setIsAccessUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_ACCESS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [masterDataModalOpen, setMasterDataModalOpen] = useState(false);
  const [masterDataInitialTab, setMasterDataInitialTab] = useState<
    'sites' | 'equipment' | 'tickets'
  >('sites');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  // Report Fault modal form state
  const [modalLocationCode, setModalLocationCode] = useState('BB-001');
  const [modalCustomSiteMode, setModalCustomSiteMode] = useState(false);
  const [modalCustomSiteCode, setModalCustomSiteCode] = useState('BB-007');
  const [modalCustomSiteLocation, setModalCustomSiteLocation] = useState('');
  const [modalPriority, setModalPriority] = useState<'Tinggi' | 'Sederhana' | 'Segera' | 'Rendah'>(
    'Tinggi'
  );
  const [modalContractor, setModalContractor] = useState('MegaVolt Engineering Sdn Bhd');
  const [modalFaultDesc, setModalFaultDesc] = useState('');

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
    isError?: boolean;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const isEn = lang === 'en';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(tickets));
    } catch {
      // ignore storage quota errors
    }
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(inventory));
    } catch {
      // ignore storage quota errors
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SITES_KEY, JSON.stringify(sites));
    } catch {
      // ignore storage quota errors
    }
  }, [sites]);

  const handleOpenMasterDataModal = (tab?: 'sites' | 'equipment' | 'tickets') => {
    if (tab) setMasterDataInitialTab(tab);
    setMasterDataModalOpen(true);
  };

  const handleUnlockAccess = () => {
    setIsAccessUnlocked(true);
    try {
      sessionStorage.setItem(STORAGE_ACCESS_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleLockAccess = () => {
    setIsAccessUnlocked(false);
    try {
      sessionStorage.removeItem(STORAGE_ACCESS_KEY);
    } catch {
      // ignore
    }
  };

  // Global keyboard shortcut for Command Palette (Ctrl+K / Cmd+K & Escape)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const showToast = (title: string, message: string, isError?: boolean) => {
    setToast({ visible: true, title, message, isError });
  };

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4200);
    return () => clearTimeout(timer);
  }, [toast.visible, toast.title, toast.message]);

  const handleNavigate = (screen: ScreenId, ticketId?: string) => {
    if (ticketId) {
      setSelectedTicketId(ticketId);
    } else if (screen === 's04-approval' || screen === 's05-finance') {
      setSelectedTicketId('TKT-2024-084');
    } else if (screen === 's03-contractor') {
      setSelectedTicketId('TKT-2024-089');
    }
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetDemoData = () => {
    localStorage.removeItem(STORAGE_TICKETS_KEY);
    localStorage.removeItem(STORAGE_INVENTORY_KEY);
    localStorage.removeItem(STORAGE_SITES_KEY);
    setTickets(INITIAL_TICKETS);
    setInventory(INITIAL_INVENTORY);
    setSites(BILLBOARD_LOCATIONS);
    setSelectedTicketId('TKT-2024-089');
    showToast(
      isEn ? 'Demo Data Restored' : 'Data Demo Dipulihkan',
      isEn
        ? 'All sites, tickets, and electrical inventory restored to default state.'
        : 'Semua lokasi, tiket dan inventori elektrik telah dipulihkan ke keadaan asal.'
    );
  };

  // F02: Create Ticket + Duplicate Prevention
  const handleCreateTicket = (data: {
    billboardCode: string;
    location: string;
    priority: 'Tinggi' | 'Sederhana' | 'Segera' | 'Rendah';
    contractor: string;
    faultDescription: string;
  }): { ok: boolean; error?: string; ticket?: Ticket } => {
    if (role === 'finance') {
      const msg = isEn
        ? 'Finance (Read-Only) role cannot create or modify work order tickets.'
        : 'Peranan Kewangan (Baca-Sahaja) tidak dibenarkan mencipta tiket baru.';
      showToast(isEn ? 'Access Blocked (F05)' : 'Akses Disekat (F05)', msg, true);
      return { ok: false, error: msg };
    }

    const existingActive = tickets.find(
      (t) =>
        t.billboardCode === data.billboardCode &&
        t.status !== 'Approved for Payment' &&
        t.faultDescription
          .toLowerCase()
          .slice(0, 18) === data.faultDescription.trim().toLowerCase().slice(0, 18)
    );
    if (existingActive) {
      const errMsg = isEn
        ? `Active ticket #${existingActive.id} for ${data.billboardCode} is already in progress (${existingActive.status}). Duplicate ticket blocked.`
        : `Tiket aktif #${existingActive.id} untuk ${data.billboardCode} sedang dalam proses (${existingActive.status}). Penduaan tiket disekat.`;
      showToast(isEn ? 'Duplicate Ticket Blocked (F02)' : 'Amaran Tiket Pendua (F02)', errMsg, true);
      return { ok: false, error: errMsg };
    }

    const nextNum = 90 + tickets.length;
    const newId = `TKT-2024-0${nextNum}`;
    const existingLocObj = sites.find((l) => l.code === data.billboardCode);
    const resolvedLocation =
      data.location && !data.location.startsWith(data.billboardCode)
        ? data.location
        : existingLocObj
        ? existingLocObj.shortNameEn
        : data.location || data.billboardCode;
    const resolvedAssetCode = existingLocObj ? existingLocObj.assetCode : `AST-${data.billboardCode}`;

    if (!existingLocObj) {
      const newSite: BillboardSite = {
        id: `site-${Date.now()}`,
        code: data.billboardCode,
        assetCode: resolvedAssetCode,
        name: `${data.billboardCode}: ${resolvedLocation}`,
        shortName: resolvedLocation,
        shortNameEn: resolvedLocation,
        zone: 'Central Corridor',
        gpsCoords: '3.1466° N, 101.7112° E',
        displayType: 'Outdoor Unipole / LED Floodlight System',
        electricalSpec: '415V 3-Phase DB • 6x 400W IP66 LED Floodlight',
      };
      setSites((prev) => [newSite, ...prev]);
    }

    const newTicket: Ticket = {
      id: newId,
      auditKey: `${data.billboardCode}-${nextNum}`,
      billboardCode: data.billboardCode,
      assetCode: resolvedAssetCode,
      location: resolvedLocation,
      locationEn: resolvedLocation,
      addressFull: `${resolvedLocation}, Malaysia`,
      addressFullEn: `${resolvedLocation}, Malaysia`,
      displayType: existingLocObj?.displayType || 'Outdoor Unipole / LED Floodlight System',
      iconType: 'signpost',
      priority: data.priority,
      priorityEn:
        data.priority === 'Segera'
          ? 'Urgent'
          : data.priority === 'Tinggi'
          ? 'High'
          : data.priority === 'Sederhana'
          ? 'Medium'
          : 'Low',
      status: 'Assigned',
      registeredTime: 'Just now',
      registeredTimeEn: 'Just now',
      slaText: 'Within 24 Hours',
      slaTextEn: 'Within 24 Hours',
      contractor: data.contractor,
      contractorFull: data.contractor,
      cidbReg: '012018-SL-044120',
      technician: 'Ahmad Taufiq (PW4)',
      wiremanCert: '012-3456789 / PW4 Wireman',
      faultDescription: data.faultDescription.trim(),
      faultDescriptionEn: data.faultDescription.trim(),
      faultShort: data.faultDescription.trim().slice(0, 68),
      faultShortEn: data.faultDescription.trim().slice(0, 68),
      contractorUrl: `https://billboard-system.my/portal/contractor-form?id=${newId}&token=a8f${nextNum}`,
      repairSummary: 'Awaiting field completion submission from appointed contractor.',
      repairSummaryEn: 'Awaiting field completion submission from appointed contractor.',
      technicalNotes: 'New ticket registered and contractor link dispatched.',
      technicalNotesEn: 'New ticket registered and contractor link dispatched.',
      partsUsed: [
        {
          id: `p-${nextNum}-1`,
          sku: 'SKU-LED-400W-HV',
          name: 'LED Spotlight 400W IP66',
          subtitle: 'Industrial Grade Outdoor Weatherproof',
          qty: 1,
          unit: 'unit',
          unitCost: 450,
          icon: 'lightbulb',
        },
      ],
      photos: [
        {
          id: `ph-${nextNum}-1`,
          phaseLabel: 'Photo 1: Before Repair',
          phaseLabelEn: 'Photo 1: Before Repair',
          badgeText: `${data.billboardCode} • BEFORE`,
          title: 'Photo 1: Before Repair',
          titleEn: 'Photo 1: Before Repair',
          subtitle: 'Initial fault report on-site',
          subtitleEn: 'Initial fault report on-site',
          timestamp: '24-10-2024 10:30',
          url: IMAGES.s03Photo1,
          gpsLat: '3.1466° N',
          gpsLng: '101.7112° E',
          statusText: 'STATUS: REPORTED',
          statusTime: '10:30 AM',
        },
        {
          id: `ph-${nextNum}-2`,
          phaseLabel: 'Photo 2: During Work / DB Panel',
          phaseLabelEn: 'Photo 2: During Work / DB Panel',
          badgeText: `${data.billboardCode} • PROCESS`,
          title: 'Photo 2: During Work / DB Panel',
          titleEn: 'Photo 2: During Work / DB Panel',
          subtitle: 'Electrical component inspection',
          subtitleEn: 'Electrical component inspection',
          timestamp: '24-10-2024 11:00',
          url: IMAGES.s03Photo2,
          telemetryLeft: 'Test: 500V MEGGER',
          telemetryRight: '240.0 VAC',
          statusText: 'UNDER TEST',
          statusTime: '11:00 AM',
        },
        {
          id: `ph-${nextNum}-3`,
          phaseLabel: 'Photo 3: Completed / Illumination Test',
          phaseLabelEn: 'Photo 3: Completed / Illumination Test',
          badgeText: `${data.billboardCode} • VERIFIED`,
          title: 'Photo 3: Completed / Illumination Test',
          titleEn: 'Photo 3: Completed / Illumination Test',
          subtitle: 'Ready for supervisor review',
          subtitleEn: 'Ready for supervisor review',
          timestamp: '24-10-2024 12:00',
          url: IMAGES.s03Photo3,
          telemetryLeft: 'Load: Stable',
          telemetryRight: 'DB Sealed',
          statusText: 'VERIFIED COMPLETE',
          statusTime: '12:00 PM',
        },
      ],
      jccNumber: `JCC-2024-BB${nextNum}`,
      invoiceNumber: `Invoice #CNT-24-${nextNum}`,
      approvedDate: '24-OCT-2024',
      approvedDateEn: '24-OCT-2024',
      approvedBy: 'Siti Zahara (Supervisor)',
      signatureRef: `SIG-99${nextNum}`,
      grandTotal: 450,
      pdfFilename: `JCC-2024-BB${nextNum}_COMPLETION_CERT.pdf`,
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicket.id);
    showToast(
      isEn ? 'Ticket Issued (F02)' : 'Tiket Berjaya Dijana (F02)',
      isEn
        ? `Ticket #${newId} (${data.billboardCode}) assigned to ${data.contractor}.`
        : `Tiket #${newId} (${data.billboardCode}) telah ditugaskan kepada ${data.contractor}.`
    );
    return { ok: true, ticket: newTicket };
  };

  // F03: Contractor submits work completion + deducts inventory stock
  const handleContractorSubmit = (
    ticketId: string,
    payload: {
      companyName: string;
      technicianName: string;
      licenseNo: string;
      partsUsed: PartUsed[];
      photos: TicketPhoto[];
      repairSummary: string;
      billboardCode?: string;
      assetCode?: string;
      location?: string;
      faultDescription?: string;
    }
  ) => {
    const totalCost = payload.partsUsed.reduce((sum, p) => sum + p.qty * p.unitCost, 0);

    setInventory((prevInv) =>
      prevInv.map((item) => {
        const usedPart = payload.partsUsed.find(
          (p) =>
            p.sku.toLowerCase() === item.sku.toLowerCase() ||
            item.name.toLowerCase().includes(p.name.toLowerCase().slice(0, 10))
        );
        if (!usedPart) return item;
        const nextQty = Math.max(0, item.quantity - usedPart.qty);
        const isCrit = nextQty <= item.minThreshold;
        return {
          ...item,
          quantity: nextQty,
          levelType: isCrit ? 'critical' : 'normal',
          statusLabel: isCrit ? 'Critical Low' : item.statusLabel,
          statusLabelEn: isCrit ? 'Critical Low' : item.statusLabelEn,
          lastUpdated: 'Just now (Work Order Deduction)',
        };
      })
    );

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'Pending Approval',
          billboardCode: payload.billboardCode || t.billboardCode,
          assetCode: payload.assetCode || t.assetCode,
          location: payload.location || t.location,
          locationEn: payload.location || t.locationEn,
          faultShort: payload.faultDescription || t.faultShort,
          faultShortEn: payload.faultDescription || t.faultShortEn,
          contractorFull: payload.companyName,
          technician: payload.technicianName,
          wiremanCert: payload.licenseNo,
          partsUsed: payload.partsUsed,
          photos: payload.photos,
          repairSummary: payload.repairSummary,
          repairSummaryEn: payload.repairSummary,
          grandTotal: totalCost > 0 ? totalCost : t.grandTotal,
          registeredTime: 'Submitted: Just now',
          registeredTimeEn: 'Submitted: Just now',
          slaText: 'Awaiting Supervisor E-Signature',
          slaTextEn: 'Awaiting Supervisor E-Signature',
        };
      })
    );

    showToast(
      isEn ? 'Work Order Submitted (F03)' : 'Laporan Kerja Dihantar (F03)',
      isEn
        ? `Ticket #${ticketId} moved to Pending Approval & inventory stock updated.`
        : `Tiket #${ticketId} dikemas kini ke Menunggu Kelulusan & stok inventori ditolak.`
    );
  };

  // F04: Supervisor E-Signature Approval
  const handleApproveTicket = (ticketId: string, signatureDataUrl: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'Approved for Payment',
          signatureDataUrl,
          approvedDate: '24-OCT-2024',
          approvedDateEn: '24-OCT-2024',
          registeredTime: 'Verified: Today',
          registeredTimeEn: 'Verified: Today',
        };
      })
    );
    showToast(
      isEn ? 'Supervisor E-Signature Verified (F04)' : 'Kelulusan E-Signature Sah (F04)',
      isEn
        ? `Ticket #${ticketId} is now Approved for Payment and locked in the Finance Audit Ledger.`
        : `Tiket #${ticketId} kini Diluluskan untuk Pembayaran dan dikunci dalam Lejar Audit Kewangan.`
    );
  };

  // F04: Supervisor requests revision from contractor
  const handleRequestRevision = (ticketId: string, reason: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'Assigned',
          slaText: `Revision Requested: ${reason.slice(0, 30)}`,
          slaTextEn: `Revision Requested: ${reason.slice(0, 30)}`,
        };
      })
    );
    showToast(
      isEn ? 'Returned to Contractor' : 'Dikembalikan Kepada Kontraktor',
      isEn
        ? `Ticket #${ticketId} status reverted to Assigned with supervisor notes.`
        : `Status tiket #${ticketId} dikembalikan kepada Ditugaskan berserta ulasan penyelia.`,
      true
    );
  };

  // F01: Inventory stock adjustment
  const handleUpdateInventoryQty = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextQty = Math.max(0, item.quantity + delta);
        const isCrit = nextQty <= item.minThreshold;
        return {
          ...item,
          quantity: nextQty,
          levelType: isCrit ? 'critical' : 'normal',
          statusLabel: isCrit ? 'Low Stock' : 'Sufficient',
          statusLabelEn: isCrit ? 'Low Stock' : 'Sufficient',
          lastUpdated: 'Just now',
        };
      })
    );
    showToast(
      isEn ? 'Stock Ledger Updated' : 'Lejar Stok Dikemas Kini',
      isEn
        ? 'Electrical component quantity updated in central depot.'
        : 'Kuantiti komponen elektrik dikemas kini dalam depoh pusat.'
    );
  };

  const handleAddInventoryItem = (newItem: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const created: InventoryItem = {
      ...newItem,
      id: `inv-${Date.now()}`,
      lastUpdated: 'Just now',
    };
    setInventory((prev) => [created, ...prev]);
    showToast(
      isEn ? 'Component Added (F01)' : 'Komponen Ditambah (F01)',
      `${created.sku} — ${created.name}`
    );
  };

  const handleEditInventoryItem = (updatedItem: InventoryItem) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    showToast(
      isEn ? 'Equipment Updated (F01)' : 'Kelengkapan Elektrik Dikemaskini (F01)',
      `${updatedItem.sku} — ${updatedItem.name}`
    );
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
    showToast(
      isEn ? 'Equipment Removed' : 'Kelengkapan Elektrik Dipadam',
      isEn ? 'Item removed from electrical inventory.' : 'Item telah dipadam daripada inventori.'
    );
  };

  // CSV Exports
  const handleExportTicketsCsv = () => {
    const headers = [
      'Ticket_ID',
      'JCC_Number',
      'Billboard_Code',
      'Location',
      'Contractor',
      'Status',
      'Total_RM',
      'Approved_By',
      'Approved_Date',
    ];
    const rows = tickets.map((t) => [
      t.id,
      t.jccNumber,
      t.billboardCode,
      `"${t.locationEn.replace(/"/g, '""')}"`,
      `"${t.contractor.replace(/"/g, '""')}"`,
      t.status,
      t.grandTotal.toFixed(2),
      `"${t.approvedBy}"`,
      t.approvedDateEn,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'BillboardOps_Audit_Invoices_2024.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(
      isEn ? 'CSV Exported' : 'Eksport CSV Berjaya',
      isEn
        ? 'Downloaded BillboardOps_Audit_Invoices_2024.csv'
        : 'Memuat turun fail BillboardOps_Audit_Invoices_2024.csv'
    );
  };

  const handleExportInventoryCsv = () => {
    const headers = [
      'SKU',
      'Component_Name',
      'Quantity',
      'Min_Threshold',
      'Unit',
      'Unit_Cost_RM',
      'Status',
    ];
    const rows = inventory.map((i) => [
      i.sku,
      `"${i.name.replace(/"/g, '""')}"`,
      i.quantity,
      i.minThreshold,
      i.unit,
      i.unitCost.toFixed(2),
      i.statusLabelEn,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'BillboardOps_Electrical_Inventory_2024.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(
      isEn ? 'Inventory CSV Exported' : 'Eksport CSV Inventori',
      isEn
        ? 'Downloaded BillboardOps_Electrical_Inventory_2024.csv'
        : 'Fail BillboardOps_Electrical_Inventory_2024.csv telah dimuat turun.'
    );
  };

  const handleModalReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFaultDesc.trim()) return;
    if (modalCustomSiteMode && (!modalCustomSiteCode.trim() || !modalCustomSiteLocation.trim())) {
      return;
    }
    const locObj = sites.find((l) => l.code === modalLocationCode) || sites[0] || BILLBOARD_LOCATIONS[0];
    const finalCode = modalCustomSiteMode
      ? modalCustomSiteCode.trim().toUpperCase()
      : modalLocationCode;
    const finalLocation = modalCustomSiteMode
      ? modalCustomSiteLocation.trim()
      : locObj.shortNameEn;

    const res = handleCreateTicket({
      billboardCode: finalCode,
      location: finalLocation,
      priority: modalPriority,
      contractor: modalContractor,
      faultDescription: modalFaultDesc,
    });
    if (res.ok) {
      setModalFaultDesc('');
      setModalCustomSiteLocation('');
      setReportModalOpen(false);
    }
  };

  const filteredTickets = searchQuery.trim()
    ? tickets.filter((t) => {
        const q = searchQuery.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.locationEn.toLowerCase().includes(q) ||
          t.contractor.toLowerCase().includes(q) ||
          t.billboardCode.toLowerCase().includes(q) ||
          t.faultDescription.toLowerCase().includes(q)
        );
      })
    : tickets;

  const renderScreenContent = () => {
    if (activeScreen === 's02-mint' && s02LayoutStyle === 'mint-classic') {
      return (
        <ScreenS02Mint
          lang={lang}
          tickets={filteredTickets}
          inventory={inventory}
          sites={sites}
          role={role}
          layoutStyle={s02LayoutStyle}
          onToggleLayoutStyle={setS02LayoutStyle}
          onNavigate={handleNavigate}
          onCreateTicket={handleCreateTicket}
          onOpenReportModal={() => setReportModalOpen(true)}
          onOpenStockModal={() => setStockModalOpen(true)}
          onOpenMasterDataModal={handleOpenMasterDataModal}
          onExportInventoryCsv={handleExportInventoryCsv}
          showToast={showToast}
        />
      );
    }

    return (
      <SidebarShell
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        lang={lang}
        onToggleLang={setLang}
        role={role}
        onChangeRole={(newRole) => {
          setRole(newRole);
          showToast(
            isEn ? 'Role Switched' : 'Peranan Ditukar',
            isEn
              ? `Active role changed to ${newRole.toUpperCase()}`
              : `Peranan aktif ditukar kepada ${newRole.toUpperCase()}`
          );
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenReportModal={() => setReportModalOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenMasterDataModal={handleOpenMasterDataModal}
        isAccessUnlocked={isAccessUnlocked}
        onResetDemoData={handleResetDemoData}
        inventory={inventory}
        tickets={tickets}
        selectedTicketId={selectedTicketId}
      >
        {activeScreen === 's02-mint' && (
          <ScreenS02Mint
            lang={lang}
            tickets={filteredTickets}
            inventory={inventory}
            sites={sites}
            role={role}
            layoutStyle={s02LayoutStyle}
            onToggleLayoutStyle={setS02LayoutStyle}
            onNavigate={handleNavigate}
            onCreateTicket={handleCreateTicket}
            onOpenReportModal={() => setReportModalOpen(true)}
            onOpenStockModal={() => setStockModalOpen(true)}
            onOpenMasterDataModal={handleOpenMasterDataModal}
            onExportInventoryCsv={handleExportInventoryCsv}
            showToast={showToast}
          />
        )}
        {activeScreen === 's01-hub' && (
          <ScreenS01Hub
            lang={lang}
            tickets={filteredTickets}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}
        {activeScreen === 'f01-inventory' && (
          <ScreenF01Inventory
            lang={lang}
            role={role}
            inventory={inventory}
            onUpdateQty={handleUpdateInventoryQty}
            onAddInventoryItem={handleAddInventoryItem}
            onEditInventoryItem={handleEditInventoryItem}
            onDeleteInventoryItem={handleDeleteInventoryItem}
            onOpenMasterDataModal={handleOpenMasterDataModal}
            showToast={showToast}
          />
        )}
        {activeScreen === 's03-contractor' && (
          <ScreenS03Contractor
            lang={lang}
            tickets={filteredTickets}
            selectedTicketId={selectedTicketId}
            onSelectTicketId={setSelectedTicketId}
            inventory={inventory}
            onSubmitCompletion={handleContractorSubmit}
            onOpenMasterDataModal={handleOpenMasterDataModal}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}
        {activeScreen === 's04-approval' && (
          <ScreenS04Approval
            lang={lang}
            role={role}
            tickets={filteredTickets}
            selectedTicketId={selectedTicketId}
            onSelectTicketId={setSelectedTicketId}
            onApproveTicket={handleApproveTicket}
            onRequestRevision={handleRequestRevision}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}
        {activeScreen === 's05-finance' && (
          <ScreenS05Finance
            lang={lang}
            tickets={filteredTickets}
            selectedTicketId={selectedTicketId}
            onSelectTicketId={setSelectedTicketId}
            onExportCsv={handleExportTicketsCsv}
            showToast={showToast}
          />
        )}
        {activeScreen === 'f06-logs' && (
          <ScreenF06Logs
            lang={lang}
            tickets={filteredTickets}
            sites={sites}
            onExportCsv={handleExportTicketsCsv}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}
      </SidebarShell>
    );
  };

  return (
    <div className="relative min-h-screen">
      {renderScreenContent()}

      {/* Universal Quick Command Palette Modal (⌘K / Ctrl+K) */}
      {commandPaletteOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div
            className="bg-surface-panel rounded-xl max-w-xl w-full border border-border-strong shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-border-subtle flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">terminal</span>
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder={
                  isEn
                    ? 'Jump to screen, ticket (#TKT-2024-084), or action...'
                    : 'Cari skrin, tiket (#TKT-2024-084), atau arahan pantas...'
                }
                className="w-full bg-transparent text-sm text-on-surface focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(false)}
                className="font-code-metric text-[11px] px-2 py-0.5 rounded bg-surface-container-low text-secondary cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 divide-y divide-border-subtle">
              {/* Master Data & Access Code 1111 Shortcut */}
              <div className="py-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    handleOpenMasterDataModal('sites');
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs font-bold text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">
                      {isAccessUnlocked ? 'lock_open' : 'lock'}
                    </span>
                    <span>
                      {isEn
                        ? 'Update Sites, Locations & Electrical Equipment'
                        : 'Kemaskini Sites, Lokasi & Kelengkapan Elektrik'}
                    </span>
                  </span>
                  <span className="font-code-metric text-[10px] px-2 py-0.5 rounded bg-navy-header text-white">
                    CODE: 1111
                  </span>
                </button>
              </div>

              {/* Quick Navigation */}
              <div className="py-1.5">
                <div className="px-3 py-1 text-[10px] font-code-metric uppercase text-secondary">
                  {isEn ? 'Operations Modules & Screens' : 'Skrin & Modul Operasi'}
                </div>
                {(
                  [
                    {
                      id: 's02-mint',
                      label: '1. Dashboard & Fault Tickets (S02 / F02)',
                      langMode: 'en',
                    },
                    {
                      id: 's01-hub',
                      label: '2. System Operations Hub & Corridor Map (S01)',
                      langMode: 'en',
                    },
                    {
                      id: 'f01-inventory',
                      label: '3. Electrical Spare Parts Inventory Ledger (F01)',
                      langMode: 'en',
                    },
                    {
                      id: 's03-contractor',
                      label: '4. Contractor Job Completion Form (S03 / F03)',
                      langMode: 'en',
                    },
                    {
                      id: 's04-approval',
                      label: '5. Supervisor Verification & E-Signature (S04 / F04)',
                      langMode: 'en',
                    },
                    {
                      id: 's05-finance',
                      label: '6. Contractor Invoice Audit & Payment Clearance (S05 / F05)',
                      langMode: 'en',
                    },
                    {
                      id: 'f06-logs',
                      label: '7. Client Summary Reports & Safety Logs (F06)',
                      langMode: 'en',
                    },
                  ] as const
                )
                  .filter(
                    (item) =>
                      !commandQuery.trim() ||
                      item.label.toLowerCase().includes(commandQuery.toLowerCase())
                  )
                  .map((item, idx) => (
                    <button
                      key={`${item.id}-${idx}`}
                      type="button"
                      onClick={() => {
                        setLang(item.langMode);
                        handleNavigate(item.id);
                        setCommandPaletteOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-on-surface hover:bg-surface-container-low rounded-lg flex items-center justify-between cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <span className="font-code-metric text-[10px] text-secondary uppercase">
                        {item.langMode.toUpperCase()}
                      </span>
                    </button>
                  ))}
              </div>

              {/* Tickets Quick Jump */}
              <div className="py-1.5">
                <div className="px-3 py-1 text-[10px] font-code-metric uppercase text-secondary">
                  {isEn ? 'Work Order Tickets & JCC Certificates' : 'Tiket & Sijil JCC'}
                </div>
                {tickets
                  .filter(
                    (t) =>
                      !commandQuery.trim() ||
                      t.id.toLowerCase().includes(commandQuery.toLowerCase()) ||
                      t.locationEn.toLowerCase().includes(commandQuery.toLowerCase())
                  )
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        const targetScreen =
                          t.status === 'Assigned'
                            ? 's03-contractor'
                            : t.status === 'Pending Approval'
                            ? 's04-approval'
                            : 's05-finance';
                        handleNavigate(targetScreen, t.id);
                        setCommandPaletteOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-surface-container-low rounded-lg flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <span className="font-code-metric font-bold text-on-surface">#{t.id}</span>{' '}
                        <span className="text-secondary">— {t.locationEn}</span>
                      </div>
                      <span className="font-code-metric text-[10px] text-primary font-semibold">
                        {t.status}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global + Report Fault Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-panel rounded-xl max-w-lg w-full p-space-lg border border-border-strong shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-status-pending-amber">bolt</span>
                <h3 className="font-headline-md text-title-md font-bold text-on-surface">
                  {isEn
                    ? 'Register New Billboard Fault Ticket (F02)'
                    : 'Daftar Tiket Kerosakan Papan Iklan Baru (F02)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleModalReportSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-label-sm text-secondary uppercase">
                    {isEn ? 'Billboard Location / Structure ID' : 'Lokasi / ID Papan Iklan'}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalCustomSiteMode((prev) => !prev)}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      {modalCustomSiteMode
                        ? isEn
                          ? 'Select from List'
                          : 'Pilih dari Senarai'
                        : isEn
                        ? '+ Custom Site / Location'
                        : '+ Taip Site / Lokasi Baru'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReportModalOpen(false);
                        handleOpenMasterDataModal('sites');
                      }}
                      className="text-[11px] font-code-metric font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high border border-border-subtle cursor-pointer"
                    >
                      {isEn ? 'Manage All (1111)' : 'Urus Semua (1111)'}
                    </button>
                  </div>
                </div>
                {modalCustomSiteMode ? (
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      value={modalCustomSiteCode}
                      onChange={(e) => setModalCustomSiteCode(e.target.value)}
                      placeholder="BB-007"
                      className="col-span-1 px-3 py-2.5 rounded-lg border border-primary bg-surface-canvas font-code-metric font-bold text-body-sm text-on-surface"
                    />
                    <input
                      type="text"
                      required
                      value={modalCustomSiteLocation}
                      onChange={(e) => setModalCustomSiteLocation(e.target.value)}
                      placeholder={
                        isEn
                          ? 'Enter exact billboard location...'
                          : 'Masukkan lokasi sebenar papan iklan...'
                      }
                      className="col-span-2 px-3 py-2.5 rounded-lg border border-primary bg-surface-canvas text-body-sm text-on-surface"
                    />
                  </div>
                ) : (
                  <select
                    value={modalLocationCode}
                    onChange={(e) => setModalLocationCode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border-strong bg-surface-canvas text-body-sm text-on-surface"
                  >
                    {sites.map((loc) => (
                      <option key={loc.code} value={loc.code}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-secondary uppercase mb-1">
                    {isEn ? 'Priority Level' : 'Tahap Keutamaan'}
                  </label>
                  <select
                    value={modalPriority}
                    onChange={(e) =>
                      setModalPriority(
                        e.target.value as 'Tinggi' | 'Sederhana' | 'Segera' | 'Rendah'
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-border-strong bg-surface-canvas text-body-sm text-on-surface"
                  >
                    <option value="Segera">
                      {isEn ? 'Urgent (Short Circuit Emergency)' : 'Segera (Kecemasan Litar Pintas)'}
                    </option>
                    <option value="Tinggi">
                      {isEn ? 'High (12-Hour SLA)' : 'Tinggi (SLA 12 Jam)'}
                    </option>
                    <option value="Sederhana">
                      {isEn ? 'Medium (24-Hour SLA)' : 'Sederhana (SLA 24 Jam)'}
                    </option>
                    <option value="Rendah">
                      {isEn ? 'Low (Routine Maintenance)' : 'Rendah (Penyelenggaraan Berkala)'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-sm text-secondary uppercase mb-1">
                    {isEn ? 'Appointed Contractor' : 'Kontraktor Dilantik'}
                  </label>
                  <select
                    value={modalContractor}
                    onChange={(e) => setModalContractor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border-strong bg-surface-canvas text-body-sm text-on-surface"
                  >
                    <option value="MegaVolt Engineering Sdn Bhd">
                      MegaVolt Engineering Sdn Bhd
                    </option>
                    <option value="Apex Power Works">Apex Power Works</option>
                    <option value="Southern Bright Electrical">Southern Bright Electrical</option>
                    <option value="Elektrik Jaya Services">Elektrik Jaya Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-secondary uppercase mb-1">
                  {isEn ? 'Electrical Fault Description' : 'Keterangan Kerosakan Elektrik'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={modalFaultDesc}
                  onChange={(e) => setModalFaultDesc(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Example: 3 units of 400W LED floodlights unlit on left rack & incoming MCB breaker tripped...'
                      : 'Contoh: 3 lampu limpah LED 400W padam di sebelah kiri & pemutus litar MCB trip...'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-canvas text-body-sm text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border-strong text-secondary font-label-md cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-status-pending-amber hover:bg-primary text-on-primary font-label-md uppercase cursor-pointer"
                >
                  {isEn ? 'Generate Ticket & Link' : 'Jana Tiket & Pautan Kerja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Adjustment Modal */}
      {stockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-panel rounded-xl max-w-2xl w-full p-space-lg border border-border-strong shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
              <div>
                <h3 className="font-headline-md text-title-md font-bold text-on-surface">
                  {isEn
                    ? 'Quick Electrical Spare Parts Stock Adjustment (F01)'
                    : 'Kemaskini Pantas Inventori Alat Ganti Elektrik (F01)'}
                </h3>
                <p className="font-body-sm text-secondary">
                  {isEn
                    ? 'Adjust current depot stock quantities or open the full inventory ledger.'
                    : 'Laraskan baki stok semasa atau buka lejar inventori penuh.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStockModalOpen(false)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-border-subtle flex-1 pr-1">
              {inventory.map((item) => {
                const isCrit = item.quantity <= item.minThreshold;
                return (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface text-body-sm">
                          {item.name}
                        </span>
                        <span className="font-code-metric text-label-sm text-secondary">
                          ({item.sku})
                        </span>
                        {isCrit && (
                          <span className="font-code-metric text-[10px] font-bold text-status-assigned-red">
                            · {isEn ? 'CRITICAL' : 'KRITIKAL'} (Min: {item.minThreshold})
                          </span>
                        )}
                      </div>
                      <p className="text-label-sm text-secondary">{item.notes}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateInventoryQty(item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-16 text-center font-code-metric font-bold text-on-surface">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateInventoryQty(item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-navy-header hover:bg-slate-800 text-white font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStockModalOpen(false);
                    handleNavigate('f01-inventory');
                  }}
                  className="text-primary font-bold text-body-sm hover:underline cursor-pointer"
                >
                  {isEn
                    ? 'Open Full Inventory Ledger (F01) \u2192'
                    : 'Buka Jadual Penuh Inventori (F01) \u2192'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStockModalOpen(false);
                    handleOpenMasterDataModal('equipment');
                  }}
                  className="text-xs font-code-metric font-bold px-2.5 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high border border-border-subtle cursor-pointer"
                >
                  {isEn ? 'Edit Equipment Details (Code: 1111)' : 'Kemaskini Kelengkapan (Kod: 1111)'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStockModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-navy-header text-white font-label-md cursor-pointer"
              >
                {isEn ? 'Done' : 'Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Data Manager Modal (Protected by Access Code 1111) */}
      <MasterDataModal
        isOpen={masterDataModalOpen}
        onClose={() => setMasterDataModalOpen(false)}
        lang={lang}
        isUnlocked={isAccessUnlocked}
        onUnlock={handleUnlockAccess}
        onLock={handleLockAccess}
        initialTab={masterDataInitialTab}
        sites={sites}
        onSaveSite={(site, isNew) => {
          if (isNew) {
            setSites((prev) => [site, ...prev]);
          } else {
            setSites((prev) => prev.map((s) => (s.id === site.id ? site : s)));
            // Also sync any tickets matching this site code
            setTickets((prev) =>
              prev.map((t) =>
                t.billboardCode === site.code
                  ? {
                      ...t,
                      assetCode: site.assetCode,
                      location: site.shortName,
                      locationEn: site.shortNameEn,
                      addressFull: `${site.shortName}, Malaysia`,
                      addressFullEn: `${site.shortNameEn}, Malaysia`,
                      displayType: site.displayType,
                    }
                  : t
              )
            );
          }
        }}
        onDeleteSite={(id) => {
          setSites((prev) => prev.filter((s) => s.id !== id));
          showToast(
            isEn ? 'Site Removed' : 'Tapak Dipadam',
            isEn ? 'Billboard site removed from master list.' : 'Tapak papan iklan telah dipadam.'
          );
        }}
        inventory={inventory}
        onSaveInventoryItem={(item, isNew) => {
          if (isNew) {
            setInventory((prev) => [item, ...prev]);
          } else {
            setInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)));
          }
        }}
        onDeleteInventoryItem={handleDeleteInventoryItem}
        tickets={tickets}
        onUpdateTicketDetails={(ticketId, updates) => {
          setTickets((prev) =>
            prev.map((t) =>
              t.id === ticketId
                ? {
                    ...t,
                    ...updates,
                    contractorFull: updates.contractor,
                    faultDescription: updates.faultShortEn,
                    faultDescriptionEn: updates.faultShortEn,
                  }
                : t
            )
          );
        }}
        showToast={showToast}
      />

      {/* Sleek Non-Intrusive Enterprise Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-5 right-5 z-50 bg-navy-header text-white px-4 py-3 rounded-xl shadow-2xl border border-white/15 flex items-center gap-3 max-w-md print:hidden">
          <span
            className={`material-symbols-outlined ${
              toast.isError ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {toast.isError ? 'error' : 'check_circle'}
          </span>
          <div className="text-xs">
            <p className="font-bold">{toast.title}</p>
            <p className="text-slate-300 mt-0.5">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
