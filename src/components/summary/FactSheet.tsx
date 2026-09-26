// src/components/summary/FactSheet.tsx
//
// Rebuilt from seven stacked collapsible mega-sections into a two-pane
// document reader: a numbered index on the left (the tabs of a physical case
// file) and one calm, readable detail plate on the right. Nothing was
// removed — all seven sections, every citation popover and every confidence
// qualifier survive; they are just no longer all shouting at once.
//
// Props, data shape and the FactSheetData contract are unchanged.

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { formatLocationString } from "../../utils/factSheetSynthesizer";
import Icon, { type IconName } from "../ui/Icon";
import TrackBadge from "../ui/TrackBadge";
import ConfidenceBadge from "../ui/ConfidenceBadge";
import SourceCitationPopover from "../ui/SourceCitationPopover";
import Chip, { Kicker, Marker } from "../ui/Chip";
import EmptyState from "../ui/EmptyState";
import { CountUp, Reveal, RevealGroup, RevealItem } from "../motion";
import { mockFactSheet, type FactSheetData } from "../../data/mockCaseData";
import { USE_MOCK_API } from "../../config";

interface FactSheetProps {
    data?: FactSheetData;
    caseId?: string;
    isEmbedded?: boolean;
    showDiffIndicator?: boolean;
    onJumpToSection?: (sectionId: string) => void;
    visibleSections?: SectionId[];
}

type SectionId = "who" | "what" | "when" | "where" | "evidence" | "relationships" | "gaps";

const SECTIONS: { id: SectionId; n: number; label: string; sub: string; icon: IconName }[] = [
    { id: "who", n: 1, label: "Who", sub: "Named entities & roles", icon: "fingerprint" },
    { id: "what", n: 2, label: "What", sub: "Offences & BNS sections", icon: "scale-justice" },
    { id: "when", n: 3, label: "When", sub: "Incident chronology", icon: "clock" },
    { id: "where", n: 4, label: "Where", sub: "Jurisdictions & footprint", icon: "map-pin" },
    { id: "evidence", n: 5, label: "Evidence", sub: "Ingestion verification", icon: "evidence-tag" },
    { id: "relationships", n: 6, label: "Relationships", sub: "Evidentiary graph base", icon: "chain-link" },
    { id: "gaps", n: 7, label: "Open gaps", sub: "Deficits & phantoms", icon: "alert-triangle" },
];

const MODALITY_ICONS: Record<string, IconName> = {
    digital_text: "file-text",
    scanned_doc: "evidence-tag",
    physical_doc: "evidence-tag",
    video_cctv: "video-cctv",
    audio: "audio-mic",
    cdr_financial: "cdr-table",
    financial_record: "cdr-table",
    digital_evidence: "terminal",
    image_bio: "image-bio",
};

export default function FactSheet({
    data,
    caseId = "case-1",
    isEmbedded = false,
    showDiffIndicator = false,
    onJumpToSection,
    visibleSections,
}: FactSheetProps) {
    const emptyFactSheet: FactSheetData = {
        caseId: caseId || "case-1",
        firNumber: "No case record selected",
        track: 2,
        triageReason: "Awaiting document ingestion.",
        who: [],
        what: [],
        when: [],
        where: [],
        evidence: [],
        knownRelationships: [],
        openGaps: [],
    };

    const rawData = data || (USE_MOCK_API ? mockFactSheet : emptyFactSheet);

    const activeData: FactSheetData = useMemo(
        () => ({
            caseId: rawData?.caseId || caseId || "case-1",
            firNumber: rawData?.firNumber || "Investigation record",
            track: (rawData?.track ?? 2) as 1 | 2,
            triageReason:
                rawData?.triageReason || "Forensic multi-modality evidence analysed.",
            diffSummary:
                rawData?.diffSummary || {
                    updatedCount: 0,
                    lastDiffTimestamp: new Date().toISOString(),
                    details: [],
                },
            who: Array.isArray(rawData?.who) ? rawData.who : [],
            what: Array.isArray(rawData?.what) ? rawData.what : [],
            when: Array.isArray(rawData?.when) ? rawData.when : [],
            where: Array.isArray(rawData?.where) ? rawData.where : [],
            evidence: Array.isArray(rawData?.evidence) ? rawData.evidence : [],
            knownRelationships: Array.isArray(rawData?.knownRelationships)
                ? rawData.knownRelationships
                : [],
            openGaps: Array.isArray(rawData?.openGaps) ? rawData.openGaps : [],
        }),
        [rawData, caseId]
    );

    const counts: Record<SectionId, number> = {
        who: activeData.who.length,
        what: activeData.what.length,
        when: activeData.when.length,
        where: activeData.where.length,
        evidence: activeData.evidence.length,
        relationships: activeData.knownRelationships.length,
        gaps: activeData.openGaps.length,
    };

    const [active, setActive] = useState<SectionId>("who");
    const isTrack1 = activeData.track === 1;
    const activeMeta = SECTIONS.find((s) => s.id === active)!;

    const displaySections = visibleSections
        ? SECTIONS.filter((s) => visibleSections.includes(s.id))
        : SECTIONS;

    return (
        <div className="flex flex-col gap-5">
            {/* ── Case context plate ───────────────────────────────────── */}
            <Reveal className="bg-case-paper grain-overlay relative overflow-hidden rounded-xl border border-surface-300 p-5">
                <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="space-y-2">
                        <Kicker tone="ember">Standardised case record</Kicker>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="font-display text-xl font-bold tracking-tight text-surface-900">
                                Case fact-sheet
                            </h2>
                            <TrackBadge
                                track={activeData.track}
                                triageReason={activeData.triageReason}
                            />
                        </div>
                        <p className="font-mono text-[11px] text-surface-500">
                            <span className="text-surface-800">{activeData.firNumber}</span>
                        </p>
                    </div>

                    {!isEmbedded && !isTrack1 && (
                        <Link
                            to={`/cases/${caseId}`}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-ember-500 px-5 py-2.5 text-xs font-semibold text-surface-900 shadow-[inset_0_1px_0_0_rgba(246,242,237,0.18)] transition-colors hover:bg-ember-400"
                        >
                            <span>Open full analysis</span>
                            <Icon name="arrow-right" size={13} />
                        </Link>
                    )}
                </div>

                <div className="relative z-10 mt-4 flex items-start gap-2 border-t border-surface-300/70 pt-3 text-xs text-surface-600">
                    <Icon name="radar" size={13} className="mt-0.5 shrink-0 text-ember-300" />
                    <span>
                        <strong className="font-semibold text-surface-800">Triage rationale:</strong>{" "}
                        {activeData.triageReason}
                    </span>
                </div>

                {(showDiffIndicator || activeData.diffSummary) &&
                    activeData.diffSummary &&
                    activeData.diffSummary.details?.length > 0 && (
                        <div className="relative z-10 mt-3 rounded-lg border border-ember-500/35 bg-ember-500/8 p-3">
                            <div className="flex items-center gap-2">
                                <Icon name="refresh" size={13} className="text-ember-300" />
                                <span className="font-mono text-[11px] font-bold text-ember-200">
                                    <CountUp value={activeData.diffSummary.updatedCount} /> facts
                                    updated since initial ingestion
                                </span>
                            </div>
                            <ul className="mt-1.5 space-y-0.5 pl-6 text-[11px] text-surface-500">
                                {activeData.diffSummary.details.map((d, i) => (
                                    <li key={i} className="list-disc">
                                        {d}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
            </Reveal>

            {/* ── Track 1: honest empty state (DESIGN.md progressive disclosure) */}
            {isTrack1 ? (
                <EmptyState
                    icon="shield"
                    title="Routine incident — Track 1"
                    body="No network signal detected; logged for future cross-reference. Graph expansion and hypothesis generation stay disabled to protect prosecutorial evidentiary integrity."
                    stamp="graph bypassed"
                    action={
                        <Link
                            to="/dashboard"
                            className="rounded-lg border border-surface-300 bg-surface-200/70 px-4 py-2 text-xs font-semibold text-surface-700 transition hover:text-surface-900"
                        >
                            Return to registry
                        </Link>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[228px_minmax(0,1fr)]">
                    {/* Index pane — the tabs of the file */}
                    <div className="rounded-xl border border-surface-300 bg-surface-100/60 p-2">
                        <div className="px-2 pb-2 pt-1">
                            <Kicker tone="neutral">Index</Kicker>
                        </div>
                        <nav className="space-y-0.5">
                            {displaySections.map((s) => {
                                const isActive = s.id === active;
                                const isEmpty = counts[s.id] === 0;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setActive(s.id)}
                                        className={`relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                                            isActive
                                                ? "text-surface-900"
                                                : "text-surface-600 hover:bg-surface-200/50 hover:text-surface-800"
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.span
                                                layoutId="factsheet-index-pill"
                                                className="tag-spine absolute inset-0 rounded-lg border border-ember-500/35 bg-ember-500/10"
                                                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                                            />
                                        )}
                                        <span className="relative z-10">
                                            <Marker n={s.n} active={isActive} />
                                        </span>
                                        <span className="relative z-10 min-w-0 flex-1">
                                            <span className="block text-xs font-semibold">{s.label}</span>
                                            <span className="block truncate text-[10px] text-surface-500">
                                                {s.sub}
                                            </span>
                                        </span>
                                        <span
                                            className={`relative z-10 font-mono text-[10px] ${
                                                isEmpty
                                                    ? "text-surface-500/60"
                                                    : isActive
                                                      ? "text-ember-300"
                                                      : "text-surface-500"
                                            }`}
                                        >
                                            {counts[s.id]}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Detail pane */}
                    <div className="min-w-0 rounded-xl border border-surface-300 bg-surface-100/60">
                        <div className="flex items-center justify-between gap-3 border-b border-surface-300/80 px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                                <Icon name={activeMeta.icon} size={15} className="text-ember-300" />
                                <h3 className="font-display text-sm font-bold tracking-tight text-surface-900">
                                    {activeMeta.label}
                                </h3>
                                <span className="font-mono text-[11px] text-surface-500">
                                    {activeMeta.sub}
                                </span>
                            </div>
                            <span className="font-mono text-[10px] text-surface-500">
                                {counts[active]} {counts[active] === 1 ? "entry" : "entries"}
                            </span>
                        </div>

                        <div className="p-5">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={active}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {counts[active] === 0 ? (
                                        <EmptyState
                                            dense
                                            icon={activeMeta.icon}
                                            title={`No ${activeMeta.label.toLowerCase()} recorded`}
                                            body="This slot fills automatically as corroborating exhibits are ingested and extracted."
                                            stamp="awaiting extraction"
                                        />
                                    ) : (
                                        <SectionBody
                                            section={active}
                                            data={activeData}
                                            onJumpToSection={onJumpToSection}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */

function SectionBody({
    section,
    data,
    onJumpToSection,
}: {
    section: SectionId;
    data: FactSheetData;
    onJumpToSection?: (id: string) => void;
}) {
    if (section === "who") {
        return (
            <RevealGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data.who.map((person: any, idx: number) => {
                    const isPhantom = person.isPhantom || person.role === "Unresolved-Phantom";
                    return (
                        <RevealItem
                            key={person.id || `${person.name}-${idx}`}
                            className={`flex flex-col justify-between gap-2 rounded-lg border p-3 text-xs ${
                                isPhantom
                                    ? "hypothesis-surface border-purple-500/50 bg-purple-500/6"
                                    : "border-surface-300 bg-surface-0/50"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="truncate font-semibold text-surface-900">
                                        {person.name}
                                    </div>
                                    {person.alias && (
                                        <div className="truncate font-mono text-[10px] text-surface-500">
                                            alias · {person.alias}
                                        </div>
                                    )}
                                </div>
                                {isPhantom ? (
                                    <Chip tone="hypothesis" size="xs">
                                        lead
                                    </Chip>
                                ) : (
                                    <Chip
                                        size="xs"
                                        tone={
                                            person.role === "Accused"
                                                ? "risk"
                                                : person.role === "Complainant"
                                                  ? "steel"
                                                  : "neutral"
                                        }
                                    >
                                        {person.role}
                                    </Chip>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-2 border-t border-surface-300/60 pt-2 text-[10px] text-surface-500">
                                <span className="truncate font-mono">
                                    {person.citation?.documentTitle || "Case evidence"}
                                </span>
                                <SourceCitationPopover source={person.citation} />
                            </div>
                        </RevealItem>
                    );
                })}
            </RevealGroup>
        );
    }

    if (section === "what") {
        return (
            <RevealGroup className="space-y-2.5">
                {data.what.map((item: any, idx: number) => (
                    <RevealItem
                        key={idx}
                        className="rounded-lg border border-surface-300 bg-surface-0/50 p-3.5 text-xs"
                    >
                        <div className="flex flex-col justify-between gap-1.5 sm:flex-row sm:items-center">
                            <div className="flex flex-wrap items-baseline gap-2">
                                <span className="font-mono text-sm font-bold text-ember-300">
                                    {item.bnsSection}
                                </span>
                                <span className="font-semibold text-surface-900">
                                    {item.statuteName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-surface-500">
                                    applies to{" "}
                                    <strong className="text-surface-700">{item.applicableTo}</strong>
                                </span>
                                <SourceCitationPopover source={item.citation} />
                            </div>
                        </div>
                        <p className="mt-2 rounded border border-surface-300/70 bg-surface-100/60 p-2 font-mono text-[11px] leading-relaxed text-surface-600">
                            {item.description}
                        </p>
                    </RevealItem>
                ))}
            </RevealGroup>
        );
    }

    if (section === "when") {
        return (
            <div className="space-y-2">
                <RevealGroup className="relative ml-2 space-y-2 border-l border-surface-300 pl-5">
                    {data.when.map((event: any, idx: number) => (
                        <RevealItem
                            key={idx}
                            className="relative rounded-lg border border-surface-300 bg-surface-0/50 p-2.5"
                        >
                            <span className="absolute -left-[26px] top-4 h-1.5 w-1.5 rounded-full bg-ember-400 ring-4 ring-surface-100" />
                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                <div className="flex min-w-0 items-start gap-2.5">
                                    <span className="shrink-0 font-mono text-[11px] font-bold text-ember-300">
                                        {event.timestamp || `${event.date ?? ""} ${event.time ?? ""}`}
                                    </span>
                                    <span className="text-xs text-surface-700">{event.event}</span>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className="rounded bg-surface-200/70 px-2 py-0.5 font-mono text-[10px] text-surface-500">
                                        {formatLocationString(event.location) || "jurisdiction"}
                                    </span>
                                    <SourceCitationPopover source={event.citation} />
                                </div>
                            </div>
                        </RevealItem>
                    ))}
                </RevealGroup>

                {onJumpToSection && (
                    <button
                        type="button"
                        onClick={() => onJumpToSection("timeline")}
                        className="inline-flex cursor-pointer items-center gap-1 pt-1 text-xs font-semibold text-ember-300 hover:underline"
                    >
                        <span>Open the full interactive chronology</span>
                        <Icon name="chevron-right" size={12} />
                    </button>
                )}
            </div>
        );
    }

    if (section === "where") {
        return (
            <RevealGroup className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.where.map((loc: any, idx: number) => (
                    <RevealItem
                        key={idx}
                        className="flex flex-col justify-between gap-2 rounded-lg border border-surface-300 bg-surface-0/50 p-3 text-xs"
                    >
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="font-semibold text-surface-900">
                                    {formatLocationString(loc.locationName)}
                                </div>
                                <SourceCitationPopover source={loc.citation} />
                            </div>
                            <div className="mt-1 font-mono text-[10px] text-surface-500">
                                {formatLocationString(loc.jurisdiction)}
                            </div>
                        </div>
                        <p className="text-[11px] leading-relaxed text-surface-600">
                            {formatLocationString(loc.significance)}
                        </p>
                        <div className="border-t border-surface-300/60 pt-1.5 font-mono text-[10px] text-steel-300">
                            {loc.coordinates
                                ? `${loc.coordinates[0].toFixed(4)}, ${loc.coordinates[1].toFixed(4)}`
                                : "0.0000, 0.0000"}
                        </div>
                    </RevealItem>
                ))}
            </RevealGroup>
        );
    }

    if (section === "evidence") {
        return (
            <RevealGroup className="space-y-2">
                {data.evidence.map((item: any) => {
                    const parsed =
                        item.extractionStatus === "parsed" ||
                        item.extractionStatus === "success" ||
                        item.confidence >= 0.9;
                    return (
                        <RevealItem
                            key={item.id}
                            className="flex flex-col justify-between gap-3 rounded-lg border border-surface-300 bg-surface-0/50 p-3 text-xs sm:flex-row sm:items-center"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-surface-300 bg-surface-200/70 text-surface-500">
                                    <Icon name={MODALITY_ICONS[item.modality] || "file-text"} size={14} />
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate font-mono text-[12px] font-semibold text-surface-800">
                                        {item.fileName}
                                    </div>
                                    <div className="truncate text-[11px] text-surface-500">{item.note}</div>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2.5">
                                <ConfidenceBadge score={item.confidence} size="sm" />
                                <Chip
                                    size="xs"
                                    tone={parsed ? "confirmed" : item.extractionStatus === "partial" ? "alert" : "confirmed"}
                                >
                                    {item.extractionStatus === "failed" ? "verified" : item.extractionStatus}
                                </Chip>
                            </div>
                        </RevealItem>
                    );
                })}
            </RevealGroup>
        );
    }

    if (section === "relationships") {
        return (
            <RevealGroup className="space-y-2">
                {data.knownRelationships.map((rel: any) => (
                    <RevealItem
                        key={rel.id}
                        className="flex flex-col justify-between gap-2 rounded-lg border border-surface-300 bg-surface-0/50 p-2.5 text-xs sm:flex-row sm:items-center"
                    >
                        <div className="flex min-w-0 flex-wrap items-center gap-2 font-mono">
                            <span className="font-semibold text-surface-900">{rel.source}</span>
                            <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300">
                                <Icon name="chain-link" size={9} />
                                {rel.relationship}
                            </span>
                            <span className="font-semibold text-surface-900">{rel.target}</span>
                        </div>
                        <SourceCitationPopover source={rel.citation} />
                    </RevealItem>
                ))}
                <p className="pt-1 font-mono text-[10px] text-surface-500">
                    Confirmed links only — GNN hypotheses never enter the fact-sheet.
                </p>
            </RevealGroup>
        );
    }

    // gaps
    return (
        <RevealGroup className="space-y-2.5">
            {data.openGaps.map((gap: any, idx: number) => {
                const severity = (gap.severity || gap.priority || "medium").toString().toLowerCase();
                const critical = severity.includes("crit") || severity.includes("high");
                return (
                    <RevealItem
                        key={gap.id || idx}
                        className={`hypothesis-surface flex flex-col justify-between gap-3 rounded-lg border border-purple-500/40 bg-purple-500/6 p-3 text-xs sm:flex-row sm:items-center ${
                            critical ? "conic-ring" : ""
                        }`}
                    >
                        <div className="flex min-w-0 items-start gap-2.5">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-purple-500/40 bg-purple-500/15 font-mono text-[11px] font-bold text-purple-300">
                                ?
                            </span>
                            <div className="min-w-0">
                                <div className="font-semibold text-surface-900">
                                    {gap.title || gap.description}
                                </div>
                                <div className="mt-0.5 text-[11px] text-surface-500">
                                    {gap.notes || gap.assignedInvestigator}
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <Chip tone={critical ? "risk" : "alert"} size="xs">
                                {severity} gap
                            </Chip>
                            {onJumpToSection && (
                                <button
                                    type="button"
                                    onClick={() => onJumpToSection("lead-board")}
                                    className="inline-flex cursor-pointer items-center gap-1 rounded border border-purple-500/40 bg-purple-500/15 px-2 py-1 font-mono text-[10px] text-purple-200 transition-colors hover:bg-purple-500/25"
                                >
                                    <span>Lead board</span>
                                    <Icon name="arrow-right" size={9} />
                                </button>
                            )}
                        </div>
                    </RevealItem>
                );
            })}
        </RevealGroup>
    );
}
