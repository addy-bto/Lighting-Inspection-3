import React, { useEffect, useRef, useState } from 'react';
import {
  IMAGES,
  InventoryItem,
  LangMode,
  PartUsed,
  ScreenId,
  Ticket,
  TicketPhoto,
} from '../data/initialData';

interface ScreenS03ContractorProps {
  lang: LangMode;
  tickets: Ticket[];
  selectedTicketId: string;
  onSelectTicketId: (id: string) => void;
  inventory: InventoryItem[];
  onSubmitCompletion: (
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
  ) => void;
  onOpenMasterDataModal?: (tab?: 'sites' | 'equipment' | 'tickets') => void;
  onNavigate: (screen: ScreenId, ticketId?: string) => void;
  showToast: (title: string, message: string, isError?: boolean) => void;
}

export const ScreenS03Contractor: React.FC<ScreenS03ContractorProps> = ({
  lang,
  tickets,
  selectedTicketId,
  onSelectTicketId,
  inventory,
  onSubmitCompletion,
  onOpenMasterDataModal,
  onNavigate,
  showToast,
}) => {
  const isEn = lang === 'en';
  const currentTicket =
    tickets.find((t) => t.id === selectedTicketId) ||
    tickets.find((t) => t.id === 'TKT-2024-089') ||
    tickets[0];

  const [siteCodeInput, setSiteCodeInput] = useState(currentTicket.billboardCode || 'BB-001');
  const [assetCodeInput, setAssetCodeInput] = useState(currentTicket.assetCode || 'PLS-SB-024');
  const [locationInput, setLocationInput] = useState(
    isEn ? currentTicket.locationEn : currentTicket.location
  );
  const [faultInput, setFaultInput] = useState(
    isEn ? currentTicket.faultShortEn : currentTicket.faultShort
  );
  const [editingSiteBanner, setEditingSiteBanner] = useState(false);

  const [companyName, setCompanyName] = useState(currentTicket.contractorFull || 'Mega Power Volt Engineering');
  const [technicianName, setTechnicianName] = useState(currentTicket.technician || 'Ahmad Taufiq');
  const [licenseNo, setLicenseNo] = useState(currentTicket.wiremanCert || '012-3456789 / PW4 Wireman');
  const [parts, setParts] = useState<PartUsed[]>(currentTicket.partsUsed);
  const [photos, setPhotos] = useState<TicketPhoto[]>(currentTicket.photos);
  const [summary, setSummary] = useState(
    isEn ? currentTicket.repairSummaryEn : currentTicket.repairSummary
  );
  const [complianceChecked, setComplianceChecked] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<TicketPhoto | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSiteCodeInput(currentTicket.billboardCode || 'BB-001');
    setAssetCodeInput(currentTicket.assetCode || 'PLS-SB-024');
    setLocationInput(isEn ? currentTicket.locationEn : currentTicket.location);
    setFaultInput(isEn ? currentTicket.faultShortEn : currentTicket.faultShort);
    setCompanyName(currentTicket.contractorFull || 'Mega Power Volt Engineering');
    setTechnicianName(currentTicket.technician || 'Ahmad Taufiq');
    setLicenseNo(currentTicket.wiremanCert || '012-3456789 / PW4 Wireman');
    setParts(currentTicket.partsUsed);
    setPhotos(currentTicket.photos);
    setSummary(isEn ? currentTicket.repairSummaryEn : currentTicket.repairSummary);
    setSubmittedSuccess(false);
    setValidationError(null);
  }, [currentTicket.id, isEn]);

  const handleAddRow = () => {
    const defaultItem = inventory[4] || inventory[0];
    const newRow: PartUsed = {
      id: `part-${Date.now()}`,
      sku: defaultItem ? defaultItem.sku : 'SKU-GENERIC-STOK',
      name: defaultItem ? defaultItem.name : 'Timer Switch Theben 24H',
      subtitle: defaultItem ? defaultItem.subtitle : 'Suruhanjaya Tenaga Approved',
      qty: 1,
      unit: defaultItem ? defaultItem.unit : 'unit',
      unitCost: defaultItem ? defaultItem.unitCost : 250,
      icon: 'settings_input_component',
    };
    setParts((prev) => [...prev, newRow]);
  };

  const handleRemoveRow = (id: string) => {
    setParts((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePartQtyChange = (id: string, qty: number) => {
    setParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p))
    );
  };

  const handlePartSelectChange = (id: string, newName: string) => {
    const matched = inventory.find((i) => i.name === newName);
    setParts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name: newName,
              sku: matched ? matched.sku : 'SKU-GENERIC-STOK',
              unit: matched ? matched.unit : 'unit',
              unitCost: matched ? matched.unitCost : 300,
            }
          : p
      )
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = typeof reader.result === 'string' ? reader.result : IMAGES.s03Photo3;
        const nowStr = '24-10-2024 19:50';
        const newPhoto: TicketPhoto = {
          id: `ph-upload-${Date.now()}-${idx}`,
          phaseLabel: `Foto Tambahan: ${file.name}`,
          phaseLabelEn: `Additional Photo: ${file.name}`,
          badgeText: `${currentTicket.billboardCode} • UPLOAD`,
          title: isEn ? `Photo ${photos.length + 1}: On-Site Verification` : `Foto ${photos.length + 1}: Bukti Tapak Tambahan`,
          titleEn: `Photo ${photos.length + 1}: On-Site Verification`,
          subtitle: isEn ? 'Uploaded by field technician' : 'Dimuat naik oleh juruteknik tapak',
          subtitleEn: 'Uploaded by field technician',
          timestamp: nowStr,
          url: resultUrl,
        };
        setPhotos((prev) => [...prev, newPhoto]);
        setValidationError(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleClearPhotosForTest = () => {
    setPhotos([]);
    showToast(
      isEn ? 'Photos Cleared (Test Mode)' : 'Foto Dipadam (Mod Ujian F03)',
      isEn
        ? 'Try submitting now to verify mandatory photo validation per PRD F03.'
        : 'Cuba hantar sekarang untuk menguji sekatan wajib muat naik foto (PRD F03).'
    );
  };

  const handleRestorePhotos = () => {
    setPhotos(currentTicket.photos);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // PRD F03 Validation: Photo attachment is mandatory. Block submission if no photo is attached.
    if (photos.length === 0) {
      const msg = isEn
        ? 'Validation Error (F03): Photographic proof is mandatory! Submission blocked until at least 1 photo is attached.'
        : 'Ralat Pengesahan (F03): Bukti bergambar adalah WAJIB! Penghantaran disekat sehingga sekurang-kurangnya 1 foto dilampirkan.';
      setValidationError(msg);
      showToast(
        isEn ? 'Missing Photo Proof (F03)' : 'Bukti Foto Diperlukan (F03)',
        msg,
        true
      );
      return;
    }

    if (!summary.trim()) {
      setValidationError(
        isEn
          ? 'Please enter the On-Site Repair Summary.'
          : 'Sila masukkan Catatan Pembaikan di Tapak.'
      );
      return;
    }

    if (!complianceChecked) {
      setValidationError(
        isEn
          ? 'Please check the Electrical Competency Declaration.'
          : 'Sila tandakan Perakuan Kekompetenan Elektrik.'
      );
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedSuccess(true);
      onSubmitCompletion(currentTicket.id, {
        companyName,
        technicianName,
        licenseNo,
        partsUsed: parts,
        photos,
        repairSummary: summary,
        billboardCode: siteCodeInput,
        assetCode: assetCodeInput,
        location: locationInput,
        faultDescription: faultInput,
      });
    }, 600);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Zero-Login Public Notice Bar */}
      <div className="w-full bg-status-pending-amber-bg border-b border-status-pending-amber-border px-space-md py-space-sm sm:px-space-lg">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-xs text-status-pending-amber">
          <div className="flex items-center gap-space-xs font-label-md text-label-md flex-wrap">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="font-bold tracking-tight">
              {isEn ? 'External Contractor Public Access:' : 'Akses Awam Kontraktor Luar:'}
            </span>
            <span className="font-normal text-on-surface">
              {isEn
                ? 'Job Work Order Only (No Login Required)'
                : 'Pautan Pekerjaan Sahaja (Tiada Log Masuk Diperlukan)'}
            </span>
          </div>
          <div className="flex items-center gap-space-sm text-secondary font-code-metric text-label-sm">
            <select
              value={currentTicket.id}
              onChange={(e) => onSelectTicketId(e.target.value)}
              className="bg-surface-panel border border-border-strong rounded px-2 py-0.5 text-label-sm text-on-surface font-code-metric"
            >
              {tickets.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id} ({t.billboardCode})
                </option>
              ))}
            </select>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-approved-green animate-pulse" />
              {isEn ? 'Session Verified: Module S03 & F03' : 'SESI SAH: MODUL S03 & F03'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto px-margin-mobile sm:px-space-lg py-space-lg space-y-space-lg">
        {/* Status Overview & Job Reference Banner */}
        <section className="bg-surface-panel rounded-xl shadow-xs border border-border-subtle overflow-hidden">
          {/* Top Strip with status */}
          <div className="bg-navy-header text-on-primary px-space-md sm:px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-surface-container-highest">
                {isEn ? 'Reference Ticket' : 'Tiket Rujukan'}
              </span>
              <span className="font-code-metric text-title-md font-bold text-tertiary-fixed">
                #{currentTicket.id}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setEditingSiteBanner((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-label-sm text-label-sm border border-white/20 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {editingSiteBanner ? 'check' : 'edit_location_alt'}
                </span>
                <span>
                  {editingSiteBanner
                    ? isEn
                      ? 'Done Editing Site'
                      : 'Selesai Edit Lokasi'
                    : isEn
                    ? 'Edit Site & Location'
                    : 'Kemaskini Site & Lokasi'}
                </span>
              </button>
              {onOpenMasterDataModal && (
                <button
                  type="button"
                  onClick={() => onOpenMasterDataModal('sites')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-status-pending-amber hover:bg-amber-600 text-white font-label-sm text-label-sm cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">lock_open</span>
                  <span>{isEn ? 'Master Data (Code: 1111)' : 'Data Utama (Kod: 1111)'}</span>
                </button>
              )}
              {submittedSuccess || currentTicket.status === 'Pending Approval' ? (
                <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-lg font-label-sm text-label-sm bg-status-pending-amber-bg text-status-pending-amber border border-status-pending-amber-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-pending-amber animate-pulse" />
                  {isEn
                    ? 'PENDING APPROVAL'
                    : 'MENUNGGU KELULUSAN (PENDING APPROVAL)'}
                </span>
              ) : currentTicket.status === 'Approved for Payment' ? (
                <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-lg font-label-sm text-label-sm bg-status-approved-green-bg text-status-approved-green border border-status-approved-green-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-approved-green" />
                  {isEn ? 'APPROVED FOR PAYMENT' : 'DILULUSKAN UNTUK PEMBAYARAN'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-lg font-label-sm text-label-sm bg-status-assigned-red-bg text-status-assigned-red border border-status-assigned-red-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-assigned-red" />
                  {isEn ? 'ASSIGNED' : 'DITUGASKAN (ASSIGNED)'}
                </span>
              )}
            </div>
          </div>

          {/* Detail Grid in Banner */}
          <div className="p-space-md sm:p-space-lg bg-surface-container-low/40 grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <div>
              <span className="font-label-sm text-label-sm uppercase text-secondary block mb-1">
                {isEn ? 'Billboard Site & Location' : 'Site & Lokasi Papan Iklan'}
              </span>
              {editingSiteBanner ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Enter Exact Billboard Location..."
                    className="w-full px-2.5 py-1.5 rounded border border-primary bg-surface-panel text-body-sm font-semibold text-on-surface"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={siteCodeInput}
                      onChange={(e) => setSiteCodeInput(e.target.value)}
                      placeholder="Site ID (e.g. BB-001)"
                      className="w-full px-2 py-1 rounded border border-border-strong bg-surface-panel font-code-metric text-label-sm text-on-surface"
                    />
                    <input
                      type="text"
                      value={assetCodeInput}
                      onChange={(e) => setAssetCodeInput(e.target.value)}
                      placeholder="Asset Code"
                      className="w-full px-2 py-1 rounded border border-border-strong bg-surface-panel font-code-metric text-label-sm text-on-surface"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-title-md text-title-md text-on-surface font-semibold">
                    {locationInput}
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container font-code-metric text-label-sm text-secondary">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                    {siteCodeInput} • {isEn ? `Asset Code: ${assetCodeInput}` : `Kod: ${assetCodeInput}`}
                  </div>
                </>
              )}
            </div>
            <div>
              <span className="font-label-sm text-label-sm uppercase text-secondary block mb-1">
                {isEn ? 'Reported Electrical Fault' : 'Kerosakan Elektrik Dilaporkan'}
              </span>
              {editingSiteBanner ? (
                <textarea
                  rows={2}
                  value={faultInput}
                  onChange={(e) => setFaultInput(e.target.value)}
                  placeholder="Enter reported electrical fault..."
                  className="w-full px-2.5 py-1.5 rounded border border-primary bg-surface-panel text-body-sm text-on-surface"
                />
              ) : (
                <p className="font-body-md text-body-md text-status-assigned-red font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  {faultInput}
                </p>
              )}
              <span className="font-body-sm text-body-sm text-secondary mt-0.5 block">
                {isEn
                  ? 'Category: Critical Electrical / High Priority'
                  : 'Kategori: Elektrikal Kritikal (High Priority)'}
              </span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm uppercase text-secondary block mb-1">
                {isEn ? 'Assignment Date & SLA' : 'Tarikh Penugasan & SLA'}
              </span>
              <p className="font-code-metric text-body-md text-on-surface font-semibold">
                {isEn ? '24 October 2024 (09:30 AM)' : '24 Oktober 2024 (09:30 AM)'}
              </p>
              <span className="font-body-sm text-body-sm text-secondary block mt-0.5">
                {isEn ? 'Repair Deadline: ' : 'Tempoh Pembaikan: '}
                <span className="font-semibold text-status-pending-amber">
                  {isEn ? 'Within 24 Hours' : 'Kurang 24 Jam'}
                </span>
              </span>
            </div>
          </div>
        </section>

        {validationError && (
          <div className="bg-status-assigned-red-bg border border-status-assigned-red-border text-status-assigned-red rounded-xl p-space-md flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-2 font-label-md text-label-md">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{validationError}</span>
            </div>
            {photos.length === 0 && (
              <button
                type="button"
                onClick={handleRestorePhotos}
                className="px-3 py-1.5 rounded bg-status-assigned-red text-white text-label-sm font-bold shrink-0 cursor-pointer"
              >
                {isEn ? 'Restore Sample Photos' : 'Pulihkan 3 Foto Bukti'}
              </button>
            )}
          </div>
        )}

        {/* Form Section */}
        <form className="space-y-space-lg" onSubmit={handleSubmit}>
          {/* SECTION 1: Maklumat Syarikat & Juruteknik */}
          <div className="bg-surface-panel rounded-xl p-space-md sm:p-space-lg shadow-xs border border-border-subtle space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-border-subtle">
              <div className="flex items-center gap-space-sm">
                <span className="w-7 h-7 rounded-lg bg-status-pending-amber-bg text-status-pending-amber flex items-center justify-center font-bold text-label-md">
                  1
                </span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    {isEn
                      ? 'Company & Technician Details'
                      : 'Maklumat Syarikat & Juruteknik'}
                  </h2>
                  <p className="font-body-sm text-body-sm text-secondary">
                    {isEn
                      ? 'Mandatory verification for on-site compliance'
                      : 'Pengesahan kontraktor bertauliah bagi pematuhan kerja tapak'}
                  </p>
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-secondary uppercase bg-surface-canvas px-2 py-1 rounded">
                {isEn ? 'Mandatory' : 'Mandatori'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface">
                  {isEn ? 'Contractor Company Name' : 'Nama Kontraktor / Syarikat'}{' '}
                  <span className="text-status-assigned-red">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                    business
                  </span>
                  <input
                    className="w-full h-11 pl-9 pr-3 bg-surface-panel border border-border-strong rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-status-pending-amber focus:ring-1 focus:ring-status-pending-amber"
                    required
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface">
                  {isEn ? 'Lead Certified Technician' : 'Nama Juruteknik Utama'}{' '}
                  <span className="text-status-assigned-red">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                    engineering
                  </span>
                  <input
                    className="w-full h-11 pl-9 pr-3 bg-surface-panel border border-border-strong rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-status-pending-amber focus:ring-1 focus:ring-status-pending-amber"
                    required
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface">
                  {isEn ? 'Contact Number & Wireman License' : 'No Tel & Lesen ST'}{' '}
                  <span className="text-status-assigned-red">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                    badge
                  </span>
                  <input
                    className="w-full h-11 pl-9 pr-3 bg-surface-panel border border-border-strong rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-status-pending-amber focus:ring-1 focus:ring-status-pending-amber"
                    required
                    type="text"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Penggunaan Alat Ganti Elektrik */}
          <div className="bg-surface-panel rounded-xl p-space-md sm:p-space-lg shadow-xs border border-border-subtle space-y-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-xs pb-space-sm border-b border-border-subtle">
              <div className="flex items-center gap-space-sm">
                <span className="w-7 h-7 rounded-lg bg-status-pending-amber-bg text-status-pending-amber flex items-center justify-center font-bold text-label-md">
                  2
                </span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    {isEn
                      ? 'Electrical Spare Parts Consumed'
                      : 'Penggunaan Alat Ganti Elektrik'}
                  </h2>
                  <p className="font-body-sm text-body-sm text-secondary">
                    {isEn
                      ? 'Matched against central warehouse inventory'
                      : 'Dipadankan dengan baki inventori bilik stok berpusat'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="inline-flex items-center gap-1.5 px-3 h-9 bg-surface-panel hover:bg-surface-container border border-border-subtle rounded-lg font-label-sm text-secondary hover:text-on-surface transition-colors cursor-pointer"
                  onClick={() => {
                    setParts(currentTicket.partsUsed);
                    showToast(
                      isEn ? 'Default Parts Restored' : 'Alat Ganti Dipulihkan',
                      isEn
                        ? 'Reset spare parts table to initial ticket allocation.'
                        : 'Jadual alat ganti dipulihkan ke tetapan asal tiket.'
                    );
                  }}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>{isEn ? 'Reset Default Parts' : 'Pulihkan Senarai Asal'}</span>
                </button>
                <button
                  className="inline-flex items-center gap-1.5 px-space-md h-9 bg-surface-container-low hover:bg-surface-container border border-border-strong rounded-lg font-label-md text-label-md text-on-surface transition-colors cursor-pointer"
                  onClick={handleAddRow}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-status-pending-amber">
                    add_circle
                  </span>
                  <span>
                    {isEn ? '+ Add Replacement Part' : '+ Tambah Alat Ganti Digunakan'}
                  </span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy-header text-on-primary font-label-md text-label-md">
                    <th className="py-2.5 px-space-md font-semibold tracking-wider">
                      {isEn ? 'ELECTRICAL COMPONENT' : 'KOMPONEN ELEKTRIK'}
                    </th>
                    <th className="py-2.5 px-space-md font-semibold tracking-wider">
                      {isEn ? 'SERIAL NO. / SKU REFERENCE' : 'NO. SIRI / RUJUKAN STOK'}
                    </th>
                    <th className="py-2.5 px-space-md font-semibold tracking-wider text-right">
                      {isEn ? 'QUANTITY USED' : 'KUANTITI DIGUNAKAN'}
                    </th>
                    <th className="py-2.5 px-space-md font-semibold tracking-wider text-center">
                      {isEn ? 'ACTION' : 'TINDAKAN'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {parts.map((part, index) => (
                    <tr
                      key={part.id}
                      className={`${
                        index % 2 === 1 ? 'bg-surface-canvas/50' : 'bg-surface-panel'
                      } hover:bg-status-pending-amber-bg/30 transition-colors`}
                    >
                      <td className="py-3 px-space-md">
                        <div className="space-y-1">
                          <input
                            type="text"
                            list="inventory-parts-list"
                            value={part.name}
                            onChange={(e) => handlePartSelectChange(part.id, e.target.value)}
                            placeholder={isEn ? 'Enter or select electrical part...' : 'Masukkan atau pilih komponen elektrik...'}
                            className="w-full h-9 bg-surface-canvas border border-border-strong rounded px-2.5 font-body-md text-body-md font-semibold text-on-surface focus:outline-none focus:border-status-pending-amber"
                          />
                          <datalist id="inventory-parts-list">
                            {inventory.map((inv) => (
                              <option key={inv.id} value={inv.name}>
                                {inv.sku} — RM {inv.unitCost}
                              </option>
                            ))}
                          </datalist>
                          {part.subtitle && (
                            <span className="font-body-sm text-body-sm text-secondary block pl-1">
                              {part.subtitle}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-space-md">
                        <input
                          type="text"
                          value={part.sku}
                          onChange={(e) =>
                            setParts((prev) =>
                              prev.map((p) =>
                                p.id === part.id ? { ...p, sku: e.target.value } : p
                              )
                            )
                          }
                          className="w-full max-w-[200px] h-9 bg-surface-canvas border border-border-subtle rounded px-2 font-code-metric text-body-sm text-secondary focus:outline-none focus:border-status-pending-amber"
                        />
                      </td>
                      <td className="py-3 px-space-md text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <input
                            className="w-20 h-9 px-2 text-right bg-surface-canvas border border-border-strong rounded font-code-metric text-body-md font-semibold text-on-surface focus:outline-none focus:border-status-pending-amber"
                            min={1}
                            type="number"
                            value={part.qty}
                            onChange={(e) =>
                              handlePartQtyChange(part.id, parseInt(e.target.value, 10) || 1)
                            }
                          />
                          <span className="font-label-sm text-label-sm text-secondary">
                            {part.unit}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-space-md text-center">
                        <button
                          className="text-secondary hover:text-status-assigned-red transition-colors p-1 cursor-pointer"
                          onClick={() => handleRemoveRow(part.id)}
                          title={isEn ? 'Delete row' : 'Padam baris'}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: Muat Naik Bukti Bergambar */}
          <div className="bg-surface-panel rounded-xl p-space-md sm:p-space-lg shadow-xs border border-border-subtle space-y-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-xs pb-space-sm border-b border-border-subtle">
              <div className="flex items-center gap-space-sm">
                <span className="w-7 h-7 rounded-lg bg-status-pending-amber-bg text-status-pending-amber flex items-center justify-center font-bold text-label-md">
                  3
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      {isEn
                        ? 'Upload Photographic Proof'
                        : 'Muat Naik Bukti Bergambar'}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-status-assigned-red-bg text-status-assigned-red font-label-sm text-label-sm border border-status-assigned-red-border">
                      {isEn
                        ? 'Mandatory for Payment Voucher Approval'
                        : 'Wajib untuk Kelulusan Bayaran'}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary">
                    {isEn
                      ? 'Upload timestamped photos of Before, During test bench/DB, and After with full nighttime illumination.'
                      : 'Sertakan keadaan sebelum, semasa pengujian kotak DB, dan nyalaan penuh waktu malam'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {photos.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearPhotosForTest}
                    className="px-2.5 h-10 text-label-sm text-secondary hover:text-status-assigned-red border border-border-subtle rounded-lg transition-colors cursor-pointer"
                    title="Uji sekatan wajib foto PRD F03"
                  >
                    {isEn ? 'Test Empty Photo (F03)' : 'Uji Tanpa Foto (F03)'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRestorePhotos}
                    className="px-2.5 h-10 text-label-sm text-status-approved-green border border-status-approved-green-border bg-status-approved-green-bg rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? 'Restore 3 Photos' : 'Pulihkan 3 Foto'}
                  </button>
                )}
                <button
                  className="inline-flex items-center gap-2 px-space-md h-10 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md text-label-md border border-border-strong transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] text-status-pending-amber">
                    photo_camera
                  </span>
                  <span>
                    {isEn
                      ? 'Capture Photo via Camera'
                      : 'Ambil Foto Menggunakan Kamera'}
                  </span>
                </button>
              </div>
            </div>

            {/* 3 Required Photo Slots */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setPreviewPhoto(photo)}
                    className="flex flex-col bg-surface-canvas rounded-lg overflow-hidden border border-border-subtle hover:border-status-pending-amber transition-all cursor-pointer group"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-navy-header">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={photo.title}
                        src={photo.url}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-navy-header/80 backdrop-blur-xs text-on-primary font-code-metric text-label-sm px-2 py-0.5 rounded">
                        {photo.timestamp}
                      </div>
                      <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-status-approved-green-bg text-status-approved-green border border-status-approved-green-border px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Uploaded
                      </div>
                    </div>
                    <div className="p-space-sm">
                      <span className="font-label-md text-label-md text-on-surface font-semibold block">
                        {isEn ? photo.titleEn : photo.title}
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary">
                        {isEn ? photo.subtitleEn : photo.subtitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-space-lg rounded-lg bg-status-assigned-red-bg/50 border border-status-assigned-red-border text-center space-y-2">
                <span className="material-symbols-outlined text-status-assigned-red text-[32px]">
                  no_photography
                </span>
                <p className="font-label-lg text-status-assigned-red font-bold">
                  {isEn
                    ? 'No Photographic Evidence Attached (F03 Validation Mode)'
                    : 'Tiada Bukti Bergambar Dilampirkan (Mod Pengesahan F03)'}
                </p>
                <p className="font-body-sm text-secondary">
                  {isEn
                    ? 'Submitting this form without photos will trigger the mandatory PRD F03 error blocker.'
                    : 'Menghantar borang tanpa gambar akan mengaktifkan sekatan ralat mandatori PRD F03.'}
                </p>
              </div>
            )}

            {/* Additional upload dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-strong rounded-lg p-space-md text-center bg-surface-canvas hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <input
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                multiple
                type="file"
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[32px]">
                  cloud_upload
                </span>
                <span className="font-label-md text-label-md text-on-surface">
                  {isEn ? 'Drag & Drop Additional Photos or ' : 'Tarik & Lepas Foto Tambahan atau '}
                  <span className="text-status-pending-amber underline">
                    {isEn ? 'Browse Files' : 'Pilih Fail'}
                  </span>
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  {isEn
                    ? 'Supported: JPG, PNG, HEIC (Max 15MB each)'
                    : 'Format disokong: JPG, PNG, HEIC (Maks 15MB setiap fail)'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Ringkasan & Catatan Kerja */}
          <div className="bg-surface-panel rounded-xl p-space-md sm:p-space-lg shadow-xs border border-border-subtle space-y-space-md">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-space-sm border-b border-border-subtle">
              <div className="flex items-center gap-space-sm">
                <span className="w-7 h-7 rounded-lg bg-status-pending-amber-bg text-status-pending-amber flex items-center justify-center font-bold text-label-md">
                  4
                </span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    {isEn
                      ? 'Work Summary & Technician Notes'
                      : 'Ringkasan & Catatan Kerja'}
                  </h2>
                  <p className="font-body-sm text-body-sm text-secondary">
                    {isEn
                      ? 'Detailed technical report for supervisor audit'
                      : 'Laporan terperinci untuk rekod audit teknikal dan semakan penyelia'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const telemetryStamp = isEn
                    ? ' [MEGGER TEST: >285 MΩ @ 500V DC | VOLTAGE: 415V/240V | EARTH: 1.9 Ω PASS]'
                    : ' [UJIAN MEGGER: >285 MΩ @ 500V DC | VOLTAN: 415V/240V | BUMI: 1.9 Ω LULUS]';
                  if (!summary.includes('MEGGER')) {
                    setSummary((prev) => prev.trim() + telemetryStamp);
                  }
                  showToast(
                    isEn ? 'Megger & Voltage Telemetry Appended' : 'Telemetri Megger Ditambah',
                    isEn
                      ? 'Inserted MS IEC 60364 insulation & voltage reading into field summary.'
                      : 'Bacaan penebatan & voltan MS IEC 60364 dimasukkan ke dalam ringkasan.'
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs uppercase cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
                <span>{isEn ? '+ Insert Megger & Voltage Log' : '+ Masukkan Log Megger'}</span>
              </button>
            </div>
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface">
                {isEn ? 'On-Site Repair Summary' : 'Catatan Pembaikan di Tapak'}{' '}
                <span className="text-status-assigned-red">*</span>
              </label>
              <textarea
                className="w-full p-space-sm bg-surface-panel border border-border-strong rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-status-pending-amber focus:ring-1 focus:ring-status-pending-amber leading-relaxed"
                required
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
              <div className="flex items-center justify-between text-secondary font-body-sm text-body-sm pt-1">
                <span>
                  {isEn
                    ? 'Ensure operating voltage and load current are noted where applicable.'
                    : 'Pastikan voltan operasi dan arus ujian dinyatakan jika berkaitan.'}
                </span>
                <span className="font-code-metric">
                  {summary.length} {isEn ? 'characters' : 'aksara'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Perakuan Keselamatan & Penghantaran */}
          <div className="bg-surface-panel rounded-xl p-space-md sm:p-space-lg shadow-xs border border-border-subtle space-y-space-md border-t-4 border-t-status-pending-amber">
            <div className="flex items-center gap-space-sm pb-space-sm border-b border-border-subtle">
              <span className="w-7 h-7 rounded-lg bg-status-pending-amber-bg text-status-pending-amber flex items-center justify-center font-bold text-label-md">
                5
              </span>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  {isEn
                    ? 'Safety Compliance & Formal Declaration'
                    : 'Perakuan Keselamatan & Penghantaran'}
                </h2>
                <p className="font-body-sm text-body-sm text-secondary">
                  {isEn
                    ? 'Adherence to Energy Commission & MS IEC Wiring Standards'
                    : 'Pematuhan standard pendawaian Suruhanjaya Tenaga & MS IEC'}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-space-md rounded-lg space-y-space-sm">
              <label className="flex items-start gap-space-sm cursor-pointer select-none">
                <input
                  checked={complianceChecked}
                  onChange={(e) => setComplianceChecked(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-border-strong text-status-pending-amber focus:ring-status-pending-amber"
                  type="checkbox"
                />
                <div className="flex-1">
                  <span className="font-label-md text-label-md text-on-surface font-semibold block">
                    {isEn
                      ? 'Electrical Competency Declaration (Energy Commission)'
                      : 'Perakuan Kekompetenan Elektrik (Suruhanjaya Tenaga)'}
                  </span>
                  <p className="font-body-md text-body-md text-secondary mt-0.5">
                    {isEn ? (
                      <>
                        I hereby certify that all works executed comply with{' '}
                        <strong className="text-on-surface">MS IEC 60364</strong> electrical safety
                        standards and all spare parts claimed have been properly installed on the
                        designated billboard structure.
                      </>
                    ) : (
                      <>
                        Saya mengesahkan semua kerja dijalankan mengikut piawaian keselamatan
                        elektrik <strong className="text-on-surface">MS IEC 60364</strong> dan
                        komponen ganti yang dituntut telah dipasang dengan sempurna di struktur
                        papan iklan ini.
                      </>
                    )}
                  </p>
                </div>
              </label>
            </div>

            {/* Form Submission Actions */}
            <div className="pt-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-xs text-secondary font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[18px] text-status-approved-green">
                  lock
                </span>
                <span>
                  {isEn
                    ? 'Submission is encrypted and dispatched directly to the Operations Supervisor.'
                    : 'Penghantaran disulitkan & terus dimaklumkan kepada Penyelia Penyelenggaraan'}
                </span>
              </div>
              <button
                disabled={submitting || submittedSuccess}
                className={`w-full sm:w-auto h-12 px-space-xl rounded-lg font-label-md text-label-md font-bold uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  submittedSuccess
                    ? 'bg-secondary text-on-primary cursor-not-allowed'
                    : 'bg-status-pending-amber hover:bg-primary border border-primary-container text-on-primary'
                }`}
                type="submit"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {submitting ? 'refresh' : submittedSuccess ? 'check' : 'send'}
                </span>
                <span>
                  {submitting
                    ? isEn
                      ? 'Submitting Report...'
                      : 'Menghantar Laporan...'
                    : submittedSuccess
                    ? isEn
                      ? 'Report Received'
                      : 'Laporan Diterima'
                    : isEn
                    ? 'SUBMIT JOB COMPLETION REPORT'
                    : 'HANTAR LAPORAN PENYELESAIAN KERJA (SUBMIT COMPLETION REPORT)'}
                </span>
              </button>
            </div>
          </div>
        </form>

        {/* Post-submission feedback banner */}
        {submittedSuccess && (
          <div className="bg-status-approved-green-bg border border-status-approved-green-border rounded-xl p-space-lg shadow-xs">
            <div className="flex flex-col sm:flex-row items-start gap-space-md">
              <div className="w-12 h-12 rounded-full bg-status-approved-green text-on-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">task_alt</span>
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-headline-md text-headline-md text-status-approved-green font-bold">
                    {isEn ? 'Report Successfully Submitted!' : 'Laporan Berjaya Dihantar!'}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded font-label-sm text-label-sm bg-status-pending-amber-bg text-status-pending-amber border border-status-pending-amber-border">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-pending-amber" />
                    {isEn
                      ? 'Current Status: Pending Approval'
                      : 'Status Terkini: Menunggu Kelulusan (Pending Approval)'}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface">
                  {isEn ? (
                    <>
                      Thank you, {companyName}. The completion report for ticket{' '}
                      <strong className="font-code-metric">#{currentTicket.id}</strong> has been
                      recorded. Supervisor Siti Zahara will perform e-signature verification before
                      forwarding your invoice to Finance.
                    </>
                  ) : (
                    <>
                      Terima kasih, {companyName}. Laporan pembaikan untuk tiket{' '}
                      <strong className="font-code-metric">#{currentTicket.id}</strong> telah
                      disimpan. Penyelia Siti Zahara akan membuat verifikasi e-tandatangan sebelum
                      invois anda dihantar ke bahagian Kewangan.
                    </>
                  )}
                </p>
                <div className="pt-space-sm flex flex-wrap items-center justify-between gap-space-md text-secondary font-code-metric text-label-sm">
                  <div className="flex items-center gap-2">
                    <span>Proof ID: REP-20241024-998</span>
                    <span>•</span>
                    <span>
                      {isEn ? 'Timestamp: Realtime (Live Persisted)' : 'Masa: Serta-merta (Live Persisted)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('s04-approval', currentTicket.id)}
                    className="px-4 py-2 rounded-lg bg-status-approved-green text-white font-label-md font-bold cursor-pointer hover:opacity-95"
                  >
                    {isEn
                      ? 'Proceed to Supervisor E-Sign (S04) →'
                      : 'Terus ke Semakan E-Sign Penyelia (S04) →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Lightbox Preview Modal */}
        {previewPhoto && (
          <div
            onClick={() => setPreviewPhoto(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-panel rounded-xl max-w-2xl w-full overflow-hidden border border-border-strong shadow-2xl"
            >
              <div className="px-4 py-3 bg-navy-header text-white flex items-center justify-between">
                <div>
                  <span className="font-code-metric text-xs text-amber-400 block">
                    {previewPhoto.badgeText} • {previewPhoto.timestamp}
                  </span>
                  <h4 className="font-headline-md text-sm font-bold">
                    {isEn ? previewPhoto.titleEn : previewPhoto.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="aspect-video bg-slate-950">
                <img
                  src={previewPhoto.url}
                  alt={previewPhoto.titleEn}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 flex items-center justify-between text-xs">
                <span className="text-secondary">
                  {isEn ? previewPhoto.subtitleEn : previewPhoto.subtitle}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="px-4 py-1.5 rounded-lg bg-navy-header text-white font-label-md uppercase cursor-pointer"
                >
                  {isEn ? 'Close Preview' : 'Tutup Pratonton'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
