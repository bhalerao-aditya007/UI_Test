// src/components/dashboard/analytics/DigitalFootprint.tsx
//
// OSINT source adapter panel — ExifTool, libphonenumber, dnstwist, Sherlock.
// Public-record tier only — every finding is hash-anchored and carries its
// collection timestamp.
//
// Mounts in Act III (Evidence) of the CaseView 4-Act model.

import { useEffect, useState } from "react";
import Icon, { type IconName } from "../../ui/Icon";
import ConfidenceBadge from "../../ui/ConfidenceBadge";
import Chip from "../../ui/Chip";
import EmptyState from "../../ui/EmptyState";
import {
    getCaseOsint,
    enrichCaseOsint,
    type OsintFinding,
} from "../../../services/osint";
import { mockOsintFindings } from "../../../data/mockCaseData";

// ── Finding type metadata ───────────────────────────────────────────────

const TYPE_META: Record<
    string,
    { icon: IconName; label: string; tone: "confirmed" | "steel" | "alert" | "hypothesis" | "risk" }
> = {
    geolocation: {
        icon: "map-pin",
        label: "Geolocation (EXIF)",
        tone: "confirmed",
    },
    device: {
        icon: "fingerprint",
        label: "Capture Device",
        tone: "confirmed",
    },
    timestamp: {
        icon: "clock",
        label: "Capture Timestamp",
        tone: "steel",
    },
    phone_profile: {
        icon: "phone-tower",
        label: "Telecom Profile",
        tone: "steel",
    },
    phone_invalid: {
        icon: "alert-triangle",
        label: "Invalid MSISDN",
        tone: "risk",
    },
    typosquat: {
        icon: "chain-link",
        label: "Typosquat Domain",
        tone: "alert",
    },
    social_account: {
        icon: "search",
        label: "Social Account",
        tone: "hypothesis",
    },
};

const FALLBACK_META = {
    icon: "file-text" as IconName,
    label: "OSINT Finding",
    tone: "steel" as const,
};

// ── Component ───────────────────────────────────────────────────────────

export default function DigitalFootprint({
    caseId,
    isDemoMode = true,
}: {
    caseId: string;
    isDemoMode?: boolean;
}) {
    const [liveFindings, setLiveFindings] = useState<OsintFinding[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isLiveMode, setIsLiveMode] = useState(!isDemoMode);
    const [expanded, setExpanded] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        try {
            const res = await getCaseOsint(caseId);
            if (res.findings && res.findings.length > 0) {
                setLiveFindings(res.findings);
                setIsLiveMode(true);
            }
        } catch {
            // Keep demo findings on failure
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [caseId]);

    const handleScan = async () => {
        setIsScanning(true);
        try {
            await enrichCaseOsint(caseId);
            const res = await getCaseOsint(caseId);
            if (res.findings && res.findings.length > 0) {
                setLiveFindings(res.findings);
                setIsLiveMode(true);
            }
        } catch {
            /* surfaced by the empty state */
        } finally {
            setIsScanning(false);
        }
    };

    // Use live findings if live mode active and has findings; otherwise use mock benchmark findings
    const findings: OsintFinding[] =
        isLiveMode && liveFindings.length > 0
            ? liveFindings
            : isDemoMode
              ? (mockOsintFindings as OsintFinding[])
              : liveFindings;

    const isCurrentDemo = !isLiveMode || liveFindings.length === 0;

    // Group findings by type
    const grouped = findings.reduce<Record<string, OsintFinding[]>>(
        (acc, f) => {
            (acc[f.finding_type] ||= []).push(f);
            return acc;
        },
        {},
    );

    const offlineCount = findings.filter((f) => !f.egress_used).length;

    // ── Loading ─────────────────────────────────────────────────────────
    if (isLoading && findings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 font-mono text-xs text-surface-500">
                <Icon name="radar" size={20} className="mb-2 animate-spin text-surface-400" />
                Loading OSINT findings…
            </div>
        );
    }

    // ── Empty state (only in real mode when 0 findings) ─────────────────
    if (findings.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        onClick={handleScan}
                        disabled={isScanning}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500 disabled:opacity-50"
                    >
                        <Icon
                            name="refresh"
                            size={13}
                            className={isScanning ? "animate-spin" : ""}
                        />
                        <span>{isScanning ? "Running adapters…" : "Run OSINT Scan"}</span>
                    </button>
                </div>
                <EmptyState
                    dense
                    icon="radar"
                    title="No OSINT findings yet"
                    body="Run the scan to extract EXIF geolocation and device identifiers from seized media, validate MSISDNs offline, and cluster typosquat infrastructure."
                    stamp="0 findings · 4 adapters ready"
                />
            </div>
        );
    }

    // ── Findings view ───────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-4 font-sans">

            {/* Toolbar */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-2">
                    <Chip tone="confirmed" size="xs">
                        {offlineCount}/{findings.length} air-gap safe
                    </Chip>
                    <Chip tone="steel" size="xs">
                        {Object.keys(grouped).length} categories
                    </Chip>
                    {isCurrentDemo ? (
                        <Chip tone="alert" size="xs">
                            Benchmark Dataset
                        </Chip>
                    ) : (
                        <Chip tone="confirmed" size="xs" live>
                            Live Ingestion
                        </Chip>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleScan}
                        disabled={isScanning}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500 disabled:opacity-50"
                    >
                        <Icon
                            name="refresh"
                            size={13}
                            className={isScanning ? "animate-spin" : ""}
                        />
                        <span>{isScanning ? "Running adapters…" : "Run OSINT Scan"}</span>
                    </button>
                </div>
            </div>

            {/* Finding groups */}
            <div className="space-y-3">
                {Object.entries(grouped).map(([type, items]) => {
                    const meta = TYPE_META[type] || FALLBACK_META;
                    return (
                        <div
                            key={type}
                            className="overflow-hidden rounded-xl border border-surface-300 bg-surface-0/40"
                        >
                            {/* Group header */}
                            <div className="flex items-center justify-between border-b border-surface-200/70 bg-surface-100/80 px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                    <Icon name={meta.icon} size={14} />
                                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-surface-800">
                                        {meta.label}
                                    </span>
                                </div>
                                <Chip tone={meta.tone} size="xs">
                                    {items.length}
                                </Chip>
                            </div>

                            {/* Finding rows */}
                            <div className="divide-y divide-surface-200/60">
                                {items.map((f, i) => {
                                    const key = `${type}-${i}`;
                                    const open = expanded === key;
                                    return (
                                        <div key={key} className="px-4 py-2.5">
                                            {/* Summary row */}
                                            <div
                                                onClick={() =>
                                                    setExpanded(open ? null : key)
                                                }
                                                className="flex cursor-pointer items-center justify-between gap-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate font-mono text-xs font-semibold text-surface-800">
                                                        {f.label}
                                                    </div>
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-surface-500">
                                                        <span className="uppercase">
                                                            {f.tool}
                                                        </span>
                                                        <span>·</span>
                                                        <span>
                                                            {f.source_document ||
                                                                "case evidence"}
                                                        </span>
                                                        {f.egress_used && (
                                                            <>
                                                                <span>·</span>
                                                                <span className="text-amber-400">
                                                                    egress
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <ConfidenceBadge
                                                        score={f.confidence}
                                                        size="sm"
                                                    />
                                                    <Icon
                                                        name="chevron-down"
                                                        size={14}
                                                        className={`text-surface-400 transition-transform ${
                                                            open ? "rotate-180" : ""
                                                        }`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Expanded detail */}
                                            {open && (
                                                <div className="mt-2.5 space-y-1.5 rounded-lg border border-surface-300 bg-surface-0/70 p-3 font-mono text-[11px]">
                                                    {Object.entries(
                                                        (f.attributes || {}) as Record<string, unknown>,
                                                    )
                                                        .filter(
                                                            ([, v]) =>
                                                                v !== null &&
                                                                v !== "" &&
                                                                !(
                                                                    Array.isArray(v) &&
                                                                    v.length === 0
                                                                ),
                                                        )
                                                        .map(([k, v]) => (
                                                            <div
                                                                key={k}
                                                                className="flex justify-between gap-3 border-b border-surface-200/40 pb-1 last:border-0"
                                                            >
                                                                <span className="capitalize text-surface-500">
                                                                    {k.replace(
                                                                        /_/g,
                                                                        " ",
                                                                    )}
                                                                </span>
                                                                <span className="break-all text-right text-surface-800">
                                                                    {Array.isArray(v)
                                                                        ? (v as string[]).join(", ")
                                                                        : String(v)}
                                                                </span>
                                                            </div>
                                                        ))}

                                                    {/* Provenance footer */}
                                                    <div className="space-y-0.5 pt-1.5 text-[10px] text-surface-500">
                                                        <div>
                                                            collected:{" "}
                                                            {f.collected_at}
                                                        </div>
                                                        <div className="break-all">
                                                            sha256:{" "}
                                                            {f.raw_sha256}
                                                        </div>
                                                        {f.source_url && (
                                                            <div className="break-all text-blue-400">
                                                                source:{" "}
                                                                {f.source_url}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
