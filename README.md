# BillboardOps Enterprise — Billboard Maintenance & Electrical Inventory System

An enterprise-grade **Outdoor Advertising Structure Maintenance, Electrical Spare Parts Inventory, Contractor Work Order Portal, Digital E-Signature Verification, and Financial Invoice Audit System** built with React 19, TypeScript, Vite, and Tailwind CSS.

---

## ⚡ Key Modules & Architecture (S01–S05 & F01–F06)

| Module ID | Module Name | Core Capabilities |
| :--- | :--- | :--- |
| **S02 / F02** | **Operations Dashboard & Fault Tickets** | Real-time KPI summary cards, active ticket filtering (`Assigned`, `Pending Approval`, `Approved for Payment`), duplicate fault prevention, custom site/location dispatch, and zero-login contractor token URL & QR generator. |
| **S01** | **System Operations Hub & Corridor Map** | Nationwide highway corridor monitoring (`Central`, `North-South`, `Southern`, `East Coast`), live 415V 3-Phase DB electrical grid telemetry view, contractor SLA scorecard, and downloadable Executive Summary CSV reports. |
| **F01** | **Electrical Spare Parts Inventory Ledger** | Central depot stock tracking with minimum threshold alerts (`Critical Low` / `Reorder Needed`), inline stock adjustments (`-` / `+`), quick reorder PO (`+5`), bulk critical restock (`+10`), full CRUD item editing, and CSV export. |
| **S03 / F03** | **Zero-Login Contractor Job Completion Portal** | Token-authenticated field reporting form for appointed electrical contractors (`PW4 Wireman` / `CIDB`), editable site & location banner, spare parts consumption table with live stock deduction, mandatory photographic proof validation, and one-click `500V DC Megger & Voltage` test log insertion. |
| **S04 / F04** | **Supervisor Verification & Digital E-Signature** | Side-by-side `Before / Process / After` EXIF & GPS photographic proof inspection, interactive split comparison slider, 3-point technical verification checklist, interactive HTML5 canvas digital signature pad, revision request workflow, and A4 Job Completion Certificate (`JCC`) preview. |
| **S05 / F05** | **Finance Invoice Audit & Payment Clearance** | Print-ready A4 Job Completion Certificate (`JCC`) & Tax Invoice cross-check ledger, itemized spare parts cost breakdown (`RM`), bulk payment voucher export modal, downloadable vendor tax invoice (`.TXT`), and CSV financial audit export. |
| **F06** | **Client Summary Reports & ST Safety Logs** | Consolidated maintenance log filtered by billboard structure, SLA turnaround metrics, and interactive **Suruhanjaya Tenaga (`MS IEC 60364`)** Electrical Safety & Insulation Resistance Certificate modal. |

---

## 🔐 Master Data Manager & Access Code (`1111`)

The system includes a dedicated **Master Data Manager** protected by a 4-digit security PIN (**`1111`**) accessible from the top navigation bar, sidebar, dashboard banner, inventory header, or Command Palette (`⌘K` / `Ctrl+K`):

- **Access Code**: `1111`
- **Tab 1 — Sites & Locations (`Billboard Sites`)**: Add, edit, or delete billboard sites including `Site ID` (`BB-001`), `Asset Code` (`PLS-SB-024`), exact highway location, corridor zone, GPS coordinates, structure display type, and 3-Phase DB electrical specifications.
- **Tab 2 — Electrical Equipment (`F01 Inventory`)**: Add, edit, or remove electrical spare parts, SKU codes, technical specifications, unit prices (`RM`), current stock quantities, and minimum stock alert thresholds.
- **Tab 3 — Active Ticket Details**: Live-edit existing ticket locations, asset codes, assigned contractors, wireman details, and fault descriptions.

---

## 🎨 Typography & Design System

Built around a **2+1 Architectural & Technical Font Hierarchy**:
- **Display & Section Headlines**: `Cabinet Grotesk` & `Outfit` — high-contrast geometric grotesque for engineering headers and KPI metrics.
- **UI & Technical Prose**: `Satoshi` & `Plus Jakarta Sans` — crisp, legible body typography for dense operational tables and forms.
- **Monospace Telemetry & Codes**: `JetBrains Mono` (`tabular-nums`) — precision alignment for Ticket IDs (`#TKT-2024-089`), SKUs, GPS coordinates, electrical test telemetry (`500V DC >100MΩ`), and `RM` currency figures.
- **Bilingual Support**: Instant toggle between **English (`EN`)** (default) and **Bahasa Melayu (`BM`)** across all screens, modals, and certificates.
- **Role-Based Access Control (RBAC)**: Switch live between **Supervisor (Full Access)**, **Contractor (Portal F03)**, and **Finance (Read-Only Audit)** to test role permissions.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 18.x` (or **Bun**)
- **npm** `>= 9.x`

### Installation & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the development server on port 3000
npm run dev
```

Open `http://localhost:3000` in your browser.

### Type-Checking & Production Build

```bash
# Run TypeScript compiler verification
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```text
├── index.html                        # Entry HTML with Cabinet Grotesk, Satoshi & JetBrains Mono fonts
├── metadata.json                     # Application metadata & capabilities
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite bundler & Tailwind CSS v4 plugin configuration
└── src/
    ├── main.tsx                      # React 19 DOM root mount
    ├── index.css                     # Tailwind CSS v4 theme tokens, typography & print styles
    ├── App.tsx                       # Global state, localStorage persistence, modals & routing
    ├── data/
    │   └── initialData.ts            # Seed data for Billboard Sites, Tickets, Inventory & Access Code (1111)
    └── components/
        ├── SidebarShell.tsx          # Enterprise sidebar, RBAC switcher, notifications & profile popover
        ├── MasterDataModal.tsx       # PIN-protected (1111) Sites, Locations & Electrical Equipment CRUD manager
        ├── ScreenS01Hub.tsx          # Module S01: Operations Hub, Corridor Map & Live Grid Telemetry
        ├── ScreenS02Mint.tsx         # Module S02/F02: Dashboard, Fault Ticket Dispatch & QR/Token Link Modal
        ├── ScreenF01Inventory.tsx    # Module F01: Electrical Spare Parts Inventory Ledger & Stock Controls
        ├── ScreenS03Contractor.tsx   # Module S03/F03: Zero-Login Contractor Job Completion & Megger Test Form
        ├── ScreenS04Approval.tsx     # Module S04/F04: Supervisor Photo Verification & E-Signature Pad
        ├── ScreenS05Finance.tsx      # Module S05/F05: Finance Audit, A4 JCC Certificate & Bulk Voucher Export
        └── ScreenF06Logs.tsx         # Module F06: Client Summary Reports & ST MS IEC 60364 Safety Certificate
```

---

## ⌨️ Keyboard Shortcuts

- **`⌘K` / `Ctrl+K`**: Open Universal Quick Command Palette (jump to any screen, ticket, or the `Code: 1111` Master Data Manager).
- **`ESC`**: Close active modal or Command Palette.
