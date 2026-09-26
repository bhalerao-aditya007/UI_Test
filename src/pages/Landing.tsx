// src/pages/Landing.tsx
// Minimalist, sophisticated Apple-like design.
// Jargon-free, capability-focused, with dual action buttons (Run Pipeline & Demo Run).

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import dashboardImage from "../assets/dashboard.png";
import graphImage from "../assets/graph.png";
import Icon from "../components/ui/Icon";
import Chip, { Kicker } from "../components/ui/Chip";
import { ParticleField, Reveal, RevealGroup, RevealItem, ShimmerText, TiltCard } from "../components/motion";

const marqueeItems = [
    { text: "Scanned FIRs & Memos", color: "text-surface-700" },
    { text: "Multilingual Wiretap Audio", color: "text-ember-300" },
    { text: "EXIF Geolocation Carving", color: "text-surface-600" },
    { text: "Phishing Domain Discovery", color: "text-ember-200" },
    { text: "Mule Account Fund Flow", color: "text-purple-300" },
    { text: "OSINT Identity Tracing", color: "text-emerald-400" },
];

const pillars = [
    {
        icon: "upload" as const,
        title: "Reads Any Evidence",
        desc: "Ingests scanned FIRs, handwritten case diaries, wiretap audio, CCTV footage, and bank statements. Extracts every entity, amount, and timestamp into verified case records.",
    },
    {
        icon: "radar" as const,
        title: "Traces Digital Footprints via OSINT",
        desc: "Carves hidden GPS from seized photos, validates telecom numbers, and identifies lookalike fraud domains — providing intelligence beyond the physical case folder.",
    },
    {
        icon: "network-graph" as const,
        title: "Maps the Criminal Syndicate",
        desc: "Connects suspects, phone lines, mule accounts, and drop locations into an interactive graph. Confirmed evidence is strictly separated from AI hypotheses.",
    },
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-surface-0 font-sans text-surface-700 selection:bg-ember-500/30 selection:text-surface-900">
            {/* ── Navigation ──────────────────────────────────────────── */}
            <nav className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between border-b border-surface-200/40 px-6 sm:px-8">
                <div className="flex items-center gap-3">
                    <img
                        src="/astrax-logo.png"
                        alt="AstraX"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                        className="h-8 w-8 rounded-lg object-contain shadow-sm"
                    />
                    <span className="font-display text-lg font-bold tracking-tight text-surface-900">
                        AstraX
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to="/dashboard"
                        className="text-xs font-medium text-surface-500 transition-colors hover:text-surface-900"
                    >
                        Case Directory
                    </Link>
                    <Link
                        to="/intake?mode=real"
                        className="rounded-lg bg-surface-100 px-3.5 py-1.5 text-xs font-semibold text-surface-900 border border-surface-300 transition-colors hover:bg-surface-200"
                    >
                        Launch Pipeline
                    </Link>
                </div>
            </nav>

            {/* ── Hero ────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden pb-20 pt-16 lg:pb-32 lg:pt-24">
                <div className="bg-tactical-grid pointer-events-none absolute inset-0 opacity-15" />
                <ParticleField count={18} seed={3} className="opacity-40" />

                <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:flex lg:items-center lg:gap-16">
                    <div className="max-w-2xl lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <Chip tone="ember" size="md">
                                AI-Powered Criminal Intelligence
                            </Chip>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-surface-900 sm:text-5xl lg:text-6xl"
                        >
                            From Raw Evidence to{" "}
                            <ShimmerText>Criminal Network Maps</ShimmerText>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-6 text-base leading-relaxed text-surface-500 sm:text-lg"
                        >
                            Drop in case documents, wiretaps, and financial ledgers. AstraX parses
                            multi-modal exhibits, uncovers digital traces with integrated OSINT tools,
                            and synthesizes the complete syndicate hierarchy — with verifiable citations
                            for every finding.
                        </motion.p>

                        {/* Minimalist Apple-style Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-10 flex flex-wrap items-center gap-3.5"
                        >
                            <Link
                                to="/intake?mode=real"
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-ember-500 px-6 py-3.5 text-sm font-semibold text-surface-900 shadow-sm transition-all hover:bg-ember-400"
                            >
                                <Icon name="upload" size={16} />
                                <span>Run Pipeline</span>
                            </Link>

                            <Link
                                to="/intake?mode=demo"
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-surface-300 bg-surface-100/80 px-6 py-3.5 text-sm font-semibold text-surface-700 backdrop-blur-sm transition-all hover:bg-surface-200 hover:text-surface-900"
                            >
                                <Icon name="radar" size={16} />
                                <span>Demo Run</span>
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-14 lg:mt-0 lg:w-1/2"
                    >
                        <TiltCard max={3} className="rounded-2xl">
                            <div className="glass overflow-hidden rounded-2xl border border-surface-300/80 p-2 shadow-xl">
                                <img
                                    src={dashboardImage}
                                    alt="AstraX criminal network dashboard"
                                    className="w-full rounded-xl object-cover"
                                />
                            </div>
                        </TiltCard>
                    </motion.div>
                </div>
            </section>

            {/* ── Marquee strip ───────────────────────────────────────── */}
            <section className="overflow-hidden border-y border-surface-200/60 bg-surface-50/50 py-3.5">
                <div className="relative flex w-full overflow-hidden">
                    <div className="animate-marquee flex items-center whitespace-nowrap font-mono text-xs tracking-wider">
                        {[...marqueeItems, ...marqueeItems].map((item, idx) => (
                            <span key={idx} className="inline-flex shrink-0 items-center">
                                <span className={`mx-3 ${item.color}`}>{item.text}</span>
                                <span className="mx-4 inline-block h-1 w-1 shrink-0 rounded-full bg-surface-300" />
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Problem & Solution Statement ────────────────────────── */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-6 sm:px-8">
                    <Reveal className="max-w-3xl">
                        <Kicker tone="ember">Investigative Clarity</Kicker>
                        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
                            Connecting What is Deliberately Scattered
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-surface-500">
                            Modern syndicates distribute operations across burner lines, mule accounts,
                            and state borders to overwhelm manual case compilation. AstraX ingests
                            unstructured case files, validates identities against public OSINT registries,
                            and reveals the criminal command structure in minutes instead of weeks.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* ── Core Capabilities ────────────────────────────────────── */}
            <section className="border-t border-surface-200/60 bg-surface-50/40 py-24">
                <div className="mx-auto max-w-7xl px-6 sm:px-8">
                    <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {pillars.map((p) => (
                            <RevealItem key={p.title}>
                                <div className="h-full rounded-2xl border border-surface-300/80 bg-surface-100/60 p-8 shadow-sm transition-all hover:border-surface-400/80">
                                    <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-surface-300 bg-surface-200/70 text-ember-300">
                                        <Icon name={p.icon} size={20} />
                                    </div>
                                    <h3 className="font-display text-lg font-bold text-surface-900">
                                        {p.title}
                                    </h3>
                                    <p className="mt-2.5 text-sm leading-relaxed text-surface-500">
                                        {p.desc}
                                    </p>
                                </div>
                            </RevealItem>
                        ))}
                    </RevealGroup>
                </div>
            </section>

            {/* ── Visual Insight Section ──────────────────────────────── */}
            <section className="border-t border-surface-200/60 py-24">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:flex lg:items-center lg:gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:w-1/2"
                    >
                        <div className="glass overflow-hidden rounded-2xl border border-surface-300/80 p-2 shadow-xl">
                            <img
                                src={graphImage}
                                alt="Network graph visualisation"
                                className="w-full rounded-xl object-cover"
                            />
                        </div>
                    </motion.div>

                    <Reveal className="mt-12 lg:mt-0 lg:w-1/2">
                        <Kicker tone="ember">Provenance First</Kicker>
                        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
                            Leads with Receipts, Never Automated Verdicts
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-surface-500">
                            Every AI suggestion in AstraX links directly to the original file, page,
                            and snippet. Evidence-backed facts remain visually distinct from predictive
                            leads, giving officers the transparency needed for court compliance.
                        </p>

                        <div className="mt-8 space-y-3 font-mono text-xs">
                            <div className="flex items-start gap-3 rounded-xl border border-surface-300/80 bg-surface-100/60 p-3.5">
                                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                                <div>
                                    <span className="font-semibold text-surface-900">
                                        Confirmed Evidence
                                    </span>
                                    <p className="mt-0.5 text-surface-500 font-sans text-xs">
                                        Verified records pulled directly from seizure memos and bank ledgers.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-purple-500/30 bg-purple-500/5 p-3.5">
                                <span className="mt-1 h-2 w-2 rounded-full bg-purple-400" />
                                <div>
                                    <span className="font-semibold text-purple-300">
                                        Predictive Hypothesis
                                    </span>
                                    <p className="mt-0.5 text-surface-500 font-sans text-xs">
                                        Probabilistic links tagged for officer verification before inclusion in briefs.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── Minimalist Footer ────────────────────────────────────── */}
            <footer className="border-t border-surface-200/60 py-10 text-xs text-surface-500">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-8">
                    <div className="flex items-center gap-2.5">
                        <span className="font-display font-bold text-surface-900">AstraX</span>
                        <span>·</span>
                        <span>Tactical Criminal Intelligence Platform</span>
                    </div>

                    <p className="font-mono text-[11px]">
                        State Police Special Operations · Air-Gapped Ready
                    </p>
                </div>
            </footer>
        </div>
    );
}
