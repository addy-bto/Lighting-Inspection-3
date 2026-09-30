import React, { useState } from 'react';
import {
  BillboardSite,
  InventoryItem,
  LangMode,
  SYSTEM_ACCESS_CODE,
  Ticket,
} from '../data/initialData';

interface MasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LangMode;
  isUnlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
  initialTab?: 'sites' | 'equipment' | 'tickets';
  sites: BillboardSite[];
  onSaveSite: (site: BillboardSite, isNew: boolean) => void;
  onDeleteSite: (id: string) => void;
  inventory: InventoryItem[];
  onSaveInventoryItem: (item: InventoryItem, isNew: boolean) => void;
  onDeleteInventoryItem: (id: string) => void;
  tickets: Ticket[];
  onUpdateTicketDetails: (
    ticketId: string,
    updates: {
      billboardCode: string;
      assetCode: string;
      location: string;
      locationEn: string;
      addressFull: string;
      addressFullEn: string;
      displayType: string;
      contractor: string;
      technician: string;
      faultShort: string;
      faultShortEn: string;
    }
  ) => void;
  showToast: (title: string, message: string, isError?: boolean) => void;
}

export const MasterDataModal: React.FC<MasterDataModalProps> = ({
  isOpen,
  onClose,
  lang,
  isUnlocked,
  onUnlock,
  onLock,
  initialTab = 'sites',
  sites,
  onSaveSite,
  onDeleteSite,
  inventory,
  onSaveInventoryItem,
  onDeleteInventoryItem,
  tickets,
  onUpdateTicketDetails,
  showToast,
}) => {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState<'sites' | 'equipment' | 'tickets'>(initialTab);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Site Form State
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [siteCode, setSiteCode] = useState('');
  const [assetCode, setAssetCode] = useState('');
  const [locationName, setLocationName] = useState('');
  const [zoneName, setZoneName] = useState('Central Zone (Klang Valley)');
  const [gpsCoords, setGpsCoords] = useState('3.1466° N, 101.7112° E');
  const [displayType, setDisplayType] = useState('2-Sided Unipole (Static 40x20ft)');
  const [electricalSpec, setElectricalSpec] = useState(
    '3-Phase 415V DB, 8x 150W LED Floodlights, SPD 40kA, Timer Theben 24H'
  );

  // Equipment Form State
  const [editingEquipId, setEditingEquipId] = useState<string | null>(null);
  const [eqSku, setEqSku] = useState('');
  const [eqName, setEqName] = useState('');
  const [eqSubtitle, setEqSubtitle] = useState('');
  const [eqQty, setEqQty] = useState(10);
  const [eqMin, setEqMin] = useState(5);
  const [eqUnit, setEqUnit] = useState('unit');
  const [eqCost, setEqCost] = useState(250);
  const [eqNotes, setEqNotes] = useState('');

  // Ticket Edit State
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || 'TKT-2024-089');
  const currentTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];
  const [tktSiteCode, setTktSiteCode] = useState(currentTicket?.billboardCode || 'BB-001');
  const [tktAssetCode, setTktAssetCode] = useState(currentTicket?.assetCode || 'PLS-SB-024');
  const [tktLocation, setTktLocation] = useState(currentTicket?.locationEn || '');
  const [tktAddress, setTktAddress] = useState(currentTicket?.addressFullEn || '');
  const [tktDisplayType, setTktDisplayType] = useState(currentTicket?.displayType || '');
  const [tktContractor, setTktContractor] = useState(currentTicket?.contractor || '');
  const [tktTechnician, setTktTechnician] = useState(currentTicket?.technician || '');
  const [tktFault, setTktFault] = useState(currentTicket?.faultShortEn || '');

  if (!isOpen) return null;

  const handlePinSubmit = (e?: React.FormEvent, overridePin?: string) => {
    if (e) e.preventDefault();
    const candidate = overridePin !== undefined ? overridePin : pinInput;
    if (candidate === SYSTEM_ACCESS_CODE) {
      setPinError(false);
      setPinInput('');
      onUnlock();
      showToast(
        isEn ? 'Access Code 1111 Verified' : 'Kod Akses 1111 Disahkan',
        isEn
          ? 'Master Data Editor unlocked for Sites, Locations & Electrical Equipment.'
          : 'Editor Data Induk dibuka untuk kemas kini Sites, Lokasi & Kelengkapan Elektrik.'
      );
    } else {
      setPinError(true);
      showToast(
        isEn ? 'Invalid Access Code' : 'Kod Akses Tidak Sah',
        isEn ? 'Please enter access code 1111.' : 'Sila masukkan kod akses 1111.',
        true
      );
    }
  };

  const handleDigitClick = (digit: string) => {
    const next = (pinInput + digit).slice(0, 4);
    setPinInput(next);
    setPinError(false);
    if (next.length === 4) {
      handlePinSubmit(undefined, next);
    }
  };

  const startEditSite = (site: BillboardSite) => {
    setEditingSiteId(site.id);
    setSiteCode(site.code);
    setAssetCode(site.assetCode);
    setLocationName(site.shortNameEn || site.shortName);
    setZoneName(site.zone);
    setGpsCoords(site.gpsCoords);
    setDisplayType(site.displayType);
    setElectricalSpec(site.electricalSpec);
  };

  const resetSiteForm = () => {
    setEditingSiteId(null);
    setSiteCode('');
    setAssetCode('');
    setLocationName('');
    setZoneName('Central Zone (Klang Valley)');
    setGpsCoords('3.1466° N, 101.7112° E');
    setDisplayType('2-Sided Unipole (Static 40x20ft)');
    setElectricalSpec('3-Phase 415V DB, 8x 150W LED Floodlights, SPD 40kA, Timer Theben 24H');
  };

  const handleSubmitSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteCode.trim() || !locationName.trim()) return;
    const cleanCode = siteCode.trim().toUpperCase();
    const cleanLoc = locationName.trim();
    const payload: BillboardSite = {
      id: editingSiteId || `site-${Date.now()}`,
      code: cleanCode,
      assetCode: assetCode.trim() || `${cleanCode}-AST`,
      name: `${cleanCode}: ${cleanLoc}`,
      shortName: cleanLoc,
      shortNameEn: cleanLoc,
      zone: zoneName.trim() || 'Central Zone',
      gpsCoords: gpsCoords.trim() || '3.1466° N, 101.7112° E',
      displayType: displayType.trim() || 'Static Unipole 40x20ft',
      electricalSpec:
        electricalSpec.trim() || '3-Phase 415V DB, LED Floodlights, SPD 40kA, Timer Switch',
    };
    onSaveSite(payload, !editingSiteId);
    resetSiteForm();
  };

  const startEditEquip = (item: InventoryItem) => {
    setEditingEquipId(item.id);
    setEqSku(item.sku);
    setEqName(item.name);
    setEqSubtitle(item.subtitle);
    setEqQty(item.quantity);
    setEqMin(item.minThreshold);
    setEqUnit(item.unit);
    setEqCost(item.unitCost);
    setEqNotes(item.notes);
  };

  const resetEquipForm = () => {
    setEditingEquipId(null);
    setEqSku('');
    setEqName('');
    setEqSubtitle('');
    setEqQty(10);
    setEqMin(5);
    setEqUnit('unit');
    setEqCost(250);
    setEqNotes('');
  };

  const handleSubmitEquip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqSku.trim() || !eqName.trim()) return;
    const isCrit = eqQty <= eqMin;
    const payload: InventoryItem = {
      id: editingEquipId || `inv-${Date.now()}`,
      sku: eqSku.trim().toUpperCase(),
      name: eqName.trim(),
      subtitle: eqSubtitle.trim() || 'MS IEC 60364 Certified Electrical Equipment',
      quantity: eqQty,
      minThreshold: eqMin,
      maxCapacity: Math.max(eqQty * 2, 20),
      unit: eqUnit,
      unitCost: eqCost,
      statusLabel: isCrit ? 'Low Stock' : 'Sufficient',
      statusLabelEn: isCrit ? 'Low Stock' : 'Sufficient',
      levelType: isCrit ? 'critical' : 'normal',
      notes: eqNotes.trim() || 'Central Depot & Site Electrical Equipment',
      lastUpdated: 'Just updated',
    };
    onSaveInventoryItem(payload, !editingEquipId);
    resetEquipForm();
  };

  const handleSelectTicketForEdit = (id: string) => {
    setSelectedTicketId(id);
    const found = tickets.find((t) => t.id === id);
    if (found) {
      setTktSiteCode(found.billboardCode);
      setTktAssetCode(found.assetCode);
      setTktLocation(found.locationEn);
      setTktAddress(found.addressFullEn);
      setTktDisplayType(found.displayType);
      setTktContractor(found.contractor);
      setTktTechnician(found.technician);
      setTktFault(found.faultShortEn);
    }
  };

  const handleSubmitTicketEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTicket) return;
    onUpdateTicketDetails(currentTicket.id, {
      billboardCode: tktSiteCode.trim() || currentTicket.billboardCode,
      assetCode: tktAssetCode.trim() || currentTicket.assetCode,
      location: tktLocation.trim() || currentTicket.location,
      locationEn: tktLocation.trim() || currentTicket.locationEn,
      addressFull: tktAddress.trim() || currentTicket.addressFull,
      addressFullEn: tktAddress.trim() || currentTicket.addressFullEn,
      displayType: tktDisplayType.trim() || currentTicket.displayType,
      contractor: tktContractor.trim() || currentTicket.contractor,
      technician: tktTechnician.trim() || currentTicket.technician,
      faultShort: tktFault.trim() || currentTicket.faultShort,
      faultShortEn: tktFault.trim() || currentTicket.faultShortEn,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-surface-panel rounded-2xl max-w-5xl w-full border border-border-strong shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="px-5 py-4 bg-navy-header text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-[22px]">
                {isUnlocked ? 'tune' : 'lock'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-code-metric text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                  {isUnlocked
                    ? 'ACCESS CODE 1111 VERIFIED • MASTER DATA CONFIGURATION'
                    : 'SECURITY GATE • ACCESS CODE REQUIRED (1111)'}
                </span>
              </div>
              <h2 className="font-headline-md text-lg font-bold tracking-tight">
                {isEn
                  ? 'Sites, Locations & Electrical Equipment Manager'
                  : 'Pengurusan Sites, Lokasi & Kelengkapan Elektrik'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                type="button"
                onClick={onLock}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-code-metric text-amber-300 cursor-pointer"
                title={isEn ? 'Lock Master Data Editor' : 'Kunci Editor Data Induk'}
              >
                <span className="material-symbols-outlined text-[15px]">lock</span>
                <span>{isEn ? 'Lock (1111)' : 'Kunci (1111)'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* If Locked: Render Access Code 1111 Keypad Gate */}
        {!isUnlocked ? (
          <div className="p-6 sm:p-10 max-w-md mx-auto text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-status-pending-amber-bg border border-status-pending-amber-border text-status-pending-amber flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[34px]">pin</span>
            </div>
            <div>
              <h3 className="font-headline-md text-xl font-bold text-on-surface">
                {isEn ? 'Enter Access Code to Edit Data' : 'Masukkan Kod Akses Untuk Kemas Kini Data'}
              </h3>
              <p className="font-body-sm text-secondary mt-1">
                {isEn
                  ? 'Protected configuration for Billboard Sites, Locations, and Electrical Equipment. Default Access Code: 1111'
                  : 'Ruang konfigurasi bersepadu untuk Sites, Lokasi, dan Kelengkapan Elektrik. Kod Akses: 1111'}
              </p>
            </div>

            <form onSubmit={(e) => handlePinSubmit(e)} className="space-y-4">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPinInput(val);
                    setPinError(false);
                    if (val === SYSTEM_ACCESS_CODE) {
                      handlePinSubmit(undefined, val);
                    }
                  }}
                  placeholder="••••"
                  className={`w-48 h-14 text-center text-2xl tracking-[0.5em] font-code-metric font-bold rounded-xl border-2 bg-surface-canvas focus:outline-none ${
                    pinError
                      ? 'border-status-assigned-red text-status-assigned-red'
                      : 'border-border-strong focus:border-status-pending-amber text-on-surface'
                  }`}
                />
                {pinError && (
                  <p className="text-xs text-status-assigned-red font-semibold mt-1.5">
                    {isEn
                      ? 'Incorrect code. Please enter 1111.'
                      : 'Kod salah. Sila masukkan nombor 1111.'}
                  </p>
                )}
              </div>

              {/* Interactive Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDigitClick(d)}
                    className="h-11 rounded-lg bg-surface-container-low hover:bg-surface-container border border-border-subtle font-code-metric text-base font-bold text-on-surface cursor-pointer active:scale-95 transition-transform"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinInput('')}
                  className="h-11 rounded-lg bg-surface-container-low hover:bg-status-assigned-red-bg text-status-assigned-red border border-border-subtle font-label-sm text-xs uppercase font-bold cursor-pointer"
                >
                  CLR
                </button>
                <button
                  type="button"
                  onClick={() => handleDigitClick('0')}
                  className="h-11 rounded-lg bg-surface-container-low hover:bg-surface-container border border-border-subtle font-code-metric text-base font-bold text-on-surface cursor-pointer"
                >
                  0
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-lg bg-status-approved-green text-white font-label-sm text-xs uppercase font-bold cursor-pointer"
                >
                  OK
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePinSubmit(undefined, SYSTEM_ACCESS_CODE)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-header hover:bg-slate-800 text-amber-400 font-code-metric text-xs font-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">key</span>
                  <span>{isEn ? 'Quick Unlock (Code: 1111)' : 'Buka Pantas (Kod: 1111)'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Unlocked Master Data Workspace */
          <div className="flex flex-col max-h-[82vh]">
            {/* Tab Navigation */}
            <div className="px-5 pt-3 bg-surface-container-low border-b border-border-subtle flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('sites')}
                  className={`px-4 py-2.5 rounded-t-lg font-label-md text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'sites'
                      ? 'bg-surface-panel text-primary border-status-pending-amber font-bold'
                      : 'text-secondary border-transparent hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                  <span>
                    {isEn
                      ? `1. Sites & Locations (${sites.length})`
                      : `1. Sites & Lokasi (${sites.length})`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('equipment')}
                  className={`px-4 py-2.5 rounded-t-lg font-label-md text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'equipment'
                      ? 'bg-surface-panel text-primary border-status-pending-amber font-bold'
                      : 'text-secondary border-transparent hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>
                    {isEn
                      ? `2. Electrical Equipment (${inventory.length})`
                      : `2. Kelengkapan Elektrik (${inventory.length})`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className={`px-4 py-2.5 rounded-t-lg font-label-md text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'tickets'
                      ? 'bg-surface-panel text-primary border-status-pending-amber font-bold'
                      : 'text-secondary border-transparent hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  <span>
                    {isEn
                      ? `3. Edit Ticket Sites & Details (${tickets.length})`
                      : `3. Edit Tiket & Lokasi (${tickets.length})`}
                  </span>
                </button>
              </div>

              <span className="font-code-metric text-[11px] text-status-approved-green font-semibold pb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-approved-green" />
                {isEn ? 'Auto-Saved to Browser Storage' : 'Disimpan Automatik'}
              </span>
            </div>

            {/* Tab Content Area */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* TAB 1: SITES & LOCATIONS */}
              {activeTab === 'sites' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Form: Add / Edit Site & Location */}
                  <form
                    onSubmit={handleSubmitSite}
                    className="lg:col-span-5 bg-surface-canvas p-4 rounded-xl border border-border-strong space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                      <h3 className="font-headline-md text-sm font-bold text-on-surface uppercase">
                        {editingSiteId
                          ? isEn
                            ? `Edit Site: ${siteCode}`
                            : `Kemas Kini Tapak: ${siteCode}`
                          : isEn
                          ? '+ Enter New Site & Location Details'
                          : '+ Masukkan Butiran Site & Lokasi Baru'}
                      </h3>
                      {editingSiteId && (
                        <button
                          type="button"
                          onClick={resetSiteForm}
                          className="text-xs text-status-assigned-red font-semibold cursor-pointer"
                        >
                          {isEn ? 'Cancel Edit' : 'Batal Edit'}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                          {isEn ? 'Site ID / Billboard Code *' : 'Kod Site / Papan Iklan *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. BB-101 or SITE-A1"
                          value={siteCode}
                          onChange={(e) => setSiteCode(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel font-code-metric text-xs font-bold text-on-surface"
                        />
                      </div>
                      <div>
                        <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                          {isEn ? 'Asset / TNB Meter Code' : 'Kod Aset / Meter TNB'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. TNB-KL-084"
                          value={assetCode}
                          onChange={(e) => setAssetCode(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel font-code-metric text-xs text-on-surface"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Full Location / Highway Name *' : 'Nama Lokasi / Lebuhraya *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jalan Ampang / PLUS KM 18.2 Northbound"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs text-on-surface"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                          {isEn ? 'Operating Zone / State' : 'Zon Operasi / Negeri'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Central Zone (KL & Selangor)"
                          value={zoneName}
                          onChange={(e) => setZoneName(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs text-on-surface"
                        />
                      </div>
                      <div>
                        <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                          {isEn ? 'GPS Coordinates' : 'Koordinat GPS'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 3.1466° N, 101.7112° E"
                          value={gpsCoords}
                          onChange={(e) => setGpsCoords(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel font-code-metric text-xs text-on-surface"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Structure / Display Type' : 'Jenis Struktur / Paparan'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Outdoor P10 Digital LED / Static Unipole 40x20ft"
                        value={displayType}
                        onChange={(e) => setDisplayType(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn
                          ? 'On-Site Electrical Equipment & DB Spec *'
                          : 'Kelengkapan Elektrik Tapak & Spesifikasi DB *'}
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. 3-Phase 415V DB, 8x 150W LED Floodlights, SPD 40kA, Timer Theben 24H"
                        value={electricalSpec}
                        onChange={(e) => setElectricalSpec(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs text-on-surface"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 rounded-lg bg-status-pending-amber hover:bg-primary text-white font-label-md text-xs uppercase font-bold tracking-wider shadow-xs cursor-pointer"
                    >
                      {editingSiteId
                        ? isEn
                          ? 'Save Updated Site & Location'
                          : 'Simpan Kemas Kini Site & Lokasi'
                        : isEn
                        ? '+ Add Site & Location'
                        : '+ Tambah Site & Lokasi'}
                    </button>
                  </form>

                  {/* Right Table: Registered Sites List */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-xs text-secondary uppercase font-bold">
                        {isEn
                          ? 'Registered Billboard Sites & Electrical DB Specifications (Click Edit to modify)'
                          : 'Senarai Tapak (Sites), Lokasi & Kelengkapan Elektrik Tapak (Klik Edit untuk ubah)'}
                      </span>
                    </div>
                    <div className="divide-y divide-border-subtle border border-border-subtle rounded-xl overflow-hidden bg-surface-panel">
                      {sites.map((s) => (
                        <div
                          key={s.id}
                          className="p-3.5 hover:bg-surface-canvas flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-navy-header text-amber-400 font-code-metric text-xs font-bold">
                                {s.code}
                              </span>
                              <span className="font-code-metric text-[11px] text-secondary">
                                {s.assetCode}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold">
                                {s.zone}
                              </span>
                            </div>
                            <div className="font-bold text-sm text-on-surface">
                              {s.shortNameEn || s.shortName}
                            </div>
                            <div className="text-xs text-secondary flex flex-wrap items-center gap-2">
                              <span>{s.displayType}</span>
                              <span>•</span>
                              <span className="font-code-metric">{s.gpsCoords}</span>
                            </div>
                            <div className="text-xs text-primary font-medium bg-status-pending-amber-bg/40 px-2.5 py-1 rounded border border-status-pending-amber-border/60 mt-1">
                              <span className="font-bold uppercase text-[10px] mr-1">
                                {isEn ? 'Electrical Spec:' : 'Kelengkapan Elektrik:'}
                              </span>
                              {s.electricalSpec}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditSite(s)}
                              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-navy-header hover:text-white text-on-surface font-label-sm text-xs uppercase font-bold cursor-pointer transition-colors"
                            >
                              {isEn ? 'Edit' : 'Ubah'}
                            </button>
                            {sites.length > 1 && (
                              <button
                                type="button"
                                onClick={() => onDeleteSite(s.id)}
                                className="p-1.5 rounded-lg text-secondary hover:text-status-assigned-red hover:bg-status-assigned-red-bg cursor-pointer"
                                title={isEn ? 'Delete Site' : 'Padam Tapak'}
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ELECTRICAL EQUIPMENT & INVENTORY */}
              {activeTab === 'equipment' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Form: Add / Edit Electrical Equipment */}
                  <form
                    onSubmit={handleSubmitEquip}
                    className="lg:col-span-5 bg-surface-canvas p-4 rounded-xl border border-border-strong space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                      <h3 className="font-headline-md text-sm font-bold text-on-surface uppercase">
                        {editingEquipId
                          ? isEn
                            ? `Edit Equipment: ${eqSku}`
                            : `Kemas Kini Kelengkapan: ${eqSku}`
                          : isEn
                          ? '+ Enter Electrical Equipment Details'
                          : '+ Masukkan Kelengkapan Elektrik Baru'}
                      </h3>
                      {editingEquipId && (
                        <button
                          type="button"
                          onClick={resetEquipForm}
                          className="text-xs text-status-assigned-red font-semibold cursor-pointer"
                        >
                          {isEn ? 'Cancel Edit' : 'Batal Edit'}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                          {isEn ? 'SKU / Equipment Code *' : 'Kod SKU / Kelengkapan *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ELC-LED-150W"
                          value={eqSku}
                          onChange={(e) => setEqSku(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel font-code-metric text-xs font-bold text-on-surface"
                        />
                      </div>
                      <div>
                        <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                          {isEn ? 'Unit Type' : 'Unit Ukuran'}
                        </label>
                        <select
                          value={eqUnit}
                          onChange={(e) => setEqUnit(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs text-on-surface"
                        >
                          <option value="unit">unit</option>
                          <option value="meter">meter</option>
                          <option value="set">set</option>
                          <option value="roll">roll / gulung</option>
                          <option value="panel">panel</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Electrical Equipment Name *' : 'Nama Kelengkapan Elektrik *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. LED Floodlight 150W Outdoor IP66 / MCB 63A 3-Pole"
                        value={eqName}
                        onChange={(e) => setEqName(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Technical Specification / Brand' : 'Spesifikasi Teknikal / Jenama'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Philips / Hager / Chint / Suruhanjaya Tenaga Approved"
                        value={eqSubtitle}
                        onChange={(e) => setEqSubtitle(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs text-on-surface"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                          {isEn ? 'Current Qty' : 'Baki Stok'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          required
                          value={eqQty}
                          onChange={(e) => setEqQty(Number(e.target.value))}
                          className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel font-code-metric text-xs text-on-surface"
                        />
                      </div>
                      <div>
                        <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                          {isEn ? 'Min Alert' : 'Had Minimum'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={eqMin}
                          onChange={(e) => setEqMin(Number(e.target.value))}
                          className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel font-code-metric text-xs text-on-surface"
                        />
                      </div>
                      <div>
                        <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                          {isEn ? 'Cost (RM)' : 'Kos (RM)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          required
                          value={eqCost}
                          onChange={(e) => setEqCost(Number(e.target.value))}
                          className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel font-code-metric text-xs text-on-surface"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Usage / Depot Notes' : 'Catatan Penggunaan / Lokasi Simpanan'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Installed on Unipole DB Panels / Central Depot Rack A2"
                        value={eqNotes}
                        onChange={(e) => setEqNotes(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs text-on-surface"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 rounded-lg bg-status-pending-amber hover:bg-primary text-white font-label-md text-xs uppercase font-bold tracking-wider shadow-xs cursor-pointer"
                    >
                      {editingEquipId
                        ? isEn
                          ? 'Save Updated Electrical Equipment'
                          : 'Simpan Kemas Kini Kelengkapan Elektrik'
                        : isEn
                        ? '+ Add Electrical Equipment'
                        : '+ Tambah Kelengkapan Elektrik'}
                    </button>
                  </form>

                  {/* Right Table: Electrical Equipment List */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <span className="font-label-sm text-xs text-secondary uppercase font-bold block">
                      {isEn
                        ? 'Registered Electrical Equipment & Spare Parts (Click Edit to modify)'
                        : 'Senarai Kelengkapan Elektrik & Komponen (Klik Edit untuk ubah)'}
                    </span>
                    <div className="divide-y divide-border-subtle border border-border-subtle rounded-xl overflow-hidden bg-surface-panel">
                      {inventory.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 hover:bg-surface-canvas flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-navy-header text-white font-code-metric text-xs font-bold">
                                {item.sku}
                              </span>
                              <span className="font-code-metric text-xs font-bold text-primary">
                                RM {item.unitCost.toFixed(2)} / {item.unit}
                              </span>
                              <span
                                className={`font-code-metric text-xs px-2 py-0.5 rounded font-bold ${
                                  item.quantity <= item.minThreshold
                                    ? 'bg-status-assigned-red-bg text-status-assigned-red'
                                    : 'bg-status-approved-green-bg text-status-approved-green'
                                }`}
                              >
                                Qty: {item.quantity} {item.unit}
                              </span>
                            </div>
                            <div className="font-bold text-sm text-on-surface">{item.name}</div>
                            <div className="text-xs text-secondary">{item.subtitle}</div>
                            <div className="text-[11px] text-secondary italic">{item.notes}</div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditEquip(item)}
                              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-navy-header hover:text-white text-on-surface font-label-sm text-xs uppercase font-bold cursor-pointer transition-colors"
                            >
                              {isEn ? 'Edit' : 'Ubah'}
                            </button>
                            {inventory.length > 1 && (
                              <button
                                type="button"
                                onClick={() => onDeleteInventoryItem(item.id)}
                                className="p-1.5 rounded-lg text-secondary hover:text-status-assigned-red hover:bg-status-assigned-red-bg cursor-pointer"
                                title={isEn ? 'Delete Equipment' : 'Padam Kelengkapan'}
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EDIT EXISTING WORK ORDER TICKETS */}
              {activeTab === 'tickets' && currentTicket && (
                <form
                  onSubmit={handleSubmitTicketEdit}
                  className="bg-surface-canvas p-5 rounded-xl border border-border-strong space-y-4 max-w-3xl mx-auto"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                    <div>
                      <h3 className="font-headline-md text-base font-bold text-on-surface">
                        {isEn
                          ? 'Update Work Order Ticket Site, Location & Contractor Details'
                          : 'Kemas Kini Maklumat Site, Lokasi & Kontraktor Pada Tiket'}
                      </h3>
                      <p className="text-xs text-secondary">
                        {isEn
                          ? 'Select any work order ticket below to customize its billboard site code, address, contractor, and electrical fault.'
                          : 'Pilih mana-mana tiket di bawah untuk menukar kod tapak, lokasi, kontraktor, dan butiran kerosakan elektrik.'}
                      </p>
                    </div>
                    <select
                      value={selectedTicketId}
                      onChange={(e) => handleSelectTicketForEdit(e.target.value)}
                      className="h-10 px-3 rounded-lg bg-navy-header text-amber-400 font-code-metric text-xs font-bold"
                    >
                      {tickets.map((t) => (
                        <option key={t.id} value={t.id}>
                          #{t.id} ({t.billboardCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Quick Fill from Registered Site' : 'Pilih Dari Senarai Site'}
                      </label>
                      <select
                        value={tktSiteCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          setTktSiteCode(code);
                          const matchedSite = sites.find((s) => s.code === code);
                          if (matchedSite) {
                            setTktAssetCode(matchedSite.assetCode);
                            setTktLocation(matchedSite.shortNameEn);
                            setTktAddress(`${matchedSite.name} (${matchedSite.gpsCoords})`);
                            setTktDisplayType(matchedSite.displayType);
                          }
                        }}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs font-semibold"
                      >
                        {sites.map((s) => (
                          <option key={s.id} value={s.code}>
                            {s.code} — {s.shortNameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Custom Site Code' : 'Kod Site Tersuai'}
                      </label>
                      <input
                        type="text"
                        value={tktSiteCode}
                        onChange={(e) => setTktSiteCode(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel font-code-metric text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Asset / Meter Code' : 'Kod Aset / Meter'}
                      </label>
                      <input
                        type="text"
                        value={tktAssetCode}
                        onChange={(e) => setTktAssetCode(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel font-code-metric text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Billboard Location Title' : 'Nama Lokasi Papan Iklan'}
                      </label>
                      <input
                        type="text"
                        value={tktLocation}
                        onChange={(e) => setTktLocation(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Display / Structure Type' : 'Jenis Paparan / Struktur'}
                      </label>
                      <input
                        type="text"
                        value={tktDisplayType}
                        onChange={(e) => setTktDisplayType(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                      {isEn ? 'Full Site Address & Highway Reference' : 'Alamat Penuh Tapak & Rujukan'}
                    </label>
                    <input
                      type="text"
                      value={tktAddress}
                      onChange={(e) => setTktAddress(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Contractor Company' : 'Syarikat Kontraktor'}
                      </label>
                      <input
                        type="text"
                        value={tktContractor}
                        onChange={(e) => setTktContractor(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                        {isEn ? 'Lead Wireman / Technician' : 'Juruteknik / Pendawai'}
                      </label>
                      <input
                        type="text"
                        value={tktTechnician}
                        onChange={(e) => setTktTechnician(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-sm text-[11px] text-secondary uppercase mb-1">
                      {isEn ? 'Electrical Fault / Scope of Work' : 'Kerosakan Elektrik / Skop Kerja'}
                    </label>
                    <input
                      type="text"
                      value={tktFault}
                      onChange={(e) => setTktFault(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-border-strong bg-surface-panel text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-status-approved-green text-white font-label-md text-xs uppercase font-bold tracking-wider shadow-xs cursor-pointer"
                    >
                      {isEn ? 'Save Ticket Changes' : 'Simpan Perubahan Tiket'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
