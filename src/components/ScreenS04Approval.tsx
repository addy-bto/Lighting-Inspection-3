import React, { useEffect, useRef, useState } from 'react';
import {
  IMAGES,
  LangMode,
  RoleMode,
  ScreenId,
  Ticket,
} from '../data/initialData';

interface ScreenS04ApprovalProps {
  lang: LangMode;
  role: RoleMode;
  tickets: Ticket[];
  selectedTicketId: string;
  onSelectTicketId: (id: string) => void;
  onApproveTicket: (ticketId: string, signatureDataUrl: string) => void;
  onRequestRevision: (ticketId: string, reason: string) => void;
  onNavigate: (screen: ScreenId, ticketId?: string) => void;
  showToast: (title: string, message: string, isError?: boolean) => void;
}

export const ScreenS04Approval: React.FC<ScreenS04ApprovalProps> = ({
  lang,
  role,
  tickets,
  selectedTicketId,
  onSelectTicketId,
  onApproveTicket,
  onRequestRevision,
  onNavigate,
  showToast,
}) => {
  const isEn = lang === 'en';
  const currentTicket =
    tickets.find((t) => t.id === selectedTicketId) ||
    tickets.find((t) => t.id === 'TKT-2024-084') ||
    tickets[1] ||
    tickets[0];

  const [chkPhotos, setChkPhotos] = useState(true);
  const [chkParts, setChkParts] = useState(true);
  const [chkScreen, setChkScreen] = useState(true);
  const [hasSigned, setHasSigned] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [exifModalOpen, setExifModalOpen] = useState(false);
  const [photoViewMode, setPhotoViewMode] = useState<'grid' | 'compare'>('grid');
  const [comparePosition, setComparePosition] = useState(50);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawSampleSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(40, 95);
    ctx.bezierCurveTo(60, 40, 85, 40, 95, 85);
    ctx.bezierCurveTo(105, 120, 115, 120, 130, 80);
    ctx.bezierCurveTo(145, 50, 160, 75, 175, 90);
    ctx.bezierCurveTo(190, 105, 210, 80, 230, 85);
    ctx.lineTo(260, 85);
    // Flourish cross stroke
    ctx.moveTo(70, 75);
    ctx.lineTo(240, 70);
    // Underline flourish
    ctx.moveTo(65, 115);
    ctx.bezierCurveTo(130, 125, 220, 120, 280, 105);
    ctx.stroke();
    ctx.closePath();

    setHasSigned(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 640;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(2, 2);
    }
    drawSampleSignature();
  }, [currentTicket.id]);

  const getPointerPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / 2 / rect.width;
    const scaleY = canvas.height / 2 / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStartDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (role === 'finance') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSigned(true);
    const pos = getPointerPos(e);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleMoveDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || role === 'finance') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPointerPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handleStopDraw = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.closePath();
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    showToast(
      isEn ? 'Signature Pad Cleared' : 'Padang Tandatangan Kosong',
      isEn
        ? 'Please sign again before approving.'
        : 'Sila tandatangan semula sebelum meluluskan.'
    );
  };

  const handleLoadSavedSignature = () => {
    drawSampleSignature();
    showToast(
      isEn ? 'Signature Loaded' : 'Tandatangan Dimuatkan',
      isEn
        ? 'Official signature of Siti Zahara applied.'
        : 'Tandatangan rasmi Siti Zahara dimasukkan.'
    );
  };

  const handleApproveClick = () => {
    if (role === 'finance') {
      showToast(
        isEn ? 'Read-Only Access' : 'Akses Baca-Sahaja',
        isEn
          ? 'Finance role cannot alter approvals.'
          : 'Peranan Kewangan tidak dibenarkan mengubah kelulusan.',
        true
      );
      return;
    }

    if (!chkPhotos || !chkParts || !chkScreen) {
      showToast(
        isEn ? 'Verification Incomplete' : 'Semakan Belum Lengkap',
        isEn
          ? 'Please check all 3 audit verification criteria above.'
          : 'Sila tanda semua 3 kriteria semakan audit di atas.',
        true
      );
      return;
    }

    // PRD F04 Validation: Cannot approve without valid signature drawing
    if (!hasSigned) {
      showToast(
        isEn ? 'Signature Required (F04)' : 'Tandatangan Diperlukan (F04)',
        isEn
          ? 'Please draw supervisor e-signature in the signature box before approving.'
          : 'Sila turunkan e-tandatangan penyelia dalam kotak tandatangan sebelum meluluskan.',
        true
      );
      return;
    }

    const dataUrl = canvasRef.current?.toDataURL('image/png') || '';
    onApproveTicket(currentTicket.id, dataUrl);
  };

  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionReason.trim()) return;
    onRequestRevision(currentTicket.id, revisionReason.trim());
    setRevisionModalOpen(false);
    setRevisionReason('');
  };

  const isBB084 = currentTicket.id === 'TKT-2024-084';

  return (
    <div className="flex flex-col w-full">
      {/* Top Operational Banner & Telemetry Breadcrumb */}
      <div className="px-space-md lg:px-space-xl py-space-sm bg-surface-panel shadow-xs border-b border-border-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm max-w-7xl mx-auto w-full">
          {/* Nav Trail */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 font-label-md text-label-md text-secondary"
          >
            <button
              type="button"
              onClick={() => onNavigate('s02-mint')}
              className="hover:text-on-surface transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              {isEn ? 'Tickets Dashboard' : 'Dashboard Tiket'}
            </button>
            <span className="text-secondary/50 font-mono">/</span>
            <span className="hover:text-on-surface transition-colors">
              {isEn ? 'Approvals & Verification' : 'Kelulusan & Pengesahan'}
            </span>
            <span className="text-secondary/50 font-mono">/</span>
            <select
              value={currentTicket.id}
              onChange={(e) => onSelectTicketId(e.target.value)}
              className="font-code-metric font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20 cursor-pointer"
            >
              {tickets.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id}
                </option>
              ))}
            </select>
          </nav>

          {/* Quick Telemetry Flags */}
          <div className="flex items-center gap-3 self-start md:self-auto font-label-sm text-label-sm">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-surface-container-low text-secondary font-code-metric">
              <span className="material-symbols-outlined text-[14px]">pin_drop</span>
              3.1466° N, 101.7112° E
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-secondary-container text-on-secondary-container font-code-metric uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Audit Fasa 4/4
            </div>
          </div>
        </div>
      </div>

      <div className="p-space-md lg:p-space-xl max-w-7xl mx-auto w-full space-y-space-lg">
        {/* Header Block: Work Order & Status */}
        <header className="bg-surface-panel p-space-md lg:p-space-lg rounded-xl shadow-xs border border-border-subtle relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md relative">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {currentTicket.status === 'Approved for Payment' ? (
                  <span className="px-2.5 py-1 rounded-lg text-label-sm font-label-sm uppercase bg-status-approved-green-bg text-status-approved-green border border-status-approved-green-border font-bold inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-status-approved-green" />
                    {isEn
                      ? 'Approved for Payment (E-Signed)'
                      : 'Diluluskan untuk Pembayaran (Telah Ditandatangan)'}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-label-sm font-label-sm uppercase bg-status-pending-amber-bg text-status-pending-amber font-bold inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-status-pending-amber" />
                    {isEn
                      ? 'Pending Supervisor Approval'
                      : 'Menunggu Kelulusan Penyelia (Pending Approval)'}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-secondary font-code-metric">
                  ID: {isBB084 ? 'BB-084 • Skrin LED P10' : currentTicket.assetCode}
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                {isBB084
                  ? isEn
                    ? 'Repair Verification & Approval: Bukit Bintang Digital Billboard (BB-084)'
                    : 'Pengesahan & Kelulusan Pembaikan: Billboard Digital Bukit Bintang (BB-084)'
                  : `${isEn ? 'Repair Verification & Approval:' : 'Pengesahan & Kelulusan Pembaikan:'} ${
                      currentTicket.location
                    }`}
              </h1>
              <p className="font-body-md text-body-md text-secondary">
                {isEn
                  ? 'Physical site audit and high-voltage spare parts replacement verification before payment voucher generation.'
                  : 'Audit tapak fizikal dan verifikasi penggantian alat ganti voltan tinggi sebelum bayaran baucar dijana kepada kontraktor.'}
              </p>
            </div>

            {/* Meta Stamp Card */}
            <div className="bg-surface-container-low p-space-sm rounded-lg min-w-[270px] space-y-2 border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary uppercase">
                  {isEn ? 'Appointed Contractor' : 'Kontraktor Dilantik'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-status-approved-green">
                  verified
                </span>
              </div>
              <p className="font-label-md text-label-md text-on-surface font-semibold truncate">
                {isBB084
                  ? 'Apex Electrical & High-Rise Services Sdn Bhd'
                  : currentTicket.contractorFull}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-body-sm text-body-sm text-secondary">
                <div>
                  <span className="block text-label-sm text-secondary uppercase font-label-sm">
                    {isEn ? 'Technician' : 'Juruteknik'}
                  </span>
                  <span className="text-on-surface font-medium truncate block">
                    {isBB084 ? 'Hazim bin Rosli' : currentTicket.technician}
                  </span>
                </div>
                <div>
                  <span className="block text-label-sm text-secondary uppercase font-label-sm">
                    {isEn ? 'Completion Time' : 'Tarikh Siap'}
                  </span>
                  <span className="text-on-surface font-medium truncate block font-code-metric">
                    {isEn ? 'Today, 3:45 PM' : 'Hari Ini, 3:45 PM'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Operational Workspace: 60/40 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: Proof of Work & Inventory Consumption (7 cols) */}
          <section className="lg:col-span-7 space-y-space-lg">
            {/* Photographic Proof Module */}
            <article className="bg-surface-panel p-space-md lg:p-space-lg rounded-xl shadow-xs border border-border-subtle space-y-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">
                      photo_camera
                    </span>
                    <h2 className="font-title-md text-title-md text-on-surface font-bold">
                      {isEn
                        ? 'Completed Work Photo Proof'
                        : 'Bukti Gambar Siap Kerja (Photo Proof)'}
                    </h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                    {isEn
                      ? '3 mandatory documentation phases required prior to sign-off.'
                      : '3 fasa dokumentasi mandatori diperlukan sebelum pengesahan.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center p-0.5 rounded-lg bg-surface-container-low border border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setPhotoViewMode('grid')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        photoViewMode === 'grid'
                          ? 'bg-navy-header text-white'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      {isEn ? '3-Phase Grid' : 'Grid 3 Fasa'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoViewMode('compare')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        photoViewMode === 'compare'
                          ? 'bg-navy-header text-white'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      {isEn ? 'Before / After Slider' : 'Banding Sebelum / Selepas'}
                    </button>
                  </div>
                  <span className="inline-flex items-center gap-1 font-code-metric text-label-sm text-status-approved-green bg-status-approved-green-bg px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    3 / 3 {isEn ? 'Complete' : 'Lengkap'}
                  </span>
                </div>
              </div>

              {photoViewMode === 'compare' ? (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-navy-header border border-border-subtle select-none">
                    {/* After Image (Full width background) */}
                    <img
                      src={currentTicket.photos[2]?.url || IMAGES.s04Photo3}
                      alt="Selepas Pembaikan"
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-status-approved-green text-white font-code-metric text-xs font-bold z-10">
                      {isEn
                        ? '3. AFTER (VERIFIED • 100% ILLUMINATED)'
                        : '3. SELEPAS (DISAHKAN SIAP • 100% MENYALA)'}
                    </div>

                    {/* Before Image (Clipped by slider) */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-xl"
                      style={{ width: `${comparePosition}%` }}
                    >
                      <img
                        src={currentTicket.photos[0]?.url || IMAGES.s04Photo1}
                        alt="Before Repair"
                        className="h-full max-w-none object-cover"
                        style={{ width: '100vw', maxWidth: '720px' }}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-status-assigned-red text-white font-code-metric text-xs font-bold">
                        {isEn
                          ? '1. BEFORE (STATUS: FAILED / TRIPPED)'
                          : '1. SEBELUM (STATUS: GAGAL / TRIP)'}
                      </div>
                    </div>

                    {/* Slider Range Input Overlay */}
                    <input
                      type="range"
                      min={5}
                      max={95}
                      value={comparePosition}
                      onChange={(e) => setComparePosition(Number(e.target.value))}
                      aria-label="Before and After Comparison Slider"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    />

                    {/* Visual Handle */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-navy-header shadow-lg border border-border-strong flex items-center justify-center pointer-events-none z-10"
                      style={{ left: `${comparePosition}%` }}
                    >
                      <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-secondary px-1">
                    <span>
                      {isEn
                        ? 'Drag slider handle left/right to compare Before & After photographic proof.'
                        : 'Geser pemegang ke kiri/kanan untuk membandingkan bukti Sebelum & Selepas.'}
                    </span>
                    <span className="font-code-metric font-bold text-on-surface">
                      {isEn ? 'Split:' : 'Nisbah:'} {comparePosition}% / {100 - comparePosition}%
                    </span>
                  </div>
                </div>
              ) : (
              /* Photo Gallery Grid */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                {/* Phase 1: Sebelum */}
                <div
                  onClick={() => setExifModalOpen(true)}
                  className="group relative flex flex-col bg-surface-canvas rounded-lg overflow-hidden shadow-xs border border-border-subtle cursor-pointer"
                >
                  <div className="relative aspect-square w-full bg-navy-header overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt="1. Before Photo"
                      src={currentTicket.photos[0]?.url || IMAGES.s04Photo1}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-header/90 via-navy-header/20 to-transparent" />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-navy-header/80 text-on-secondary font-code-metric text-label-sm">
                      {currentTicket.billboardCode} • BEFORE
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="block text-on-secondary font-label-md text-label-md font-semibold leading-tight">
                        {isEn ? '1. Before Photo' : '1. Foto Sebelum'}
                      </span>
                      <span className="block text-on-secondary/80 font-body-sm text-body-sm text-[11px] leading-tight truncate">
                        {isEn ? 'DB trip, scorched MCB terminal' : 'DB trip, MCB terminal hangus'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 space-y-1 bg-surface-panel font-code-metric text-label-sm text-secondary">
                    <div className="flex justify-between items-center text-[10px]">
                      <span>GPS: 3.1466° N</span>
                      <span>101.7112° E</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-status-assigned-red font-semibold">
                      <span>{isEn ? 'STATUS: FAILED' : 'STATUS: GAGAL'}</span>
                      <span>11:15 AM</span>
                    </div>
                  </div>
                </div>

                {/* Phase 2: Semasa */}
                <div
                  onClick={() => setExifModalOpen(true)}
                  className="group relative flex flex-col bg-surface-canvas rounded-lg overflow-hidden shadow-xs border border-border-subtle cursor-pointer"
                >
                  <div className="relative aspect-square w-full bg-navy-header overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt="2. During Repair"
                      src={currentTicket.photos[1]?.url || IMAGES.s04Photo2}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-header/90 via-navy-header/20 to-transparent" />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-navy-header/80 text-on-secondary font-code-metric text-label-sm">
                      {currentTicket.billboardCode} • PROCESS
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="block text-on-secondary font-label-md text-label-md font-semibold leading-tight">
                        {isEn ? '2. During Repair' : '2. Semasa Baiki'}
                      </span>
                      <span className="block text-on-secondary/80 font-body-sm text-body-sm text-[11px] leading-tight truncate">
                        {isEn
                          ? 'Replace Timer Switch & Voltage Test'
                          : 'Ganti Timer Switch & Uji Voltan'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 space-y-1 bg-surface-panel font-code-metric text-label-sm text-secondary">
                    <div className="flex justify-between items-center text-[10px]">
                      <span>{isEn ? 'Test: 500V MEGGER' : 'Ujian: 500V MEGGER'}</span>
                      <span>240.2 VAC</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-status-pending-amber font-semibold">
                      <span>{isEn ? 'UNDER TEST' : 'SEDANG DIUJI'}</span>
                      <span>02:20 PM</span>
                    </div>
                  </div>
                </div>

                {/* Phase 3: Selepas */}
                <div
                  onClick={() => setExifModalOpen(true)}
                  className="group relative flex flex-col bg-surface-canvas rounded-lg overflow-hidden shadow-xs border border-border-subtle cursor-pointer"
                >
                  <div className="relative aspect-square w-full bg-navy-header overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt="3. After Photo"
                      src={currentTicket.photos[2]?.url || IMAGES.s04Photo3}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-header/90 via-navy-header/20 to-transparent" />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-status-approved-green text-on-secondary font-code-metric text-label-sm">
                      {currentTicket.billboardCode} • VERIFIED
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="block text-on-secondary font-label-md text-label-md font-semibold leading-tight">
                        {isEn ? '3. After Photo' : '3. Foto Selepas'}
                      </span>
                      <span className="block text-on-secondary/80 font-body-sm text-body-sm text-[11px] leading-tight truncate">
                        {isEn ? 'Screen 100% fully illuminated' : 'Skrin bercahaya penuh 100%'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 space-y-1 bg-surface-panel font-code-metric text-label-sm text-secondary">
                    <div className="flex justify-between items-center text-[10px]">
                      <span>{isEn ? 'Load: 14.2A Stable' : 'Beban: 14.2A Stabil'}</span>
                      <span>{isEn ? 'DB Sealed' : 'DB Bertutup'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-status-approved-green font-semibold">
                      <span>{isEn ? 'VERIFIED COMPLETE' : 'DISAHKAN SIAP'}</span>
                      <span>03:45 PM</span>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Audit Photo Notice */}
              <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-wrap items-center justify-between gap-2 text-body-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    security_update_good
                  </span>
                  <span className="text-on-surface">
                    {isEn
                      ? `Valid EXIF Metadata: Verified at site latitude ${currentTicket.billboardCode} with zero digital tampering.`
                      : `Metadata EXIF sah: Disahkan pada latitud tapak ${currentTicket.billboardCode} tanpa suntingan digital.`}
                  </span>
                </div>
                <button
                  onClick={() => setExifModalOpen(true)}
                  className="text-primary hover:underline font-label-md text-label-md font-semibold cursor-pointer"
                  type="button"
                >
                  {isEn ? 'Open Full Lightbox' : 'Buka Paparan Penuh'}
                </button>
              </div>
            </article>

            {/* Replacement Parts & Contractor Log */}
            <article className="bg-surface-panel p-space-md lg:p-space-lg rounded-xl shadow-xs border border-border-subtle space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    precision_manufacturing
                  </span>
                  <h2 className="font-title-md text-title-md text-on-surface font-bold">
                    {isEn
                      ? 'Work Report & Spare Parts Consumed'
                      : 'Laporan Kerja & Alat Ganti Digunakan'}
                  </h2>
                </div>
                <span className="font-code-metric text-label-sm text-secondary">
                  {isEn ? 'Ref Code: INV-CLAIM-8819' : 'Kod Ref: INV-CLAIM-8819'}
                </span>
              </div>

              {/* Parts Table */}
              <div className="overflow-x-auto rounded-lg shadow-xs border border-border-subtle">
                <table className="w-full text-left font-body-sm text-body-sm">
                  <thead className="bg-navy-header text-on-secondary font-label-md text-label-md uppercase">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">
                        {isEn ? 'Component / Model' : 'Komponen / Model'}
                      </th>
                      <th className="py-2.5 px-4 font-semibold">
                        {isEn ? 'SKU Code' : 'Kod SKU'}
                      </th>
                      <th className="py-2.5 px-4 text-center font-semibold">
                        {isEn ? 'Quantity' : 'Kuantiti'}
                      </th>
                      <th className="py-2.5 px-4 text-right font-semibold">
                        {isEn ? 'Stock Verification' : 'Verifikasi Stok'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle bg-surface-panel">
                    {isBB084 ? (
                      <>
                        <tr className="hover:bg-status-pending-amber-bg/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-on-surface block">
                              MCB 32A Type C Single Pole
                            </span>
                            <span className="text-secondary text-[11px]">
                              Hager Industrial 10kA Breaking Cap
                            </span>
                          </td>
                          <td className="py-3 px-4 font-code-metric text-secondary">INV-MCB-32</td>
                          <td className="py-3 px-4 text-center font-code-metric font-bold text-on-surface">
                            2 Unit
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 font-code-metric text-label-sm text-status-approved-green font-semibold">
                              <span className="material-symbols-outlined text-[14px]">check</span>{' '}
                              {isEn ? 'Matched' : 'Dipadankan'}
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-surface-canvas hover:bg-status-pending-amber-bg/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-on-surface block">
                              Digital Timer Switch 24H 7-Day
                            </span>
                            <span className="text-secondary text-[11px]">
                              Theben TR 610 Top3 Digital Din-Rail
                            </span>
                          </td>
                          <td className="py-3 px-4 font-code-metric text-secondary">INV-TMR-01</td>
                          <td className="py-3 px-4 text-center font-code-metric font-bold text-on-surface">
                            1 Unit
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 font-code-metric text-label-sm text-status-approved-green font-semibold">
                              <span className="material-symbols-outlined text-[14px]">check</span>{' '}
                              {isEn ? 'Matched' : 'Dipadankan'}
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-status-pending-amber-bg/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-on-surface block">
                              {isEn
                                ? 'Silicone Heat-Resistant Cable 4mm²'
                                : 'Kabel Tahan Haba Silikon 4mm²'}
                            </span>
                            <span className="text-secondary text-[11px]">
                              Flame Retardant Double Sheathed Single Core
                            </span>
                          </td>
                          <td className="py-3 px-4 font-code-metric text-secondary">INV-CBL-4MM</td>
                          <td className="py-3 px-4 text-center font-code-metric font-bold text-on-surface">
                            4 Meter
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 font-code-metric text-label-sm text-status-approved-green font-semibold">
                              <span className="material-symbols-outlined text-[14px]">check</span>{' '}
                              {isEn ? 'Matched' : 'Dipadankan'}
                            </span>
                          </td>
                        </tr>
                      </>
                    ) : (
                      currentTicket.partsUsed.map((part) => (
                        <tr key={part.id} className="hover:bg-status-pending-amber-bg/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-on-surface block">{part.name}</span>
                            {part.subtitle && (
                              <span className="text-secondary text-[11px]">{part.subtitle}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-code-metric text-secondary">{part.sku}</td>
                          <td className="py-3 px-4 text-center font-code-metric font-bold text-on-surface">
                            {part.qty} {part.unit}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 font-code-metric text-label-sm text-status-approved-green font-semibold">
                              <span className="material-symbols-outlined text-[14px]">check</span>{' '}
                              {isEn ? 'Matched' : 'Dipadankan'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Contractor Field Notes */}
              <div className="bg-surface-container-low p-space-md rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-on-surface font-label-md text-label-md">
                  <span className="material-symbols-outlined text-primary text-[18px]">notes</span>
                  <span className="font-bold uppercase tracking-wider">
                    {isEn ? 'Contractor Technical Field Notes:' : 'Catatan Teknikal Kontraktor:'}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant italic pl-6 leading-relaxed">
                  “{isEn ? currentTicket.technicalNotesEn : currentTicket.technicalNotes}”
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-label-sm font-label-sm text-secondary pt-2 pl-6">
                  <span>
                    {isEn
                      ? 'Recorded by: Hazim bin Rosli (Apex Electrical)'
                      : 'Direkodkan oleh: Hazim bin Rosli (Apex Electrical)'}
                  </span>
                  <span className="font-code-metric">
                    {isEn
                      ? 'Field Signature: Verified in Log #APX-441'
                      : 'Tandatangan Tapak: Tersedia di Log #APX-441'}
                  </span>
                </div>
              </div>
            </article>
          </section>

          {/* RIGHT COLUMN: Supervisor Audit Checklist & Digital E-Signature (5 cols) */}
          <aside className="lg:col-span-5 space-y-space-lg">
            {/* Audit Verification Checkbox Panel */}
            <div className="bg-surface-panel p-space-md lg:p-space-lg rounded-xl shadow-xs border border-border-subtle space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    fact_check
                  </span>
                  <h2 className="font-title-md text-title-md text-on-surface font-bold">
                    {isEn ? 'Supervisor Verification Checklist' : 'Semakan Verifikasi Penyelia'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allChecked = chkPhotos && chkParts && chkScreen;
                    setChkPhotos(!allChecked);
                    setChkParts(!allChecked);
                    setChkScreen(!allChecked);
                  }}
                  className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high font-label-sm text-xs text-primary font-semibold uppercase cursor-pointer"
                >
                  {chkPhotos && chkParts && chkScreen
                    ? isEn
                      ? 'Uncheck All'
                      : 'Nyahpilih Semua'
                    : isEn
                    ? 'Check All (3/3)'
                    : 'Tanda Semua (3/3)'}
                </button>
              </div>

              {/* Dynamic Checkbox Matrix */}
              <div className="space-y-2.5">
                <label className="flex items-start gap-3 p-3 rounded-lg bg-surface-canvas hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <input
                    checked={chkPhotos}
                    onChange={(e) => setChkPhotos(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-status-pending-amber focus:ring-status-pending-amber border-border-strong"
                    type="checkbox"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-label-md text-label-md font-semibold text-on-surface block group-hover:text-primary transition-colors">
                      {isEn
                        ? '1. Site photos are clear, valid & complete'
                        : '1. Foto tapak jelas, sah & mencukupi'}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary block">
                      {isEn
                        ? 'All 3 geotagged Bukit Bintang work phases verified without visual obstruction.'
                        : '3 sudut fasa kerja bergeotag Bukit Bintang lengkap tanpa kecacatan gambar.'}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg bg-surface-canvas hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <input
                    checked={chkParts}
                    onChange={(e) => setChkParts(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-status-pending-amber focus:ring-status-pending-amber border-border-strong"
                    type="checkbox"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-label-md text-label-md font-semibold text-on-surface block group-hover:text-primary transition-colors">
                      {isEn
                        ? '2. Spare parts quantity matches on-site installation'
                        : '2. Kuantiti alat ganti sepadan di tapak'}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary block">
                      {isEn
                        ? '2 units MCB 32A, 1 timer switch & 4m cable confirmed installed inside DB enclosure.'
                        : '2 unit MCB 32A, 1 timer switch & 4m kabel disahkan terpasang di kotak DB.'}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg bg-surface-canvas hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <input
                    checked={chkScreen}
                    onChange={(e) => setChkScreen(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-status-pending-amber focus:ring-status-pending-amber border-border-strong"
                    type="checkbox"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-label-md text-label-md font-semibold text-on-surface block group-hover:text-primary transition-colors">
                      {isEn
                        ? '3. Display operates steadily without flicker'
                        : '3. Skrin beroperasi stabil tanpa kelipan'}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary block">
                      {isEn
                        ? '15-minute burn-in test completed without current surge or breaker trip.'
                        : 'Ujian nyalaan 15 minit selesai tanpa lonjakan arus atau trip semula.'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* E-Signature Interactive Canvas Pad */}
            <div className="bg-surface-panel p-space-md lg:p-space-lg rounded-xl shadow-xs border border-border-subtle space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">draw</span>
                  <h2 className="font-title-md text-title-md text-on-surface font-bold">
                    {isEn ? 'Digital E-Signature Module' : 'Modul E-Tandatangan Digital'}
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-status-approved-green-bg text-status-approved-green font-code-metric uppercase">
                  {isEn ? 'Ready to Sign' : 'Sedia Ditandatangan'}
                </span>
              </div>

              {/* Supervisor Info Card */}
              <div className="p-3 bg-surface-container-low rounded-lg space-y-1 font-body-sm text-body-sm">
                <div className="flex justify-between">
                  <span className="text-secondary font-label-sm uppercase">
                    {isEn ? 'Supervisor Name:' : 'Nama Penyelia:'}
                  </span>
                  <span className="text-on-surface font-bold">Siti Zahara binti Mansor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary font-label-sm uppercase">
                    {isEn ? 'Designation:' : 'Jawatan:'}
                  </span>
                  <span className="text-on-surface font-medium">
                    {isEn
                      ? 'Head of Technical Operations (ID: ST-9022)'
                      : 'Ketua Operasi Teknikal (ID: ST-9022)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary font-label-sm uppercase">
                    {isEn ? 'System Timestamp:' : 'Masa Sistem:'}
                  </span>
                  <span className="text-primary font-code-metric font-semibold">
                    {isEn ? '24 October 2024, 17:15:30 MYT' : '24 Oktober 2024, 17:15:30 MYT'}
                  </span>
                </div>
              </div>

              {/* Signature Pad Container */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-label-sm font-label-sm text-secondary">
                  <span>
                    {isEn
                      ? 'Draw your official digital signature below:'
                      : 'Sila turunkan tandatangan digital anda di bawah:'}
                  </span>
                  <span className="text-status-assigned-red font-medium">
                    {isEn ? '* Mandatory' : '* Mandatori'}
                  </span>
                </div>
                <div className="relative bg-surface-canvas rounded-lg overflow-hidden p-1 shadow-inner border border-border-strong">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleStartDraw}
                    onMouseMove={handleMoveDraw}
                    onMouseUp={handleStopDraw}
                    onMouseLeave={handleStopDraw}
                    onTouchStart={handleStartDraw}
                    onTouchMove={handleMoveDraw}
                    onTouchEnd={handleStopDraw}
                    className="w-full h-40 bg-surface-panel rounded cursor-crosshair touch-none"
                  />
                  {/* Subtle guide line */}
                  <div className="absolute bottom-9 left-6 right-6 h-px bg-secondary/20 pointer-events-none flex items-center justify-between px-2">
                    <span className="text-[9px] uppercase tracking-widest text-secondary/40 font-code-metric">
                      {isEn ? 'Authorized Signature Line' : 'Garis Tandatangan Rasmi'}
                    </span>
                    <span className="text-[9px] text-secondary/40 font-code-metric">
                      BillboardOps Verifier
                    </span>
                  </div>
                  {/* Canvas Action Bar */}
                  <div className="flex items-center justify-between pt-2 px-2 pb-1">
                    <div className="flex items-center gap-1 text-[11px] text-secondary font-code-metric">
                      <span className="material-symbols-outlined text-[14px]">touch_app</span>
                      <span>{isEn ? 'Touch / Mouse Input' : 'Sentuh / Gunakan Tetikus'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleLoadSavedSignature}
                        className="px-2 py-1 text-label-sm font-label-sm text-secondary hover:text-on-surface hover:bg-surface-container rounded transition-colors cursor-pointer"
                        type="button"
                      >
                        {isEn ? 'Load Saved Signature' : 'Muat Tandatangan Simpanan'}
                      </button>
                      <button
                        onClick={handleClearCanvas}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-label-sm font-label-sm text-status-assigned-red hover:bg-status-assigned-red-bg rounded transition-colors font-semibold cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>{' '}
                        {isEn ? 'Clear' : 'Padam'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Attestation Statement */}
              <div className="p-3 bg-surface-canvas rounded-lg flex items-start gap-2.5">
                <span className="material-symbols-outlined text-status-pending-amber text-[20px] mt-0.5 shrink-0">
                  verified_user
                </span>
                <p className="font-body-sm text-body-sm text-secondary leading-snug">
                  {isEn
                    ? `“I hereby certify that the electrical repair works at Billboard ${currentTicket.billboardCode} have been physically and digitally audited, MS IEC 60364 safety standards are met, and spare parts are verified for payment voucher issuance.”`
                    : `“Saya dengan ini memperakui bahawa kerja-kerja pembaikan di Billboard ${currentTicket.billboardCode} telah diaudit secara fizikal/digital, spesifikasi keselamatan elektrik dipatuhi, dan alat ganti direkodkan dengan sah untuk pengeluaran baucar bayaran.”`}
                </p>
              </div>

              {/* Final Operational CTA Actions */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleApproveClick}
                  className="w-full h-11 px-space-md bg-status-approved-green hover:bg-status-approved-green/90 text-on-secondary rounded-lg font-label-md text-label-md uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>
                    {isEn
                      ? 'Verify & Approve for Payment'
                      : 'Sahkan & Luluskan untuk Pembayaran'}
                  </span>
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setRevisionModalOpen(true)}
                    className="h-10 px-space-xs bg-surface-panel hover:bg-surface-canvas border border-border-subtle text-status-assigned-red rounded-lg font-label-sm text-label-sm uppercase tracking-wide flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">cancel</span>
                    <span>{isEn ? 'Request Revision' : 'Minta Pindaan'}</span>
                  </button>
                  <button
                    onClick={() => onNavigate('s05-finance', currentTicket.id)}
                    className="h-10 px-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-sm text-label-sm uppercase tracking-wide flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                    <span>{isEn ? 'A4 JCC Cert' : 'Sijil JCC A4'}</span>
                  </button>
                  <button
                    onClick={() => onNavigate('f06-logs', currentTicket.id)}
                    className="h-10 px-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-sm text-label-sm uppercase tracking-wide flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">forward_to_inbox</span>
                    <span>{isEn ? 'Client Logs' : 'Log Klien'}</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* EXIF Full Resolution Photo Modal */}
      {exifModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-panel rounded-xl max-w-4xl w-full p-space-lg shadow-2xl border border-border-strong space-y-space-md">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified</span>
                <h3 className="font-headline-md text-title-md text-on-surface font-bold">
                  {isEn
                    ? `EXIF Geotagged Photo Proof — #${currentTicket.id} (${currentTicket.billboardCode})`
                    : `Bukti Foto Bergeotag EXIF — #${currentTicket.id} (${currentTicket.billboardCode})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExifModalOpen(false)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentTicket.photos.map((ph, idx) => (
                <div key={ph.id} className="rounded-lg overflow-hidden border border-border-subtle bg-surface-canvas">
                  <img
                    src={ph.url}
                    alt={isEn ? ph.titleEn : ph.title}
                    className="w-full aspect-square object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-3 space-y-1">
                    <p className="font-label-md font-bold text-on-surface">
                      {idx + 1}. {isEn ? ph.titleEn : ph.title}
                    </p>
                    <p className="text-body-sm text-secondary">
                      {isEn ? ph.subtitleEn : ph.subtitle}
                    </p>
                    <p className="font-code-metric text-[11px] text-primary">
                      EXIF Timestamp: {ph.timestamp} • GPS: 3.1466° N, 101.7112° E
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setExifModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-navy-header text-white font-label-md cursor-pointer"
              >
                {isEn ? 'Close Lightbox' : 'Tutup Paparan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Revision Modal */}
      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-panel rounded-xl max-w-md w-full p-space-lg shadow-2xl border border-border-strong space-y-space-md">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <h3 className="font-headline-md text-title-md text-status-assigned-red font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">cancel</span>
                {isEn ? 'Request Contractor Revision' : 'Minta Pindaan Kontraktor'}
              </h3>
              <button
                type="button"
                onClick={() => setRevisionModalOpen(false)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmitRevision} className="space-y-4">
              <div>
                <label className="block font-label-md text-on-surface mb-1">
                  {isEn
                    ? `Specify revision notes for ${currentTicket.contractor}:`
                    : `Nyatakan sebab pindaan diperlukan kepada ${currentTicket.contractor}:`}
                </label>
                <textarea
                  required
                  rows={3}
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Example: Please upload a clearer photo of the earth resistance tester reading...'
                      : 'Contoh: Sila muat naik bacaan meter penguji rintangan bumi dengan lebih jelas...'
                  }
                  className="w-full p-2.5 rounded-lg border border-border-strong bg-surface-canvas text-body-sm text-on-surface"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevisionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-sm cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-status-assigned-red text-white font-label-sm font-bold cursor-pointer"
                >
                  {isEn ? 'Send Revision Request' : 'Hantar Arahan Pindaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
