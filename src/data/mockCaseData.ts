export interface CaseTimelineEvent {
    id: string;
    date: string;
    time: string;
    title: string;
    summary: string;
    type: "incident" | "arrest" | "financial" | "digital" | "forensic" | string;
    confidence: number;
    primaryEntity?: string;
    location?: string;
    citation?: CitationRef;
}

// src/data/mockCaseData.ts

export interface CitationRef {
    documentTitle: string;
    pageOrOffset?: string;
    extractedAt?: string;
    confidenceScore?: number;
    rawSnippet?: string;
    extractorModel?: string;
}

export const mockGeoLocation = [
    { 
        id: "geo-1", 
        lat: 28.6139, 
        lng: 77.2090, 
        label: "Suspect Primary Residence", 
        timestamp: "2026-09-01T10:00:00Z", 
        entity: "Rajesh Sharma", 
        type: "residence", 
        details: { address: "Plot 42, Vasant Vihar, New Delhi", occupants: 3, surveillanceOrder: "SO-DEL-2026-088" },
        citation: { documentTitle: "Physical Surveillance Log", pageOrOffset: "Page 2, Line 14", confidenceScore: 0.98, rawSnippet: "Target exited Plot 42 Vasant Vihar in black SUV DL-4C-9981." }
    },
    { 
        id: "geo-2", 
        lat: 28.6145, 
        lng: 77.2105, 
        label: "Meeting Point Drop", 
        timestamp: "2026-09-02T14:30:00Z", 
        entity: "Rajesh Sharma", 
        type: "movement", 
        details: { vehicle: "DL-4C-9981", duration: "12 mins", companion: "Unidentified male in cap" },
        citation: { documentTitle: "CCTV Traffic Cam Feed 14", pageOrOffset: "Timestamp 14:32:10", confidenceScore: 0.91, rawSnippet: "Brief handover of envelope between vehicle DL-4C-9981 and unidentified courier." }
    },
    { 
        id: "geo-3", 
        lat: 28.6110, 
        lng: 77.2150, 
        label: "Unregistered Warehouse", 
        timestamp: "2026-09-04T02:15:00Z", 
        entity: "Vikram Malhotra", 
        type: "incident", 
        details: { seized: "50kg Contraband & Ledger", arrests: 2, raidLead: "Insp. K. Verma" },
        citation: { documentTitle: "FIR 101/2026 Seizure Memo", pageOrOffset: "Annexure B", confidenceScore: 1.0, rawSnippet: "Warehouse raided at 02:15 hrs. Vikram Malhotra detained on site." }
    },
    { 
        id: "geo-4", 
        lat: 28.6200, 
        lng: 77.2200, 
        label: "ATM Cash Structuring Withdrawal", 
        timestamp: "2026-09-04T08:00:00Z", 
        entity: "Phantom-Driver", 
        type: "financial", 
        details: { amount: "₹49,500", card: "HDFC Ends 4432", camera: "Individual wearing surgical mask" },
        citation: { documentTitle: "HDFC Bank CCTV & Log", pageOrOffset: "ATM 0984 Log", confidenceScore: 0.85, rawSnippet: "Withdrawal of ₹49,500 just under ₹50,000 threshold using clone debit card." }
    },
    { 
        id: "geo-5", 
        lat: 28.5900, 
        lng: 77.1900, 
        label: "Burner Phone Ping", 
        timestamp: "2026-09-05T18:45:00Z", 
        entity: "Burner 9871", 
        type: "communication", 
        details: { imei: "354921092837411", duration: "45s ping", tower: "DEL-SOUTH-442" },
        citation: { documentTitle: "Telecom CDR Airtel Dump", pageOrOffset: "Record #4192", confidenceScore: 0.94, rawSnippet: "IMEI 354921092837411 latched to Tower DEL-SOUTH-442 for 45s outgoing ping." }
    },
    { 
        id: "geo-6", 
        lat: 28.5562, 
        lng: 77.1000, 
        label: "IGI Airport Terminal 3", 
        timestamp: "2026-09-06T04:30:00Z", 
        entity: "Rajesh Sharma", 
        type: "movement", 
        details: { flight: "EK-512 to Dubai", status: "Intercepted by Immigration LOC" },
        citation: { documentTitle: "Bureau of Immigration LOC Alert", pageOrOffset: "Notice LOC-2026-091", confidenceScore: 0.99, rawSnippet: "Subject intercepted at Boarding Gate 14 pursuant to Look Out Circular." }
    },
];

export const mockFinancialTracing = {
    nodes: [
        { id: "p-rajesh", label: "Rajesh Sharma", type: "person", details: { role: "Primary Suspect", risk: "High", pan: "ABCPS1294F" } },
        { id: "p-vikram", label: "Vikram Malhotra", type: "person", details: { role: "Associate", aliases: ["Vicky", "V.M."] } },
        { id: "c-shell", label: "Apex Logistics LLC", type: "company", details: { regDate: "2024-05-12", cin: "U74999DL2024PTC192831", director: "Dummy Nominee" } },
        { id: "a-bank1", label: "HDFC A/C 9901", type: "bank_account", details: { balance: "₹120,000", branch: "Connaught Place, Delhi" } },
        { id: "a-bank2", label: "ICICI A/C 4521", type: "bank_account", details: { balance: "₹5,200", flagged: true, suspiciousTransactions: 14 } },
        { id: "w-crypto", label: "Wallet 0x8A1...BC4", type: "wallet", details: { balance: "14.2 BTC", network: "Bitcoin / Wasabi Mixer" } },
        { id: "c-front", label: "Zenith Holdings", type: "company", details: { regDate: "2025-01-20", shellJurisdiction: "Seychelles" } },
        { id: "a-bank3", label: "SBI A/C 1122", type: "bank_account", details: { balance: "₹2.1M", kycStatus: "Incomplete" } },
        { id: "p-amit", label: "Amit Singh", type: "person", details: { role: "Financier / Hawala Operator" } },
        { id: "prop-1", label: "Luxury Villa Sector 42", type: "property", details: { value: "₹45M", location: "Gurgaon", registeredUnder: "Benami Nominee" } },
    ],
    edges: [
        { id: "e1", source: "p-rajesh", target: "a-bank1", label: "owns (100%)", color: "#64748b", valid_from: "2024-01-01", is_hypothesis: false, merge_reason: "Direct KYC signatory document match" },
        { id: "e2", source: "a-bank1", target: "c-shell", label: "transferred ₹5M", color: "#ef4444", valid_from: "2026-08-10", is_hypothesis: false, merge_reason: "NEFT transaction UTR #HDFC0092817291" },
        { id: "e3", source: "c-shell", target: "a-bank2", label: "transferred ₹4.8M", color: "#f59e0b", valid_from: "2026-08-12", is_hypothesis: false, merge_reason: "RTGS ledger entry verified by bank audit" },
        { id: "e4", source: "p-vikram", target: "a-bank2", label: "controls", color: "#64748b", valid_from: "2025-06-01", is_hypothesis: false, merge_reason: "OTP phone linked to Vikram Malhotra device" },
        { id: "e5", source: "a-bank2", target: "w-crypto", label: "crypto purchase", color: "#ef4444", valid_from: "2026-08-15", is_hypothesis: false, merge_reason: "P2P exchange order ID #WZX-9921 matching wallet withdrawal" },
        { id: "e6", source: "w-crypto", target: "c-front", label: "laundered via mixer (96%)", color: "#8b5cf6", style: "dashed", valid_from: "2026-08-20", is_hypothesis: true, merge_reason: "Chainalysis peel chain clustering with 96% heuristic certainty" },
        { id: "e7", source: "c-front", target: "a-bank3", label: "foreign inward remittance", color: "#f59e0b", valid_from: "2026-08-25", is_hypothesis: false, merge_reason: "Swift inward remittance MT103 from offshore branch" },
        { id: "e8", source: "p-amit", target: "a-bank3", label: "beneficial owner (88%)", color: "#8b5cf6", style: "dashed", valid_from: "2026-08-28", is_hypothesis: true, merge_reason: "Shared IP and device fingerprint on net-banking sessions" },
        { id: "e9", source: "p-amit", target: "prop-1", label: "purchased benami (92%)", color: "#8b5cf6", style: "dashed", valid_from: "2026-09-01", is_hypothesis: true, merge_reason: "Sub-registrar deed token funded via SBI A/C 1122" },
    ]
};

export const mockTimeline = [
    { 
        id: "tl-1", 
        date: "2026-08-15", 
        time: "14:00", 
        type: "communication", 
        entity: "Rajesh Sharma", 
        location: "Delhi", 
        description: "Encrypted handshake established with Vikram Malhotra via Signal messenger.", 
        confidence: 0.95, 
        details: { app: "Signal", metadata: "IP 182.72.10.42 logged in forensic memory dump" },
        citation: { documentTitle: "Digital Forensics Memory Dump", pageOrOffset: "Offset 0x7FFF920", confidenceScore: 0.95, rawSnippet: "Signal session initialization handshake confirmed between +91-9871... and +91-9811..." }
    },
    { 
        id: "tl-2", 
        date: "2026-08-20", 
        time: "09:30", 
        type: "financial", 
        entity: "Apex Logistics LLC", 
        location: "Mumbai ROC", 
        description: "Shell entity incorporated using falsified Aadhaar credentials and proxy director.", 
        confidence: 0.88, 
        details: { docs: "Forged Aadhaar ending 9942", notary: "B. K. Saxena" },
        citation: { documentTitle: "MCA Incorporation Records", pageOrOffset: "Form SPICe+ Part B", confidenceScore: 0.88, rawSnippet: "Aadhaar UIDAI checksum failed during back-verification for director nominee." }
    },
    { 
        id: "tl-3", 
        date: "2026-09-01", 
        time: "10:00", 
        type: "movement", 
        entity: "Rajesh Sharma", 
        location: "Vasant Vihar Residence", 
        description: "Subject departs residence with heavy Pelican hard-cases in black SUV DL-4C-9981.", 
        confidence: 0.99, 
        details: { vehicle: "DL-4C-9981", team: "Surveillance Unit 4" },
        citation: { documentTitle: "Field Surveillance Report", pageOrOffset: "Entry #12", confidenceScore: 0.99, rawSnippet: "Visual confirmation of target loading two black Pelican flight cases at 10:04 AM." }
    },
    { 
        id: "tl-4", 
        date: "2026-09-03", 
        time: "22:00", 
        type: "movement", 
        entity: "Vikram Malhotra", 
        location: "Industrial Area Warehouse", 
        description: "Vikram arrives at warehouse location; perimeter movement confirmed by infrared sensor.", 
        confidence: 0.90, 
        details: { sensorId: "P-IND-04" },
        citation: { documentTitle: "Tactical Reconnaissance Log", pageOrOffset: "Para 4", confidenceScore: 0.90, rawSnippet: "Thermal signature identified subject matching Vikram Malhotra stature entering rear shutter." }
    },
    { 
        id: "tl-5", 
        date: "2026-09-04", 
        time: "02:15", 
        type: "incident", 
        entity: "Vikram Malhotra", 
        location: "Unregistered Warehouse", 
        description: "Special Cell raid executed. 50kg contraband, cloned credit cards, and encrypted laptop seized.", 
        confidence: 1.0, 
        details: { officers: 12, seized: "Contraband, ₹18L Cash, MacBook Pro" },
        citation: { documentTitle: "FIR 101/2026 Recovery Panchnama", pageOrOffset: "Page 1-4", confidenceScore: 1.0, rawSnippet: "Panchanama executed under Sec 105 BNSS 2023. Seized articles marked Exhibit A1 through A14." }
    },
    { 
        id: "tl-6", 
        date: "2026-09-04", 
        time: "08:00", 
        type: "financial", 
        entity: "Phantom-Driver", 
        location: "South Delhi ATM", 
        description: "Emergency cash structuring withdrawal of ₹49,500 immediately following raid alert.", 
        confidence: 0.85, 
        details: { camera: "Masked operator wearing dark hoodie" },
        citation: { documentTitle: "ATM Audit Log & CCTV", pageOrOffset: "Transaction #88129", confidenceScore: 0.85, rawSnippet: "Debit card linked to ICICI A/C 4521 used 6 hours post-raid." }
    },
    { 
        id: "tl-7", 
        date: "2026-09-05", 
        time: "18:45", 
        type: "communication", 
        entity: "Burner 9871", 
        location: "South Delhi Cell Tower", 
        description: "Burner phone IMEI activated for 45s to transmit short panic message to Dubai number.", 
        confidence: 0.94, 
        details: { towerId: "DEL-SOUTH-442", callee: "+971-50-998-129" },
        citation: { documentTitle: "CDR Intercept Order #44", pageOrOffset: "Page 8", confidenceScore: 0.94, rawSnippet: "Burner activated, transmitted 1 SMS to UAE gateway: 'Shipment compromised. Evacuate immediately.'" }
    },
    { 
        id: "tl-8", 
        date: "2026-09-06", 
        time: "04:30", 
        type: "movement", 
        entity: "Rajesh Sharma", 
        location: "IGI Airport T3", 
        description: "Interception at departure gate 14 attempting to board flight EK-512 under forged passport.", 
        confidence: 1.0, 
        details: { flight: "EK-512", alias: "Rakesh Verma", intercepted: true },
        citation: { documentTitle: "Airport Arrest Memo", pageOrOffset: "Arrest Form #2026-11", confidenceScore: 1.0, rawSnippet: "Accused detained at immigration desk with forged passport in name of Rakesh Verma." }
    },
];

export const mockDigitalForensics = {
    nodes: [
        { id: "d-laptop", label: "MacBook Pro M2", type: "device", details: { os: "macOS 14.5", seized: true, hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" } },
        { id: "d-phone", label: "iPhone 14 Pro", type: "device", details: { unlocked: false, secureEnclave: true, imei: "359182049182741" } },
        { id: "f-ledger", label: "syndicate_ledger_2026.xlsx", type: "file", details: { size: "48KB", encrypted: true, cipher: "AES-256" } },
        { id: "f-photo", label: "IMG_9912_contraband.jpg", type: "file", details: { exifGps: "28.6110, 77.2150", camera: "iPhone 14 Pro" } },
        { id: "f-deleted", label: "passwords_keys.txt", type: "deleted_file", details: { recoveredVia: "Deep Sector Carving", tool: "Autopsy 4.21" } },
        { id: "a-telegram", label: "Telegram Desktop", type: "application", details: { version: "4.16.8", secretChatsFound: 6 } },
        { id: "a-signal", label: "Signal Private Messenger", type: "application", details: { messagesExtracted: 450, disappearingEnabled: true } },
        { id: "f-script", label: "anti_forensic_wipe.sh", type: "file", details: { type: "Bash Script", action: "Shreds ~/.ssh and sqlite history" } },
    ],
    edges: [
        { id: "e1", source: "d-laptop", target: "f-ledger", label: "contains encrypted", color: "#64748b", valid_from: "2026-08-01", is_hypothesis: false },
        { id: "e2", source: "d-laptop", target: "f-deleted", label: "recovered from unallocated", color: "#f59e0b", valid_from: "2026-08-15", is_hypothesis: false },
        { id: "e3", source: "d-phone", target: "f-photo", label: "captured by EXIF", color: "#64748b", valid_from: "2026-09-02", is_hypothesis: false },
        { id: "e4", source: "d-phone", target: "a-telegram", label: "installed app", color: "#64748b", valid_from: "2025-11-01", is_hypothesis: false },
        { id: "e5", source: "a-telegram", target: "f-ledger", label: "shared in secret group", color: "#ef4444", valid_from: "2026-09-03", is_hypothesis: false },
        { id: "e6", source: "d-phone", target: "a-signal", label: "installed app", color: "#64748b", valid_from: "2025-10-15", is_hypothesis: false },
        { id: "e7", source: "d-laptop", target: "f-script", label: "executed prior to raid", color: "#ef4444", valid_from: "2026-09-04", is_hypothesis: false },
    ]
};

export const mockCommunicationAnalysis = {
    nodes: [
        { id: "p-rajesh", label: "Rajesh Sharma (Target)", type: "person", details: { risk: "High", totalCalls: 188, uniqueContacts: 14 } },
        { id: "p-vikram", label: "Vikram Malhotra", type: "person", details: { risk: "High", totalCalls: 215, uniqueContacts: 22 } },
        { id: "p-amit", label: "Amit Singh", type: "person", details: { risk: "Medium", totalCalls: 64, uniqueContacts: 9 } },
        { id: "p-unknown1", label: "Burner +91-9871-449102", type: "phone", details: { provider: "Airtel", kycName: "Fake Nominee - Ram Lal", churnRate: "Active 4 days only" } },
        { id: "p-unknown2", label: "UK Number +44-7700-900821", type: "phone", details: { provider: "O2 UK", roaming: "London Gateway" } },
        { id: "p-unknown3", label: "VoIP Gateway +1-555-019-4821", type: "phone", details: { provider: "Twilio SIP Relay", ip: "198.51.100.22" } },
        { id: "p-sarah", label: "Sarah (Alias Courier)", type: "person", details: { role: "Logistics Runner", nationality: "Undetermined" } },
    ],
    edges: [
        { id: "e1", source: "p-rajesh", target: "p-vikram", label: "142 calls (freq: high)", color: "#ef4444", weight: 5, valid_from: "2026-08-01", is_hypothesis: false },
        { id: "e2", source: "p-rajesh", target: "p-amit", label: "12 calls (finance window)", color: "#f59e0b", weight: 2, valid_from: "2026-08-15", is_hypothesis: false },
        { id: "e3", source: "p-vikram", target: "p-unknown1", label: "45 calls (post-midnight)", color: "#ef4444", weight: 3, valid_from: "2026-08-25", is_hypothesis: false },
        { id: "e4", source: "p-vikram", target: "p-unknown2", label: "8 international calls", color: "#64748b", weight: 1, valid_from: "2026-08-28", is_hypothesis: false },
        { id: "e5", source: "p-amit", target: "p-unknown1", label: "2 verification pings", color: "#64748b", weight: 1, valid_from: "2026-08-30", is_hypothesis: false },
        { id: "e6", source: "p-rajesh", target: "p-unknown3", label: "34 encrypted VoIP routes", color: "#f59e0b", weight: 2, valid_from: "2026-09-01", is_hypothesis: false },
        { id: "e7", source: "p-sarah", target: "p-unknown3", label: "18 calls (coordination)", color: "#f59e0b", weight: 2, valid_from: "2026-09-02", is_hypothesis: false },
    ]
};

export const mockForensicEvidence = {
    nodes: [
        { id: "scene-1", label: "Warehouse Site A", type: "location", details: { address: "Plot 12, Okhla Industrial Area Ph-III, Delhi", status: "Sealed under Sec 107 BNSS" } },
        { id: "ev-1", label: "Latent Fingerprint FP-01", type: "evidence", details: { quality: "Partial 12 minutiae", matchedDatabase: "NCRB NAFIS" } },
        { id: "ev-2", label: "DNA Swab D-44", type: "evidence", details: { matchProbability: "99.999%", laboratory: "CFSL New Delhi" } },
        { id: "obj-1", label: "Pry Bar & Tools", type: "object", details: { material: "Hardened Carbon Steel", toolmarkMatch: "Striations match safe door" } },
        { id: "p-vikram", label: "Vikram Malhotra", type: "person", details: { status: "Under Judicial Custody", remandDays: 14 } },
        { id: "ev-3", label: "CCTV Footage Cam 04", type: "evidence", details: { duration: "4 hours 12 mins", resolution: "1080p", hash: "sha256:4a819b..." } },
        { id: "scene-2", label: "Getaway SUV DL-4C-9981", type: "location", details: { chassisNumber: "Tampered", registeredOwner: "Phantom-Entity" } },
        { id: "ev-4", label: "Hair Follicle HF-09", type: "evidence", details: { matched: false, mitochondrialDna: "Candidate profile extracted" } },
    ],
    edges: [
        { id: "e1", source: "scene-1", target: "obj-1", label: "recovered from", color: "#64748b", valid_from: "2026-09-04", is_hypothesis: false },
        { id: "e2", source: "obj-1", target: "ev-1", label: "extracted fingerprint", color: "#f59e0b", valid_from: "2026-09-04", is_hypothesis: false },
        { id: "e3", source: "ev-1", target: "p-vikram", label: "NAFIS 100% match", color: "#ef4444", valid_from: "2026-09-05", is_hypothesis: false },
        { id: "e4", source: "scene-1", target: "ev-2", label: "swabbed from desk", color: "#64748b", valid_from: "2026-09-04", is_hypothesis: false },
        { id: "e5", source: "scene-1", target: "ev-3", label: "DVR hard-drive seized", color: "#64748b", valid_from: "2026-09-04", is_hypothesis: false },
        { id: "e6", source: "ev-3", target: "p-vikram", label: "facial match (98.4%)", color: "#ef4444", valid_from: "2026-09-05", is_hypothesis: false },
        { id: "e7", source: "scene-2", target: "ev-4", label: "swabbed from headrest", color: "#64748b", valid_from: "2026-09-05", is_hypothesis: false },
        { id: "e8", source: "scene-2", target: "p-vikram", label: "fingerprint on steering", color: "#ef4444", valid_from: "2026-09-05", is_hypothesis: false },
    ]
};

export const mockIdentityResolution = {
    target: "Rajesh Sharma",
    candidates: [
        {
            id: "cand-1",
            name: "Rajesh K. Sharma",
            confidence: 94,
            matchingAttributes: ["DOB: 1985-04-12", "Phone: +91-9871...", "City: Delhi", "Father: Late S. N. Sharma"],
            conflictingAttributes: ["Address: Plot 42 Vasant Vihar vs Flat 12 Dwarka"],
            source: "Telecom C-DOT & MCA KYC",
            reasoning: "Matched on 3 unique high-entropy identifiers (PAN, Mobile IMEI, and Mother's name) with 94% statistical confidence."
        },
        {
            id: "cand-2",
            name: "R. Sharma (Alias)",
            confidence: 71,
            matchingAttributes: ["Phone: +91-9871...", "Voter ID Epic: DEL0928174"],
            conflictingAttributes: ["DOB: Undetermined", "City: Noida Sector 15"],
            source: "Bank KYC Record",
            reasoning: "Moderate confidence linkage established via secondary contact number registered as recovery phone."
        },
        {
            id: "cand-3",
            name: "Rajesh Sharma",
            confidence: 42,
            matchingAttributes: ["Name Lexical Match"],
            conflictingAttributes: ["DOB: 1990-01-01", "Phone: +91-9999...", "State: Haryana"],
            source: "Traffic Challan Database",
            reasoning: "Low-confidence homonym match; excluded from primary syndicate network."
        }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW MOCK DATASETS (Architecture Shadowing: Stage 5, Stage 10, Stage 13)
// ─────────────────────────────────────────────────────────────────────────────

export interface FactSheetData {
    caseId: string;
    firNumber: string;
    track: 1 | 2;
    triageReason: string;
    diffSummary?: {
        updatedCount: number;
        lastDiffTimestamp: string;
        details: string[];
    };
    who: Array<{
        id?: string;
        name: string;
        role: "Accused" | "Complainant" | "Witness" | "Unresolved-Phantom" | string;
        isPhantom?: boolean;
        alias?: string;
        status?: string;
        citation: CitationRef;
    }>;
    what: Array<{
        bnsSection?: string;
        statuteName?: string;
        description?: string;
        crimeDescription?: string;
        ipcSection?: string;
        natureOfIncident?: string;
        severity?: string;
        applicableTo?: string;
        citation: CitationRef;
    }>;
    when: Array<{
        timestamp?: string;
        date?: string;
        time?: string;
        event: string;
        location?: string;
        significance?: string;
        citation: CitationRef;
    }>;
    where: Array<{
        id?: string;
        locationName?: string;
        placeName?: string;
        jurisdiction?: string;
        significance?: string;
        coordinates?: [number, number];
        citation: CitationRef;
    }>;
    evidence: Array<{
        id: string;
        modality: "digital_text" | "scanned_doc" | "video_cctv" | "audio" | "cdr_financial" | "image_bio" | string;
        fileName: string;
        extractionStatus: "parsed" | "partial" | "failed" | string;
        confidence: number;
        note?: string;
    }>;
    knownRelationships: Array<{
        id: string;
        source: string;
        target: string;
        relationship: string;
        citation: CitationRef;
    }>;
    openGaps: Array<{
        id?: string;
        title?: string;
        description?: string;
        assignedInvestigator?: string;
        priority?: "critical" | "high" | "medium" | string;
        linkedLeadId?: string;
        severity?: "critical" | "high" | "medium" | string;
        notes?: string;
    }>;
}

export const mockFactSheet: FactSheetData = {
    caseId: "FIR 101/2026",
    firNumber: "PS Special Cell / FIR-101-2026",
    track: 2,
    triageReason: "Multi-layered syndicate detected: 4 shell companies, cross-border VoIP churn, and cryptocurrency laundering loop.",
    diffSummary: {
        updatedCount: 3,
        lastDiffTimestamp: "2026-09-08T11:45:00+05:30",
        details: [
            "Resolved beneficial ownership of Apex Logistics to Amit Singh (92% confidence)",
            "Identified second burner IMEI associated with South Delhi cell tower ping",
            "Updated BNS charge sheet to include Section 111 (Organized Crime)"
        ]
    },
    who: [
        {
            id: "ent-1",
            name: "Rajesh Sharma",
            role: "Accused",
            alias: "Bhaiji / Chairman",
            citation: {
                documentTitle: "FIR 101/2026 Complaint Copy",
                pageOrOffset: "Page 1, Col 4",
                confidenceScore: 0.99,
                rawSnippet: "Primary named accused: Rajesh Sharma s/o Late S.N. Sharma."
            }
        },
        {
            id: "ent-2",
            name: "Vikram Malhotra",
            role: "Accused",
            alias: "Vicky Contractor",
            citation: {
                documentTitle: "Raid Panchnama Exhibit A",
                pageOrOffset: "Page 2",
                confidenceScore: 1.0,
                rawSnippet: "Apprehended at warehouse premises in physical possession of contraband."
            }
        },
        {
            id: "ent-3",
            name: "Sunil Narang",
            role: "Complainant",
            citation: {
                documentTitle: "Commercial Fraud Complaint Letter",
                pageOrOffset: "Header 1",
                confidenceScore: 0.98,
                rawSnippet: "Complainant: Sunil Narang, Managing Director of Narang Exports Ltd."
            }
        },
        {
            id: "ent-4",
            name: "Suresh P. Tiwari",
            role: "Witness",
            alias: "Godown Security Guard",
            citation: {
                documentTitle: "Witness Statement Sec 180 BNSS",
                pageOrOffset: "Statement #03",
                confidenceScore: 0.92,
                rawSnippet: "Stated he witnessed night deliveries in black SUV DL-4C-9981."
            }
        },
        {
            id: "ent-phantom-1",
            name: "Phantom-Driver (Masked ATM Operator)",
            role: "Unresolved-Phantom",
            isPhantom: true,
            alias: "Courier 7 / Burner Relay",
            citation: {
                documentTitle: "HDFC ATM Surveillance Still #0912",
                pageOrOffset: "Frame 4821",
                confidenceScore: 0.76,
                rawSnippet: "Masked operator withdrew ₹49,500 using clone card; height ~5ft 10in."
            }
        },
        {
            id: "ent-phantom-2",
            name: "Phantom-Financier (Dubai Beneficiary)",
            role: "Unresolved-Phantom",
            isPhantom: true,
            alias: "Overseas Node +971-50-***",
            citation: {
                documentTitle: "Swift MT103 Gateway Audit",
                pageOrOffset: "Wire Record #9921",
                confidenceScore: 0.68,
                rawSnippet: "Beneficial owner concealed behind offshore trust in Ras Al Khaimah."
            }
        }
    ],
    what: [
        {
            bnsSection: "BNS Section 318(4)",
            statuteName: "Cheating and dishonestly inducing delivery of property",
            description: "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment up to 7 years and fine.",
            applicableTo: "Rajesh Sharma, Apex Logistics LLC",
            citation: {
                documentTitle: "Charge Recommendation Memo",
                pageOrOffset: "Para 12",
                confidenceScore: 0.98,
                rawSnippet: "Inducement of ₹5 Crore export advance on fraudulent bill of lading."
            }
        },
        {
            bnsSection: "BNS Section 61(2)",
            statuteName: "Criminal Conspiracy",
            description: "Whoever is a party to a criminal conspiracy to commit an offence punishable with death, imprisonment for life or rigorous imprisonment for a term of two years or upwards, shall be punished in the same manner as if he had abetted such offence.",
            applicableTo: "Rajesh Sharma, Vikram Malhotra, Amit Singh",
            citation: {
                documentTitle: "Digital Forensic Nexus Report",
                pageOrOffset: "Page 14",
                confidenceScore: 0.94,
                rawSnippet: "Coordinated communications established prior to procurement of shell company."
            }
        },
        {
            bnsSection: "BNS Section 111",
            statuteName: "Organized Crime Syndicate Offence",
            description: "Any continuing unlawful activity including kidnapping, robbery, cyber-crimes having severe consequences, or economic offences committed by a person singly or jointly with members of an organized crime syndicate.",
            applicableTo: "Apex Syndicate Consortium",
            citation: {
                documentTitle: "Organized Crime Dossier v2",
                pageOrOffset: "Section 3.1",
                confidenceScore: 0.89,
                rawSnippet: "Multiple interconnected legal entities, repeated layering patterns, cross-jurisdiction operations."
            }
        },
        {
            bnsSection: "BNS Section 336(3)",
            statuteName: "Forgery of valuable security / Electronic records",
            description: "Whoever forges a document or electronic record purporting to be a valuable security or authority to receive funds shall be punished with imprisonment up to 10 years.",
            applicableTo: "Apex Logistics LLC, Vikram Malhotra",
            citation: {
                documentTitle: "MCA Forgery Audit Report",
                pageOrOffset: "Annexure F",
                confidenceScore: 0.96,
                rawSnippet: "Forged Aadhaar and notary seals utilized during incorporation."
            }
        }
    ],
    when: [
        {
            timestamp: "2026-08-15 14:00",
            event: "Signal encrypted communications initiated between Rajesh Sharma and Vikram Malhotra.",
            location: "South Delhi",
            citation: { documentTitle: "Memory Dump Report", pageOrOffset: "P. 6", confidenceScore: 0.95, rawSnippet: "Initial key exchange on Signal." }
        },
        {
            timestamp: "2026-08-20 09:30",
            event: "Apex Logistics LLC registered using fake Aadhaar.",
            location: "MCA Portal",
            citation: { documentTitle: "MCA Log", pageOrOffset: "P. 1", confidenceScore: 0.98, rawSnippet: "Incorporation certificate issued." }
        },
        {
            timestamp: "2026-09-04 02:15",
            event: "Special Cell raid at Okhla warehouse; Vikram Malhotra arrested on scene.",
            location: "Okhla Phase-III",
            citation: { documentTitle: "FIR 101/2026", pageOrOffset: "P. 3", confidenceScore: 1.0, rawSnippet: "Contraband seized at 02:15." }
        },
        {
            timestamp: "2026-09-06 04:30",
            event: "Rajesh Sharma intercepted at IGI Airport departure gate 14.",
            location: "IGI Airport T3",
            citation: { documentTitle: "LOC Memo", pageOrOffset: "P. 1", confidenceScore: 1.0, rawSnippet: "Subject apprehended." }
        }
    ],
    where: [
        {
            locationName: "Vasant Vihar Residence (Plot 42)",
            jurisdiction: "South West District Police, New Delhi",
            significance: "Headquarters of primary mastermind, origin of planning sessions.",
            coordinates: [28.6139, 77.2090],
            citation: { documentTitle: "Surveillance Dossier", pageOrOffset: "P. 2", confidenceScore: 0.98, rawSnippet: "Residence occupied by Rajesh Sharma." }
        },
        {
            locationName: "Okhla Industrial Area Warehouse",
            jurisdiction: "South East District Police, New Delhi",
            significance: "Physical storage site for contraband, cash consolidation hub.",
            coordinates: [28.6110, 77.2150],
            citation: { documentTitle: "Raid Panchnama", pageOrOffset: "P. 1", confidenceScore: 1.0, rawSnippet: "Primary recovery location." }
        },
        {
            locationName: "IGI Airport Terminal 3",
            jurisdiction: "Delhi Airport Police / Bureau of Immigration",
            significance: "Failed exfiltration vector toward Dubai International.",
            coordinates: [28.5562, 77.1000],
            citation: { documentTitle: "LOC Intercept Memo", pageOrOffset: "P. 1", confidenceScore: 1.0, rawSnippet: "Border control interception." }
        }
    ],
    evidence: [
        {
            id: "ev-chan-1",
            modality: "digital_text",
            fileName: "FIR_101_2026_cas_export.json",
            extractionStatus: "parsed",
            confidence: 0.99,
            note: "Schema-aware CAS export parsed without OCR error; 18 entities matched."
        },
        {
            id: "ev-chan-2",
            modality: "scanned_doc",
            fileName: "seizure_memo_panchnama_scanned.pdf",
            extractionStatus: "parsed",
            confidence: 0.94,
            note: "Layout-aware OCR completed; handwritten witness signatures flagged for expert verification."
        },
        {
            id: "ev-chan-3",
            modality: "video_cctv",
            fileName: "warehouse_perimeter_cam04.mp4",
            extractionStatus: "parsed",
            confidence: 0.91,
            note: "ANPR detected plate DL-4C-9981; facial Re-ID matched Vikram Malhotra (98.4%)."
        },
        {
            id: "ev-chan-4",
            modality: "audio",
            fileName: "wiretap_intercept_call_9871.wav",
            extractionStatus: "partial",
            confidence: 0.79,
            note: "ASR completed; high background ambient noise in segment 03:12-03:45 required diarization fallback."
        },
        {
            id: "ev-chan-5",
            modality: "cdr_financial",
            fileName: "hdfc_bank_statement_9901.xlsx",
            extractionStatus: "parsed",
            confidence: 0.98,
            note: "Structuring detection model flagged 4 rapid deposits under ₹50,000 threshold."
        },
        {
            id: "ev-chan-6",
            modality: "image_bio",
            fileName: "driver_atm_still_cam.jpg",
            extractionStatus: "partial",
            confidence: 0.74,
            note: "Subject partially obscured by surgical mask; biometric identity claim routed externally."
        }
    ],
    knownRelationships: [
        {
            id: "rel-1",
            source: "Rajesh Sharma",
            target: "Vikram Malhotra",
            relationship: "Co-conspirators in FIR 101/2026 with 142 direct telephonic contacts",
            citation: { documentTitle: "Telecom Analysis Dump", pageOrOffset: "Call Log Matrix", confidenceScore: 0.99, rawSnippet: "142 calls recorded between IMEI 3549210... and 3591820..." }
        },
        {
            id: "rel-2",
            source: "Rajesh Sharma",
            target: "HDFC A/C 9901",
            relationship: "Sole authorized signatory and debit card holder",
            citation: { documentTitle: "HDFC KYC Certificate", pageOrOffset: "Signatory Mandate", confidenceScore: 1.0, rawSnippet: "Account opened on sole signature of Rajesh Sharma." }
        },
        {
            id: "rel-3",
            source: "Vikram Malhotra",
            target: "Warehouse Site A",
            relationship: "Lease agreement lessee under alias Vicky Contractor",
            citation: { documentTitle: "Property Lease Deed #8812", pageOrOffset: "Page 2", confidenceScore: 0.96, rawSnippet: "Tenant signed as Vikram Malhotra." }
        }
    ],
    openGaps: [
        {
            id: "gap-1",
            title: "Unidentified Registered Owner of Black SUV (DL-4C-9981)",
            linkedLeadId: "lead-phantom-vehicle",
            severity: "critical",
            notes: "Vehicle used in contraband transport is registered under a fictitious name at a non-existent Sultanpuri address."
        },
        {
            id: "gap-2",
            title: "Identity of Masked ATM Operator Withdrawing Structuring Tranches",
            linkedLeadId: "lead-phantom-driver",
            severity: "high",
            notes: "ATM still shows operator height ~5ft 10in; phone tower triangulation pending CDR cross-reference."
        },
        {
            id: "gap-3",
            title: "Ultimate Beneficial Owner of Wasabi Mixer Receiving Crypto Wallet",
            linkedLeadId: "lead-phantom-crypto",
            severity: "critical",
            notes: "14.2 BTC traced to offshore cluster; FIU mutual legal assistance request (MLAT) required."
        }
    ]
};

export interface PhantomLead {
    id: string;
    title: string;
    phantomType?: "vehicle" | "person" | "phone" | "wallet" | "document" | "location" | string;
    status: "open" | "requested" | "resolved" | "dismissed" | string;
    confidenceScore?: number;
    partialAttributes?: Record<string, string>;
    recommendedAction?: string;
    sourceDocument?: string;
    dateIdentified?: string;
    originEvidence?: string;
    assignedTo?: string;
    category?: string;
    severity?: string;
    priority?: string;
    dueDate?: string;
    summary?: string;
}

export const mockPhantomLeads: PhantomLead[] = [
    {
        id: "lead-phantom-vehicle",
        title: "Phantom Vehicle: SUV DL-4C-9981",
        phantomType: "vehicle",
        status: "open",
        confidenceScore: 0.82,
        partialAttributes: {
            plate: "DL-4C-9981",
            make: "Black Mahindra Scorpio",
            chassis: "MA1TC2**** (tampered)",
            registeredAddress: "Fictitious Sultanpuri Plot 9"
        },
        recommendedAction: "Issue FastTag toll barrier surveillance order on Delhi-Jaipur Expressway.",
        sourceDocument: "Traffic Cam ANPR Feed #14",
        dateIdentified: "2026-09-04"
    },
    {
        id: "lead-phantom-driver",
        title: "Phantom Entity: Masked ATM Courier",
        phantomType: "person",
        status: "requested",
        confidenceScore: 0.74,
        partialAttributes: {
            physicality: "Male, ~178cm, dark hoodie, surgical mask",
            timeWindow: "08:00 AM post-raid",
            bankCard: "ICICI Clone Debit ending 4521",
            withdrawal: "₹49,500 cash"
        },
        recommendedAction: "Subpoena adjacent shop CCTV within 200m radius of ATM for unmasked footage.",
        sourceDocument: "HDFC Bank ATM 0984 Video Log",
        dateIdentified: "2026-09-04"
    },
    {
        id: "lead-phantom-burner",
        title: "Phantom Lead: UAE Relay Contact",
        phantomType: "phone",
        status: "open",
        confidenceScore: 0.88,
        partialAttributes: {
            number: "+971-50-998-1294",
            service: "Etisalat UAE",
            lastMessage: "'Shipment compromised. Evacuate immediately.'",
            interceptTower: "DEL-SOUTH-442"
        },
        recommendedAction: "Transmit red-notice inquiry through Interpol NCB New Delhi to UAE authorities.",
        sourceDocument: "CDR Tower Intercept DEL-442",
        dateIdentified: "2026-09-05"
    },
    {
        id: "lead-phantom-crypto",
        title: "Phantom Wallet: Mixer Destination 0x8A1",
        phantomType: "wallet",
        status: "requested",
        confidenceScore: 0.91,
        partialAttributes: {
            clusterId: "Cluster #99201 (Wasabi Mixer)",
            transferredSum: "14.2 BTC (~₹7.8 Crore)",
            hopCount: "3 intermediate peel hops",
            finalExchangeHop: "Offshore VASP"
        },
        recommendedAction: "Serve Section 91 CrPC/BNSS disclosure order to exchange compliance desk.",
        sourceDocument: "Blockchain Forensic Cluster Analysis",
        dateIdentified: "2026-09-05"
    },
    {
        id: "lead-phantom-property",
        title: "Phantom Benami Asset: Gurgaon Luxury Villa",
        phantomType: "person",
        status: "resolved",
        confidenceScore: 0.92,
        partialAttributes: {
            address: "Sector 42, Gurgaon, Haryana",
            deedNominee: "Proxy caretaker (Sunita Devi)",
            trueBeneficiary: "Amit Singh (Financier)",
            valuation: "₹45,000,000"
        },
        recommendedAction: "Provisional attachment notice under Benami Transactions (Prohibition) Act.",
        sourceDocument: "Sub-Registrar Haryana Property Index",
        dateIdentified: "2026-09-02"
    }
];

export interface StructuringAlert {
    id: string;
    accountNumber: string;
    bankName: string;
    totalAmount: number | string;
    transactionCount: number;
    timeWindow: string;
    riskScore: number;
    flaggedReason?: string;
    suspectedEntities?: string[];
    recommendedAction?: string;
    patternType?: string;
    confidence?: number;
    gbmFeatures?: any;
}

export const mockStructuringAlerts: StructuringAlert[] = [
    {
        id: "struct-1",
        accountNumber: "ICICI A/C 4521",
        bankName: "ICICI Bank",
        patternType: "Sub-threshold Smurfing (Under ₹50,000)",
        totalAmount: "₹4,95,000 across 10 tranches",
        transactionCount: 10,
        timeWindow: "24 Hours (Sep 3 - Sep 4)",
        confidence: 0.94,
        riskScore: 0.91,
        gbmFeatures: ["Deposit amount clustering at ₹49,500", "Zero historical transaction cadence", "Immediate ATM cash-out ratio: 98%"]
    },
    {
        id: "struct-2",
        accountNumber: "HDFC A/C 9901",
        bankName: "HDFC Bank",
        patternType: "Rapid Layering & Pass-Through Velocity",
        totalAmount: "₹50,00,000 Inward / ₹48,00,000 Outward",
        transactionCount: 2,
        timeWindow: "48 Hours (Aug 10 - Aug 12)",
        confidence: 0.89,
        riskScore: 0.85,
        gbmFeatures: ["Retention period < 4 hours", "Immediate transfer to newly incorporated LLC", "High-risk counterparty risk"]
    },
    {
        id: "struct-3",
        accountNumber: "SBI A/C 1122",
        bankName: "State Bank of India",
        patternType: "Round-Tripping Foreign Inward Remittance",
        totalAmount: "₹21,00,000 (US $25,000 equivalent)",
        transactionCount: 1,
        timeWindow: "Aug 25",
        confidence: 0.82,
        riskScore: 0.78,
        gbmFeatures: ["Offshore tax-haven remittance origin", "Mismatch between declared trade turnover and deposit"]
    }
];

export interface MOMatch {
    id?: string;
    matchedCaseId?: string;
    title?: string;
    modusOperandi?: string;
    similarity?: number;
    similarityScore?: number;
    overallSimilarity?: number;
    geospatialSimilarity?: number;
    temporalSimilarity?: number;
    textSimilarity?: number;
    jurisdiction?: string;
    dateReported?: string;
    commonFactors?: string[];
    commonIndicators?: string[];
    status?: string;
    linkedCaseRef?: string;
    matchingPatterns?: string[];
    matchedCases?: any[];
}

export const mockMOMatches: MOMatch[] = [
    {
        id: "mo-1",
        matchedCaseId: "FIR 88/2025 (PS Cyber Cell South)",
        title: "Fake Export LC & Cryptocurrency Layering Syndicate",
        jurisdiction: "Delhi Police Special Cell",
        dateReported: "2025-11-14",
        overallSimilarity: 0.91,
        geospatialSimilarity: 0.88,
        temporalSimilarity: 0.85,
        textSimilarity: 0.94,
        commonFactors: [
            "Use of Wasabi Bitcoin mixing services to obscure proceeds",
            "Incorporation of dummy logistics LLP with forged Aadhaar",
            "Burner phone activation restricted to post-midnight windows",
            "Same forged notary seal attributed to B. K. Saxena"
        ],
        status: "Active Linkage"
    },
    {
        id: "mo-2",
        matchedCaseId: "FIR 412/2024 (PS Bandra)",
        title: "Container Fraud & Hawala Cash Structuring",
        jurisdiction: "Mumbai Crime Branch",
        dateReported: "2024-08-19",
        overallSimilarity: 0.83,
        geospatialSimilarity: 0.72,
        temporalSimilarity: 0.80,
        textSimilarity: 0.89,
        commonFactors: [
            "Sub-₹50k ATM structuring pattern by masked runners",
            "Signal application utilized for end-to-end operational dispatch",
            "Shared Dubai recipient telephone exchange prefix (+971-50-***)"
        ],
        status: "Active Linkage"
    },
    {
        id: "mo-3",
        matchedCaseId: "FIR 19/2026 (PS Cyber Gurugram)",
        title: "Benami Real Estate Procurement via Offshore Remittances",
        jurisdiction: "Haryana Police",
        dateReported: "2026-02-10",
        overallSimilarity: 0.67,
        geospatialSimilarity: 0.92,
        temporalSimilarity: 0.58,
        textSimilarity: 0.65,
        commonFactors: [
            "Overlapping benami registry location in Gurgaon Sector 42",
            "Amit Singh identified as secondary investor in company filings"
        ],
        status: "Under Review"
    }
];

export interface CrimeTheory {
    id?: string;
    version?: string;
    isSuperseded?: boolean;
    supersedesVersion?: string;
    title: string;
    summary?: string;
    confidence?: number;
    supportingEvidence?: string[];
    counterEvidence?: string[];
    counterfactuals?: string[];
    verificationSteps?: string[];
    overallConfidenceQualifier?: "strong evidence" | "possible lead" | "unconfirmed hypothesis";
    overallConfidenceScore?: number;
    rationale?: string;
    keyAssumptions?: string[];
    sequence?: Array<{
        stepNumber: number;
        description: string;
        confidence: number;
        citation: CitationRef;
    }>;
    unresolvedGaps?: Array<{
        gapTitle: string;
        linkedLeadId?: string;
    }>;
}

export const mockTheories: CrimeTheory[] = [
    {
        version: "v2",
        isSuperseded: false,
        supersedesVersion: "v1",
        title: "Multi-Tier Money Laundering via Shell Entity & Crypto Mixer (Active Working Theory)",
        overallConfidenceQualifier: "strong evidence",
        overallConfidenceScore: 0.91,
        rationale: "Corroborated by physical contraband recovery at Okhla warehouse, digital forensics of laptop AES ledgers, and bank MT103 Swift records cross-referenced with Wasabi mixer clustering.",
        sequence: [
            {
                stepNumber: 1,
                description: "Rajesh Sharma and Vikram Malhotra establish encrypted Signal communications to plan fraud scheme.",
                confidence: 0.95,
                citation: { documentTitle: "Digital Memory Dump", pageOrOffset: "0x7FFF", confidenceScore: 0.95, rawSnippet: "Signal key exchange logged 2026-08-15." }
            },
            {
                stepNumber: 2,
                description: "Apex Logistics LLC incorporated using forged Aadhaar cards to provide commercial veneer for fraudulent transactions.",
                confidence: 0.98,
                citation: { documentTitle: "MCA Incorporation Records", pageOrOffset: "SPICe+ B", confidenceScore: 0.98, rawSnippet: "Forged Aadhaar detected in back-verification." }
            },
            {
                stepNumber: 3,
                description: "Complainant Sunil Narang induced to transfer ₹5 Crore advance into HDFC A/C 9901 on fraudulent bill of lading.",
                confidence: 0.99,
                citation: { documentTitle: "HDFC Bank Statement", pageOrOffset: "Row 14", confidenceScore: 0.99, rawSnippet: "Inward NEFT ₹50,00,000 credited." }
            },
            {
                stepNumber: 4,
                description: "Funds layered within 48 hours to ICICI A/C 4521 and converted to 14.2 BTC via P2P crypto gateway.",
                confidence: 0.89,
                citation: { documentTitle: "P2P Gateway Order Ledger", pageOrOffset: "Order #9921", confidenceScore: 0.89, rawSnippet: "14.2 BTC purchased using debit card." }
            },
            {
                stepNumber: 5,
                description: "Crypto routed through Wasabi peel chain mixer to offshore destination cluster in UAE.",
                confidence: 0.88,
                citation: { documentTitle: "Blockchain Forensic Report", pageOrOffset: "Cluster 99201", confidenceScore: 0.88, rawSnippet: "Peel chain hops matching Wasabi coin-join protocol." }
            },
            {
                stepNumber: 6,
                description: "Vikram Malhotra arrested in physical raid; Rajesh Sharma attempts international flight exfiltration via IGI Airport.",
                confidence: 1.0,
                citation: { documentTitle: "Airport Arrest Memo", pageOrOffset: "Arrest Form #11", confidenceScore: 1.0, rawSnippet: "LOC interception at Gate 14." }
            }
        ],
        unresolvedGaps: [
            {
                gapTitle: "Unidentified Registered Owner of Black SUV (DL-4C-9981)",
                linkedLeadId: "lead-phantom-vehicle"
            },
            {
                gapTitle: "Identity of Masked ATM Operator Withdrawing Structuring Tranches",
                linkedLeadId: "lead-phantom-driver"
            },
            {
                gapTitle: "Ultimate Beneficial Owner of Wasabi Mixer Receiving Crypto Wallet",
                linkedLeadId: "lead-phantom-crypto"
            }
        ]
    },
    {
        version: "v1",
        isSuperseded: true,
        title: "Traditional Hawala Courier Nexus (Superseded Preliminary Model)",
        overallConfidenceQualifier: "possible lead",
        overallConfidenceScore: 0.68,
        rationale: "Initial hypothesis formulated before recovery of encrypted MacBook ledgers; presumed cash-only domestic hawala pipeline without cryptocurrency component.",
        sequence: [
            {
                stepNumber: 1,
                description: "Cash collected in unrecorded installments across Delhi NCR retail establishments.",
                confidence: 0.65,
                citation: { documentTitle: "Initial FIR Complaint", pageOrOffset: "Page 2", confidenceScore: 0.70, rawSnippet: "Complainant alleged cash extortion demands." }
            },
            {
                stepNumber: 2,
                description: "Physical transport via interstate road couriers to border states.",
                confidence: 0.62,
                citation: { documentTitle: "Initial Patrol Report", pageOrOffset: "Item 4", confidenceScore: 0.65, rawSnippet: "General observation of vehicle movements." }
            }
        ],
        unresolvedGaps: [
            {
                gapTitle: "Hawala operator ledger unverified",
                linkedLeadId: "lead-phantom-burner"
            }
        ]
    }
];

export const mockAuditLog = [
    {
        id: "audit-1",
        timestamp: "2026-09-08T10:14:00+05:30",
        action: "Auto-Entity Resolution",
        description: "Merged candidate entity 'Rajesh K. Sharma' with target 'Rajesh Sharma' based on PAN & Mobile IMEI match.",
        confidence: 0.94,
        status: "Auto-Confirmed (High Confidence)"
    },
    {
        id: "audit-2",
        timestamp: "2026-09-08T10:30:22+05:30",
        action: "GNN Link Prediction",
        description: "Predicted hypothesis edge 'launder_path' from Apex Logistics to Wallet 0x8A1 with 96% heuristic probability.",
        confidence: 0.96,
        status: "Pending Human Confirmation"
    },
    {
        id: "audit-3",
        timestamp: "2026-09-08T11:05:40+05:30",
        action: "GBM Structuring Flag",
        description: "Flagged ICICI A/C 4521 for Smurfing anomaly (10 tranches at ₹49,500).",
        confidence: 0.94,
        status: "Auto-Confirmed"
    },
    {
        id: "audit-4",
        timestamp: "2026-09-08T11:45:10+05:30",
        action: "Delta Evidence Re-Triage",
        description: "Case complexity evaluated at Track 2 based on multi-entity syndication across 6 evidence channels.",
        confidence: 0.98,
        status: "System Certified"
    }
];

export const mockOsintFindings = [
    {
        finding_type: "geolocation",
        label: "28.66531, 77.23240 (Mori Gate Terminal)",
        attributes: {
            latitude: 28.66531,
            longitude: 77.23240,
            altitude: 216.4,
            captured_at: "2026-09-02T19:42:11",
            location_name: "Mori Gate Terminal, Old Delhi",
            relevance: "EXIF coordinates match seizure location of recovery cache"
        },
        confidence: 0.95,
        source_url: null,
        tool: "exiftool",
        tool_args: ["-json", "-G", "-n"],
        raw_sha256: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        collected_at: "2026-09-03T04:12:00Z",
        egress_used: false,
        source_document: "Seizure_Photo_MoriGate_Cache.jpg"
    },
    {
        finding_type: "device",
        label: "OnePlus CPH2413 (SN: W4A8911C)",
        attributes: {
            make: "OnePlus",
            model: "CPH2413 (Nord CE 3 Lite)",
            serial_number: "W4A8911C",
            software: "OxygenOS 14.0",
            captured_at: "2026-09-02T19:42:11",
            cross_case_match: "Serial matches phone seized in FIR 42/2025 (Rohini Extortion)"
        },
        confidence: 0.95,
        source_url: null,
        tool: "exiftool",
        tool_args: ["-json", "-G", "-n"],
        raw_sha256: "3d5a43905cf4e815e10e42d7b42f61e88863f64095bb4f9f4a9b6c0e816a75f2",
        collected_at: "2026-09-03T04:12:00Z",
        egress_used: false,
        source_document: "Seizure_Photo_MoriGate_Cache.jpg"
    },
    {
        finding_type: "phone_profile",
        label: "+91 98112 44901 (Airtel Delhi)",
        attributes: {
            e164: "+919811244901",
            country_code: 91,
            national_number: "9811244901",
            carrier: "Bharti Airtel Ltd",
            circle: "Delhi & NCR",
            line_type: "mobile",
            valid: true,
            cdr_corroboration: "Matches active caller ID on Kashmere Gate Wiretap Line 4"
        },
        confidence: 0.92,
        source_url: null,
        tool: "phonenumbers",
        tool_args: ["IN"],
        raw_sha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
        collected_at: "2026-09-03T04:12:01Z",
        egress_used: false,
        source_document: "Wiretap_Intercept_Line9811_Session4.txt"
    },
    {
        finding_type: "phone_profile",
        label: "+91 80004 11200 (Vi Gujarat - VoIP Flag)",
        attributes: {
            e164: "+918000411200",
            country_code: 91,
            national_number: "8000411200",
            carrier: "Vodafone Idea Ltd",
            circle: "Gujarat",
            line_type: "voip",
            valid: true,
            anomaly: "Virtual SIP Trunk / VoIP routing detected on domestic number"
        },
        confidence: 0.88,
        source_url: null,
        tool: "phonenumbers",
        tool_args: ["IN"],
        raw_sha256: "185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969",
        collected_at: "2026-09-03T04:12:01Z",
        egress_used: false,
        source_document: "Extortion_Call_Audio_Transcript.txt"
    },
    {
        finding_type: "typosquat",
        label: "kashmere-syndicate-pay.in",
        attributes: {
            fuzzer: "omission/hyphenation",
            parent_domain: "kashmeregate-logistics.in",
            a_records: ["104.21.48.11", "172.67.182.204"],
            mx_records: ["mail.kashmere-syndicate-pay.in"],
            registered: true,
            phishing_risk: "Active MX server indicates phishing/spoofing email readiness"
        },
        confidence: 0.85,
        source_url: "http://kashmere-syndicate-pay.in",
        tool: "dnstwist",
        tool_args: ["--format", "json", "--registered", "--mx"],
        raw_sha256: "bc60f64c6dd1f5c6b9f1d8ef3ee9f2e3be04ef3be04e12e3e5b128794d4d6e91",
        collected_at: "2026-09-03T04:12:05Z",
        egress_used: true,
        source_document: "Phishing_Domain_Evidence_Link.txt"
    },
    {
        finding_type: "social_account",
        label: "telegram/imran_kg_handler",
        attributes: {
            platform: "Telegram",
            username: "imran_kg_handler",
            profile_url: "https://t.me/imran_kg_handler",
            association: "Handles bulk hawala drop dispatch communications"
        },
        confidence: 0.72,
        source_url: "https://t.me/imran_kg_handler",
        tool: "sherlock",
        tool_args: ["--print-found", "imran_kg_handler"],
        raw_sha256: "2c624232cdd221771294dfbb310aca000a0df6ac9b66b0e318f0ff91e2e15b9f",
        collected_at: "2026-09-03T04:12:30Z",
        egress_used: true,
        source_document: "Mobile_Chat_Export.txt"
    }
];
