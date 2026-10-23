"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DURATION, EASE, SPRING } from "@/lib/motion";
import { trackPageView } from "@/lib/track";
import Button from "@/components/ui/button";
import { ANNOUNCEMENT, NAV_CTA, NAV_LINKS, NAV_MENUS, type NavLink, type NavMenuId } from "@/constants/navigation";

const CLOSE_DELAY_MS = 120;
const SCROLLED_PX = 8;

type Platform = keyof typeof ANNOUNCEMENT.stores;

function detectPlatform(): Platform {
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua)) return "android";
    if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
    return "other";
}

function Announcement({ onDismiss }: { onDismiss: () => void }) {
    const [platform, setPlatform] = useState<Platform>("other");
    useEffect(() => setPlatform(detectPlatform()), []);
    const store = ANNOUNCEMENT.stores[platform];

    return (
        <motion.div
            initial={false}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="overflow-hidden bg-foreground text-background"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-[14px] sm:px-6 lg:px-8">
                <p className="truncate">
                    {ANNOUNCEMENT.text} {store.name}.
                </p>
                <a href={store.link} className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline">
                    {ANNOUNCEMENT.cta} <ArrowRight aria-hidden className="size-3.5" />
                </a>
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss announcement"
                    className="ml-auto flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/60 sm:absolute sm:right-4"
                >
                    <X aria-hidden className="size-4" />
                </button>
            </div>
        </motion.div>
    );
}

function NavItemLink({ link, active, onHover }: { link: NavLink; active: boolean; onHover: () => void }) {
    return (
        <Link
            href={link.href}
            {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
            onMouseEnter={onHover}
            onFocus={onHover}
            aria-current={active ? "page" : undefined}
            className={cn(
                "relative z-10 inline-flex items-center gap-1 rounded-full px-3 py-2 text-[14px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/60",
                active ? "text-foreground" : "text-soft hover:text-foreground",
            )}
        >
            {link.label}
            {link.external && <ArrowUpRight aria-hidden className="size-3.5" />}
        </Link>
    );
}

function HoverPill() {
    return <motion.span layoutId="nav-hover-pill" transition={SPRING.snappy} className="absolute inset-0 -z-0 rounded-full bg-hover" />;
}

export default function Navbar() {
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();
    const [scrolled, setScrolled] = useState(false);
    const [openMenu, setOpenMenu] = useState<NavMenuId | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileSection, setMobileSection] = useState<NavMenuId | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const [showAnnouncement, setShowAnnouncement] = useState(true);
    const closeTimer = useRef<number>();

    useEffect(() => trackPageView(pathname), [pathname]);

    useEffect(() => {
        setOpenMenu(null);
        setMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > SCROLLED_PX);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpenMenu(null);
                setMobileOpen(false);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        if (!mobileOpen) setMobileSection(null);
        document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.documentElement.style.overflow = "";
        };
    }, [mobileOpen]);

    const openMenuNow = (id: NavMenuId) => {
        window.clearTimeout(closeTimer.current);
        setOpenMenu(id);
    };
    const keepMenu = () => window.clearTimeout(closeTimer.current);
    const closeMenu = () => {
        closeTimer.current = window.setTimeout(() => setOpenMenu(null), CLOSE_DELAY_MS);
    };

    const isActive = (href: string) => pathname === href || (href !== "/" && pathname?.startsWith(href));
    const menu = NAV_MENUS.find((m) => m.id === openMenu);
    const panel = { duration: reduceMotion ? 0 : DURATION.base, ease: EASE.out };

    return (
        <header className="sticky top-0 z-50">
            <AnimatePresence initial={false}>
                {showAnnouncement && <Announcement key="announcement" onDismiss={() => setShowAnnouncement(false)} />}
            </AnimatePresence>

            <div
                className={cn(
                    "relative bg-background transition-shadow duration-200",
                    (scrolled || openMenu) && "shadow-[0_1px_0_hsl(var(--border))]",
                )}
                onMouseLeave={closeMenu}
            >
                <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
                        <Image src="/assets/logo.svg" width={28} height={28} alt="" priority />
                        <span className="text-[16px] font-semibold tracking-[-0.01em] text-foreground">GebetaMaps</span>
                    </Link>

                    <ul className="hidden flex-1 items-center justify-center md:flex" onMouseLeave={() => setHovered(null)}>
                        {NAV_MENUS.map((m) => {
                            const open = openMenu === m.id;
                            return (
                                <li key={m.id} className="relative">
                                    {hovered === m.id && <HoverPill />}
                                    <button
                                        type="button"
                                        aria-expanded={open}
                                        aria-controls="nav-menu"
                                        onMouseEnter={() => {
                                            setHovered(m.id);
                                            openMenuNow(m.id);
                                        }}
                                        onFocus={() => setHovered(m.id)}
                                        onClick={() => setOpenMenu(open ? null : m.id)}
                                        className={cn(
                                            "relative z-10 inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-[14px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/60",
                                            open || pathname?.startsWith(m.basePath) ? "text-foreground" : "text-soft hover:text-foreground",
                                        )}
                                    >
                                        {m.label}
                                        <ChevronDown aria-hidden className={cn("size-3.5 transition-transform duration-200 ease-power3-out", open && "rotate-180")} />
                                    </button>
                                </li>
                            );
                        })}
                        {NAV_LINKS.map((link) => (
                            <li key={link.href} className="relative" onMouseEnter={closeMenu}>
                                {hovered === link.href && <HoverPill />}
                                <NavItemLink link={link} active={!!isActive(link.href)} onHover={() => setHovered(link.href)} />
                            </li>
                        ))}
                    </ul>

                    <div className="ml-auto hidden items-center gap-2 md:flex">
                        <div className="auth-signed-out flex items-center gap-2">
                            <Button href={NAV_CTA.signIn.href} variant="ghost" className="text-soft">{NAV_CTA.signIn.label}</Button>
                            <Button href={NAV_CTA.signUp.href} variant="ink">{NAV_CTA.signUp.label}</Button>
                        </div>
                        <div className="auth-signed-in">
                            <Button href={NAV_CTA.dashboard.href} variant="ink">
                                {NAV_CTA.dashboard.label} <ArrowRight aria-hidden />
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto md:hidden"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((o) => !o)}
                    >
                        {mobileOpen ? <X aria-hidden /> : <Menu aria-hidden />}
                    </Button>
                </nav>

                <AnimatePresence>
                    {menu && (
                        <motion.div
                            id="nav-menu"
                            key="menu"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={panel}
                            onMouseEnter={keepMenu}
                            className="absolute inset-x-0 top-full hidden bg-background shadow-[0_1px_0_hsl(var(--border)),0_24px_48px_-24px_hsl(var(--foreground)/0.18)] md:block"
                        >
                            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8">
                                <ul className="grid gap-1 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
                                    {menu.items.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "group flex h-full flex-col gap-1.5 rounded-lg p-3 outline-none transition-colors duration-150 hover:bg-hover focus-visible:bg-hover",
                                                    isActive(item.href) && "bg-hover",
                                                )}
                                            >
                                                <span className="flex items-center gap-1 text-[15px] font-medium text-foreground">
                                                    {item.label}
                                                    <ArrowRight aria-hidden className="size-3.5 -translate-x-1 opacity-0 transition-[opacity,transform] duration-150 ease-power3-out group-hover:translate-x-0 group-hover:opacity-100" />
                                                </span>
                                                <span className="text-[14px] leading-[1.45] text-soft">{item.summary}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex flex-col gap-4 rounded-lg bg-raised p-5 lg:col-span-4">
                                    <p className="text-[16px] font-medium text-foreground">{menu.feature.title}</p>
                                    <p className="text-[14px] leading-[1.5] text-soft">{menu.feature.body}</p>
                                    {menu.feature.links.length > 0 && (
                                        <ul className="flex flex-col gap-2">
                                            {menu.feature.links.map((link) => (
                                                <li key={link.href}>
                                                    <Link
                                                        href={link.href}
                                                        {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                                                        className="inline-flex items-center gap-1 text-[14px] font-medium text-foreground hover:text-soft"
                                                    >
                                                        {link.label}
                                                        {link.external ? <ArrowUpRight aria-hidden className="size-3.5" /> : <ArrowRight aria-hidden className="size-3.5" />}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <Button href={NAV_CTA.contact.href} variant="secondary" className="mt-auto w-fit">
                                        {NAV_CTA.contact.label}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        key="mobile"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={panel}
                        className="absolute inset-x-0 top-full h-[100dvh] overflow-y-auto bg-background md:hidden"
                    >
                        <div className="flex flex-col gap-8 px-4 pb-40 pt-4 sm:px-6">
                            <section className="flex flex-col gap-1">
                                {NAV_MENUS.map((m) => {
                                    const expanded = mobileSection === m.id;
                                    return (
                                        <div key={m.id} className="flex flex-col">
                                            <button
                                                type="button"
                                                aria-expanded={expanded}
                                                aria-controls={`mobile-${m.id}`}
                                                onClick={() => setMobileSection(expanded ? null : m.id)}
                                                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-[17px] font-medium text-foreground outline-none hover:bg-hover focus-visible:bg-hover"
                                            >
                                                {m.label}
                                                <ChevronDown
                                                    aria-hidden
                                                    className={cn("size-5 text-soft transition-transform duration-200 ease-power3-out", expanded && "rotate-180")}
                                                />
                                            </button>
                                            <AnimatePresence initial={false}>
                                                {expanded && (
                                                    <motion.div
                                                        id={`mobile-${m.id}`}
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={panel}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="flex flex-col gap-1 pb-2 pl-3">
                                                            {m.items.map((item) => (
                                                                <Link key={item.href} href={item.href} className="flex flex-col gap-1 rounded-lg px-3 py-2.5 hover:bg-hover">
                                                                    <span className="text-[16px] font-medium text-foreground">{item.label}</span>
                                                                    <span className="text-[14px] text-soft">{item.summary}</span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                                {[...NAV_LINKS, { label: "Contact", href: "/contact" }].map((link: NavLink) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                                        className="flex items-center gap-1 rounded-lg px-3 py-2.5 text-[17px] font-medium text-foreground hover:bg-hover"
                                    >
                                        {link.label}
                                        {link.external && <ArrowUpRight aria-hidden className="size-4" />}
                                    </Link>
                                ))}
                            </section>
                            <div className="auth-signed-out grid grid-cols-2 gap-2">
                                <Button href={NAV_CTA.signIn.href} variant="secondary" size="lg">{NAV_CTA.signIn.label}</Button>
                                <Button href={NAV_CTA.signUp.href} variant="ink" size="lg">{NAV_CTA.signUp.label}</Button>
                            </div>
                            <div className="auth-signed-in">
                                <Button href={NAV_CTA.dashboard.href} variant="ink" size="lg" className="w-full">{NAV_CTA.dashboard.label}</Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
