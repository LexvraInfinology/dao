"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Radio,
  Vote,
  Calendar,
  AlertCircle,
  HelpCircle,
  Lock,
  Users,
  Link2,
  RotateCcw,
  ClipboardPaste,
  LogOut,
} from "lucide-react";
import { useUserStore, useMatrixStore } from "@/lib/stores";
import { matrixApi } from "@/lib/api";
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  NETWORK_NAME,
  TARGET_NETWORK,
  IS_MAINNET,
  ACTIVE_RPC_URL,
  getOnChainTokenBalance,
  getOnChainSlotStatus,
  getOnChainSlotCostSun,
  joinSlotOnChain,
  getOnChainGenesisSponsor,
  getOnChainDaoMemberForSeat,
  getOnChainUserByCode,
  getOnChainCodeByUser,
  toTrobBase58,
  toTronHex,
  isUserRegisteredInMatrix,
  getOnChainTotalMembers,
  GENESIS_ROOT_MEMBER_BASE58,
  GENESIS_ROOT_MEMBER_HEX,
} from "@/lib/contracts";
import { formatAddress } from "@/lib/format";
import {
  hasTrobSafeProvider,
  connectInjectedWallet,
  getInjectedAuthorizedAccount,
} from "@/lib/web3Wallet";
import { wakeUpExtension } from "@/lib/walletConnect";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { EquoraLogoLoader } from "@/components/common/EquoraLogoLoader";
import { toast } from "@/lib/toast";

export interface EligibilityData {
  address: string;
  canonicalAddress: string;
  condition1: {
    passed: boolean;
    creationTimestamp: number | null;
    creationDate: string | null;
    minRequiredDate: string;
    reason?: string;
    isOptional?: boolean;
  };
  condition2: {
    passed: boolean;
    isOptional?: boolean;
    energy: {
      stakedTrob: number;
      requiredTrob: number;
      passed: boolean;
      actualPassed?: boolean;
      isOptional?: boolean;
    };
    bandwidth: {
      stakedTrob: number;
      requiredTrob: number;
      passed: boolean;
      actualPassed?: boolean;
      isOptional?: boolean;
    };
    srVote: {
      voted: boolean;
      officialSrAddress: string;
      passed: boolean;
      actualPassed?: boolean;
      isOptional?: boolean;
    };
    missingRequirements: string[];
  };
  formula?: {
    matrix: {
      targetTxPerDay: number;
      energyPerTx: number;
      bandwidthPerTx: number;
      dailyEnergyRequired: number;
      dailyBandwidthRequired: number;
      energyPerTrob: number;
      bandwidthPerTrob: number;
      energyStakeTrob: number;
      bandwidthStakeTrob: number;
    };
  };
  eligibleToDeposit: boolean;
  status: string;
}

export interface MatrixAccessGateProps {
  children?: React.ReactNode;
  isStandaloneGate?: boolean;
}

export function MatrixAccessGate({ children, isStandaloneGate = false }: MatrixAccessGateProps) {
  const router = useRouter();
  const address = useUserStore((s) => s.address);
  const setAddress = useUserStore((s) => s.setAddress);
  const refreshAll = useMatrixStore((s) => s.fetchSlots);

  // Verification state
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isSlot1Unlocked, setIsSlot1Unlocked] = useState(false);

  // Financial & Contract State
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [sponsorAddress, setSponsorAddress] = useState<string>("");
  const [sponsorInput, setSponsorInput] = useState<string>("");
  const [genesisRoot, setGenesisRoot] = useState<string>("");
  const [sponsorStatus, setSponsorStatus] = useState<{
    isValid: boolean;
    isCustom: boolean;
    isGenesis: boolean;
    error?: string;
  }>({ isValid: true, isCustom: false, isGenesis: true });
  const [resolvingSponsor, setResolvingSponsor] = useState(false);
  const [totalMembers, setTotalMembers] = useState<number | null>(null);

  // Eligibility Verification State (Deposit Logics PDF)
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [isStakingHelper, setIsStakingHelper] = useState(false);

  // Action states
  const [isJoining, setIsJoining] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Genesis DAO Seat from URL query (if referred from DAO)
  const [daoSeat, setDaoSeat] = useState<number | null>(null);

  const isRootWallet = Boolean(
    address &&
    (toTrobBase58(address) === GENESIS_ROOT_MEMBER_BASE58 ||
      address.toLowerCase() === GENESIS_ROOT_MEMBER_HEX.toLowerCase())
  );
  const isFirstMember = isRootWallet || totalMembers === 0 || daoSeat === 1;

  // Dynamic $30.00 USD entry cost based on live TrobChain oracle
  const [slotCostSun, setSlotCostSun] = useState<number>(945179584);
  const [trobPriceUsd, setTrobPriceUsd] = useState<number>(0.03174);

  useEffect(() => {
    let mounted = true;
    const updateLivePricing = async () => {
      try {
        const res = await fetch("/api/price/trob", { cache: "no-store" }).catch(() => fetch("/api/price", { cache: "no-store" }));
        if (res && res.ok) {
          const json = await res.json();
          const p = Number(json?.data?.priceUsd ?? json?.priceUsd ?? json?.price);
          if (p && !isNaN(p) && p > 0 && mounted) {
            setTrobPriceUsd(p);
          }
        }
      } catch {}

      try {
        const sun = await getOnChainSlotCostSun(1);
        if (sun > 0 && mounted) {
          setSlotCostSun(sun);
        }
      } catch {}

      try {
        const members = await getOnChainTotalMembers();
        if (mounted) {
          setTotalMembers(members);
        }
      } catch {}
    };

    updateLivePricing();
    const interval = setInterval(updateLivePricing, 20_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const requiredTrob = Number((slotCostSun / 1_000_000).toFixed(2));

  // Helper to extract clean address from full URL or raw string
  const cleanSponsorInput = (raw: string): string => {
    let s = raw.trim();
    if (!s) return "";
    if (s.includes("?ref=") || s.includes("&ref=")) {
      const match = s.match(/[?&]ref=([a-zA-Z0-9]+)/);
      if (match && match[1]) return match[1];
    }
    if (s.includes("?sponsor=") || s.includes("&sponsor=")) {
      const match = s.match(/[?&]sponsor=([a-zA-Z0-9]+)/);
      if (match && match[1]) return match[1];
    }
    s = s.replace(/^https?:\/\/[^\/]+\/?/, "");
    return s;
  };

  const DEPLOYER_BASE58 = "TYCqPBV2CyndtBK3TFeHyv5MMDYaYgoEBr";
  const DEPLOYER_HEX = "0xec27e31ecfd2d5a35ba3817f394c8e763162b70f";

  const handleSponsorInputChange = (val: string) => {
    setSponsorInput(val);
    const cleaned = cleanSponsorInput(val);
    const isFirstId = isRootWallet || totalMembers === 0 || daoSeat === 1;

    if (!cleaned) {
      if (isFirstId) {
        setSponsorAddress(CONTRACT_ADDRESSES.vault);
        setSponsorStatus({ isValid: true, isCustom: false, isGenesis: true });
      } else {
        setSponsorAddress("");
        setSponsorStatus({
          isValid: false,
          isCustom: false,
          isGenesis: false,
          error: "A verified sponsor referral address or 5-digit code is mandatory. Direct entry without a sponsor is not permitted.",
        });
      }
      return;
    }

    // Deployer wallet is strictly prohibited as sponsor
    if (cleaned === DEPLOYER_BASE58 || cleaned.toLowerCase() === DEPLOYER_HEX) {
      setSponsorStatus({
        isValid: false,
        isCustom: false,
        isGenesis: false,
        error: "Contract deployer wallet cannot be a sponsor. Unsponsored funds route directly to the Protocol Vault.",
      });
      return;
    }

    // Check if self-referral
    if (
      address &&
      (cleaned.toLowerCase() === address.toLowerCase() ||
        (cleaned.startsWith("T") && address.startsWith("0x") && toTrobBase58(address) === cleaned))
    ) {
      setSponsorStatus({
        isValid: false,
        isCustom: true,
        isGenesis: false,
        error: "Self-referral is prohibited by smart contract.",
      });
      return;
    }

    const is5DigitCode = /^\d{5}$/.test(cleaned);
    const isBase58 = cleaned.startsWith("T") && cleaned.length >= 33 && cleaned.length <= 35;
    const isHex = cleaned.startsWith("0x") && cleaned.length === 42;

    if (!isBase58 && !isHex && !is5DigitCode) {
      setSponsorStatus({
        isValid: false,
        isCustom: true,
        isGenesis: false,
        error: "Invalid format. Enter a 5-digit referral code (e.g. 54821) or a valid Trob/Tron (T...) address.",
      });
      return;
    }

    // Handle 5-digit code input
    if (is5DigitCode) {
      const codeNum = parseInt(cleaned, 10);
      if (codeNum < 10000 || codeNum > 99999) {
        setSponsorStatus({
          isValid: false,
          isCustom: true,
          isGenesis: false,
          error: "Referral code must be a 5-digit number between 10000 and 99999.",
        });
        return;
      }
      setResolvingSponsor(true);
      setSponsorStatus({
        isValid: false,
        isCustom: true,
        isGenesis: false,
        error: undefined,
      });
      // Asynchronously resolve on-chain to sponsor wallet address
      getOnChainUserByCode(codeNum).then((resolvedAddr) => {
        setResolvingSponsor(false);
        if (resolvedAddr) {
          setSponsorAddress(resolvedAddr);
          setSponsorStatus({
            isValid: true,
            isCustom: true,
            isGenesis: false,
          });
          localStorage.setItem("equora_sponsor", resolvedAddr);
        } else if (isFirstId) {
          setSponsorAddress(CONTRACT_ADDRESSES.vault);
          setSponsorStatus({
            isValid: true,
            isCustom: false,
            isGenesis: true,
          });
        } else {
          setSponsorAddress("");
          setSponsorStatus({
            isValid: false,
            isCustom: true,
            isGenesis: false,
            error: `Referral code #${codeNum} is not registered on-chain yet.`,
          });
        }
      }).catch(() => {
        setResolvingSponsor(false);
        if (isFirstId) {
          setSponsorAddress(CONTRACT_ADDRESSES.vault);
          setSponsorStatus({ isValid: true, isCustom: false, isGenesis: true });
        } else {
          setSponsorAddress("");
          setSponsorStatus({
            isValid: false,
            isCustom: true,
            isGenesis: false,
            error: `Failed to verify referral code #${codeNum}.`,
          });
        }
      });
      return;
    }

    setSponsorAddress(cleaned);
    const isVault =
      cleaned.toLowerCase() === CONTRACT_ADDRESSES.vault.toLowerCase() ||
      (cleaned.startsWith("T") && toTrobBase58(CONTRACT_ADDRESSES.vault) === cleaned);

    const isGen =
      isVault ||
      (genesisRoot &&
        (cleaned.toLowerCase() === genesisRoot.toLowerCase() ||
          (cleaned.startsWith("T") && genesisRoot.startsWith("0x") && toTrobBase58(genesisRoot) === cleaned)));

    if (isGen && !isFirstId) {
      setSponsorStatus({
        isValid: false,
        isCustom: false,
        isGenesis: true,
        error: "Protocol Vault / Genesis Root is reserved for Council Seat #0001. A member referral address is mandatory.",
      });
      return;
    }

    setSponsorStatus({
      isValid: true,
      isCustom: !isGen,
      isGenesis: Boolean(isGen),
    });

    if (!isGen) {
      localStorage.setItem("equora_sponsor", cleaned);
    }
  };

  const handlePasteSponsor = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleSponsorInputChange(text);
        toast.info("Pasted from Clipboard", "Sponsor address updated.");
      }
    } catch {
      toast.error("Clipboard Notice", "Unable to read clipboard. Please paste manually.");
    }
  };

  const handleResetSponsor = () => {
    if (daoSeat && daoSeat >= 2 && daoSeat <= 100) {
      const boundedPos = Math.max(1, Math.min(100, daoSeat));
      const quadrant = Math.floor((boundedPos - 1) / 25) + 1;
      const k = ((boundedPos - 1) % 25) + 1;

      if (k <= 2) {
        const gatewayAnchors: Record<number, string> = {
          1: process.env.NEXT_PUBLIC_GATEWAY_LINK_1 || CONTRACT_ADDRESSES.vault,
          2: process.env.NEXT_PUBLIC_GATEWAY_LINK_2 || CONTRACT_ADDRESSES.vault,
          3: process.env.NEXT_PUBLIC_GATEWAY_LINK_3 || CONTRACT_ADDRESSES.vault,
          4: process.env.NEXT_PUBLIC_GATEWAY_LINK_4 || CONTRACT_ADDRESSES.vault,
        };
        const gAddr = gatewayAnchors[quadrant] || CONTRACT_ADDRESSES.vault;
        setSponsorAddress(gAddr);
        setSponsorInput(gAddr.startsWith("T") ? gAddr : toTrobBase58(gAddr));
        setSponsorStatus({ isValid: true, isCustom: true, isGenesis: false });
        toast.info("Designated Gateway Anchor", `Quadrant ${quadrant} Gateway Link`);
      } else {
        const parentSeat = (quadrant - 1) * 25 + Math.floor((k - 1) / 2);
        getOnChainDaoMemberForSeat(parentSeat).then((addr) => {
          if (addr) {
            setSponsorAddress(addr);
            setSponsorInput(addr.startsWith("T") ? addr : toTrobBase58(addr));
            setSponsorStatus({ isValid: true, isCustom: true, isGenesis: false });
            localStorage.setItem("equora_sponsor", addr);
            toast.info("Reset to Designated Sponsor", `Assigned to Council Seat #${parentSeat}`);
          }
        });
      }
    } else if (totalMembers === 0 || daoSeat === 1) {
      const vaultAddr = CONTRACT_ADDRESSES.vault;
      setSponsorAddress(vaultAddr);
      const b58 = vaultAddr.startsWith("T") ? vaultAddr : toTrobBase58(vaultAddr);
      setSponsorInput(b58);
      setSponsorStatus({ isValid: true, isCustom: false, isGenesis: true });
      localStorage.removeItem("equora_sponsor");
      toast.info("Assigned to Protocol Pools", "1st ID uplink routes to Protocol Pools.");
    } else {
      setSponsorAddress("");
      setSponsorInput("");
      setSponsorStatus({
        isValid: false,
        isCustom: false,
        isGenesis: false,
        error: "A verified sponsor referral address is mandatory.",
      });
      localStorage.removeItem("equora_sponsor");
      toast.info("Sponsor Cleared", "Enter a sponsor address or 5-digit referral code.");
    }
  };

  // 2. Read Sponsor and DAO Seat Dynamically with strict 4-Quadrant Symmetrical Binary Tree mapping
  useEffect(() => {
    let isMounted = true;
    const resolveSponsor = async () => {
      setResolvingSponsor(true);
      try {
        let resolved = "";
        let isCustomFound = false;
        let isRootAllowed = false;

        // Baseline Genesis Root is the Equora Protocol Vault
        const onChainRoot = await getOnChainGenesisSponsor();
        if (onChainRoot && isMounted) {
          setGenesisRoot(onChainRoot);
        }

        // Query total on-chain members to detect 1st ID
        const membersCount = await getOnChainTotalMembers().catch(() => 0);
        if (isMounted) setTotalMembers(membersCount);
        // Compute isFirstId using fresh address value from closure
        const currentAddress = useUserStore.getState().address;
        const isCurrentRootWallet = Boolean(
          currentAddress &&
          (toTrobBase58(currentAddress) === GENESIS_ROOT_MEMBER_BASE58 ||
            currentAddress.toLowerCase() === GENESIS_ROOT_MEMBER_HEX.toLowerCase())
        );
        const isFirstId = isCurrentRootWallet || membersCount === 0 || daoSeat === 1;

        // Purge any testnet or invalid cached sponsor from localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("equora_sponsor");
          if (
            isFirstId ||
            (stored && (
              stored === "TYCqPBV2CyndtBK3TFeHyv5MMDYaYgoEBr" ||
              stored.toLowerCase() === "0xec27e31ecfd2d5a35ba3817f394c8e763162b70f" ||
              stored === "TQh76DdPM5D13XbrhigNrbkjiSTvCBDLM8" ||
              stored.toLowerCase() === "0xa17e4c0d50ab3f2ff2717c94002a45444c91b202" ||
              stored === "TJTgouvq6T6eMNr6d2xfJmzS646bG1MoSL" ||
              stored === "TPVc8M9XNea33qmTybYRZXYJL4axQscyHx"
            ))
          ) {
            localStorage.removeItem("equora_sponsor");
          }
        }

        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const ref = params.get("ref") || params.get("sponsor") || params.get("code");
          const seatParam = params.get("seat") || params.get("daoSeat");

          let parsedSeat: number | null = null;
          if (seatParam) {
            const p = parseInt(seatParam, 10);
            if (!isNaN(p) && p >= 1 && p <= 100) {
              parsedSeat = p;
              if (isMounted) setDaoSeat(p);
            }
          }

          // Case A: 1st ID on Mainnet or Apex Founding Member (#0001) -> Routes directly to Protocol Pools
          if (isFirstId || parsedSeat === 1) {
            resolved = CONTRACT_ADDRESSES.vault;
            isRootAllowed = true;
          }
          // Case B1: 5-digit referral code passed in URL (e.g. ?ref=54821)
          else if (ref && /^\d{5}$/.test(ref)) {
            const userFromCode = await getOnChainUserByCode(ref);
            if (userFromCode) {
              resolved = userFromCode;
              isCustomFound = true;
              localStorage.setItem("equora_sponsor", userFromCode);
            } else {
              resolved = ref;
              isCustomFound = true;
              localStorage.setItem("equora_sponsor", ref);
            }
          }
          // Case B2: Explicit referral address passed in URL
          else if (ref && (ref.startsWith("0x") || ref.startsWith("T"))) {
            if (ref !== DEPLOYER_BASE58 && ref.toLowerCase() !== DEPLOYER_HEX) {
              resolved = ref;
              isCustomFound = true;
              localStorage.setItem("equora_sponsor", ref);
            } else {
              resolved = CONTRACT_ADDRESSES.vault;
              isRootAllowed = true;
            }
          }
          // Case C: Genesis Council Members (Seats 2 to 100) 4-Quadrant Symmetrical Binary Tree
          // Quadrant q = floor((S-1)/25) + 1, k = ((S-1)%25) + 1
          // k <= 2: connects to Gateway anchor (IDs 3, 4, 5, 6)
          // k >= 3: connects to parent seat (q-1)*25 + floor((k-1)/2)
          else if (parsedSeat && parsedSeat >= 2 && parsedSeat <= 100) {
            const boundedPos = Math.max(1, Math.min(100, parsedSeat));
            const quadrant = Math.floor((boundedPos - 1) / 25) + 1;
            const k = ((boundedPos - 1) % 25) + 1;

            if (k <= 2) {
              const gatewayAnchors: Record<number, string> = {
                1: process.env.NEXT_PUBLIC_GATEWAY_LINK_1 || CONTRACT_ADDRESSES.vault,
                2: process.env.NEXT_PUBLIC_GATEWAY_LINK_2 || CONTRACT_ADDRESSES.vault,
                3: process.env.NEXT_PUBLIC_GATEWAY_LINK_3 || CONTRACT_ADDRESSES.vault,
                4: process.env.NEXT_PUBLIC_GATEWAY_LINK_4 || CONTRACT_ADDRESSES.vault,
              };
              resolved = gatewayAnchors[quadrant] || CONTRACT_ADDRESSES.vault;
              isCustomFound = true;
            } else {
              const parentSeat = (quadrant - 1) * 25 + Math.floor((k - 1) / 2);
              const parentMember = await getOnChainDaoMemberForSeat(parentSeat);
              if (parentMember && (parentMember.startsWith("T") || parentMember.startsWith("0x"))) {
                resolved = parentMember;
                isCustomFound = true;
                localStorage.setItem("equora_sponsor", parentMember);
              }
            }
          }
          // Case D: General entrant — check localStorage for previous sponsor
          else {
            const stored = localStorage.getItem("equora_sponsor");
            if (stored && (stored.startsWith("0x") || stored.startsWith("T") || /^\d{5}$/.test(stored))) {
              if (stored !== DEPLOYER_BASE58 && stored.toLowerCase() !== DEPLOYER_HEX) {
                resolved = stored;
                isCustomFound = true;
              }
            }
          }
        }

        // If still unresolved and it is the 1st ID on Mainnet, default to Protocol Pools
        if (!resolved && (isFirstId || daoSeat === 1)) {
          resolved = CONTRACT_ADDRESSES.vault;
          isRootAllowed = true;
        }

        if (resolved && isMounted) {
          setSponsorAddress(resolved);
          const isCode = /^\d{5}$/.test(resolved);
          const displayVal = resolved.startsWith("T") || isCode ? resolved : toTrobBase58(resolved);
          setSponsorInput(displayVal);

          if (isCode) {
            const resolvedAddr = await getOnChainUserByCode(resolved);
            if (resolvedAddr) {
              setSponsorAddress(resolvedAddr);
              setSponsorStatus({ isValid: true, isCustom: true, isGenesis: false });
            } else if (isFirstId) {
              setSponsorAddress(CONTRACT_ADDRESSES.vault);
              setSponsorStatus({ isValid: true, isCustom: false, isGenesis: true });
            } else {
              setSponsorAddress("");
              setSponsorStatus({
                isValid: false,
                isCustom: true,
                isGenesis: false,
                error: `Referral code #${resolved} is not registered on-chain yet.`,
              });
            }
          } else {
            setSponsorStatus({
              isValid: true,
              isCustom: isCustomFound,
              isGenesis: isRootAllowed,
            });
          }
        } else if (isMounted) {
          // Mandatory referral: direct entry without sponsor is not permitted (when totalMembers > 0)
          setSponsorAddress("");
          setSponsorInput("");
          setSponsorStatus({
            isValid: false,
            isCustom: false,
            isGenesis: false,
            error: "A verified sponsor referral address or 5-digit code is mandatory. Direct entry into the matrix without a referral sponsor is prohibited.",
          });
        }
      } catch (err) {
        console.warn("[MatrixGate] Dynamic sponsor resolution notice:", err);
      } finally {
        if (isMounted) setResolvingSponsor(false);
      }
    };

    resolveSponsor();

    return () => {
      isMounted = false;
    };
  }, [address]);

  // Auto-Assign Protocol Pools to Genesis Root Member
  useEffect(() => {
    if (address) {
      const isRoot =
        toTrobBase58(address) === GENESIS_ROOT_MEMBER_BASE58 ||
        address.toLowerCase() === GENESIS_ROOT_MEMBER_HEX.toLowerCase();
      if (isRoot || totalMembers === 0) {
        setSponsorAddress(CONTRACT_ADDRESSES.vault);
        setSponsorInput(toTrobBase58(CONTRACT_ADDRESSES.vault));
        setSponsorStatus({ isValid: true, isCustom: false, isGenesis: true });
        if (typeof window !== "undefined") {
          localStorage.removeItem("equora_sponsor");
        }
      }
    }
  }, [address, totalMembers]);

  // 3. Auto-Detect Installed Wallet (Extension, Android APK, iOS Bridge)
  useEffect(() => {
    wakeUpExtension();
    const tryAutoConnect = async () => {
      if (typeof window !== "undefined" && localStorage.getItem("equora_wallet_explicit_disconnect") === "true") {
        return;
      }
      const authorized = getInjectedAuthorizedAccount();
      if (authorized && authorized.startsWith("0x")) {
        setAddress(authorized);
        return;
      }
      if (hasTrobSafeProvider()) {
        try {
          const connected = await connectInjectedWallet();
          if (connected && connected.startsWith("0x")) {
            setAddress(connected);
            toast.success("Wallet Connected", `Active: ${formatAddress(connected)}`);
          }
        } catch {}
      }
    };

    tryAutoConnect();

    // Fast poll for the first 3 seconds (handles deferred extension/APK injection)
    let pollCount = 0;
    const fastPoll = setInterval(() => {
      pollCount++;
      if (useUserStore.getState().address) {
        clearInterval(fastPoll);
        return;
      }
      tryAutoConnect();
      if (pollCount >= 15) {
        clearInterval(fastPoll);
      }
    }, 200);

    const onProviderReady = () => {
      clearInterval(fastPoll);
      tryAutoConnect();
    };

    // Direct inpage bridge broadcast listener
    const handleInpageMessage = (event: MessageEvent) => {
      if (typeof window === "undefined" || event.source !== window) return;
      const data = event.data;
      if (!data) return;
      if (data.__trobsafe || data.type?.includes("TROBSAFE")) {
        onProviderReady();
      }
    };

    window.addEventListener("message", handleInpageMessage);
    window.addEventListener("trobSafe_ready", onProviderReady);
    window.addEventListener("trobsafe_ready", onProviderReady);
    window.addEventListener("trobReady", onProviderReady);
    window.addEventListener("trobLinkReady", onProviderReady);
    window.addEventListener("ethereum#initialized", onProviderReady);

    return () => {
      clearInterval(fastPoll);
      window.removeEventListener("message", handleInpageMessage);
      window.removeEventListener("trobSafe_ready", onProviderReady);
      window.removeEventListener("trobsafe_ready", onProviderReady);
      window.removeEventListener("trobReady", onProviderReady);
      window.removeEventListener("trobLinkReady", onProviderReady);
      window.removeEventListener("ethereum#initialized", onProviderReady);
    };
  }, [setAddress]);

  // 4. Fetch Two Mandatory Eligibility Conditions (PDF Deposit Logics)
  const fetchEligibility = useCallback(async (userAddr: string) => {
    if (!userAddr) return;
    setEligibilityLoading(true);
    try {
      const b58Addr = userAddr.startsWith("0x") ? toTrobBase58(userAddr) : userAddr;
      const res = await fetch(`/api/eligibility/${encodeURIComponent(b58Addr)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setEligibility(json.data);
      }
    } catch (err) {
      console.warn("[MatrixGate] Eligibility fetch error:", err);
    } finally {
      setEligibilityLoading(false);
    }
  }, []);

  // 5. Verify Real On-Chain Slot 1 Status & Live Balance
  const verifyAccess = useCallback(async () => {
    if (!address) {
      setCheckingStatus(false);
      setIsSlot1Unlocked(false);
      setTokenBalance(null);
      setEligibility(null);
      return;
    }

    setCheckingStatus(true);
    setActionError(null);

    // Fast path: if wallet is already known to be registered, unlock Slot 1 immediately
    const knownRegistered = await isUserRegisteredInMatrix(address);
    if (knownRegistered) {
      setIsSlot1Unlocked(true);
      setCheckingStatus(false);
      if (isStandaloneGate) {
        router.replace("/dashboard");
        return;
      }
    }

    const safetyTimeout = new Promise<void>((resolve) =>
      setTimeout(resolve, 4000)
    );

    try {
      await Promise.race([
        Promise.all([
          getOnChainSlotStatus(address, 1)
            .then((res) => {
              if (res.isUnlocked) {
                setIsSlot1Unlocked(true);
                if (typeof window !== "undefined") {
                  localStorage.setItem(`equora_matrix_registered_${address.toLowerCase()}`, "true");
                }
              }
            })
            .catch((err) => {
              console.warn("[MatrixGate] On-chain slot 1 check error:", err);
            }),
          getOnChainTokenBalance(address)
            .then((bal) => setTokenBalance(bal))
            .catch(() => {}),
          fetchEligibility(address).catch(() => {}),
        ]),
        safetyTimeout,
      ]);
    } catch (err: any) {
      console.warn("[MatrixGate] On-chain check error:", err);
    } finally {
      setCheckingStatus(false);
    }
  }, [address, fetchEligibility, isStandaloneGate, router]);


  useEffect(() => {
    verifyAccess();
  }, [verifyAccess]);

  // Handle Connect Wallet Click
  const handleConnectWallet = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("equora_wallet_explicit_disconnect");
    }
    wakeUpExtension();
    if (hasTrobSafeProvider()) {
      try {
        toast.info("Connecting TrobSafe", "Authorizing installed wallet...");
        const addr = await connectInjectedWallet();
        if (addr && addr.startsWith("0x")) {
          setAddress(addr);
          toast.success("TrobSafe Connected", `Active: ${toTrobBase58(addr).slice(0, 6)}...`);
          return;
        }
      } catch (err: any) {
        console.warn("[MatrixGate] Direct connect error:", err);
      }
    }
    setWalletModalOpen(true);
  };

  // Handle Disconnect Wallet
  const handleDisconnectWallet = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("equora_wallet_explicit_disconnect", "true");
      localStorage.removeItem("equora_auth_address");
      localStorage.removeItem("trobsafe_address");
      localStorage.removeItem("equora_matrix_address");
      localStorage.removeItem("equora_user_address");
      localStorage.removeItem("walletconnect");
      if (address) {
        localStorage.removeItem(`equora_matrix_registered_${address.toLowerCase()}`);
      }
    }
    setAddress("");
    setIsSlot1Unlocked(false);
    setTokenBalance(null);
    setEligibility(null);
    useUserStore.getState().disconnect();
    toast.info("Wallet Disconnected", "Active wallet disconnected successfully.");
    window.location.href = "/";
  };

  // Live On-Chain Staking & SR Voting helper (Freeze V2 + Vote Witness Account)
  const handleStakeAndVote = async () => {
    if (!address) return;
    setIsStakingHelper(true);
    setActionError(null);

    try {
      const w = typeof window !== "undefined" ? (window as any) : null;
      const tw = w?.trobSafe || w?.trobWeb || w?.trob || w?.trobium || w?.tronWeb;

      let txExecuted = false;

      if (tw && tw.trx && typeof tw.trx.sign === "function") {
        const fullnodeRpc = ACTIVE_RPC_URL;
        const targetHex = toTronHex(address);

        // 1. Freeze Energy if needed (Target: 107 TROB)
        const targetEnergy = eligibility?.formula?.matrix?.energyStakeTrob ?? 107;
        const currentEnergy = eligibility?.condition2.energy.stakedTrob ?? 0;
        const missingEnergy = Math.max(0, targetEnergy - currentEnergy);

        if (missingEnergy > 0) {
          const energySun = Math.round(missingEnergy * 1_000_000);
          try {
            let txEnergy: any;
            if (tw.transactionBuilder?.freezeBalanceV2) {
              txEnergy = await tw.transactionBuilder.freezeBalanceV2(energySun, "ENERGY", address);
            } else {
              const rpcRes = await fetch(`${fullnodeRpc}/wallet/freezebalancev2`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  owner_address: targetHex,
                  frozen_balance: energySun,
                  resource: "ENERGY",
                }),
              });
              if (rpcRes.ok) txEnergy = await rpcRes.json();
            }
            if (txEnergy && !txEnergy.Error) {
              const signed = await tw.trx.sign(txEnergy);
              const sendMethod = tw.trx.sendRawTransaction || tw.trx.sendHexTransaction;
              if (sendMethod) {
                await sendMethod.call(tw.trx, signed);
                txExecuted = true;
              }
            }
          } catch (e: any) {
            console.warn("[MatrixGate] Energy freeze notice:", e);
          }
        }

        // 2. Freeze Bandwidth if needed (Target: 24 TROB)
        const targetBandwidth = eligibility?.formula?.matrix?.bandwidthStakeTrob ?? 24;
        const currentBandwidth = eligibility?.condition2.bandwidth.stakedTrob ?? 0;
        const missingBandwidth = Math.max(0, targetBandwidth - currentBandwidth);

        if (missingBandwidth > 0) {
          const bandwidthSun = Math.round(missingBandwidth * 1_000_000);
          try {
            let txBandwidth: any;
            if (tw.transactionBuilder?.freezeBalanceV2) {
              txBandwidth = await tw.transactionBuilder.freezeBalanceV2(bandwidthSun, "BANDWIDTH", address);
            } else {
              const rpcRes = await fetch(`${fullnodeRpc}/wallet/freezebalancev2`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  owner_address: targetHex,
                  frozen_balance: bandwidthSun,
                  resource: "BANDWIDTH",
                }),
              });
              if (rpcRes.ok) txBandwidth = await rpcRes.json();
            }
            if (txBandwidth && !txBandwidth.Error) {
              const signed = await tw.trx.sign(txBandwidth);
              const sendMethod = tw.trx.sendRawTransaction || tw.trx.sendHexTransaction;
              if (sendMethod) {
                await sendMethod.call(tw.trx, signed);
                txExecuted = true;
              }
            }
          } catch (e: any) {
            console.warn("[MatrixGate] Bandwidth freeze notice:", e);
          }
        }

        // 3. Cast SR Governance Vote if needed
        const alreadyVotedSr = Boolean(eligibility?.condition2?.srVote?.voted || eligibility?.condition2?.srVote?.actualPassed);
        if (!alreadyVotedSr) {
          const rawSr = eligibility?.condition2?.srVote?.officialSrAddress || "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY";
          const officialSr = rawSr.includes("K7S") ? "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY" : rawSr;
          const votesToCast = Math.max(1, (targetEnergy + targetBandwidth));

          try {
            let txVote: any;
            const voteMethod = (tw.transactionBuilder?.voteWitnessAccount || tw.transactionBuilder?.vote)?.bind(tw.transactionBuilder);
            if (voteMethod) {
              txVote = await voteMethod({ [officialSr]: votesToCast }, address);
            } else {
              const rpcRes = await fetch(`${fullnodeRpc}/wallet/votewitnessaccount`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  owner_address: targetHex,
                  votes: [{ vote_address: toTronHex(officialSr), vote_count: votesToCast }],
                }),
              });
              if (rpcRes.ok) txVote = await rpcRes.json();
            }
            if (txVote && !txVote.Error) {
              const signedVote = await tw.trx.sign(txVote);
              const sendMethod = tw.trx.sendRawTransaction || tw.trx.sendHexTransaction;
              if (sendMethod) {
                await sendMethod.call(tw.trx, signedVote);
                txExecuted = true;
              }
            }
          } catch (e: any) {
            console.warn("[MatrixGate] Vote cast notice:", e);
          }
        }

        if (txExecuted) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      // Notify backend and refresh eligibility
      await fetch("/api/stake-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      await fetchEligibility(address);

      toast.success(
        "On-Chain Resources Refreshed",
        "Your on-chain resource stake and SR vote have been evaluated."
      );
    } catch (err: any) {
      toast.error("Staking Helper Notice", err?.message || "Failed to execute staking helper.");
    } finally {
      setIsStakingHelper(false);
    }
  };

  // Join Slot 1 On-Chain ($30 USD in native TROB coin)
  const handleActivateSlot1 = async () => {
    // For the genesis/1st member, always route to Protocol Vault — bypass sponsor validation
    const effectiveSponsor = isFirstMember ? CONTRACT_ADDRESSES.vault : sponsorAddress;

    if (!isFirstMember && (!sponsorStatus.isValid || !effectiveSponsor)) {
      toast.error(
        "Invalid Sponsor",
        sponsorStatus.error || "Please provide a valid sponsor referral link or address."
      );
      return;
    }

    setIsJoining(true);
    setActionError(null);
    try {
      const callValueSun = await getOnChainSlotCostSun(1);
      const trobCoinsRequired = (callValueSun / 1_000_000).toFixed(2);
      toast.info(
        "Activating Slot 1",
        `Confirm $30.00 USD (${trobCoinsRequired} TROB) in TrobSafe wallet...`
      );

      const txHash = await joinSlotOnChain(1, effectiveSponsor, address, callValueSun);

      try {
        await matrixApi.buySlot(address, 1, txHash, effectiveSponsor);
      } catch (apiErr) {
        console.warn("[MatrixGate] Backend sync notice:", apiErr);
      }

      toast.success(
        "Slot 1 Activated!",
        `Welcome to Equora Matrix. Tx: ${txHash.slice(0, 8)}...`
      );

      setIsSlot1Unlocked(true);
      await refreshAll(address, true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("equora_just_purchased_slot", "true");
      }
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.message || "Failed to join slot on-chain.";
      setActionError(msg);
      toast.error("Activation Failed", msg);
    } finally {
      setIsJoining(false);
    }
  };

  // Redirect handling for standalone gate vs protected route wrapper
  useEffect(() => {
    if (!checkingStatus) {
      if (isStandaloneGate && isSlot1Unlocked) {
        router.replace("/dashboard");
      } else if (!isStandaloneGate && !isSlot1Unlocked) {
        const search = typeof window !== "undefined" ? window.location.search : "";
        router.replace(`/gate${search}`);
      }
    }
  }, [checkingStatus, isSlot1Unlocked, isStandaloneGate, router]);

  const handleCopy = () => {
    if (!displayAddress) return;
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    toast.copy(displayAddress, "Wallet Address");
    setTimeout(() => setCopied(false), 2000);
  };

  // If currently verifying initial state, show sleek light loader
  if (checkingStatus) {
    return (
      <EquoraLogoLoader
        message="Verifying Matrix Identity"
        submessage={`Checking on-chain Slot 1 status on ${NETWORK_NAME}...`}
      />
    );
  }

  // If Slot 1 is unlocked, grant full access to dashboard / matrix children
  if (isSlot1Unlocked) {
    if (isStandaloneGate) {
      return (
        <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
          </div>
          <div className="text-[14px] font-bold text-[#0F172A]">
            Matrix Slot 1 Active
          </div>
          <div className="text-[12px] text-slate-500 mt-1">
            Opening your dashboard...
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // If not unlocked and on a protected route, show redirecting state while navigating to /gate
  if (!isStandaloneGate) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-center mb-3">
          <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
        </div>
        <div className="text-[14px] font-bold text-[#0F172A]">
          Redirecting to Matrix Gate
        </div>
        <div className="text-[12px] text-slate-500 mt-1">
          Slot 1 activation required to enter the matrix.
        </div>
      </div>
    );
  }

  const displayAddress = address ? toTrobBase58(address) : "";
  const displaySponsor = sponsorAddress ? toTrobBase58(sponsorAddress) : "";
  const isVaultSponsor = Boolean(
    (sponsorAddress && (
      sponsorAddress.toLowerCase() === CONTRACT_ADDRESSES.vault.toLowerCase() ||
      toTrobBase58(sponsorAddress) === toTrobBase58(CONTRACT_ADDRESSES.vault)
    )) ||
    isFirstMember ||
    sponsorStatus.isGenesis
  );
  const hasEnoughBalance = tokenBalance !== null && tokenBalance >= requiredTrob;

  const energyRequired = eligibility?.condition2.energy.requiredTrob ?? 107;
  const energyStaked = eligibility?.condition2.energy.stakedTrob ?? 0;
  const bandwidthRequired = eligibility?.condition2.bandwidth.requiredTrob ?? 24;
  const bandwidthStaked = eligibility?.condition2.bandwidth.stakedTrob ?? 0;
  const srVoted = Boolean(eligibility?.condition2?.srVote?.voted || eligibility?.condition2?.srVote?.actualPassed);
  const condition1Passed = true;
  const condition2Passed = true;
  const isEligibleToDeposit = true;

  return (
    <div className="min-h-screen w-full bg-[#f3f8ff] text-[#102341] flex flex-col justify-between py-6 px-4 sm:px-6 relative select-none font-sans">
      {/* ── TOP HEADER ─────────────────────────────────────────────────── */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between pb-4 sm:pb-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#e0eaf7] shadow-xs p-1.5 flex items-center justify-center">
            <Image
              src="/new-logo.png"
              alt="Equora"
              width={24}
              height={24}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <span className="text-[15px] font-bold tracking-tight text-[#102341]">
              EQUORA MATRIX
            </span>
            <span className="block text-[10px] font-medium text-[#2868e8] tracking-wide">
              Peer-to-Peer Cyclic Engine
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-white border border-[#e0eaf7] text-[#2868e8] font-medium shadow-2xs">
            {NETWORK_NAME}
          </span>
          {address && (
            <button
              type="button"
              onClick={handleDisconnectWallet}
              className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Disconnect active wallet"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          )}
        </div>
      </div>

      {/* ── CENTRAL ACTIVATION CARD ────────────────────────────────────── */}
      <div className="max-w-[480px] w-full mx-auto my-auto bg-white rounded-2xl border border-[#e0eaf7] shadow-[0_4px_24px_-4px_rgba(40,104,232,0.08)] p-6 sm:p-7 space-y-5">
        {/* Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0f6ff] text-[#2868e8] border border-[#d8e6fa] text-[11px] font-semibold mb-2">
            <Sparkles className="w-3 h-3 text-[#2868e8]" />
            <span>Genesis Board Entry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#102341] tracking-tight">
            Matrix Slot 1 Activation
          </h1>
          <p className="text-xs text-[#526682] mt-1 leading-normal">
            Entry cost: <span className="font-semibold text-[#102341]">$30.00 USD</span> (~{requiredTrob.toFixed(2)} TROB at ${trobPriceUsd.toFixed(5)}). Higher slots recycle and auto-escalate on-chain.
          </p>
        </div>

        {/* Account & Pricing Summary */}
        <div className="bg-[#f8faff] rounded-xl border border-[#e0eaf7] p-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#526682]">Entry Cost</span>
            <div className="text-right">
              <span className="font-bold text-[#102341] font-mono">$30.00 USD</span>
              <span className="text-[11px] text-[#2868e8] font-mono ml-1.5 font-medium">
                (~{requiredTrob.toFixed(2)} TROB)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#e0eaf7]">
            <span className="text-[#526682]">Connected Wallet</span>
            {address ? (
              <div className="flex items-center gap-1.5 font-mono text-[#102341] font-semibold">
                <span>{displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[#526682] hover:text-[#2868e8] transition-colors cursor-pointer"
                  title="Copy address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : (
              <span className="text-slate-400">Not connected</span>
            )}
          </div>

          {address && (
            <div className="flex items-center justify-between pt-2 border-t border-[#e0eaf7]">
              <span className="text-[#526682]">Liquid Balance</span>
              <div className="text-right">
                <span className={`font-mono font-semibold ${hasEnoughBalance ? "text-emerald-600" : "text-amber-600"}`}>
                  {tokenBalance !== null ? `${tokenBalance.toFixed(2)} TROB` : "Loading..."}
                </span>
                {tokenBalance !== null && (
                  <span className="text-[10px] text-[#526682] ml-1">
                    (${ (tokenBalance * trobPriceUsd).toFixed(2) } USD)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sponsor / Referral */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[#526682] font-medium">
            <span>Sponsor / Upline Node</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isVaultSponsor
                ? "bg-[#f0f6ff] text-[#2868e8] border border-[#d8e6fa]"
                : sponsorStatus.isValid
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}>
              {isVaultSponsor ? "Protocol Pools (Apex Root)" : resolvingSponsor ? "Verifying..." : sponsorStatus.isValid ? "Verified Upline" : "Invalid Sponsor"}
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              value={sponsorInput}
              onChange={(e) => handleSponsorInputChange(e.target.value)}
              placeholder={isFirstMember ? "Protocol Pools (THoeHcGMEzNDsE8xPZuorTYgV9hje1RkGw)" : "Sponsor Base58 address or 5-digit code..."}
              disabled={isFirstMember && isVaultSponsor}
              className={`w-full bg-[#f8faff] border rounded-xl py-2 px-3 pr-16 text-xs font-mono text-[#102341] placeholder:text-slate-400 focus:outline-none focus:bg-white transition-colors ${
                !sponsorStatus.isValid && !isFirstMember ? "border-rose-300" : "border-[#e0eaf7] focus:border-[#2868e8]"
              }`}
            />
            {!isFirstMember && (
              <div className="absolute right-1 flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePasteSponsor}
                  className="px-2 py-1 rounded-md text-[10.5px] font-medium text-[#2868e8] hover:bg-[#f0f6ff] transition-colors cursor-pointer"
                >
                  Paste
                </button>
                {sponsorStatus.isCustom && (
                  <button
                    type="button"
                    onClick={handleResetSponsor}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title="Reset to default"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
          {isFirstMember && isVaultSponsor && (
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-[#2868e8] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#2868e8]" />
                <span>Genesis Matrix Root Node (#0001)</span>
              </div>
              <p className="text-[#526682] leading-relaxed">
                You are activating the 1st node in the Equora Matrix. No upline referral sponsor is required — 100% of your $30.00 USD entry fee routes directly to the Protocol Pools (Vault).
              </p>
            </div>
          )}
          {sponsorStatus.error && !isFirstMember && (
            <p className="text-[11px] text-rose-600 font-medium">{sponsorStatus.error}</p>
          )}
        </div>

        {/* Prerequisites Checklist (When connected) */}
        {address && (
          <div className="bg-[#f8faff] rounded-xl border border-[#e0eaf7] p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#102341] font-semibold pb-1 border-b border-[#e0eaf7]">
              <span>Matrix Setup (Optional — Zero-Gas Optimization)</span>
              <button
                type="button"
                onClick={() => fetchEligibility(address)}
                disabled={eligibilityLoading}
                className="text-[#2868e8] hover:underline flex items-center gap-1 font-semibold text-[10.5px] cursor-pointer"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${eligibilityLoading ? "animate-spin" : ""}`} />
                Recheck
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#526682]">1. Wallet Date (1 Oct 2026 onwards)</span>
              <span className="text-[10.5px] font-semibold text-emerald-600">
                Verified ✓ (Optional)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#526682]">2. Staked Energy (Min 107 TROB)</span>
              <span className={`text-[10.5px] font-semibold ${energyStaked >= 107 ? "text-emerald-600" : "text-slate-500"}`}>
                {energyStaked >= 107 ? `${energyStaked} / 107 TROB ✓ (Optional)` : `${energyStaked} / 107 TROB (Optional)`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#526682]">3. Super Representative Witness Vote</span>
              <span className={`text-[10.5px] font-semibold ${srVoted ? "text-emerald-600" : "text-slate-500"}`}>
                {srVoted ? "Voted ✓ (Optional)" : "Optional"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#526682]">4. Liquid Balance</span>
              <span className={`text-[10.5px] font-semibold ${hasEnoughBalance ? "text-emerald-600" : "text-amber-600"}`}>
                {tokenBalance !== null ? tokenBalance.toFixed(2) : 0} / {requiredTrob.toFixed(2)} TROB
              </span>
            </div>

            <button
              type="button"
              onClick={handleStakeAndVote}
              disabled={isStakingHelper}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2868e8] border border-blue-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isStakingHelper ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Confirming in Wallet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>One-Click: Stake 107 TROB & Vote for SR (Optional for Zero-Gas)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Notice */}
        {actionError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-snug">
            {actionError}
          </div>
        )}

        {/* Primary Action Button */}
        <div>
          {!address ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleConnectWallet}
                className="w-full py-3 px-4 rounded-xl bg-[#2868e8] hover:bg-[#1d53c2] text-white text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect TrobSafe Wallet</span>
              </button>
              <div className="flex items-center justify-center gap-3 text-[11px] text-[#526682]">
                <a
                  href="https://chromewebstore.google.com/detail/trobsafe-wallet/hmijkpcbnkmkijljblhojfndfapidkkk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2868e8] underline transition-colors"
                >
                  Chrome Extension
                </a>
                <span>•</span>
                <a
                  href="/downloads/trobsafe.apk"
                  download="trobsafe.apk"
                  className="hover:text-[#2868e8] underline transition-colors"
                >
                  Android APK
                </a>
                <span>•</span>
                <a
                  href="https://testflight.apple.com/join/trobsafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2868e8] underline transition-colors"
                >
                  iOS App
                </a>
              </div>
            </div>
          ) : !hasEnoughBalance ? (
            <button
              type="button"
              disabled
              className="w-full py-3 px-4 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Insufficient Balance (~{requiredTrob.toFixed(2)} TROB Required)</span>
            </button>
          ) : (!sponsorStatus.isValid || !sponsorAddress) && !isFirstMember ? (
            <button
              type="button"
              disabled
              className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Valid Sponsor Address Required</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleActivateSlot1}
              disabled={isJoining}
              className="w-full py-3 px-4 rounded-xl bg-[#2868e8] hover:bg-[#1d53c2] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming in Wallet...</span>
                </>
              ) : (
                <span>Activate Slot 1 ($30.00 USD / ~{requiredTrob.toFixed(2)} TROB)</span>
              )}
            </button>
          )}

          <p className="text-center text-[11px] text-[#526682] mt-2">
            Non-custodial smart contract interaction on TrobChain.
          </p>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <div className="max-w-2xl w-full mx-auto text-center pt-4 text-[11px] text-[#526682] flex items-center justify-between">
        <span>Equora Matrix Engine</span>
        <a
          href={EXPLORER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#2868e8] transition-colors flex items-center gap-1"
        >
          <span>TrobChain Explorer</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        currentAddress={address}
        onSelectAddress={(addr) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("equora_wallet_explicit_disconnect");
          }
          setAddress(addr);
          setWalletModalOpen(false);
        }}
      />
    </div>
  );
}
