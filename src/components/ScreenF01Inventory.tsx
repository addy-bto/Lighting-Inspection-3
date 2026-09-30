import React, { useState } from 'react';
import { InventoryItem, LangMode, RoleMode } from '../data/initialData';

interface ScreenF01InventoryProps {
  lang: LangMode;
  role: RoleMode;
  inventory: InventoryItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onAddInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  onEditInventoryItem?: (item: InventoryItem) => void;
  onDeleteInventoryItem?: (id: string) => void;
  onOpenMasterDataModal?: (tab?: 'sites' | 'equipment' | 'tickets') => void;
  showToast: (title: string, message: string, isError?: boolean) => void;
}

export const ScreenF01Inventory: React.FC<ScreenF01InventoryProps> = ({
  lang,
  role,
  inventory,
  onUpdateQty,
  onAddInventoryItem,
  onEditInventoryItem,
  onDeleteInventoryItem,
  onOpenMasterDataModal,
  showToast,
}) => {
  const isEn = lang === 'en';
  const [filterLevel, setFilterLevel] = useState<'all' | 'critical' | 'normal'>('all');
  const [searchItem, setSearchItem] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Add item form state
  const [newSku, setNewSku] = useState('ELC-SPD-40KA');
  const [newName, setNewName] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('Suruhanjaya Tenaga / MS IEC 60364 Certified');
  const [newQty, setNewQty] = useState(10);
  const [newMin, setNewMin] = useState(5);
  const [newUnit, setNewUnit] = useState('unit');
  const [newCost, setNewCost] = useState(320);
  const [newNotes, setNewNotes] = useState('');

  const filteredItems = inventory.filter((item) => {
    const isCrit = item.quantity <= item.minThreshold || item.levelType !== 'normal';
    if (filterLevel === 'critical' && !isCrit) return false;
    if (filterLevel === 'normal' && isCrit) return false;
    if (searchItem.trim()) {
      const q = searchItem.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalInventoryValue = inventory.reduce(
    (acc, item) => acc + item.quantity * item.unitCost,
    0
  );
  const criticalItemsCount = inventory.filter(
    (item) => item.quantity <= item.minThreshold || item.levelType !== 'normal'
  ).length;

  const handleRestockAllCritical = () => {
    if (role === 'finance') {
      showToast(
        isEn ? 'Read-Only Mode' : 'Mod Baca-Sahaja',
        isEn
          ? 'Finance role cannot modify electrical inventory stock.'
          : 'Peranan Kewangan tidak dibenarkan mengubah stok inventori elektrik.',
        true
      );
      return;
    }
    const lowItems = inventory.filter(
      (item) => item.quantity <= item.minThreshold || item.levelType !== 'normal'
    );
    if (lowItems.length === 0) {
      showToast(
        isEn ? 'All Stock Sufficient' : 'Semua Stok Mencukupi',
        isEn
          ? 'All electrical SKU items are already above minimum threshold.'
          : 'Semua item SKU elektrik berada di atas paras minimum.'
      );
      return;
    }
    lowItems.forEach((item) => {
      onUpdateQty(item.id, 10);
    });
    showToast(
      isEn ? 'Critical Stock Replenished (+10)' : 'Stok Kritikal Ditambah (+10)',
      isEn
        ? `Restocked ${lowItems.length} low-stock SKU items in Shah Alam Central Depot.`
        : `Menambah stok bagi ${lowItems.length} komponen kritikal di Depoh Pusat.`
    );
  };

  const handleExportInventoryCsv = () => {
    const headers = ['SKU', 'Component Name', 'Specification', 'Quantity', 'Min Threshold', 'Unit', 'Unit Cost (RM)', 'Total Value (RM)'];
    const rows = inventory.map((i) => [
      i.sku,
      `"${i.name}"`,
      `"${i.subtitle}"`,
      i.quantity,
      i.minThreshold,
      i.unit,
      i.unitCost.toFixed(2),
      (i.quantity * i.unitCost).toFixed(2),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'BillboardOps_Electrical_Inventory_F01.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      isEn ? 'Inventory Ledger Exported (CSV)' : 'Lejar Inventori Dieksport (CSV)',
      isEn
        ? 'Downloaded BillboardOps_Electrical_Inventory_F01.csv'
        : 'Memuat turun BillboardOps_Electrical_Inventory_F01.csv'
    );
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'finance') {
      showToast(
        isEn ? 'Read-Only Mode' : 'Mod Baca-Sahaja',
        isEn
          ? 'Finance role cannot modify electrical inventory stock.'
          : 'Peranan Kewangan tidak dibenarkan mengubah stok inventori elektrik.',
        true
      );
      return;
    }
    if (!newName.trim()) return;
    const isCrit = newQty <= newMin;
    if (editingItemId && onEditInventoryItem) {
      onEditInventoryItem({
        id: editingItemId,
        sku: newSku.trim() || 'ELC-NEW-001',
        name: newName.trim(),
        subtitle: newSubtitle.trim() || 'Industrial Electrical Component',
        quantity: newQty,
        minThreshold: newMin,
        maxCapacity: Math.max(newQty * 2, 20),
        unit: newUnit,
        unitCost: newCost,
        statusLabel: isCrit ? 'Stok Rendah' : 'Mencukupi',
        statusLabelEn: isCrit ? 'Low Stock' : 'Sufficient',
        levelType: isCrit ? 'critical' : 'normal',
        notes: newNotes.trim() || 'Central Depot Electrical Equipment',
        lastUpdated: 'Just updated',
      });
    } else {
      onAddInventoryItem({
        sku: newSku.trim() || 'ELC-NEW-001',
        name: newName.trim(),
        subtitle: newSubtitle.trim() || 'Industrial Electrical Component',
        quantity: newQty,
        minThreshold: newMin,
        maxCapacity: Math.max(newQty * 2, 20),
        unit: newUnit,
        unitCost: newCost,
        statusLabel: isCrit ? 'Stok Rendah' : 'Mencukupi',
        statusLabelEn: isCrit ? 'Low Stock' : 'Sufficient',
        levelType: isCrit ? 'critical' : 'normal',
        notes: newNotes.trim() || 'Komponen elektrik stok depoh pusat.',
      });
    }
    setEditingItemId(null);
    setNewName('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleOpenEditRow = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setNewSku(item.sku);
    setNewName(item.name);
    setNewSubtitle(item.subtitle);
    setNewQty(item.quantity);
    setNewMin(item.minThreshold);
    setNewUnit(item.unit);
    setNewCost(item.unitCost);
    setNewNotes(item.notes);
    setShowAddModal(true);
  };

  return (
    <div className="p-space-lg max-w-[1600px] mx-auto space-y-space-lg">
      {/* Header Banner */}
      <div className="bg-surface-panel rounded-xl p-space-lg border border-border-subtle shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-navy-header text-on-primary font-code-metric text-label-sm uppercase">
              {isEn ? 'MODULE F01 • CENTRAL DEPOT STOCK' : 'MODUL F01 • STOK DEPOH PUSAT'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-status-assigned-red-bg text-status-assigned-red font-code-metric text-label-sm font-bold">
              {criticalItemsCount} {isEn ? 'CRITICAL LOW ALERTS' : 'AMARAN STOK RENDAH'}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            {isEn
              ? 'Electrical Inventory & Spare Parts Ledger (F01)'
              : 'Pengurusan Inventori Alat Ganti Elektrik & Lejar Stok (F01)'}
          </h1>
          <p className="font-body-md text-secondary mt-0.5">
            {isEn
              ? 'Real-time tracking of LED spotlights, MCB/MCCB breakers, contactors, timer switches, TNB meter boxes, and XLPE armored cables.'
              : 'Pemantauan masa nyata lampu limpah LED, pemutus litar MCB/MCCB, contactor, suis pemasa, kotak meter TNB, dan kabel perisai XLPE.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          {onOpenMasterDataModal && (
            <button
              type="button"
              onClick={() => onOpenMasterDataModal('equipment')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-navy-header hover:bg-slate-800 text-amber-400 font-code-metric text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">pin</span>
              <span>
                {isEn
                  ? 'Sites & Equipment Manager (1111)'
                  : 'Urus Sites & Kelengkapan Elektrik (1111)'}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportInventoryCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-border-strong font-label-md uppercase tracking-wider shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{isEn ? 'Export Stock CSV' : 'Eksport CSV Stok'}</span>
          </button>
          <button
            type="button"
            disabled={role === 'finance'}
            onClick={handleRestockAllCritical}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-navy-header hover:bg-slate-800 text-white font-label-md uppercase tracking-wider shadow-xs cursor-pointer ${
              role === 'finance' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">autorenew</span>
            <span>{isEn ? 'Restock Critical (+10)' : 'Tambah Stok Kritikal (+10)'}</span>
          </button>
          <button
            type="button"
            disabled={role === 'finance'}
            onClick={() => setShowAddModal(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-status-pending-amber hover:bg-primary text-on-primary font-label-md uppercase tracking-wider shadow-xs cursor-pointer ${
              role === 'finance' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">add_box</span>
            <span>{isEn ? '+ Add Electrical Part' : '+ Tambah Komponen Baru'}</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div className="bg-surface-panel p-space-md rounded-xl border border-border-subtle shadow-xs">
          <span className="font-label-sm text-secondary uppercase">
            {isEn ? 'Total Registered SKU Categories' : 'Jumlah Kategori SKU Berdaftar'}
          </span>
          <div className="font-code-metric text-headline-lg font-bold text-on-surface mt-1">
            {inventory.length} SKU
          </div>
          <span className="font-body-sm text-status-approved-green">
            {isEn ? 'Central Depot Shah Alam & North/South Hubs' : 'Depoh Pusat Shah Alam & Hab Lebuhraya'}
          </span>
        </div>

        <div className="bg-surface-panel p-space-md rounded-xl border border-border-subtle shadow-xs">
          <span className="font-label-sm text-secondary uppercase">
            {isEn ? 'Low Stock / Reorder Required' : 'Stok Bawah Paras Minimum (Kritikal)'}
          </span>
          <div className="font-code-metric text-headline-lg font-bold text-status-assigned-red mt-1">
            {criticalItemsCount} {isEn ? 'Items' : 'Komponen'}
          </div>
          <span className="font-body-sm text-secondary">
            {isEn ? 'Automatic visual flag when Qty ≤ Min Threshold' : 'Penandaan automatik apabila Kuantiti ≤ Had Minimum'}
          </span>
        </div>

        <div className="bg-surface-panel p-space-md rounded-xl border border-border-subtle shadow-xs">
          <span className="font-label-sm text-secondary uppercase">
            {isEn ? 'Total Depot Stock Value' : 'Nilai Keseluruhan Stok Semasa'}
          </span>
          <div className="font-code-metric text-headline-lg font-bold text-primary mt-1">
            RM {totalInventoryValue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
          </div>
          <span className="font-body-sm text-secondary">
            {isEn ? 'Zero-markup direct contractor allocation' : 'Agihan terus kepada kontraktor tanpa tokokan harga'}
          </span>
        </div>
      </div>

      {/* Filter Bar & Inventory Table */}
      <div className="bg-surface-panel rounded-xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-space-md border-b border-border-subtle flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterLevel('all')}
              className={`px-3 py-1.5 rounded-lg font-label-md cursor-pointer ${
                filterLevel === 'all'
                  ? 'bg-navy-header text-on-primary'
                  : 'bg-surface-panel text-secondary border border-border-subtle'
              }`}
            >
              {isEn ? 'All Parts' : 'Semua Komponen'} ({inventory.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('critical')}
              className={`px-3 py-1.5 rounded-lg font-label-md cursor-pointer ${
                filterLevel === 'critical'
                  ? 'bg-status-assigned-red text-on-primary'
                  : 'bg-surface-panel text-status-assigned-red border border-status-assigned-red-border'
              }`}
            >
              {isEn ? 'Low / Critical Stock' : 'Stok Rendah / Kritikal'} ({criticalItemsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel('normal')}
              className={`px-3 py-1.5 rounded-lg font-label-md cursor-pointer ${
                filterLevel === 'normal'
                  ? 'bg-status-approved-green text-on-primary'
                  : 'bg-surface-panel text-status-approved-green border border-status-approved-green-border'
              }`}
            >
              {isEn ? 'Sufficient Stock' : 'Stok Mencukupi'}
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              placeholder={isEn ? 'Filter SKU or component name...' : 'Tapis SKU atau nama komponen...'}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-panel border border-border-strong text-body-sm focus:outline-none focus:border-status-pending-amber"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-header text-on-primary font-label-sm text-label-sm uppercase">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">{isEn ? 'Electrical Component' : 'Komponen Elektrik'}</th>
                <th className="py-3 px-4 text-center">{isEn ? 'Current Qty' : 'Baki Semasa'}</th>
                <th className="py-3 px-4 text-center">{isEn ? 'Min Threshold' : 'Paras Minimum'}</th>
                <th className="py-3 px-4 text-right">{isEn ? 'Unit Cost' : 'Kos Unit'}</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">{isEn ? 'Technical Notes' : 'Catatan Teknikal'}</th>
                <th className="py-3 px-4 text-right">{isEn ? 'Adjust Stock' : 'Pelarasan Stok'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-body-sm">
              {filteredItems.map((item) => {
                const isCrit = item.quantity <= item.minThreshold;
                return (
                  <tr
                    key={item.id}
                    className={
                      isCrit ? 'bg-status-assigned-red-bg/30 hover:bg-status-assigned-red-bg/50' : 'hover:bg-surface-canvas'
                    }
                  >
                    <td className="py-3 px-4 font-code-metric font-bold text-on-surface">
                      {item.sku}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-on-surface">{item.name}</div>
                      <div className="text-label-sm text-secondary">{item.subtitle}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-code-metric text-title-md font-bold ${
                          isCrit ? 'text-status-assigned-red' : 'text-on-surface'
                        }`}
                      >
                        {item.quantity}
                      </span>{' '}
                      <span className="text-label-sm text-secondary">{item.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-code-metric text-secondary">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-code-metric font-semibold">
                      RM {item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isCrit ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-assigned-red-bg text-status-assigned-red border border-status-assigned-red-border font-code-metric text-label-sm font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-assigned-red animate-ping" />
                          {isEn ? 'LOW STOCK' : 'STOK KRITIKAL'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-approved-green-bg text-status-approved-green border border-status-approved-green-border font-code-metric text-label-sm font-bold">
                          {isEn ? item.statusLabelEn : item.statusLabel}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-secondary max-w-xs">{item.notes}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={role === 'finance'}
                          onClick={() => handleOpenEditRow(item)}
                          className="px-2 h-8 rounded bg-surface-container hover:bg-navy-header hover:text-white text-on-surface font-label-sm text-xs font-bold cursor-pointer disabled:opacity-40"
                          title={isEn ? 'Edit electrical equipment details' : 'Ubah butiran kelengkapan elektrik'}
                        >
                          {isEn ? 'Edit' : 'Ubah'}
                        </button>
                        <button
                          type="button"
                          disabled={role === 'finance'}
                          onClick={() => onUpdateQty(item.id, -1)}
                          className="w-8 h-8 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-bold cursor-pointer disabled:opacity-40"
                          title={isEn ? 'Deduct 1 unit' : 'Tolak 1 unit'}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          disabled={role === 'finance'}
                          onClick={() => onUpdateQty(item.id, 1)}
                          className="w-8 h-8 rounded bg-navy-header hover:bg-primary text-on-primary font-bold cursor-pointer disabled:opacity-40"
                          title={isEn ? 'Restock 1 unit' : 'Tambah 1 unit'}
                        >
                          +
                        </button>
                        {onDeleteInventoryItem && inventory.length > 1 && (
                          <button
                            type="button"
                            disabled={role === 'finance'}
                            onClick={() => onDeleteInventoryItem(item.id)}
                            className="w-8 h-8 rounded text-secondary hover:text-status-assigned-red hover:bg-status-assigned-red-bg flex items-center justify-center cursor-pointer disabled:opacity-40"
                            title={isEn ? 'Delete item' : 'Padam komponen'}
                          >
                            <span className="material-symbols-outlined text-[17px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-panel rounded-xl max-w-lg w-full p-space-lg border border-border-strong shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
              <h3 className="font-headline-md text-title-md font-bold text-on-surface">
                {editingItemId
                  ? isEn
                    ? `Edit Electrical Equipment: ${newSku}`
                    : `Kemas Kini Kelengkapan Elektrik: ${newSku}`
                  : isEn
                  ? 'Add New Electrical Inventory Item'
                  : 'Daftar Komponen Inventori Elektrik Baru'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingItemId(null);
                  setShowAddModal(false);
                }}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-secondary uppercase mb-1">
                    {isEn ? 'SKU Code' : 'Kod SKU'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-canvas font-code-metric text-body-sm"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-secondary uppercase mb-1">
                    {isEn ? 'Unit Type' : 'Unit Ukuran'}
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-canvas text-body-sm"
                  >
                    <option value="unit">unit</option>
                    <option value="meter">meter</option>
                    <option value="set">set</option>
                    <option value="gulung">gulung</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-secondary uppercase mb-1">
                  {isEn ? 'Component Name' : 'Nama Komponen Elektrik'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Surge Protection Device (SPD) 40kA"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-canvas text-body-sm"
                />
              </div>

              <div>
                <label className="block font-label-sm text-secondary uppercase mb-1">
                  {isEn ? 'Specification Subtitle' : 'Spesifikasi Teknikal'}
                </label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-canvas text-body-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-label-sm text-secondary uppercase mb-1">
                    {isEn ? 'Initial Qty' : 'Kuantiti Awal'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-canvas font-code-metric text-body-sm"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-secondary uppercase mb-1">
                    {isEn ? 'Min Threshold' : 'Paras Minimum'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newMin}
                    onChange={(e) => setNewMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-canvas font-code-metric text-body-sm"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-secondary uppercase mb-1">
                    {isEn ? 'Unit Cost (RM)' : 'Kos Unit (RM)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-canvas font-code-metric text-body-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-secondary uppercase mb-1">
                  {isEn ? 'Depot Notes' : 'Nota Penyimpanan / Depoh'}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Rak simpanan B-04, Depoh Shah Alam..."
                  className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-canvas text-body-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-border-strong text-secondary font-label-md cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-status-pending-amber text-on-primary font-label-md uppercase cursor-pointer"
                >
                  {isEn ? 'Save Component' : 'Simpan Komponen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
