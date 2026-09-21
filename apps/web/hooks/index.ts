/**
 * hooks/index.ts
 * Central export barrel for all Equora.Fi custom hooks.
 * Import from here instead of deep paths.
 *
 * Usage:
 *   import { useDAOData, useMatrixData } from "../../hooks";
 */

export { useDAOData }        from "./equora/useDAOData";
export { useUserProfile }    from "./equora/useUserProfile";
export { useMatrixData, useSlotNodes } from "./equora/useMatrixData";
export { useJoinDAO }        from "./equora/useJoinDAO";
export { useJoinMatrix }     from "./equora/useJoinMatrix";
export { useWithdraw }       from "./equora/useWithdraw";
export { useRewardsData }    from "./equora/useRewardsData";
export { useClaimFallback }  from "./equora/useClaimFallback";
export { useClaimPoolShare } from "./equora/useClaimPoolShare";
export { useAllowanceCheck } from "./equora/useAllowanceCheck";

