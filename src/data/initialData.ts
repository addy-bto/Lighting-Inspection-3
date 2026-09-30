export type ScreenId =
  | 's02-mint'      // S02 Dashboard & Work Order Tickets + Inventory (F01/F02)
  | 's01-hub'       // S01 System Overview & Billboard Operations Hub
  | 'f01-inventory' // F01 Dedicated Electrical Inventory Management & Stock Ledger
  | 's03-contractor'// S03 Contractor Public Access Work Order Form (F03)
  | 's04-approval'  // S04 Supervisor Verification & Digital E-Signature (F04)
  | 's05-finance'   // S05 Contractor Invoice Audit & Payment Clearance (F05)
  | 'f06-logs';     // F06 Client Summary Reports, MS IEC 60364 Safety Logs

export type RoleMode = 'supervisor' | 'finance' | 'contractor';
export type LangMode = 'ms' | 'en';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  subtitle: string;
  quantity: number;
  minThreshold: number;
  maxCapacity: number;
  unit: string;
  unitCost: number;
  statusLabel: string;
  statusLabelEn: string;
  levelType: 'normal' | 'critical' | 'low';
  notes: string;
  lastUpdated: string;
}

export interface PartUsed {
  id: string;
  sku: string;
  name: string;
  subtitle?: string;
  qty: number;
  unit: string;
  unitCost: number;
  icon?: string;
}

export interface TicketPhoto {
  id: string;
  phaseLabel: string;
  phaseLabelEn: string;
  badgeText: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  timestamp: string;
  url: string;
  gpsLat?: string;
  gpsLng?: string;
  telemetryLeft?: string;
  telemetryRight?: string;
  statusText?: string;
  statusTime?: string;
}

export interface Ticket {
  id: string;
  auditKey: string;
  billboardCode: string;
  assetCode: string;
  location: string;
  locationEn: string;
  addressFull: string;
  addressFullEn: string;
  displayType: string;
  iconType: 'signpost' | 'tv' | 'featured_video' | 'qr_code_2' | 'ad_units';
  priority: 'Tinggi' | 'Sederhana' | 'Segera' | 'Rendah';
  priorityEn: 'High' | 'Medium' | 'Urgent' | 'Low';
  status: 'Assigned' | 'Pending Approval' | 'Approved for Payment';
  registeredTime: string;
  registeredTimeEn: string;
  slaText: string;
  slaTextEn: string;
  contractor: string;
  contractorFull: string;
  cidbReg: string;
  technician: string;
  wiremanCert: string;
  faultDescription: string;
  faultDescriptionEn: string;
  faultShort: string;
  faultShortEn: string;
  contractorUrl: string;
  repairSummary: string;
  repairSummaryEn: string;
  technicalNotes: string;
  technicalNotesEn: string;
  partsUsed: PartUsed[];
  photos: TicketPhoto[];
  jccNumber: string;
  invoiceNumber: string;
  approvedDate: string;
  approvedDateEn: string;
  approvedBy: string;
  signatureRef: string;
  signatureDataUrl?: string;
  grandTotal: number;
  pdfFilename: string;
}

export const IMAGES = {
  logo: 'https://lh3.googleusercontent.com/aida/AEtjO1UtGziJ0SFm0x0pUawWkRnutGf-KP_NoIvK_0vYMMpo2Ml73JrqeMCI0LcfTUE9g8nQaw5E6V6MF62XJzNEQGFfRky66hy0z1Pk9Z6X4f-0aOMOMoYyp7qa6MrCClnpYFhBWjIOTPIg_wZC0StC0iUmhYnB6VyXiiiAOljqVVyoZ7pCrv8n5DEmSHUr1yXoZwBlgOhLhO4Hd7X5tlB4wNEasLzgrxBlTCx9QeMbBJ6y2dLE6mzsfm-W13k',
  avatarSidebar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi1hsR11HUXMRhypkGANvclQNXWzd2uuOc39keJ90jUqBEiThlU-7Mx5PS9NMQfBlMDkrc5jlapehqzmY6DLcVnXDM2MFkO76ckwWdoumNh7_EHeww1Eekq-HNxhQK8mVSWFpvNqRLaz4L896Y-KcW608GKpfSRJmVcsOk8kJ_TzgDIR2ZYAAT-1OmN2olwLA1-k3rcYpCMtlX8qHsBhFN52F7a6TtIWWnS0CphA1BfoGAeZt1TFBK',
  avatarS02: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqCEWdbfTEAV8JTYUvULEJG-B1b2LzwP8wEeJidIuM2dIyQkZ7MrI2qeICbedeltE4nNdVXfbeUtR8l2biNrxir6FhQBzqgMrCMX5JvMQOs-ghCyvhQFTDAVEJIcHDTVpj3wreorrVfqwPsYGC9BH114gVnBdPChNgNyrPOHGqg_jSc1ug6g4aLnPf40qUjCndnyrfBG99NH_1W7KL4xlhZ9ETNqh7VMCIsj9CqukQw8rEDvCtm6-X',
  s02Thumb084: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_KmX3MyhvFJGqVUmiV8KS5O9itrX2swL8eW7dljCeA1ia7zeD9pn86w1Rn6yfsPgaoPWVJb9Qd6ztksIvZE4iMRXrJpJfxK9qj3XXacG1Jse8n3vHZmfzWnxsaK3PpYjnkFEr2ACtplYnWutS6OKK4YYyytgPBxp1LIHqMypIRTCLnwaZBlajKoJxR3WrM85SqlO4fdnJyNyaigK9pkmyCd8i5xyS_M3e5TsBtfgeFBQEosVKX8Eu',
  s02Feed1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGdkXMePPC-naDybTQWhu-jeukoTz-ZxwCd25GmYhZnu1mUeYiQLltPtGzBponF-oshj8DSuHmPeRIaG43WMLx7yJebFgHd-6VGB9n34a0y2baGu0oG9ebjS5bsGaV-6KYyKejtJYSkAiwfJlXCl2-Fl06khylOIDXScVzD2wMfk4oGV6VBbvvf-H2pmJjmPhG-ehzuCOVQLoc7zcrRjbDtBDSwAGCFahyUrfxaHeLsfNk3Z2jtzkN',
  s02Feed2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWo17SQMjG6M0mbAwH2tkaIVBAtDu0GGRi7xhHBPTeMcK5auvBiEwPZr-jUVVg32xYqIkr9kL-4MP3xSg4eZNaftHGJqZ44UN-DwXm9VJudJrp3ksAgJjiDo-GafIB0uLF29nrtyvb-CFO3dJku-YsO3NsZPRRKxc5nukkQ4QM0wo1tN2k837Z4EJpk5j8q57C4AHqYVk9PskOsVGs76mIWgd_R43sFbiyAdwP8yNKMyyTHn7igoXn',
  s02Feed3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4UqYJvUT3gxa_81PZ2wx2Xf509UFTwC-RtT7n4Gs_gTtg749VUwv9wuauzfHiSQbFLSrkSayAQlDr0z7hB04fYBPElFylz5yaiUf7D7-SToeYm2m5NLikffo86xnm3kTeKiftd5sBVNABmVABcEm6D1rO64c2V3FNguroAONjT0IDC3s9-3V8tC-W4Cq6FKHEM8HthP9dweBnxMRbiI9ZDvs9IPY5wqPySWhP0no62UqJG6BcBbdN',
  s03Photo1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA80nGEe5BhBSOA4PLN_auL__9wnpaobjCP1DJyLCbIewoc6_lGTBYEKrmcPIhcCHjOtHNnIZVnVTLPvmsuPsmUpUVdf8MbnbixKX3dQ94fWk4LBb8xt4oLRktspbf8dkEHwldxURpbeMpGFqNmJSCv3X8H1eZJPa64y8AgyDjrgzJZFuXJpIpM1ABVZez6xFMja8scazjsS9qI1oF36Tcr4k71eSbFq_2PHh8u6yDKr2AHkSbyFo8U',
  s03Photo2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvuEFjTJfpppjfZMUZMwCCPjdJxC_gS_qCrW0s0nJIHQkqsOXdTGgVpL1IsusfgPg9qMW2VZ9ilQK3o6LQupm12WktMnb2578kd4YP46B53GYEnblR25t9O0E2vJ54FDHK0VcjzsRuBDFBzUxMAvIkDE0eL9DmHtG8lvxb12TD-AoRmKGbdttcbkR7hDdKP1WimlUWtRf50FsYvE8s7zDZksbNoQWPxO-_17yJYtz9yS5dFbMwdVg5',
  s03Photo3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2dGBtUlmFM6EjO4WfGG03KE1Ege8Oue1JUh71_kd4fzttlswzUWzAYoiV3uDw---HyYNsCRaYYKPEr4Fa1L3BdQ7He3_nQoL1h5SkG8QYjnTe6HnieinduWUjWAXID-uEB1zQ6y3t6XA7CR8i40AB2HZvSladtR6keEM3YomZGkbD40rafpMlPtIjqsPZjozvnny1kWkGclRPeHUGhBbF6833OMbpWvF_pJAsxm4Iby-nUQ_AYShe',
  s04Photo1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAK6Opz3DPgZfCa9xJ5QEmb3sNpyg0eo2nStIwBWw9NtLEVZ9ZXBKFcdjNAtVzZYu0-1bLSTofOm5zVCK2xH7pFu3mIQV3gUHGc3Mz2RAyG6AyO96XTXTpgDdt2b0bQLd8R7fFkxBAvxdXZihyFMb_yE5E61Yf1Kxfy3HbeF1Us2x9pVRqbgoknYW5yI4rBq8haTUioGrERcAmw7kInabnbZdKaDsg4X1EiVYsWUlA6-IvfYnC_PUc7',
  s04Photo2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBMQ-eZzlOgPGZHKKWyEYQ5d-BB1qB5n_JEuKteIliYnCsgAkTEpVag-0aLV3WT_NtQroENMOOcoOHax5YCqDC7QGnw4kNCsUhLXVIQNE7uzvLCKD_VaT0dTfyzrfCORAjw3j1aes_Fex8C3wd5zH3KDfjGTd6FYtRsCJpDbL_qe25aXu0PtXVt4vOrnKic7MF56qaK75IzXtNlsMLgB7fYErxYNYSzQ-CdUPzpcjvqeBNPX4QlfAf',
  s04Photo3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUF1lQqRUN2Fuw9dBpxYrNqSp5MDyq-XN4fGz_zv33HzgG76okdr_O8HG36DAv4NkzdjMHlPzl7aGPg5azZ-DrQW4tJwA_hRJ803PehRrWoRHZZSiIrcsT_DJfcTG-SBtacoASO8RvuDLyexk8pLSxNr0sHOSNaOXqemLf9eIOTIkWEqGTTiil8kzmzXt5MKXqpbREYBJWVzGZUhN9DYjpoexJSG_hzsf_iLSQ8IRMnk74j7a4fqPG',
  s05Evidence1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfMl0sYh7N77ftWeQeSyxqLIrk2KhMWQEr78AZ1bPfIJXVL1wfRSU_k6_JH7jjGmpO9deBE6rWjk6GseZO0gMUWxn3dY3O5wxy3FyAzoCwijyGm97NtD2gv0AgiaaDb0D7fILfV_2sqABgsFtbL0cGPLJtDxofrnkuqffHbA65JzejQB9AmDiJ5pvpr6psPfu7Ug0izQ7j25r4FGQXzPfcugBzXnPABvwQK4f0XW-T7fVqHaKH4oue',
  s05Evidence2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB9YvfJq-cdOCNzyDSbXzM7HnnbVp-ohXTKh3CG7HiduIYWzxuqDcYP1cJZpqp2pZ9hdu_KHWE3BE0ECapN3_2OEXV9JB4UtARTFsK4XirpFAZcX4HKRF6KRmj9_W1Eh0sHHoRnL9EiSDDosSSbHv9ZpMeCls_HhD5wzekN7M6hLC_Pv3jAwYGSVQRQBfDcKGHF0zB-uPO7_tSwgvMAK6bw6dZFdTHtaRzDgY7WlQKeozYZ2-iIlQX',
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    sku: 'SKU-LED-400W-HV',
    name: 'LED Spotlight 400W IP66',
    subtitle: 'Industrial Grade Outdoor Weatherproof',
    quantity: 12,
    minThreshold: 5,
    maxCapacity: 16,
    unit: 'units',
    unitCost: 450,
    statusLabel: 'Normal',
    statusLabelEn: 'Normal',
    levelType: 'normal',
    notes: 'Primary 400W floodlight stock for PLUS Expressway & bridge gantries.',
    lastUpdated: '24 Oct 2024, 09:15 AM',
  },
  {
    id: 'inv-2',
    sku: 'SKU-MCB-32A-1P',
    name: 'MCB 16A / 32A Schneider',
    subtitle: 'Type-C 6kA Energy Commission Compliant',
    quantity: 4,
    minThreshold: 15,
    maxCapacity: 20,
    unit: 'units',
    unitCost: 150,
    statusLabel: 'Critical Low',
    statusLabelEn: 'Critical Low',
    levelType: 'critical',
    notes: 'Below minimum threshold! Immediate reorder required (PO #2024-88).',
    lastUpdated: '24 Oct 2024, 11:20 AM',
  },
  {
    id: 'inv-3',
    sku: 'SKU-MCCB-100A-3P',
    name: 'MCCB 100A 3-Phase',
    subtitle: 'Moulded Case Circuit Breaker 25kA',
    quantity: 8,
    minThreshold: 4,
    maxCapacity: 14,
    unit: 'units',
    unitCost: 680,
    statusLabel: 'Sufficient',
    statusLabelEn: 'Sufficient',
    levelType: 'normal',
    notes: 'For primary 3-phase unipole distribution board protection.',
    lastUpdated: '22 Oct 2024, 16:00 PM',
  },
  {
    id: 'inv-4',
    sku: 'ELC-CTR-063',
    name: 'Contactor 40A AC3 Heavy Duty',
    subtitle: '3-Pole Magnetic Contactor 240V Coil',
    quantity: 2,
    minThreshold: 6,
    maxCapacity: 10,
    unit: 'units',
    unitCost: 380,
    statusLabel: 'Low Stock',
    statusLabelEn: 'Low Stock',
    levelType: 'low',
    notes: 'High usage during thunderstorm season. 2 units remaining in central depot.',
    lastUpdated: '23 Oct 2024, 14:30 PM',
  },
  {
    id: 'inv-5',
    sku: 'INV-TMR-01',
    name: 'Digital Timer Switch Theben',
    subtitle: 'Theben TR 610 Top3 Digital Din-Rail 24H',
    quantity: 15,
    minThreshold: 5,
    maxCapacity: 18,
    unit: 'units',
    unitCost: 450,
    statusLabel: 'Stable',
    statusLabelEn: 'Stable',
    levelType: 'normal',
    notes: 'Equipped with 3-year backup battery for automated night illumination.',
    lastUpdated: '24 Oct 2024, 08:45 AM',
  },
  {
    id: 'inv-6',
    sku: 'SKU-CBL-4C6MM-UV',
    name: 'Underground Armoured Cable 4C x 16mm²',
    subtitle: 'Heavy duty double insulated outdoor armored XLPE',
    quantity: 85,
    minThreshold: 40,
    maxCapacity: 120,
    unit: 'meters',
    unitCost: 70,
    statusLabel: 'Adequate',
    statusLabelEn: 'Adequate',
    levelType: 'normal',
    notes: 'Master cable drum stored at Shah Alam Central Depot.',
    lastUpdated: '21 Oct 2024, 10:10 AM',
  },
  {
    id: 'inv-7',
    sku: 'SKU-TNB-MTR-3P',
    name: 'TNB Single / 3-Phase Meter Box',
    subtitle: 'Outdoor Weatherproof Metal Enclosure',
    quantity: 5,
    minThreshold: 3,
    maxCapacity: 10,
    unit: 'units',
    unitCost: 520,
    statusLabel: 'Normal',
    statusLabelEn: 'Normal',
    levelType: 'normal',
    notes: 'Standard TNB utility specification with tempered viewing window.',
    lastUpdated: '20 Oct 2024, 15:00 PM',
  },
  {
    id: 'inv-8',
    sku: 'ELC-DB-OUTD',
    name: 'Distribution Board (DB) Weatherproof',
    subtitle: 'IP65 Stainless Steel Outdoor Enclosure 12-Way',
    quantity: 6,
    minThreshold: 4,
    maxCapacity: 10,
    unit: 'units',
    unitCost: 1200,
    statusLabel: 'Normal',
    statusLabelEn: 'Normal',
    levelType: 'normal',
    notes: 'Complete with copper busbar & Type 2 SPD surge protection.',
    lastUpdated: '19 Oct 2024, 12:30 PM',
  },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-2024-089',
    auditKey: 'PLUS-089',
    billboardCode: 'BB-001',
    assetCode: 'PLS-SB-024',
    location: 'PLUS Expressway KM 24.5 Southbound',
    locationEn: 'PLUS Expressway KM 24.5 Southbound',
    addressFull: 'KM 24.5 North-South Expressway (Southbound), Nilai, Negeri Sembilan',
    addressFullEn: 'KM 24.5 North-South Expressway (Southbound), Nilai, Negeri Sembilan',
    displayType: 'Static Unipole 40ft x 20ft (Overhead LED Floodlight)',
    iconType: 'signpost',
    priority: 'Tinggi',
    priorityEn: 'High',
    status: 'Assigned',
    registeredTime: 'Today, 09:30 AM',
    registeredTimeEn: '24 October 2024 (09:30 AM)',
    slaText: 'Within 24 Hours',
    slaTextEn: 'Within 24 Hours',
    contractor: 'MegaVolt Engineering Sdn Bhd',
    contractorFull: 'Mega Power Volt Engineering',
    cidbReg: '012018-SL-044120',
    technician: 'Ahmad Taufiq',
    wiremanCert: '012-3456789 / PW4 Wireman',
    faultDescription:
      '400W LED Spotlight Burnt & MCB Tripped due to lightning voltage surge last night. 4 spotlight units unlit.',
    faultDescriptionEn:
      '400W LED Spotlight Burnt & MCB Tripped due to lightning voltage surge last night. 4 spotlight units unlit.',
    faultShort: '400W LED Spotlight Burnt & MCB Tripped',
    faultShortEn: '400W LED Spotlight Burnt & MCB Tripped',
    contractorUrl:
      'https://billboard-system.my/portal/contractor-form?id=TKT-2024-089&token=a8f902',
    repairSummary:
      'Replaced 2 units of 400W LED spotlights on top rack, tested phase balance, and replaced loose 32A MCB. 30-minute full brightness burn-in test completed without tripping.',
    repairSummaryEn:
      'Replaced 2 units of 400W LED spotlights on top rack, tested phase balance, and replaced loose 32A MCB. 30-minute full brightness burn-in test completed without tripping.',
    technicalNotes:
      'Supply voltage verified at 241V AC stable. Insulation resistance >100MΩ. All 4 spotlight luminaires operating at 100%.',
    technicalNotesEn:
      'Supply voltage verified at 241V AC stable. Insulation resistance >100MΩ. All 4 spotlight luminaires operating at 100%.',
    partsUsed: [
      {
        id: 'p-89-1',
        sku: 'SKU-LED-400W-HV',
        name: 'LED Spotlight 400W IP66',
        subtitle: 'Industrial Grade Outdoor Weatherproof',
        qty: 2,
        unit: 'units',
        unitCost: 450,
        icon: 'lightbulb',
      },
      {
        id: 'p-89-2',
        sku: 'SKU-MCB-32A-1P',
        name: 'MCB 32A Single Pole',
        subtitle: 'Type-C 6kA Energy Commission Compliant',
        qty: 1,
        unit: 'unit',
        unitCost: 150,
        icon: 'toggle_on',
      },
      {
        id: 'p-89-3',
        sku: 'SKU-CBL-4C6MM-UV',
        name: 'Weatherproof Armored Cable 4C x 6mm²',
        subtitle: 'Heavy duty double insulated outdoor armored',
        qty: 12,
        unit: 'meters',
        unitCost: 45,
        icon: 'cable',
      },
    ],
    photos: [
      {
        id: 'ph-89-1',
        phaseLabel: 'Photo 1: Before Repair',
        phaseLabelEn: 'Photo 1: Before Repair',
        badgeText: 'BB-001 • BEFORE',
        title: 'Photo 1: Before Repair',
        titleEn: 'Photo 1: Before Repair',
        subtitle: 'Burnt spotlight & blown fuse on-site',
        subtitleEn: 'Burnt spotlight & blown fuse on-site',
        timestamp: '24-10-2024 10:14',
        url: IMAGES.s03Photo1,
        gpsLat: '2.8541° N',
        gpsLng: '101.7920° E',
        statusText: 'STATUS: FAILED',
        statusTime: '10:14 AM',
      },
      {
        id: 'ph-89-2',
        phaseLabel: 'Photo 2: During Work / Panel DB Installation',
        phaseLabelEn: 'Photo 2: During Work / Panel DB Installation',
        badgeText: 'BB-001 • PROCESS',
        title: 'Photo 2: During Work / Panel DB Installation',
        titleEn: 'Photo 2: During Work / Panel DB Installation',
        subtitle: 'New MCB installed & wiring tidied',
        subtitleEn: 'New MCB installed & wiring tidied',
        timestamp: '24-10-2024 14:42',
        url: IMAGES.s03Photo2,
        telemetryLeft: 'Test: 500V MEGGER',
        telemetryRight: '241.0 VAC',
        statusText: 'UNDER TEST',
        statusTime: '14:42 PM',
      },
      {
        id: 'ph-89-3',
        phaseLabel: 'Photo 3: Completed / Full Illumination Test',
        phaseLabelEn: 'Photo 3: Completed / Full Illumination Test',
        badgeText: 'BB-001 • VERIFIED',
        title: 'Photo 3: Completed / Full Illumination Test',
        titleEn: 'Photo 3: Completed / Full Illumination Test',
        subtitle: '30-minute burn-in test completed without trip',
        subtitleEn: '30-minute burn-in test completed without trip',
        timestamp: '24-10-2024 19:25',
        url: IMAGES.s03Photo3,
        telemetryLeft: 'Load: 8.4A Stable',
        telemetryRight: 'DB Sealed',
        statusText: 'VERIFIED COMPLETE',
        statusTime: '19:25 PM',
      },
    ],
    jccNumber: 'JCC-2024-PL089',
    invoiceNumber: 'Invoice #MEGA-24-399',
    approvedDate: '24-OCT-2024',
    approvedDateEn: '24-OCT-2024',
    approvedBy: 'Siti Zahara (Supervisor)',
    signatureRef: 'SIG-9988',
    grandTotal: 1590,
    pdfFilename: 'JCC-2024-PL089_COMPLETION_CERT.pdf',
  },
  {
    id: 'TKT-2024-084',
    auditKey: 'BB-084',
    billboardCode: 'BB-084',
    assetCode: 'BB-084 • P10 LED Screen',
    location: 'Bukit Bintang Digital Screen (Lot 10 Frontage)',
    locationEn: 'Bukit Bintang Screen (4-Sided Giant Pole)',
    addressFull: 'Jalan Sultan Ismail & Jalan Bukit Bintang Intersection, Kuala Lumpur',
    addressFullEn: 'Jalan Sultan Ismail & Jalan Bukit Bintang Intersection, Kuala Lumpur',
    displayType: 'Outdoor P6 High Brightness LED',
    iconType: 'tv',
    priority: 'Sederhana',
    priorityEn: 'Medium',
    status: 'Pending Approval',
    registeredTime: 'Submitted: Yesterday, 17:45 PM',
    registeredTimeEn: 'Submitted: Yesterday, 17:45 PM',
    slaText: 'Under Supervisor Review',
    slaTextEn: 'Under Supervisor Review',
    contractor: 'Apex Power Works',
    contractorFull: 'Apex Electrical & High-Rise Services Sdn Bhd',
    cidbReg: '012019-WP-098841',
    technician: 'Hazim bin Rosli (PW4)',
    wiremanCert: '017-8821904 / PW4 Wireman',
    faultDescription:
      'Main timer switch failed, tripped incoming MCB (burnt out). Contractor replaced 1 unit Theben Timer Switch & reset weatherproof DB board.',
    faultDescriptionEn:
      'Main timer switch failed, tripped incoming MCB (burnt out). Contractor replaced 1 unit Theben Timer Switch & reset weatherproof DB board.',
    faultShort: 'Main timer switch failed, tripped incoming MCB (burnt out).',
    faultShortEn: 'Main timer switch failed, tripped incoming MCB (burnt out).',
    contractorUrl:
      'https://billboard-system.my/portal/contractor-form?id=TKT-2024-084&token=c4e119',
    repairSummary:
      'Replaced faulty main astronomical timer switch and 2 units of 32A C-Curve MCB. Conducted 500V insulation test and full illumination check.',
    repairSummaryEn:
      'Replaced faulty main astronomical timer switch and 2 units of 32A C-Curve MCB. Conducted 500V insulation test and full illumination check.',
    technicalNotes:
      'Root cause of trip was jammed legacy timer switch and short circuit at primary phase MCB terminal. Replaced with moisture-resistant DIN-rail model. 500V insulation test recorded normal (>50MΩ), running current stable at 14.2A.',
    technicalNotesEn:
      'Root cause of trip was jammed legacy timer switch and short circuit at primary phase MCB terminal. Replaced with moisture-resistant DIN-rail model. 500V insulation test recorded normal (>50MΩ), running current stable at 14.2A.',
    partsUsed: [
      {
        id: 'p-84-1',
        sku: 'ELC-TMR-002',
        name: 'LED Digital Astronomical Timer Switch 240V',
        subtitle: 'Theben TR 610 Top3 Digital Din-Rail',
        qty: 1,
        unit: 'unit',
        unitCost: 450,
        icon: 'schedule',
      },
      {
        id: 'p-84-2',
        sku: 'ELC-MCB-032',
        name: 'Miniature Circuit Breaker (MCB) 32A C-Curve 10kA',
        subtitle: 'Hager Industrial 10kA Breaking Cap',
        qty: 2,
        unit: 'units',
        unitCost: 150,
        icon: 'toggle_on',
      },
      {
        id: 'p-84-3',
        sku: 'LBR-WRK-001',
        name: 'On-Site Insulation Resistance Testing & Rewiring Labor',
        subtitle: 'Flame Retardant 4mm² Rewiring & Megger Test',
        qty: 1,
        unit: 'session',
        unitCost: 700,
        icon: 'engineering',
      },
    ],
    photos: [
      {
        id: 'ph-84-1',
        phaseLabel: '1. Before Photo',
        phaseLabelEn: '1. Before Photo',
        badgeText: 'BB-084 • BEFORE',
        title: '1. Photo Before',
        titleEn: '1. Photo Before',
        subtitle: 'DB trip, scorched MCB terminal',
        subtitleEn: 'DB trip, scorched MCB terminal',
        timestamp: '24-10-2024 11:15',
        url: IMAGES.s04Photo1,
        gpsLat: '3.1466° N',
        gpsLng: '101.7112° E',
        statusText: 'STATUS: FAILED',
        statusTime: '11:15 AM',
      },
      {
        id: 'ph-84-2',
        phaseLabel: '2. During Repair',
        phaseLabelEn: '2. During Repair',
        badgeText: 'BB-084 • PROCESS',
        title: '2. During Repair',
        titleEn: '2. During Repair',
        subtitle: 'Replace Timer Switch & Voltage Test',
        subtitleEn: 'Replace Timer Switch & Voltage Test',
        timestamp: '24-10-2024 14:20',
        url: IMAGES.s04Photo2,
        telemetryLeft: 'Test: 500V MEGGER',
        telemetryRight: '240.2 VAC',
        statusText: 'UNDER TEST',
        statusTime: '02:20 PM',
      },
      {
        id: 'ph-84-3',
        phaseLabel: '3. After Photo',
        phaseLabelEn: '3. After Photo',
        badgeText: 'BB-084 • VERIFIED',
        title: '3. Photo After',
        titleEn: '3. Photo After',
        subtitle: 'Screen 100% fully illuminated',
        subtitleEn: 'Screen 100% fully illuminated',
        timestamp: '24-10-2024 15:45',
        url: IMAGES.s04Photo3,
        telemetryLeft: 'Load: 14.2A Stable',
        telemetryRight: 'DB Sealed',
        statusText: 'VERIFIED COMPLETE',
        statusTime: '03:45 PM',
      },
    ],
    jccNumber: 'JCC-2024-BB084',
    invoiceNumber: 'Invoice #APEX-24-912',
    approvedDate: '24-OCT-2024',
    approvedDateEn: '24-OCT-2024',
    approvedBy: 'Siti Zahara (Supervisor)',
    signatureRef: 'SIG-9940',
    grandTotal: 1450,
    pdfFilename: 'JCC-2024-BB084_COMPLETION_CERT.pdf',
  },
  {
    id: 'TKT-2024-079',
    auditKey: 'PLUS-079',
    billboardCode: 'BB-003',
    assetCode: 'FED-SJ-221',
    location: 'Unipole Federal Highway (Subang Jaya Exit 221)',
    locationEn: 'PLUS KM 24.5 Southbound (Gantry Unipole)',
    addressFull: 'Gantry KM 24.5 Northbound, Rawang Interchange / Subang Exit, Selangor',
    addressFullEn: 'Gantry KM 24.5 Northbound, Rawang Interchange / Subang Exit, Selangor',
    displayType: 'Twin-Sided Steel Unipole 60ft x 20ft',
    iconType: 'signpost',
    priority: 'Segera',
    priorityEn: 'Urgent',
    status: 'Approved for Payment',
    registeredTime: 'Verified: 21 Oct 2024',
    registeredTimeEn: 'Verified: 21 Oct 2024',
    slaText: 'Completed (18 Hours)',
    slaTextEn: 'Completed (18 Hours)',
    contractor: 'Mega Grid Engineering Works',
    contractorFull: 'Mega Grid Engineering Works',
    cidbReg: '012018-SL-044120',
    technician: 'Rashid bin Osman (PW4)',
    wiremanCert: '019-2231440 / PW4 Wireman',
    faultDescription:
      'Replacement of 63A 3-Phase AC Contactor and renewal of burnt incoming cable due to lightning surge.',
    faultDescriptionEn:
      'Replacement of 63A 3-Phase AC Contactor and renewal of burnt incoming cable due to lightning surge.',
    faultShort:
      'Replacement of 63A 3-Phase AC Contactor and renewal of burnt incoming cable due to lightning surge.',
    faultShortEn:
      'Replacement of 63A 3-Phase AC Contactor and renewal of burnt incoming cable due to lightning surge.',
    contractorUrl:
      'https://billboard-system.my/portal/contractor-form?id=TKT-2024-079&token=f0912b',
    repairSummary:
      'Replaced damaged 3-Phase AC Contactor and re-terminated 15m of 4C 16mm² armoured cable. Tested phase load and insulation.',
    repairSummaryEn:
      'Replaced damaged 3-Phase AC Contactor and re-terminated 15m of 4C 16mm² armoured cable. Tested phase load and insulation.',
    technicalNotes:
      'All terminal lugs torqued to specification. Earth electrode resistance measured at 2.4 Ohm (Compliant with MS IEC 60364).',
    technicalNotesEn:
      'All terminal lugs torqued to specification. Earth electrode resistance measured at 2.4 Ohm (Compliant with MS IEC 60364).',
    partsUsed: [
      {
        id: 'p-79-1',
        sku: 'ELC-CTR-063',
        name: '3-Phase AC Contactor 63A Heavy Duty',
        qty: 1,
        unit: 'unit',
        unitCost: 950,
      },
      {
        id: 'p-79-2',
        sku: 'CAB-XLPE-4C',
        name: 'Armoured Cable 4-Core 16mm² (Lightning Surge Replacement)',
        qty: 15,
        unit: 'meters',
        unitCost: 70,
      },
      {
        id: 'p-79-3',
        sku: 'LBR-CRN-002',
        name: 'Skylift Rental & 3-Phase Load Verification Test',
        qty: 1,
        unit: 'session',
        unitCost: 800,
      },
    ],
    photos: [
      {
        id: 'ph-79-1',
        phaseLabel: 'Night Burn-in Test',
        phaseLabelEn: 'Night Burn-in Test',
        badgeText: 'PLUS-079 • VERIFIED',
        title: 'Night Burn-in Test',
        titleEn: 'Night Burn-in Test',
        subtitle: 'Full illumination after contactor replacement',
        subtitleEn: 'Full illumination after contactor replacement',
        timestamp: '23-OCT-2024 19:40',
        url: IMAGES.s05Evidence1,
      },
      {
        id: 'ph-79-2',
        phaseLabel: 'Contactor & 16mm² Cable Installation',
        phaseLabelEn: 'Contactor & 16mm² Cable Installation',
        badgeText: 'PLUS-079 • DB PANEL',
        title: 'Contactor & 16mm² Cable Installation',
        titleEn: 'Contactor & 16mm² Cable Installation',
        subtitle: 'DB box rewiring completed',
        subtitleEn: 'DB box rewiring completed',
        timestamp: '23-OCT-2024 16:10',
        url: IMAGES.s05Evidence2,
      },
    ],
    jccNumber: 'JCC-2024-PL079',
    invoiceNumber: 'Invoice #MEGA-24-340',
    approvedDate: '23-OCT-2024',
    approvedDateEn: '23-OCT-2024',
    approvedBy: 'Siti Zahara (Supervisor)',
    signatureRef: 'SIG-9921',
    grandTotal: 2800,
    pdfFilename: 'JCC-2024-PL079_COMPLETION_CERT.pdf',
  },
  {
    id: 'TKT-2024-071',
    auditKey: 'DAM-071',
    billboardCode: 'BB-005',
    assetCode: 'DAM-071',
    location: 'Sprint Highway Damansara Exit (Overhead Bridge)',
    locationEn: 'Sprint Highway Damansara Exit',
    addressFull: 'Section 17, Damansara Link KM 4.2, Petaling Jaya, Selangor',
    addressFullEn: 'Section 17, Damansara Link KM 4.2, Petaling Jaya, Selangor',
    displayType: 'Overhead Bridge Gantry Panel 80ft x 15ft',
    iconType: 'qr_code_2',
    priority: 'Sederhana',
    priorityEn: 'Medium',
    status: 'Approved for Payment',
    registeredTime: 'Verified: 21 Oct 2024',
    registeredTimeEn: 'Verified: 21 Oct 2024',
    slaText: 'Completed (14 Hours)',
    slaTextEn: 'Completed (14 Hours)',
    contractor: 'Apex Electrical Services Sdn Bhd',
    contractorFull: 'Apex Electrical Services Sdn Bhd',
    cidbReg: '012019-WP-098841',
    technician: 'Rashid bin Osman (PW4)',
    wiremanCert: '012-9981234 / PW4 Wireman',
    faultDescription:
      '200W IP66 LED floodlight module dimming & digital night-time timer switch recalibration.',
    faultDescriptionEn:
      '200W IP66 LED floodlight module dimming & digital night-time timer switch recalibration.',
    faultShort:
      '200W IP66 LED floodlight module dimming & digital night-time timer switch recalibration.',
    faultShortEn:
      '200W IP66 LED floodlight module dimming & digital night-time timer switch recalibration.',
    contractorUrl:
      'https://billboard-system.my/portal/contractor-form?id=TKT-2024-071&token=d7721a',
    repairSummary:
      'Replaced 1 unit 200W IP66 LED Floodlight module and recalibrated timer schedule for 7:00 PM - 1:00 AM.',
    repairSummaryEn:
      'Replaced 1 unit 200W IP66 LED Floodlight module and recalibrated timer schedule for 7:00 PM - 1:00 AM.',
    technicalNotes: 'Uniform lux reading across gantry fascia.',
    technicalNotesEn: 'Uniform lux reading across gantry fascia.',
    partsUsed: [
      {
        id: 'p-71-1',
        sku: 'ELC-FL-200W',
        name: 'LED Floodlight 200W IP66 Waterproof Module',
        qty: 1,
        unit: 'unit',
        unitCost: 550,
      },
      {
        id: 'p-71-2',
        sku: 'LBR-WRK-001',
        name: 'Timer Recalibration & Terminal Rewiring Labor',
        qty: 1,
        unit: 'session',
        unitCost: 300,
      },
    ],
    photos: [
      {
        id: 'ph-71-1',
        phaseLabel: 'Gantry Illumination Test',
        phaseLabelEn: 'Gantry Illumination Test',
        badgeText: 'DAM-071 • VERIFIED',
        title: 'Gantry Illumination Test',
        titleEn: 'Gantry Illumination Test',
        subtitle: 'Verified by Supervisor Siti Zahara',
        subtitleEn: 'Verified by Supervisor Siti Zahara',
        timestamp: '21-OCT-2024 20:15',
        url: IMAGES.s03Photo3,
      },
      {
        id: 'ph-71-2',
        phaseLabel: 'Timer Panel Calibration',
        phaseLabelEn: 'Timer Panel Calibration',
        badgeText: 'DAM-071 • DB PANEL',
        title: 'Timer Panel Calibration',
        titleEn: 'Timer Panel Calibration',
        subtitle: 'Night schedule calibration',
        subtitleEn: 'Night schedule calibration',
        timestamp: '21-OCT-2024 17:30',
        url: IMAGES.s05Evidence2,
      },
    ],
    jccNumber: 'JCC-2024-DM071',
    invoiceNumber: 'Invoice #APEX-24-889',
    approvedDate: '21-OCT-2024',
    approvedDateEn: '21-OCT-2024',
    approvedBy: 'Siti Zahara (Supervisor)',
    signatureRef: 'SIG-9910',
    grandTotal: 850,
    pdfFilename: 'JCC-2024-DM071_COMPLETION_CERT.pdf',
  },
  {
    id: 'TKT-2024-065',
    auditKey: 'MRR2-065',
    billboardCode: 'BB-004',
    assetCode: 'MRR2-065',
    location: 'MRR2 Ampang Point Spectacular Unipole',
    locationEn: 'MRR2 Ampang Point Spectacular Unipole',
    addressFull: 'Middle Ring Road 2 (MRR2), Near Ampang Point, Selangor',
    addressFullEn: 'Middle Ring Road 2 (MRR2), Near Ampang Point, Selangor',
    displayType: 'Spectacular Tri-Vision / LED Unipole',
    iconType: 'ad_units',
    priority: 'Tinggi',
    priorityEn: 'High',
    status: 'Approved for Payment',
    registeredTime: 'Verified: 19 Oct 2024',
    registeredTimeEn: 'Verified: 19 Oct 2024',
    slaText: 'Completed (20 Hours)',
    slaTextEn: 'Completed (20 Hours)',
    contractor: 'Mega Grid Engineering Works',
    contractorFull: 'Mega Grid Engineering Works',
    cidbReg: '012018-SL-044120',
    technician: 'Ahmad Taufiq (PW4)',
    wiremanCert: '012-3456789 / PW4 Wireman',
    faultDescription:
      'Replacement of weatherproof outdoor DB enclosure and renewal of Surge Protection Device (SPD).',
    faultDescriptionEn:
      'Replacement of weatherproof outdoor DB enclosure and renewal of Surge Protection Device (SPD).',
    faultShort:
      'Replacement of weatherproof outdoor DB enclosure and renewal of Surge Protection Device (SPD).',
    faultShortEn:
      'Replacement of weatherproof outdoor DB enclosure and renewal of Surge Protection Device (SPD).',
    contractorUrl:
      'https://billboard-system.my/portal/contractor-form?id=TKT-2024-065&token=e5510c',
    repairSummary:
      'Replaced corroded outdoor DB enclosure with new IP65 box and installed Type 2 40kA SPD.',
    repairSummaryEn:
      'Replaced corroded outdoor DB enclosure with new IP65 box and installed Type 2 40kA SPD.',
    technicalNotes: 'Earthing resistance test recorded 1.9 Ohm.',
    technicalNotesEn: 'Earthing resistance test recorded 1.9 Ohm.',
    partsUsed: [
      {
        id: 'p-65-1',
        sku: 'ELC-DB-OUTD',
        name: 'Weatherproof Distribution Board Enclosure IP65',
        qty: 1,
        unit: 'unit',
        unitCost: 1200,
      },
      {
        id: 'p-65-2',
        sku: 'ELC-SPD-040',
        name: 'Surge Protective Device (SPD) Type 2 40kA',
        qty: 1,
        unit: 'unit',
        unitCost: 800,
      },
      {
        id: 'p-65-3',
        sku: 'LBR-WRK-FULL',
        name: 'Earthing Resistance Testing & Full DB Panel Re-installation',
        qty: 1,
        unit: 'session',
        unitCost: 1200,
      },
    ],
    photos: [
      {
        id: 'ph-65-1',
        phaseLabel: 'MRR2 Full Illumination Test',
        phaseLabelEn: 'MRR2 Full Illumination Test',
        badgeText: 'MRR2-065 • VERIFIED',
        title: 'MRR2 Full Illumination Test',
        titleEn: 'MRR2 Full Illumination Test',
        subtitle: 'Fully operational at night',
        subtitleEn: 'Fully operational at night',
        timestamp: '19-OCT-2024 20:05',
        url: IMAGES.s05Evidence1,
      },
      {
        id: 'ph-65-2',
        phaseLabel: 'New IP65 DB Panel & 40kA SPD',
        phaseLabelEn: 'New IP65 DB Panel & 40kA SPD',
        badgeText: 'MRR2-065 • DB PANEL',
        title: 'New IP65 DB Panel & 40kA SPD',
        titleEn: 'New IP65 DB Panel & 40kA SPD',
        subtitle: 'Installed per MS IEC 60364 standard',
        subtitleEn: 'Installed per MS IEC 60364 standard',
        timestamp: '19-OCT-2024 15:50',
        url: IMAGES.s05Evidence2,
      },
    ],
    jccNumber: 'JCC-2024-MR065',
    invoiceNumber: 'Invoice #MEGA-24-311',
    approvedDate: '19-OCT-2024',
    approvedDateEn: '19-OCT-2024',
    approvedBy: 'Siti Zahara (Supervisor)',
    signatureRef: 'SIG-9884',
    grandTotal: 3200,
    pdfFilename: 'JCC-2024-MR065_COMPLETION_CERT.pdf',
  },
];

export const SYSTEM_ACCESS_CODE = '1111';

export interface BillboardSite {
  id: string;
  code: string;
  assetCode: string;
  name: string;
  shortName: string;
  shortNameEn: string;
  zone: string;
  gpsCoords: string;
  displayType: string;
  electricalSpec: string;
}

export const BILLBOARD_LOCATIONS: BillboardSite[] = [
  {
    id: 'site-1',
    code: 'BB-001',
    assetCode: 'PLS-SB-024',
    name: 'BB-001: PLUS Expressway KM 24.5 (Southbound)',
    shortName: 'PLUS Expressway KM 24.5 Southbound',
    shortNameEn: 'PLUS Expressway KM 24.5 Southbound',
    zone: 'Central Zone (Klang Valley & PLUS)',
    gpsCoords: '2.9845° N, 101.7421° E',
    displayType: '2-Sided Unipole (Static 40x20ft)',
    electricalSpec: '3-Phase 415V DB, 8x 150W LED Floodlights, SPD 40kA, Timer Theben 24H',
  },
  {
    id: 'site-2',
    code: 'BB-084',
    assetCode: 'BB-084 • P10 LED Screen',
    name: 'BB-084: Jalan Bukit Bintang (Lot 10 Frontage)',
    shortName: 'Bukit Bintang Digital Screen (Lot 10 Frontage)',
    shortNameEn: 'Bukit Bintang Screen (4-Sided Giant Pole)',
    zone: 'Central Zone (Kuala Lumpur)',
    gpsCoords: '3.1466° N, 101.7112° E',
    displayType: 'Outdoor P10 Digital LED Screen (12m x 6m)',
    electricalSpec: '3-Phase 63A MCCB, 2x 32A MCB Type C, Digital Timer TR610, Silicone 4mm² Cable',
  },
  {
    id: 'site-3',
    code: 'BB-003',
    assetCode: 'FED-SJ-221',
    name: 'BB-003: Unipole Federal Highway (Subang Exit)',
    shortName: 'Unipole Federal Highway (Subang Jaya Exit 221)',
    shortNameEn: 'Unipole Federal Highway (Subang Jaya Exit 221)',
    zone: 'Central Zone (Subang / PJ)',
    gpsCoords: '3.0812° N, 101.5944° E',
    displayType: 'Single Pole Spectacular (Static 50x20ft)',
    electricalSpec: 'Outdoor IP65 TNB Meter Box, 10x 200W LED Floodlights, Chint Contactor 40A',
  },
  {
    id: 'site-4',
    code: 'BB-004',
    assetCode: 'MRR2-065',
    name: 'BB-004: MRR2 Ampang Elevated Static 40x20',
    shortName: 'MRR2 Ampang Point Spectacular Unipole',
    shortNameEn: 'MRR2 Ampang Point Spectacular Unipole',
    zone: 'Central Zone (MRR2 Ampang)',
    gpsCoords: '3.1579° N, 101.7518° E',
    displayType: 'Free-Standing Unipole (Static 40x20ft)',
    electricalSpec: 'IP65 Metal Enclosure DB, 40kA Surge Arrester (SPD), Copper Earth Rod <2.1Ω',
  },
  {
    id: 'site-5',
    code: 'BB-005',
    assetCode: 'DAM-071',
    name: 'BB-005: Sprint Highway Damansara Gantry',
    shortName: 'Sprint Highway Damansara Exit (Overhead Bridge)',
    shortNameEn: 'Sprint Highway Damansara Exit',
    zone: 'Central Zone (Damansara)',
    gpsCoords: '3.1362° N, 101.6298° E',
    displayType: 'Overhead Bridge Gantry (60x15ft)',
    electricalSpec: '12x 200W IP66 LED Floodlights, 4C 6mm² Armored XLPE Underground Cable',
  },
  {
    id: 'site-6',
    code: 'BB-006',
    assetCode: 'PNB-KM-04',
    name: 'BB-006: Penang Bridge KM 4.2 (Northern Zone)',
    shortName: 'Penang Bridge KM 4.2 Billboard Gantry',
    shortNameEn: 'Penang Bridge KM 4.2 Billboard Gantry',
    zone: 'Northern Zone (Penang & Perak)',
    gpsCoords: '5.3547° N, 100.3478° E',
    displayType: 'Marine-Grade Highway Gantry (Static)',
    electricalSpec: 'Anti-Corrosion IP66 Stainless DB, 8x 150W LED Floodlights, ELCB 100mA',
  },
  {
    id: 'site-7',
    code: 'BB-007',
    assetCode: 'JHB-SK-12',
    name: 'BB-007: Skudai Highway Johor Bahru (Southern Zone)',
    shortName: 'Skudai Highway Corridor Unipole JB',
    shortNameEn: 'Skudai Highway Corridor Unipole JB',
    zone: 'Southern Zone (Melaka & Johor)',
    gpsCoords: '1.5194° N, 103.6791° E',
    displayType: 'Highway Unipole (Static 40x20ft)',
    electricalSpec: '3-Phase 415V DB, 8x 150W LED Floodlights, Astronomical Timer Switch',
  },
];
