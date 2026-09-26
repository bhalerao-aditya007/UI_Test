// src/pages/CaseView.tsx
//
// INFORMATION ARCHITECTURE REWRITE.
// Before: 14 sections in one infinite scroll behind a 14-item scrollspy rail.
// After:  the same 14 sections, grouped into four acts of an investigation and
// switched with a persistent segmented control. Only one act is mounted at a
// time, so the page is short, the graph canvas isn't fighting eleven other
// sections for frames, and the rail is a 2–6 item thread instead of a menu.
//
//   Act I   · Brief     → Fact Sheet, Narrative Brief, Audit & Confidence
//   Act II  · Network   → Knowledge Graph (4 views), Lead Board, Identity Res.
//   Act III · Evidence  → Financial, Communication, Digital, Physical, Geo, Timeline
//   Act IV  · Analysis  → Crime Theories, MO / Serial Matches
//
// Every data path (stores, services, bundles, live-analysis trigger) and every
// section's props are unchanged. `scrollToSection(id)` still works from the
// Fact Sheet and Theory Board — it now switches act first, then scrolls.

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { formatLocationString, synthesizeGraphFromFactSheet } from "../utils/factSheetSynthesizer";
import { getCaseDataBundle } from "../data/multiCaseRegistry";
import { useCasesStore } from "../store/casesStore";
import { useDocumentsStore } from "../store/documentsStore";
import Navbar from "../components/layout/Navbar";
import DocumentList from "../components/documents/DocumentList";
import Icon, { type IconName } from "../components/ui/Icon";
import TrackBadge from "../components/ui/TrackBadge";
import ConfidenceBadge from "../components/ui/ConfidenceBadge";
import Chip, { Kicker, Marker } from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";
import { CountUp, Reveal, ScrollProgress, SegmentedControl } from "../components/motion";

// Center analytics
import FactSheet from "../components/summary/FactSheet";
import LeadBoard from "../components/dashboard/analytics/LeadBoard";
import NetworkGraph from "../components/dashboard/analytics/NetworkGraph";
import GeoLocationView from "../components/dashboard/analytics/GeoLocationView";
import TimelineView from "../components/dashboard/analytics/TimelineView";
import IdentityResolutionView from "../components/dashboard/analytics/IdentityResolutionView";
import MOMatchList from "../components/dashboard/analytics/MOMatchList";
import TheoryBoard from "../components/dashboard/analytics/TheoryBoard";
import DigitalFootprint from "../components/dashboard/analytics/DigitalFootprint";

// OSINT service
import {
    getCaseOsint,
    enrichCaseOsint,
    osintFindingsToGraph,
    type OsintFinding,
} from "../services/osint";

// Drawers & modals
import CaseWorkspaceDrawer from "../components/dashboard/CaseWorkspaceDrawer";
import DeltaIngestionModal from "../components/dashboard/DeltaIngestionModal";

import {
    mockIdentityResolution,
    mockOsintFindings,
    type FactSheetData,
} from "../data/mockCaseData";
import {
    triggerHistoricalAnalysis,
    getCaseGraph,
    type GraphData,
    type AnalysisReport,
} from "../services/analytics";

/* ── Act model ─────────────────────────────────────────────────────────── */
type ActId = "brief" | "network" | "evidence" | "analysis";

const ACTS: {
    id: ActId;
    numeral: string;
    label: string;
    blurb: string;
    sections: { id: string; label: string; icon: IconName }[];
}[] = [
    {
        id: "brief",
        numeral: "I",
        label: "Brief",
        blurb: "What the file says on its face",
        sections: [
            { id: "fact-sheet", label: "Fact sheet", icon: "file-text" },
            { id: "investigative-brief", label: "Narrative brief", icon: "scale-justice" },
            { id: "audit-log", label: "Audit & confidence", icon: "check-circle" },
        ],
    },
    {
        id: "network",
        numeral: "II",
        label: "Network",
        blurb: "Who connects to whom, and how sure we are",
        sections: [
            { id: "knowledge-graph", label: "Knowledge graph", icon: "network-graph" },
            { id: "lead-board", label: "Lead board", icon: "shield" },
            { id: "identity-resolution", label: "Identity resolution", icon: "fingerprint" },
        ],
    },
    {
        id: "evidence",
        numeral: "III",
        label: "Evidence",
        blurb: "Every stream that fed the graph",
        sections: [
            { id: "financial-tracing", label: "Financial tracing", icon: "wallet" },
            { id: "communication-analysis", label: "Communication", icon: "phone-tower" },
            { id: "digital-forensics", label: "Digital forensics", icon: "terminal" },
            { id: "forensic-evidence", label: "Physical evidence", icon: "evidence-tag" },
            { id: "geo-location", label: "Geo-intelligence", icon: "map-pin" },
            { id: "timeline", label: "Chronology", icon: "clock" },
            { id: "digital-footprint", label: "Digital footprint", icon: "radar" },
        ],
    },
    {
        id: "analysis",
        numeral: "IV",
        label: "Analysis",
        blurb: "Hypotheses — never findings",
        sections: [
            { id: "theories", label: "Crime theories", icon: "scale-justice" },
            { id: "mo-matches", label: "MO / serial matches", icon: "radar" },
        ],
    },
];

const SECTION_TO_ACT: Record<string, ActId> = ACTS.reduce((acc, act) => {
    act.sections.forEach((s) => (acc[s.id] = act.id));
    return acc;
}, {} as Record<string, ActId>);

/* ── Section shell ─────────────────────────────────────────────────────── */
function Section({
    id,
    n,
    title,
    subtitle,
    icon,
    accent = "ember",
    children,
    aside,
    flush = false,
}: {
    id: string;
    n: number;
    title: string;
    subtitle?: string;
    icon: IconName;
    accent?: "ember" | "steel" | "confirmed" | "hypothesis";
    children: React.ReactNode;
    aside?: React.ReactNode;
    flush?: boolean;
}) {
    const tint =
        accent === "steel"
            ? "text-steel-300"
            : accent === "confirmed"
              ? "text-emerald-400"
              : accent === "hypothesis"
                ? "text-purple-400"
                : "text-ember-300";
    return (
        <Reveal id={id} className="scroll-mt-24">
            <section className="overflow-hidden rounded-xl border border-surface-300 bg-surface-100/60">
                <header className="flex flex-col justify-between gap-3 border-b border-surface-300/80 px-5 py-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5">
                            <Marker n={n} active />
                        </span>
                        <div>
                            <h3 className="flex items-center gap-2 font-display text-[15px] font-bold tracking-tight text-surface-900">
                                <Icon name={icon} size={15} className={tint} />
                                {title}
                            </h3>
                            {subtitle && (
                                <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-surface-500">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    {aside && <div className="shrink-0">{aside}</div>}
                </header>
                <div className={flush ? "" : "p-5"}>{children}</div>
            </section>
        </Reveal>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */

export default function CaseView() {
    const { caseId } = useParams();
    const cases = useCasesStore((state) => state.cases);
    const fetchCases = useCasesStore((state) => state.fetchCases);
    const { documents, fetchDocuments } = useDocumentsStore();

    const [act, setAct] = useState<ActId>("brief");
    const [activeSection, setActiveSection] = useState("fact-sheet");
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isDeltaModalOpen, setIsDeltaModalOpen] = useState(false);
    const [deltaDiffApplied, setDeltaDiffApplied] = useState(false);
    const [isLeftRailOpen, setIsLeftRailOpen] = useState(true);
    const [activeGraphTab, setActiveGraphTab] = useState<
        "unified" | "financial" | "telecom" | "forensic"
    >("unified");

    const [liveReport, setLiveReport] = useState<AnalysisReport | null>(null);
    const [liveGraph, setLiveGraph] = useState<GraphData | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [searchParams] = useSearchParams();
    const isDemoMode = searchParams.get("mode") !== "real";
    const [osintFindings, setOsintFindings] = useState<OsintFinding[]>([]);

    const mainScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cases.length === 0) fetchCases();
        if (caseId) {
            setLiveGraph(null);
            setLiveReport(null);
            fetchDocuments(caseId);
            getCaseGraph(caseId)
                .then((g) => {
                    if (g && g.nodes?.length > 0) setLiveGraph(g);
                })
                .catch(() => {});
        }
    }, [caseId, cases.length, fetchCases, fetchDocuments]);

    // Fetch OSINT findings (non-blocking — enrichment is always optional)
    useEffect(() => {
        if (caseId) {
            getCaseOsint(caseId)
                .then((r) => setOsintFindings(r.findings || []))
                .catch(() => setOsintFindings([]));
        }
    }, [caseId]);

    const caseData = cases.find((c) => c.id === caseId) || {
        id: caseId || "case-1",
        name: "Active case investigation",
        track: 2 as const,
        triage_reason: "Evidence ingestion underway.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const caseBundle = useMemo(
        () => getCaseDataBundle(caseId, caseData.name, documents),
        [caseId, caseData.name, documents]
    );

    const activeFactSheet = liveReport?.fact_sheet || caseBundle.factSheet;

    const safeFactSheet: FactSheetData = {
        caseId: activeFactSheet?.caseId || caseData.id,
        firNumber: activeFactSheet?.firNumber || caseBundle.firNumber,
        track: (activeFactSheet?.track ?? caseBundle.track) as 1 | 2,
        triageReason: activeFactSheet?.triageReason || caseBundle.triageReason,
        diffSummary: activeFactSheet?.diffSummary || caseBundle.factSheet.diffSummary,
        who:
            Array.isArray(activeFactSheet?.who) && activeFactSheet.who.length > 0
                ? activeFactSheet.who
                : caseBundle.factSheet.who,
        what:
            Array.isArray(activeFactSheet?.what) && activeFactSheet.what.length > 0
                ? activeFactSheet.what
                : caseBundle.factSheet.what,
        when:
            Array.isArray(activeFactSheet?.when) && activeFactSheet.when.length > 0
                ? activeFactSheet.when
                : caseBundle.factSheet.when,
        where:
            Array.isArray(activeFactSheet?.where) && activeFactSheet.where.length > 0
                ? activeFactSheet.where
                : caseBundle.factSheet.where,
        evidence:
            Array.isArray(activeFactSheet?.evidence) && activeFactSheet.evidence.length > 0
                ? activeFactSheet.evidence
                : caseBundle.factSheet.evidence,
        knownRelationships:
            Array.isArray(activeFactSheet?.knownRelationships) &&
            activeFactSheet.knownRelationships.length > 0
                ? activeFactSheet.knownRelationships
                : caseBundle.factSheet.knownRelationships,
        openGaps:
            Array.isArray(activeFactSheet?.openGaps) && activeFactSheet.openGaps.length > 0
                ? activeFactSheet.openGaps
                : caseBundle.factSheet.openGaps,
    };

    const handleRunAIAnalysis = async () => {
        if (!caseId) return;
        setIsAnalyzing(true);
        try {
            const [report, graph] = await Promise.all([
                triggerHistoricalAnalysis(caseId),
                getCaseGraph(caseId),
            ]);
            setLiveReport(report);
            if (graph && graph.nodes?.length > 0) {
                setLiveGraph(graph);
            } else {
                const synth = synthesizeGraphFromFactSheet(
                    report?.fact_sheet || safeFactSheet,
                    documents
                );
                if (synth.nodes.length > 0) setLiveGraph(synth);
            }
        } catch (err) {
            console.error("Deep AI analysis error:", err);
            const synth = synthesizeGraphFromFactSheet(safeFactSheet, documents);
            if (synth.nodes.length > 0) setLiveGraph(synth);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const activeGraph = useMemo<GraphData>(() => {
        if (activeGraphTab === "financial") return caseBundle.financialGraph;
        if (activeGraphTab === "telecom") return caseBundle.telecomGraph;
        if (activeGraphTab === "forensic") return caseBundle.forensicGraph;

        const base =
            liveGraph && liveGraph.nodes?.length > 0
                ? liveGraph
                : caseBundle.unifiedGraph;

        // Merge OSINT nodes into unified view (live findings if available; otherwise mock benchmark in demo mode)
        const effectiveOsint =
            osintFindings.length > 0
                ? osintFindings
                : isDemoMode
                  ? (mockOsintFindings as OsintFinding[])
                  : [];

        if (effectiveOsint.length > 0) {
            const anchorName =
                safeFactSheet.who?.[0]?.name || caseData.name;
            const o = osintFindingsToGraph(effectiveOsint, anchorName);
            return {
                nodes: [...(base.nodes || []), ...o.nodes],
                edges: [...(base.edges || []), ...o.edges],
            };
        }

        return base;
    }, [activeGraphTab, liveGraph, caseBundle, osintFindings, isDemoMode, safeFactSheet.who, caseData.name]);

    const dynamicIdentityData = useMemo(
        () => ({
            target: safeFactSheet.who[0]?.name || caseData.name,
            candidates: (safeFactSheet.who || []).map((w: any, idx: number) => ({
                id: `cand-${idx + 1}`,
                name: w.name,
                confidence: 95,
                source: w.citation?.documentTitle || "Case evidence",
                matchingAttributes: [
                    `Role: ${w.role || "Subject"}`,
                    ...(w.alias ? [`Alias: ${w.alias}`] : []),
                ],
                conflictingAttributes: [],
                reasoning: `Extracted directly from ${w.citation?.documentTitle || "case record"}`,
            })),
        }),
        [safeFactSheet.who, caseData.name]
    );

    /** Cross-act navigation: switch act, then scroll once the DOM has it. */
    const scrollToSection = useCallback((sectionId: string) => {
        const targetAct = SECTION_TO_ACT[sectionId];
        if (targetAct) setAct(targetAct);
        setActiveSection(sectionId);
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.getElementById(sectionId)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 60);
        });
    }, []);

    const currentAct = ACTS.find((a) => a.id === act)!;
    const graphTabs = [
        { id: "unified", label: "Syndicate", hint: "Unified heterogeneous network" },
        { id: "financial", label: "Financial", hint: "Fund flow & layering" },
        { id: "telecom", label: "Telecom", hint: "Intercepts & tower colocation" },
        { id: "forensic", label: "Forensic", hint: "Seizures & lab findings" },
    ];

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-surface-0">
            <Navbar />

            {/* ── Case header ──────────────────────────────────────────── */}
            <header className="z-20 border-b border-surface-300 bg-surface-50/80 px-4 py-3 backdrop-blur sm:px-6">
                <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/dashboard"
                            className="rounded-lg border border-surface-300 bg-surface-100 p-1.5 text-surface-500 transition-colors hover:text-surface-900"
                        >
                            <Icon name="arrow-left" size={14} />
                        </Link>

                        <div>
                            <div className="flex items-center gap-2">
                                <Kicker tone="ember">Live case file</Kicker>
                                <span className="font-mono text-[11px] text-surface-500">
                                    {caseData.id}
                                </span>
                            </div>
                            <h1 className="mt-1 font-display text-lg font-bold tracking-tight text-surface-900">
                                {caseData.name}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <TrackBadge track={caseData.track ?? 2} size="md" />

                        <button
                            type="button"
                            onClick={handleRunAIAnalysis}
                            disabled={isAnalyzing}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-ember-500 px-3.5 py-1.5 text-xs font-semibold text-surface-900 shadow-[inset_0_1px_0_0_rgba(246,242,237,0.18)] transition-colors hover:bg-ember-400 disabled:opacity-50"
                        >
                            <Icon
                                name="radar"
                                size={14}
                                className={isAnalyzing ? "animate-spin" : ""}
                            />
                            <span>{isAnalyzing ? "Synthesising…" : "Run AI analysis"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsDeltaModalOpen(true)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-surface-300 bg-surface-100 px-3 py-1.5 text-xs font-semibold text-surface-600 transition-colors hover:text-surface-900"
                        >
                            <Icon name="upload" size={14} className="text-ember-300" />
                            <span>Delta ingestion</span>
                        </button>
                    </div>
                </div>

                {/* Act switcher + case progress thread */}
                <div className="mx-auto mt-3 flex max-w-[1600px] flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <SegmentedControl
                            items={ACTS.map((a) => ({
                                id: a.id,
                                label: `${a.numeral} · ${a.label}`,
                                hint: a.blurb,
                                count: a.sections.length,
                            }))}
                            value={act}
                            onChange={(id) => {
                                setAct(id as ActId);
                                setActiveSection(
                                    ACTS.find((a) => a.id === id)?.sections[0].id || "fact-sheet"
                                );
                                mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            layoutId="act-pill"
                        />
                        <span className="hidden font-mono text-[11px] text-surface-500 md:inline">
                            {currentAct.blurb}
                        </span>
                    </div>
                    <ScrollProgress targetRef={mainScrollRef} />
                </div>
            </header>

            {/* ── Body ─────────────────────────────────────────────────── */}
            <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 overflow-hidden">
                {/* Left: exhibit rail */}
                <aside
                    className={`flex shrink-0 flex-col border-r border-surface-300 bg-surface-50/50 transition-all duration-300 ${
                        isLeftRailOpen ? "w-80" : "w-12 items-center"
                    }`}
                >
                    <div className="flex items-center justify-between border-b border-surface-300 p-3">
                        {isLeftRailOpen && (
                            <div>
                                <Kicker tone="steel">Exhibits</Kicker>
                                <div className="mt-1 font-mono text-[11px] text-surface-500">
                                    <CountUp
                                        value={
                                            documents.length > 0
                                                ? documents.length
                                                : caseBundle.factSheet.evidence?.length || 0
                                        }
                                        className="text-surface-800"
                                    />{" "}
                                    on file
                                </div>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsLeftRailOpen(!isLeftRailOpen)}
                            className="rounded p-1 text-surface-500 transition-colors hover:text-surface-800"
                            title={isLeftRailOpen ? "Collapse rail" : "Expand rail"}
                        >
                            <Icon
                                name={isLeftRailOpen ? "chevron-right" : "file-text"}
                                size={14}
                            />
                        </button>
                    </div>

                    {isLeftRailOpen && (
                        <div className="flex-1 overflow-y-auto p-3">
                            <DocumentList documents={documents} />
                        </div>
                    )}
                </aside>

                {/* Centre: the current act */}
                <main
                    ref={mainScrollRef}
                    className="flex-1 overflow-y-auto scroll-smooth px-4 py-6 sm:px-6 lg:px-8"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={act}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col gap-6"
                        >
                            {/* ACT I — BRIEF */}
                            {act === "brief" && (
                                <>
                                    <div id="fact-sheet" className="scroll-mt-24">
                                        <FactSheet
                                            data={safeFactSheet}
                                            caseId={caseData.id}
                                            isEmbedded
                                            showDiffIndicator={deltaDiffApplied}
                                            onJumpToSection={scrollToSection}
                                        />
                                    </div>

                                    <Section
                                        id="investigative-brief"
                                        n={2}
                                        icon="file-text"
                                        title="Investigative brief & judicial narrative"
                                        subtitle="Cited natural-language brief compliant with Section 105 of the Bharatiya Sakshya Adhiniyam (BSA), 2023."
                                    >
                                        <div className="bg-case-paper space-y-3 rounded-lg border border-surface-300/70 p-5 text-xs leading-relaxed text-surface-600">
                                            <p>
                                                The active investigation in{" "}
                                                <strong className="text-surface-900">{caseData.name}</strong>{" "}
                                                incorporates{" "}
                                                <span className="font-mono text-surface-800">
                                                    {documents.length}
                                                </span>{" "}
                                                ingested evidence stream(s). Recorded statutory offences
                                                include{" "}
                                                <span className="font-mono font-semibold text-surface-900">
                                                    {safeFactSheet.what.map((w: any) => w.bnsSection).join(", ") ||
                                                        caseBundle.briefSummary.statutoryOffences}
                                                </span>
                                                .
                                            </p>
                                            <p>
                                                Primary named individuals and suspected actors identified in
                                                the case record:{" "}
                                                <span className="font-semibold text-surface-900">
                                                    {safeFactSheet.who
                                                        .map((w: any) => `${w.name} (${w.role})`)
                                                        .join(", ") || caseBundle.briefSummary.namedIndividuals}
                                                </span>
                                                . Incident jurisdiction is documented under{" "}
                                                <span className="font-semibold text-surface-900">
                                                    {safeFactSheet.where
                                                        .map((wh: any) => formatLocationString(wh.locationName))
                                                        .join("; ") || caseBundle.briefSummary.jurisdiction}
                                                </span>
                                                .
                                            </p>
                                            <p className="border-t border-surface-300/60 pt-3 font-mono text-[11px] italic text-surface-500">
                                                Ingestion status:{" "}
                                                {documents.map((d) => `${d.title}: ${d.status}`).join(", ") ||
                                                    "no active documents"}
                                            </p>
                                        </div>
                                    </Section>

                                    <Section
                                        id="audit-log"
                                        n={3}
                                        icon="check-circle"
                                        accent="confirmed"
                                        title="Audit & confidence ledger"
                                        subtitle="Leads, not verdicts — a transparent log of algorithmic merges, anomaly detections and human verifications."
                                    >
                                        <div className="space-y-2 font-mono text-xs">
                                            {documents.length > 0
                                                ? documents.map((d) => (
                                                      <div
                                                          key={d.id}
                                                          className="flex flex-col justify-between gap-2 rounded-lg border border-surface-300 bg-surface-0/50 p-2.5 sm:flex-row sm:items-center"
                                                      >
                                                          <div className="flex min-w-0 items-center gap-2.5">
                                                              <span className="shrink-0 font-bold text-ember-300">
                                                                  {new Date(d.created_at).toLocaleTimeString()}
                                                              </span>
                                                              <span className="font-semibold text-surface-800">
                                                                  Ingestion
                                                              </span>
                                                              <span className="truncate text-surface-600">
                                                                  {d.title} ({d.document_type}) ·{" "}
                                                                  {d.status.toUpperCase()}
                                                              </span>
                                                          </div>
                                                          <ConfidenceBadge score={0.97} size="sm" />
                                                      </div>
                                                  ))
                                                : caseBundle.auditEntries.map((a) => (
                                                      <div
                                                          key={a.id}
                                                          className="flex flex-col justify-between gap-2 rounded-lg border border-surface-300 bg-surface-0/50 p-2.5 sm:flex-row sm:items-center"
                                                      >
                                                          <div className="flex min-w-0 items-center gap-2.5">
                                                              <span className="shrink-0 font-bold text-ember-300">
                                                                  {a.time}
                                                              </span>
                                                              <span className="font-semibold text-surface-800">
                                                                  {a.event}
                                                              </span>
                                                              <span className="truncate text-surface-600">
                                                                  {a.detail}
                                                              </span>
                                                          </div>
                                                          <ConfidenceBadge score={a.confidence} size="sm" />
                                                      </div>
                                                  ))}
                                        </div>
                                    </Section>
                                </>
                            )}

                            {/* ACT II — NETWORK */}
                            {act === "network" && (
                                <>
                                    <Section
                                        id="knowledge-graph"
                                        n={1}
                                        icon="network-graph"
                                        title="Multi-modal heterogeneous knowledge graph"
                                        subtitle="Confirmed evidentiary links are solid; GNN-predicted links are dashed, violet and opt-in — hypotheses, never findings."
                                        aside={
                                            <SegmentedControl
                                                size="sm"
                                                layoutId="graph-view-pill"
                                                items={graphTabs}
                                                value={activeGraphTab}
                                                onChange={(id) => setActiveGraphTab(id as any)}
                                            />
                                        }
                                    >
                                        <div className="h-[520px] w-full">
                                            <NetworkGraph
                                                data={activeGraph}
                                                theme={
                                                    activeGraphTab === "financial"
                                                        ? "financial"
                                                        : activeGraphTab === "telecom"
                                                          ? "communication"
                                                          : activeGraphTab === "forensic"
                                                            ? "evidence"
                                                            : "digital"
                                                }
                                                onNodeClick={(node) => setSelectedItem(node)}
                                            />
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px] text-surface-500">
                                            <Chip tone="steel" size="xs">
                                                {activeGraph.nodes?.length ?? 0} nodes
                                            </Chip>
                                            <Chip tone="steel" size="xs">
                                                {activeGraph.edges?.length ?? 0} edges
                                            </Chip>
                                            <span>Click any node to open the inspector.</span>
                                        </div>
                                    </Section>

                                    <Section
                                        id="lead-board"
                                        n={2}
                                        icon="shield"
                                        accent="hypothesis"
                                        title="Investigative lead board"
                                        subtitle="Phantom-entity lifecycle: unconfirmed node slots, partial identifiers and operational subpoena requests."
                                        flush
                                    >
                                        <div className="p-5">
                                            <LeadBoard
                                                data={
                                                    liveReport?.priority_leads &&
                                                    liveReport.priority_leads.length > 0
                                                        ? liveReport.priority_leads.map((lead) => ({
                                                              id: lead.entity_id,
                                                              title: lead.display_name,
                                                              phantomType: "person" as const,
                                                              confidenceScore: Math.max(
                                                                  0.75,
                                                                  lead.score || 0.85
                                                              ),
                                                              status: "open" as const,
                                                              dateIdentified: "Live inference",
                                                              sourceDocument: "AstraX model linker",
                                                              partialAttributes: {
                                                                  gnn_probability:
                                                                      lead.components?.gnn_probability &&
                                                                      lead.components.gnn_probability > 0
                                                                          ? `${(lead.components.gnn_probability * 100).toFixed(1)}%`
                                                                          : "88.4%",
                                                                  centrality:
                                                                      lead.components?.centrality &&
                                                                      lead.components.centrality > 0
                                                                          ? `${(lead.components.centrality * 100).toFixed(1)}%`
                                                                          : "82.1%",
                                                                  mo_similarity:
                                                                      lead.components?.mo_similarity &&
                                                                      lead.components.mo_similarity > 0
                                                                          ? `${(lead.components.mo_similarity * 100).toFixed(1)}%`
                                                                          : "91.5%",
                                                              },
                                                              recommendedAction:
                                                                  "Cross-reference vehicle and communication records",
                                                          }))
                                                        : caseBundle.leads
                                                }
                                                onSelectLead={(lead) => setSelectedItem(lead)}
                                            />
                                        </div>
                                    </Section>

                                    <Section
                                        id="identity-resolution"
                                        n={3}
                                        icon="fingerprint"
                                        title="Entity de-duplication & identity resolution"
                                        subtitle="Cross-system disambiguation of aliases, phonetic variants and KYC records."
                                        flush
                                    >
                                        <div className="p-5">
                                            <IdentityResolutionView
                                                data={
                                                    dynamicIdentityData.candidates.length > 0
                                                        ? dynamicIdentityData
                                                        : mockIdentityResolution
                                                }
                                                onSelectCandidate={(cand) => setSelectedItem(cand)}
                                            />
                                        </div>
                                    </Section>
                                </>
                            )}

                            {/* ACT III — EVIDENCE STREAMS */}
                            {act === "evidence" && (
                                <>
                                    <Section
                                        id="financial-tracing"
                                        n={1}
                                        icon="wallet"
                                        accent="confirmed"
                                        title="Financial tracing & transaction telemetry"
                                        subtitle="Fund-flow tracking, structuring alerts and outward layering vectors."
                                    >
                                        <div className="h-[360px] w-full">
                                            <NetworkGraph
                                                data={caseBundle.financialGraph}
                                                theme="financial"
                                                showControls={false}
                                                onNodeClick={(node) => setSelectedItem(node)}
                                            />
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Kicker tone="ember">{caseBundle.structuringTitle}</Kicker>
                                                <span className="font-mono text-[10px] text-amber-300">
                                                    {caseBundle.structuringSubtitle}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                                {(Array.isArray(caseBundle.structuringAlerts)
                                                    ? caseBundle.structuringAlerts
                                                    : []
                                                ).map((alert: any) => (
                                                    <div
                                                        key={alert.id}
                                                        className="flex flex-col justify-between gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/6 p-3 text-xs"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="truncate font-mono font-bold text-amber-300">
                                                                {alert.accountNumber}
                                                            </span>
                                                            <Chip tone="alert" size="xs">
                                                                PMLA §3
                                                            </Chip>
                                                        </div>
                                                        <div className="text-[11px] text-surface-600">
                                                            Inflow{" "}
                                                            <strong className="font-mono text-surface-800">
                                                                {alert.totalAmount}
                                                            </strong>{" "}
                                                            · {alert.bankName} · {alert.transactionCount} txns
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Section>

                                    <Section
                                        id="communication-analysis"
                                        n={2}
                                        icon="phone-tower"
                                        accent="steel"
                                        title={caseBundle.telecomSummary.title}
                                        subtitle={caseBundle.telecomSummary.description}
                                    >
                                        <div className="h-[380px] w-full">
                                            <NetworkGraph
                                                data={caseBundle.telecomGraph}
                                                theme="communication"
                                                showControls={false}
                                                onNodeClick={(node) => setSelectedItem(node)}
                                            />
                                        </div>
                                    </Section>

                                    <Section
                                        id="digital-forensics"
                                        n={3}
                                        icon="terminal"
                                        accent="steel"
                                        title="Digital forensics & file carving"
                                        subtitle="Parsed digital evidence files, certificates and media artefacts."
                                    >
                                        {documents.length === 0 ? (
                                            <EmptyState
                                                dense
                                                icon="terminal"
                                                title="No digital exhibits registered"
                                                body="Ingest device images, logs or media through evidence intake to populate the carving queue."
                                                stamp="0 artefacts"
                                            />
                                        ) : (
                                            <div className="space-y-2 font-mono text-xs">
                                                {documents.map((d) => (
                                                    <div
                                                        key={d.id}
                                                        className="flex items-center justify-between gap-3 rounded-lg border border-surface-300 bg-surface-0/50 p-2.5"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <Icon
                                                                name="file-text"
                                                                size={14}
                                                                className="shrink-0 text-surface-500"
                                                            />
                                                            <span className="truncate font-semibold text-surface-800">
                                                                {d.title}
                                                            </span>
                                                            <span className="shrink-0 text-surface-500">
                                                                ({d.document_type})
                                                            </span>
                                                        </div>
                                                        <Chip tone="confirmed" size="xs">
                                                            {d.status}
                                                        </Chip>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Section>

                                    <Section
                                        id="forensic-evidence"
                                        n={4}
                                        icon="evidence-tag"
                                        title={caseBundle.forensicSummary.title}
                                        subtitle={caseBundle.forensicSummary.description}
                                    >
                                        <div className="h-[380px] w-full">
                                            <NetworkGraph
                                                data={caseBundle.forensicGraph}
                                                theme="evidence"
                                                showControls={false}
                                                onNodeClick={(node) => setSelectedItem(node)}
                                            />
                                        </div>
                                    </Section>

                                    <Section
                                        id="geo-location"
                                        n={5}
                                        icon="map-pin"
                                        title="Geospatial intelligence & movement route"
                                        subtitle="Chronological movement vector and mapped incident jurisdictions (offline plate — no external tiles)."
                                        flush
                                    >
                                        <div className="h-[460px] w-full p-5 pt-0">
                                            <GeoLocationView onSelect={(item) => setSelectedItem(item)} />
                                        </div>
                                    </Section>

                                    <Section
                                        id="timeline"
                                        n={6}
                                        icon="clock"
                                        title="Chronological crime timeline"
                                        subtitle="Verified sequence of physical and digital incidents cross-referenced with forensic timestamps."
                                        flush
                                    >
                                        <div className="p-5">
                                            <TimelineView onSelect={(item) => setSelectedItem(item)} />
                                        </div>
                                    </Section>

                                    <Section
                                        id="digital-footprint"
                                        n={7}
                                        icon="radar"
                                        accent="steel"
                                        title="Digital footprint — OSINT source adapters"
                                        subtitle="ExifTool, libphonenumber, dnstwist, Sherlock. Public-record tier only — every finding is hash-anchored and carries its collection timestamp."
                                    >
                                        <DigitalFootprint
                                            caseId={caseData.id}
                                            isDemoMode={isDemoMode}
                                        />
                                    </Section>
                                </>
                            )}

                            {/* ACT IV — ANALYSIS */}
                            {act === "analysis" && (
                                <>
                                    <Section
                                        id="theories"
                                        n={1}
                                        icon="scale-justice"
                                        accent="hypothesis"
                                        title="Crime reconstruction theories"
                                        subtitle="Multi-hypothesis event sequences synthesised by link analysis. Permanently labelled as hypotheses."
                                        flush
                                    >
                                        <div className="p-5">
                                            <TheoryBoard
                                                data={
                                                    liveReport?.theories && liveReport.theories.length > 0
                                                        ? liveReport.theories
                                                        : caseBundle.theories
                                                }
                                                onJumpToLead={scrollToSection}
                                            />
                                        </div>
                                    </Section>

                                    <Section
                                        id="mo-matches"
                                        n={2}
                                        icon="radar"
                                        title="Modus operandi & serial-crime linkage"
                                        subtitle="Cross-jurisdictional case vector matching across geospatial, temporal and narrative dimensions."
                                        flush
                                    >
                                        <div className="p-5">
                                            <MOMatchList
                                                data={
                                                    liveReport?.mo_matches?.matched_historical_cases &&
                                                    liveReport.mo_matches.matched_historical_cases.length > 0
                                                        ? liveReport.mo_matches.matched_historical_cases
                                                        : caseBundle.moMatches
                                                }
                                            />
                                        </div>
                                    </Section>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Right: act thread (2–6 items, not 14) */}
                <aside className="hidden w-52 shrink-0 flex-col gap-3 border-l border-surface-300 bg-surface-50/40 p-4 xl:flex">
                    <div>
                        <Kicker tone="ember">{`Act ${currentAct.numeral}`}</Kicker>
                        <p className="mt-1.5 text-xs text-surface-500">{currentAct.blurb}</p>
                    </div>

                    <nav className="relative flex flex-col gap-1 pl-3">
                        {/* self-drawing thread */}
                        <motion.span
                            key={act}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            style={{ originY: 0 }}
                            className="absolute left-0 top-2 h-[calc(100%-16px)] w-px bg-gradient-to-b from-ember-500/70 via-surface-400 to-transparent"
                        />
                        {currentAct.sections.map((s) => {
                            const isActive = activeSection === s.id;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => scrollToSection(s.id)}
                                    className={`relative flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                                        isActive
                                            ? "bg-ember-500/10 font-semibold text-ember-200"
                                            : "text-surface-600 hover:bg-surface-200/50 hover:text-surface-900"
                                    }`}
                                >
                                    <span
                                        className={`absolute -left-3 h-1.5 w-1.5 rounded-full ${
                                            isActive ? "bg-ember-400" : "bg-surface-400"
                                        }`}
                                    />
                                    <Icon name={s.icon} size={12} />
                                    <span className="truncate">{s.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto rounded-lg border border-purple-500/35 bg-purple-500/6 p-2.5">
                        <p className="font-mono text-[10px] leading-relaxed text-purple-300">
                            Investigative hypothesis — not a finding. Every dashed link and violet
                            node on this file is a lead requiring human corroboration.
                        </p>
                    </div>
                </aside>
            </div>

            <CaseWorkspaceDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />

            <DeltaIngestionModal
                caseId={caseData.id}
                isOpen={isDeltaModalOpen}
                onClose={() => setIsDeltaModalOpen(false)}
                onDeltaComplete={() => setDeltaDiffApplied(true)}
            />
        </div>
    );
}
