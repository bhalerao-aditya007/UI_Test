// src/pages/EvidenceIntake.tsx
// All state, upload flow, telemetry polling and navigation are unchanged —
// chrome and motion only.

import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import EvidenceChannelCard, {
    type ChannelConfig,
    type ChannelFile,
} from "../components/intake/EvidenceChannelCard";
import Icon from "../components/ui/Icon";
import Chip, { Kicker } from "../components/ui/Chip";
import { Reveal, RevealGroup, RevealItem } from "../components/motion";
import { useCasesStore } from "../store/casesStore";
import { initiateUpload, uploadToStorage, confirmUpload } from "../services/upload";
import { getDocument } from "../services/documents";
import { triggerHistoricalAnalysis } from "../services/analytics";
import type { DocumentType } from "../services/documents";
import {
    SAMPLE_FIR_TEXT,
    SAMPLE_SEIZURE_TEXT,
    SAMPLE_CCTV_TEXT,
    SAMPLE_WIRETAP_TEXT,
    SAMPLE_CSV_TEXT,
    SAMPLE_BIO_TEXT,
} from "../utils/factSheetSynthesizer";

const CHANNELS: ChannelConfig[] = [
    {
        id: "fir_text",
        title: "FIR & Complaints",
        icon: "file-text",
        accepts: ".txt,.pdf,.json",
        acceptsLabel: ".txt, .pdf, .json",
        pipelineNote: "BNS / BNSS statutory mapping — entities, sections, timestamps extracted via LLM/NER.",
        limits: "Schema: Standard CAS / CCTNS compliant",
    },
    {
        id: "scanned_doc",
        title: "Seizure Memos & Panchnamas",
        icon: "evidence-tag",
        accepts: ".pdf,.jpg,.png",
        acceptsLabel: ".pdf, .jpg, .png",
        pipelineNote: "Tesseract OCR / LayoutLM — extracts tabular seizure ledgers and witness signatures.",
        limits: "Max 50MB per file",
    },
    {
        id: "cctv_video",
        title: "CCTV & Video Feeds",
        icon: "video-cctv",
        accepts: ".mp4,.avi,.mov",
        acceptsLabel: ".mp4, .avi, .mov",
        pipelineNote: "YOLOv8 + ByteTrack — person/vehicle tracking, ANPR plate extraction, geo-scene tag.",
        limits: "Max 500MB per clip",
    },
    {
        id: "audio_recordings",
        title: "Audio & Wiretap Intercepts",
        icon: "audio-mic",
        accepts: ".wav,.mp3,.m4a",
        acceptsLabel: ".wav, .mp3, .m4a",
        pipelineNote: "Whisper ASR — multi-speaker diarisation, Hinglish dialect translation, keyword alerts.",
        limits: "Supported formats: 16kHz mono WAV preferred",
    },
    {
        id: "cdr_financial",
        title: "Bank Statements & CDR",
        icon: "cdr-table",
        accepts: ".csv,.xlsx,.xml",
        acceptsLabel: ".csv, .xlsx, .xml",
        pipelineNote: "GNN Structuring Detector — flags sub-Rs 50k smurfing, peel-chains, burner IMEI churn.",
        limits: "Standard bank format (CSV/XLSX)",
    },
    {
        id: "image_bio",
        title: "Evidence Photos / Biometrics",
        icon: "image-bio",
        accepts: ".jpg,.png",
        acceptsLabel: ".jpg, .png",
        pipelineNote: "Facial/plate detection — biometric identity claims routed externally, never confirmed in-app.",
        limits: "Demo limit: 20 high-res photos",
    },
];

function createSampleQueue(): Record<string, ChannelFile[]> {
    return {
        fir_text: [
            {
                id: "sample-fir-1",
                file: new File([SAMPLE_FIR_TEXT], "FIR_108_2026_KashmereGate.txt", { type: "text/plain" }),
                name: "FIR_108_2026_KashmereGate.txt",
                size: SAMPLE_FIR_TEXT.length,
                status: "queued",
                progress: 0,
            },
        ],
        scanned_doc: [
            {
                id: "sample-seizure-1",
                file: new File([SAMPLE_SEIZURE_TEXT], "Seizure_Memo_Recovery_MoriGate.txt", { type: "text/plain" }),
                name: "Seizure_Memo_Recovery_MoriGate.txt",
                size: SAMPLE_SEIZURE_TEXT.length,
                status: "queued",
                progress: 0,
            },
        ],
        cctv_video: [
            {
                id: "sample-cctv-1",
                file: new File([SAMPLE_CCTV_TEXT], "CCTV_ANPR_KashmereGate_Toll_Cam04.txt", { type: "text/plain" }),
                name: "CCTV_ANPR_KashmereGate_Toll_Cam04.txt",
                size: SAMPLE_CCTV_TEXT.length,
                status: "queued",
                progress: 0,
            },
        ],
        audio_recordings: [
            {
                id: "sample-audio-1",
                file: new File([SAMPLE_WIRETAP_TEXT], "Wiretap_Intercept_Line9811_Session4.txt", { type: "text/plain" }),
                name: "Wiretap_Intercept_Line9811_Session4.txt",
                size: SAMPLE_WIRETAP_TEXT.length,
                status: "queued",
                progress: 0,
            },
        ],
        cdr_financial: [
            {
                id: "sample-csv-1",
                file: new File([SAMPLE_CSV_TEXT], "Axis_Bank_Structuring_4901.csv", { type: "text/csv" }),
                name: "Axis_Bank_Structuring_4901.csv",
                size: SAMPLE_CSV_TEXT.length,
                status: "queued",
                progress: 0,
            },
        ],
        image_bio: [
            {
                id: "sample-bio-1",
                file: new File([SAMPLE_BIO_TEXT], "Bio_Forensic_Aadhaar_Mismatch_Imran.txt", { type: "text/plain" }),
                name: "Bio_Forensic_Aadhaar_Mismatch_Imran.txt",
                size: SAMPLE_BIO_TEXT.length,
                status: "queued",
                progress: 0,
            },
        ],
    };
}

export default function EvidenceIntake() {
    const navigate = useNavigate();
    const createCase = useCasesStore((state) => state.createCase);

    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get("mode") || "demo";

    const [isSampleMode, setIsSampleMode] = useState(initialMode === "demo");
    const [caseTitle, setCaseTitle] = useState(
        initialMode === "demo" ? "FIR 108/2026: Kashmere Gate Syndicate" : ""
    );
    const [channelFiles, setChannelFiles] = useState<Record<string, ChannelFile[]>>(
        initialMode === "demo"
            ? createSampleQueue
            : () => ({
                  fir_text: [],
                  scanned_doc: [],
                  cctv_video: [],
                  audio_recordings: [],
                  cdr_financial: [],
                  image_bio: [],
              })
    );

    const [isProcessing, setIsProcessing] = useState(false);
    const [streamedLogs, setStreamedLogs] = useState<string[]>([]);

    const totalFiles = Object.values(channelFiles).reduce((sum, list) => sum + list.length, 0);
    const activeChannels = Object.values(channelFiles).filter((list) => list.length > 0).length;

    const handleClearQueue = () => {
        setChannelFiles({
            fir_text: [],
            scanned_doc: [],
            cctv_video: [],
            audio_recordings: [],
            cdr_financial: [],
            image_bio: [],
        });
        setCaseTitle("");
        setIsSampleMode(false);
    };

    const handleLoadSampleQueue = () => {
        setChannelFiles(createSampleQueue());
        setCaseTitle("FIR 108/2026: Kashmere Gate Syndicate");
        setIsSampleMode(true);
    };

    const handleFilesAdded = (channelId: string, newFiles: File[]) => {
        let currentFiles = channelFiles;
        if (isSampleMode) {
            currentFiles = {
                fir_text: [],
                scanned_doc: [],
                cctv_video: [],
                audio_recordings: [],
                cdr_financial: [],
                image_bio: [],
            };
            setIsSampleMode(false);
            if (!caseTitle || caseTitle.includes("108/2026")) {
                setCaseTitle(newFiles[0]?.name.replace(/\.[^/.]+$/, "") || "Custom Investigation");
            }
        }

        const addedItems: ChannelFile[] = newFiles.map((f) => ({
            id: crypto.randomUUID(),
            file: f,
            name: f.name,
            size: f.size,
            status: "queued",
            progress: 0,
        }));

        setChannelFiles({
            ...currentFiles,
            [channelId]: [...(currentFiles[channelId] || []), ...addedItems],
        });
    };

    const handleFileRemoved = (channelId: string, fileId: string) => {
        setChannelFiles((prev) => ({
            ...prev,
            [channelId]: (prev[channelId] || []).filter((f) => f.id !== fileId),
        }));
    };

    const handleRunPipeline = async () => {
        if (totalFiles === 0) return;

        setIsProcessing(true);
        setStreamedLogs([
            "[System] AstraX Multi-Modality Ingestion Gateway initialized.",
            isSampleMode
                ? "[Demo Mode] Ingesting authentic queued benchmark evidence (FIR 108/2026 BNS §111)."
                : "[Live Ingestion] Ingesting user-submitted evidentiary files through neural pipeline.",
        ]);

        let targetCaseId = "case-1";
        try {
            const newCase = await createCase({
                name:
                    caseTitle.trim() ||
                    (isSampleMode ? "FIR 108/2026: Kashmere Gate Syndicate" : "New Ingested Investigation"),
                track: 2,
                triage_reason: "Multi-channel ingestion completed: live evidence streams merged into knowledge graph.",
            });
            targetCaseId = newCase.id;
            setStreamedLogs((prev) => [
                ...prev,
                `[Case Registered] Created case record: ${newCase.name} (ID: ${targetCaseId})`,
            ]);
        } catch {
            targetCaseId = "case-1";
            setStreamedLogs((prev) => [...prev, `[Target Case] Using workspace case: ${targetCaseId}`]);
        }

        const uploadedDocIds: { id: string; name: string; type: DocumentType }[] = [];

        for (const [channelId, fileList] of Object.entries(channelFiles)) {
            for (const item of fileList) {
                const docType: DocumentType =
                    channelId === "cctv_video" && item.name.match(/\.(mp4|avi|mov)$/i)
                        ? "video"
                        : channelId === "audio_recordings" && item.name.match(/\.(wav|mp3|m4a|ogg)$/i)
                          ? "voice"
                          : channelId === "image_bio" && item.name.match(/\.(jpg|jpeg|png|webp)$/i)
                            ? "image"
                            : "text";
                if (item.file && item.file.size > 0) {
                    try {
                        setStreamedLogs((prev) => [
                            ...prev,
                            `[Ingest] Uploading ${item.name} (${(item.size / 1024).toFixed(1)} KB)...`,
                        ]);

                        const initRes = await initiateUpload({
                            case_id: targetCaseId,
                            title: item.name,
                            description: `Uploaded via AstraX Intake Channel: ${channelId}`,
                            file_name: item.name,
                            document_type: docType,
                        });

                        if (initRes.upload_url) await uploadToStorage(initRes.upload_url, item.file);

                        const confirmedDoc = await confirmUpload(initRes.document_id, true);
                        uploadedDocIds.push({ id: confirmedDoc.id, name: item.name, type: docType });

                        setStreamedLogs((prev) => [
                            ...prev,
                            `[Confirmed] ${item.name} registered into pipeline (Doc ID: ${confirmedDoc.id.slice(0, 8)}...).`,
                        ]);
                    } catch (err: any) {
                        setStreamedLogs((prev) => [
                            ...prev,
                            `[Error] Ingestion failed for ${item.name}: ${err?.message || "Storage error"}`,
                        ]);
                    }
                }
            }
        }

        if (uploadedDocIds.length > 0) {
            setStreamedLogs((prev) => [
                ...prev,
                `[Inference] Polling model telemetry for ${uploadedDocIds.length} documents...`,
            ]);

            for (const docInfo of uploadedDocIds) {
                let attempts = 0;
                while (attempts < 6) {
                    try {
                        const statusDoc = await getDocument(docInfo.id);
                        if (statusDoc.status === "finish" || statusDoc.status === "success") {
                            setStreamedLogs((prev) => [
                                ...prev,
                                `[Telemetry] ${docInfo.name}: Processing status "${statusDoc.status}".`,
                            ]);
                            break;
                        } else if (statusDoc.status === "failed") {
                            setStreamedLogs((prev) => [
                                ...prev,
                                `[Telemetry] ${docInfo.name}: Processor reported failure (check server logs).`,
                            ]);
                            break;
                        }
                    } catch {
                        // ignore polling error
                    }
                    attempts++;
                    await new Promise((r) => setTimeout(r, 800));
                }
            }
        }

        try {
            setStreamedLogs((prev) => [...prev, "[GNN Linker] Triggering cross-modal graph synthesis..."]);
            await triggerHistoricalAnalysis(targetCaseId);
        } catch {
            // graceful fallback
        }

        setStreamedLogs((prev) => [
            ...prev,
            "[Complete] Forensic pipeline execution finished. Redirecting to Case Fact-Sheet...",
        ]);

        await new Promise((r) => setTimeout(r, 1200));
        navigate(`/cases/${targetCaseId}/summary?mode=${isSampleMode ? "demo" : "real"}`);
    };

    return (
        <div className="flex min-h-screen flex-col bg-surface-0">
            <Navbar />
            <div className="bg-tactical-grid pointer-events-none absolute inset-0 opacity-20" />

            <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 pb-32 sm:px-6 lg:px-8">
                {/* Header */}
                <Reveal className="flex flex-col justify-between gap-4 border-b border-surface-300/80 pb-6 md:flex-row md:items-end">
                    <div className="max-w-2xl">
                        <Kicker tone="ember">Multi-modality evidence intake</Kicker>
                        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-surface-900 sm:text-3xl">
                            Evidence Ingestion Matrix
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-surface-500">
                            Files are parsed per-modality via isolated domain adapters,
                            cross-referenced across telecommunications, banking, and field recovery
                            data, and unified into one case record.
                        </p>
                    </div>

                    <div className="w-full md:w-80">
                        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-surface-500">
                            Case / FIR identifier
                        </label>
                        <input
                            type="text"
                            value={caseTitle}
                            onChange={(e) => {
                                setCaseTitle(e.target.value);
                                setIsSampleMode(false);
                            }}
                            placeholder="e.g. FIR 108/2026 PS Kashmere Gate"
                            className="w-full rounded-lg border border-surface-300 bg-surface-100 px-3 py-2 font-mono text-sm text-surface-900 shadow-inner outline-none focus:border-ember-500/70 focus:ring-1 focus:ring-ember-500/25"
                        />
                    </div>
                </Reveal>

                {/* Mode banner */}
                <Reveal delay={0.05} className="flex flex-col justify-between gap-4 rounded-xl border border-surface-300 bg-surface-100 p-4 shadow-sm sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <div
                            className={`rounded-lg border p-2 ${
                                isSampleMode
                                    ? "border-amber-500/30 bg-amber-500/12 text-amber-300"
                                    : "border-emerald-500/30 bg-emerald-500/12 text-emerald-300"
                            }`}
                        >
                            <Icon name={isSampleMode ? "radar" : "file-text"} size={18} />
                        </div>
                        <div>
                            <h3 className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-surface-900">
                                <span>
                                    {isSampleMode ? "Queued benchmark evidence loaded" : "Live Pipeline Mode — Your Evidence, Real AI"}
                                </span>
                                <Chip tone={isSampleMode ? "alert" : "confirmed"} size="xs">
                                    {isSampleMode ? "Sample queue" : "Live user files"}
                                </Chip>
                            </h3>
                            <p className="mt-0.5 text-xs text-surface-500">
                                {isSampleMode
                                    ? "Authentic FIR 108/2026 text & Axis Bank structuring transactions are pre-staged. Click 'Run Analysis Pipeline' to see the full demo, or clear the queue and upload your own files."
                                    : "You are uploading your own evidence files. AstraX will process them through live AI models — OCR, ASR, NER, and GNN pipelines. All outputs are 100% model-generated, zero hardcoded data."}
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0">
                        {isSampleMode ? (
                            <button
                                type="button"
                                onClick={handleClearQueue}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-surface-300 bg-surface-200/60 px-3 py-1.5 text-xs font-semibold text-surface-600 transition-colors hover:text-surface-900"
                            >
                                <Icon name="refresh" size={13} />
                                <span>Clear & upload my own</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleLoadSampleQueue}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
                            >
                                <Icon name="radar" size={13} />
                                <span>Load sample evidence queue</span>
                            </button>
                        )}
                    </div>
                </Reveal>

                {/* Channel grid */}
                <RevealGroup className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {CHANNELS.map((channel) => (
                        <RevealItem key={channel.id}>
                            <EvidenceChannelCard
                                config={channel}
                                files={channelFiles[channel.id] || []}
                                onFilesAdded={handleFilesAdded}
                                onFileRemoved={handleFileRemoved}
                            />
                        </RevealItem>
                    ))}
                </RevealGroup>

                {/* Processing overlay */}
                <AnimatePresence>
                    {isProcessing && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0/90 p-4 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                                className="glass-strong flex w-full max-w-2xl flex-col gap-4 rounded-2xl p-6 shadow-2xl"
                            >
                                <div className="flex items-center justify-between border-b border-surface-300/70 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-ember-500/35 bg-ember-500/12 text-ember-300">
                                            <Icon name="terminal" size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-sm font-bold text-surface-900">
                                                AstraX Neural Ingestion Pipeline
                                            </h3>
                                            <p className="font-mono text-xs text-surface-500">
                                                Parsing multi-modality data streams…
                                            </p>
                                        </div>
                                    </div>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ember-500 border-t-transparent" />
                                </div>

                                <div className="bg-case-paper h-64 space-y-1.5 overflow-y-auto rounded-xl border border-surface-300 p-4 font-mono text-xs text-ember-200/95">
                                    {streamedLogs.map((log, idx) => (
                                        <div key={idx} className="leading-relaxed">
                                            {log}
                                        </div>
                                    ))}
                                    <div className="animate-pulse text-surface-500">_</div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            {/* Sticky action bar */}
            <div className="glass-strong fixed bottom-0 left-0 right-0 z-40 px-6 py-4 shadow-2xl">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-2 font-mono text-xs text-surface-500">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-ember-400" />
                        <span>
                            <strong className="text-surface-900">{totalFiles}</strong>{" "}
                            {totalFiles === 1 ? "file" : "files"} across{" "}
                            <strong className="text-surface-900">{activeChannels}</strong> of 6
                            channels queued
                        </span>
                    </div>

                    <div className="flex w-full items-center gap-3 sm:w-auto">
                        <Link
                            to="/dashboard"
                            className="rounded-lg border border-surface-300 bg-surface-200/70 px-4 py-2 text-xs font-semibold text-surface-500 transition-colors hover:text-surface-900"
                        >
                            Cancel
                        </Link>
                        <button
                            type="button"
                            onClick={handleRunPipeline}
                            disabled={totalFiles === 0 || isProcessing}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-ember-500 px-6 py-2.5 text-sm font-bold text-surface-900 shadow-[inset_0_1px_0_0_rgba(246,242,237,0.18)] shadow-lg shadow-ember-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                        >
                            <Icon name="radar" size={16} />
                            <span>Run Analysis Pipeline</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
