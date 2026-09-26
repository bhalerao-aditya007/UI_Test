// src/components/layout/Navbar.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../ui/Icon";
import Chip from "../ui/Chip";

/** Inline monogram — used if /astrax-logo.png is absent (air-gapped safe). */
function Mark({ size = 26 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
            <defs>
                <linearGradient id="astrax-mark" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d89873" />
                    <stop offset="100%" stopColor="#a85b3a" />
                </linearGradient>
            </defs>
            <rect x="1" y="1" width="30" height="30" rx="8" fill="#1a1817" stroke="#302d2b" />
            <path
                d="M16 6.5 25 25.5h-4.1L16 14.9l-4.9 10.6H7z"
                fill="url(#astrax-mark)"
            />
            <circle cx="16" cy="21.5" r="1.9" fill="#5f86aa" />
        </svg>
    );
}

function Wordmark() {
    const [broken, setBroken] = useState(false);
    return (
        <Link to="/" className="group flex items-center gap-2.5">
            {broken ? (
                <Mark size={28} />
            ) : (
                <img
                    src="/astrax-logo.png"
                    alt=""
                    onError={() => setBroken(true)}
                    className="h-7 w-7 rounded-lg object-contain transition-transform group-hover:scale-105"
                />
            )}
            <span className="font-display text-[17px] font-extrabold leading-none tracking-tight text-surface-900">
                AstraX
            </span>
        </Link>
    );
}

export default function Navbar() {
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === "/" && location.pathname === "/") return true;
        if (path !== "/" && location.pathname.startsWith(path)) return true;
        return false;
    };

    const links = [
        { to: "/intake", label: "Evidence Intake", match: ["/intake"] },
        { to: "/dashboard", label: "Case Directory", match: ["/dashboard", "/cases"] },
    ];

    return (
        <header className="glass-strong lit-edge z-30 flex h-14 shrink-0 items-center justify-between border-b border-surface-300 px-5">
            <div className="flex items-center gap-7">
                <Wordmark />

                <nav className="hidden items-center gap-1 text-xs sm:flex">
                    {links.map((l) => {
                        const active = l.match.some((m) => isActive(m));
                        return (
                            <Link
                                key={l.to}
                                to={l.to}
                                className={`relative rounded-md px-3 py-1.5 font-medium transition-colors ${
                                    active
                                        ? "bg-ember-500/12 text-ember-200"
                                        : "text-surface-500 hover:bg-surface-200/60 hover:text-surface-800"
                                }`}
                            >
                                {l.label}
                                {active && (
                                    <span className="absolute inset-x-3 -bottom-[5px] h-px bg-ember-400/70" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-3">
                <span className="hidden md:inline-flex">
                    <Chip tone="confirmed" size="sm" live>
                        Air-gapped
                    </Chip>
                </span>

                <Link
                    to="/intake?mode=real"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-ember-500 px-3.5 py-1.5 text-xs font-semibold text-surface-900 shadow-[inset_0_1px_0_0_rgba(246,242,237,0.18)] transition-colors hover:bg-ember-400"
                >
                    <Icon name="plus" size={13} />
                    <span>New Intake</span>
                </Link>
            </div>
        </header>
    );
}
