"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { IconChart, IconShield, IconGrid, IconUsers, IconAward, IconWallet } from "../ui/Icons";

const navItems = [
  { href: "/dashboard", label: "Home", icon: IconChart },
  { href: "/dao", label: "DAO", icon: IconShield },
  { href: "/matrix", label: "Matrix", icon: IconGrid },
  { href: "/referrals", label: "Refer", icon: IconUsers },
  { href: "/rewards", label: "Rewards", icon: IconAward },
  { href: "/wallet", label: "Wallet", icon: IconWallet },
];

/**
 * BottomNav — Mobile bottom tab bar with vector icons
 */
export function BottomNav() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  if (!isConnected) return null;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "var(--bottom-nav-h)",
        background: "rgba(8, 1, 20, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(168, 85, 247, 0.2)",
        zIndex: 100,
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        alignItems: "center",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      className="mobile-bottom-nav"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "0.5rem 0",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            <Icon size={18} color={isActive ? "#f59e0b" : "#64748b"} />
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: isActive ? 800 : 500,
                color: isActive ? "#fcd34d" : "#64748b",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
