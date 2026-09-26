// src/pages/Landing.tsx
// Section structure preserved (nav → hero → marquee → problem → features →
// OSINT spotlight → visual insight → footer). Content rewritten for layman
// clarity — no jargon, high impact, OSINT prominent.

import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import dashboardImage from "../assets/dashboard.png";
import graphImage from "../assets/graph.png";
import Icon from "../components/ui/Icon";
import Chip, { Kicker } from "../components/ui/Chip";
import { ParticleField, Reveal, RevealGroup, RevealItem, ShimmerText, TiltCard } from "../components/motion";

const HeroScene = lazy(() => import("../components/landing/HeroScene.tsx"));

const marqueeItems = [
    { text: "Reads Scanned FIRs & Handwritten Memos", color: "text-emerald-400" },
    { text: "Transcribes Wiretap Audio In 22+ Languages", color: "text-ember-300" },
    { text: "Extracts Hidden GPS From Seized Photos", color: "text-surface-400" },
    { text: "Detects Fake Websites & Phishing Domains", color: "text-ember-200" },
    { text: "Maps Money Trails Across Mule Bank Accounts", color: "text-purple-300" },
    { text: "Traces Suspect Social Media Across 400+ Platforms", color: "text-surface-400" },
];

const features = [
    {
        icon: "upload" as const,
        title: "Reads Any Evidence, Any Format",
        desc: "Scanned FIRs, seizure memos, wiretap recordings, CCTV footage, bank statement CSVs, biometric records — drop any file. AstraX automatically reads and extracts every name, phone number, bank account, vehicle, and location mentioned anywhere in your evidence.",
    },
    {
        icon: "radar" as const,
        title: "Traces Digital Footprints via OSINT",
        desc: "Goes beyond your case files. Pulls GPS coordinates hidden in photo metadata, validates phone numbers against carrier databases, detects fake phishing domains, and traces suspect usernames across 400+ social platforms — all with court-grade evidence hashing.",
    },
    {
        icon: "network-graph" as const,
        title: "Maps the Complete Criminal Network",
        desc: "Every suspect, bank account, phone number, and location becomes a node in an interactive map. See who funds whom, who calls whom, and who was where. AI predictions are clearly separated from confirmed evidence — always.",
    },
];

const osintTools = [
    {
        icon: "map-pin" as const,
        tool: "ExifTool",
        title: "Photo Intelligence",
        desc: "Extracts GPS coordinates, camera model, and timestamps hidden in image metadata — even when properties appear deleted.",
        tag: "Air-Gap Safe",
    },
    {
        icon: "phone-tower" as const,
        tool: "libphonenumber",
        title: "Phone Validation",
        desc: "Validates phone numbers offline, identifies carrier and region. Detects disposable and VoIP numbers commonly used by syndicates.",
        tag: "Air-Gap Safe",
    },
    {
        icon: "chain-link" as const,
        tool: "dnstwist",
        title: "Domain Detection",
        desc: "Scans for typosquatting and lookalike domains used for fraud. Finds fake payment portals, phishing websites, and email spoofing infrastructure.",
        tag: "Network Required",
    },
    {
        icon: "search" as const,
        tool: "Sherlock",
        title: "Social Media Tracing",
        desc: "Searches for a suspect's username across 400+ platforms. Uncovers hidden profiles, marketplace accounts, and encrypted communication channels.",
        tag: "Network Required",
    },
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-surface-0 font-sans text-surface-700 selection:bg-ember-500/30 selection:text-surface-900">
            {/* ── Nav ─────────────────────────────────────────────────── */}
            <nav className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between border-b border-surface-200/50 px-6">
                <div className="flex items-center gap-3">
                    <img
                        src="/astrax-logo.png"
                        alt="AstraX"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                        className="h-9 w-9 rounded-lg object-contain shadow-[0_0_18px_rgba(168,91,58,0.25)]"
                    />
                    <span className="font-display text-xl font-extrabold tracking-tight text-surface-900">
                        AstraX
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/dashboard"
                        className="rounded-lg border border-surface-300 bg-surface-100 px-4 py-2 text-xs font-semibold text-surface-500 transition-colors hover:bg-surface-200 hover:text-surface-900"
                    >
                        Case Directory
                    </Link>
                    <Link
                        to="/intake?mode=demo"
                        className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/20"
                        title="Explore preloaded benchmark case"
                    >
                        Demo Run
                    </Link>
                    <Link
                        to="/intake?mode=real"
                        className="cursor-pointer rounded-lg bg-ember-500 px-4 py-2 text-xs font-bold text-surface-900 shadow-[inset_0_1px_0_0_rgba(246,242,237,0.18)] shadow-ember-500/20 transition-all hover:bg-ember-400"
                        title="Upload your own documents for authentic model inference"
                    >
                        Run Real Pipeline
                    </Link>
                </div>
            </nav>

            {/* ── Hero ────────────────────────────────────────────────── */}
            <section className="bg-records-room grain-overlay relative overflow-hidden pb-24 pt-12 lg:pb-32 lg:pt-20">
                <div className="bg-tactical-grid pointer-events-none absolute inset-0 opacity-20" />
                <ParticleField count={22} seed={3} className="opacity-70" />

                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:flex lg:items-center lg:gap-12">
                    <div className="max-w-2xl lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, y: 22 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <Chip tone="ember" size="md" live>
                                AI-Powered Criminal Intelligence
                            </Chip>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 26 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-6 font-display text-4xl font-black leading-[1.1] tracking-tight text-surface-900 sm:text-5xl lg:text-6xl"
                        >
                            From Raw Evidence to{" "}
                            <ShimmerText>Criminal Network Maps</ShimmerText>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-6 text-base leading-relaxed text-surface-500 sm:text-lg"
                        >
                            Drop in FIRs, bank records, wiretap audio, CCTV footage, or seized
                            photos. AstraX reads every file, extracts every entity, traces digital
                            footprints using OSINT tools, and builds the complete criminal
                            network — with court-ready citations for every single finding.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
                        >
                            <div className="flex flex-col items-start gap-1">
                                <Link
                                    to="/intake?mode=real"
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-ember-500 px-6 py-3.5 text-sm font-bold text-surface-900 shadow-[inset_0_1px_0_0_rgba(246,242,237,0.18)] shadow-lg shadow-ember-500/25 transition-all hover:scale-[1.02] hover:bg-ember-400"
                                >
                                    <Icon name="upload" size={16} />
                                    <span>Run Real Pipeline</span>
                                </Link>
                                <span className="pl-1 font-mono text-[10px] text-surface-500">
                                    Upload your own files · Pure model inference
                                </span>
                            </div>

                            <div className="flex flex-col items-start gap-1">
                                <Link
                                    to="/intake?mode=demo"
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-6 py-3.5 text-sm font-bold text-amber-200 backdrop-blur-sm transition-all hover:bg-amber-500/20"
                                >
                                    <Icon name="radar" size={16} />
                                    <span>Demo Run</span>
                                </Link>
                                <span className="pl-1 font-mono text-[10px] text-surface-500">
                                    Pre-loaded FIR 108/2026 Hawala benchmark case
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-16 lg:mt-0 lg:w-1/2"
                    >
                        <TiltCard max={4} className="rounded-2xl">
                            <div className="glass lit-edge relative rounded-2xl p-2 shadow-2xl">
                                <img
                                    src={dashboardImage}
                                    alt="AstraX criminal network dashboard"
                                    className="w-full rounded-xl border border-surface-300 object-cover"
                                />
                            </div>
                        </TiltCard>
                    </motion.div>
                </div>
            </section>

            {/* ── Marquee strip ───────────────────────────────────────── */}
            <section className="overflow-hidden border-y border-surface-200/80 bg-surface-50 py-4">
                <div className="relative flex w-full overflow-hidden">
                    <div className="animate-marquee flex items-center whitespace-nowrap py-1 font-mono text-xs font-bold uppercase tracking-wider">
                        {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
                            <span key={idx} className="inline-flex shrink-0 items-center">
                                <span className={`mx-2 ${item.color}`}>{item.text}</span>
                                <span className="mx-6 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500/60" />
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Problem section ─────────────────────────────────────── */}
            <section className="bg-surface-0 py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <Reveal className="mb-16 max-w-3xl">
                        <Kicker tone="ember">Why investigations stall</Kicker>
                        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">
                            Criminal networks are designed to be invisible
                        </h2>
                        <p className="mt-6 text-base leading-relaxed text-surface-500">
                            Modern criminal syndicates don't keep everything in one place. They use
                            dozens of burner phones, route money through shell companies and mule
                            bank accounts, communicate on encrypted apps, and operate across
                            state lines. Evidence is scattered everywhere — deliberately.
                        </p>
                        <p className="mt-4 text-base leading-relaxed text-surface-500">
                            Investigators collect mountains of evidence from seized devices, bank
                            records, CCTV footage, and phone logs. But connecting the dots manually
                            across thousands of pages takes weeks. By then, suspects have fled and
                            money has moved. AstraX reads all your evidence, connects every dot,
                            and shows you the full criminal network — in minutes instead of months.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* ── Features ─────────────────────────────────────────────── */}
            <section className="border-t border-surface-200/80 bg-surface-50 py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <Reveal className="mx-auto mb-16 max-w-3xl text-center">
                        <h2 className="font-display text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">
                            Three things that change how cases are solved
                        </h2>
                        <p className="mt-4 text-base text-surface-500">
                            Purpose-built for investigators who need answers fast — without
                            compromising evidence integrity.
                        </p>
                    </Reveal>

                    <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <RevealItem key={f.title}>
                                <TiltCard max={4} className="h-full rounded-xl">
                                    <div className="shine-sweep h-full rounded-xl border border-surface-300 bg-surface-100 p-8 shadow-sm transition-all hover:border-ember-500/40 hover:bg-surface-100/90">
                                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-ember-500/30 bg-ember-500/12 text-ember-300">
                                            <Icon name={f.icon} size={22} />
                                        </div>
                                        <h3 className="font-display text-lg font-bold text-surface-900">
                                            {f.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed text-surface-500">
                                            {f.desc}
                                        </p>
                                    </div>
                                </TiltCard>
                            </RevealItem>
                        ))}
                    </RevealGroup>
                </div>
            </section>

            {/* ── OSINT Spotlight ─────────────────────────────────────── */}
            <section className="bg-records-room grain-overlay relative overflow-hidden border-t border-surface-200/80 py-24">
                <div className="bg-tactical-grid pointer-events-none absolute inset-0 opacity-15" />

                <div className="relative z-10 mx-auto max-w-7xl px-6">
                    <Reveal className="mx-auto mb-16 max-w-3xl text-center">
                        <Kicker tone="ember">Open-Source Intelligence Engine</Kicker>
                        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">
                            Intelligence Beyond Your Case Files
                        </h2>
                        <p className="mt-4 text-base text-surface-500">
                            AstraX doesn't just read what you upload — it actively investigates.
                            Four specialized OSINT tools trace digital footprints that suspects
                            thought were invisible.
                        </p>
                    </Reveal>

                    <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {osintTools.map((tool) => (
                            <RevealItem key={tool.tool}>
                                <div className="flex h-full flex-col rounded-xl border border-surface-300/20 bg-surface-100/8 p-6 backdrop-blur-sm transition-all hover:border-ember-500/30 hover:bg-surface-100/12">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-ember-500/30 bg-ember-500/12 text-ember-300">
                                            <Icon name={tool.icon} size={20} />
                                        </div>
                                        <Chip tone={tool.tag.includes("Air") ? "confirmed" : "steel"} size="xs">
                                            {tool.tag}
                                        </Chip>
                                    </div>
                                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-ember-300">
                                        {tool.tool}
                                    </div>
                                    <h3 className="mt-1 font-display text-base font-bold text-surface-900">
                                        {tool.title}
                                    </h3>
                                    <p className="mt-2 flex-1 text-sm leading-relaxed text-surface-500">
                                        {tool.desc}
                                    </p>
                                </div>
                            </RevealItem>
                        ))}
                    </RevealGroup>

                    <Reveal className="mt-12 text-center">
                        <p className="mx-auto max-w-2xl font-mono text-xs text-surface-500">
                            All OSINT findings carry cryptographic SHA-256 hashes for
                            Bharatiya Sakshya Adhiniyam 2023 (BSA) digital evidence
                            admissibility. Offline-capable tools work on air-gapped systems
                            without internet access.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* ── Visual insight section ──────────────────────────────── */}
            <section className="border-t border-surface-200/80 bg-surface-0 py-24">
                <div className="mx-auto max-w-7xl px-6 lg:flex lg:items-center lg:gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:w-1/2"
                    >
                        <TiltCard max={4} className="rounded-2xl">
                            <div className="glass overflow-hidden rounded-2xl p-2 shadow-2xl">
                                <img
                                    src={graphImage}
                                    alt="Network graph visualisation"
                                    className="w-full rounded-xl border border-surface-300 object-cover"
                                />
                            </div>
                        </TiltCard>
                    </motion.div>

                    <Reveal className="mt-12 lg:mt-0 lg:w-1/2">
                        <h2 className="font-display text-3xl font-extrabold tracking-tight text-surface-900 sm:text-4xl">
                            Every Finding Comes With Its Receipt
                        </h2>
                        <p className="mt-6 text-base leading-relaxed text-surface-500">
                            AstraX clearly separates what's confirmed from what's predicted.
                            Every link, every entity, every timeline entry carries a citation
                            pointing back to the exact document, page, and passage it came
                            from. Investigators see leads to verify — never automated verdicts.
                        </p>

                        <div className="mt-8 space-y-3 font-mono text-xs">
                            <div className="flex items-start gap-3 rounded-lg border border-surface-300 bg-surface-100 p-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                                <div>
                                    <strong className="block text-surface-900">
                                        Evidence-backed extraction
                                    </strong>
                                    <span className="text-surface-500">
                                        Pulled directly from your case files with document citation
                                        and confidence score.
                                    </span>
                                </div>
                            </div>

                            <div className="hypothesis-surface flex items-start gap-3 rounded-lg border border-purple-500/40 bg-purple-500/8 p-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-purple-400" />
                                <div>
                                    <strong className="block text-purple-300">
                                        AI hypothesis
                                    </strong>
                                    <span className="text-surface-500">
                                        Predicted connection flagged for manual verification.
                                        Never presented as confirmed evidence.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── Footer ───────────────────────────────────────────────── */}
            <footer className="border-t border-surface-200/80 bg-surface-50 py-12 text-xs text-surface-500">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                    <div className="flex items-center gap-3">
                        <img
                            src="/astrax-logo.png"
                            alt="AstraX"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                            className="h-7 w-7 rounded-lg object-contain"
                        />
                        <span className="font-display text-sm font-extrabold tracking-tight text-surface-900">
                            AstraX
                        </span>
                        <span className="font-mono text-[11px] text-surface-500">
                            | AI-Powered Criminal Intelligence
                        </span>
                    </div>

                    <p className="font-mono">
                        Designed for State Police Cyber Crime Cells · Air-Gapped System
                    </p>
                </div>
            </footer>
        </div>
    );
}
