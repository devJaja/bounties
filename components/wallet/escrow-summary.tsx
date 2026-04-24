"use client";

import { Lock, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EscrowSummaryData } from "@/hooks/use-wallet-data";
import { useActiveBountiesQuery } from "@/lib/graphql/generated";
import Link from "next/link";

interface EscrowSummaryProps {
  data: EscrowSummaryData | undefined;
  isLoading: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  );

export function EscrowSummary({ data, isLoading }: EscrowSummaryProps) {
  const { data: bountiesData, isLoading: bountiesLoading } =
    useActiveBountiesQuery();

  const activeBounties = bountiesData?.activeBounties ?? [];
  const bountiesEscrowTotal = activeBounties.reduce(
    (sum, b) => sum + (b.rewardAmount ?? 0),
    0,
  );

  const totalLocked = (data?.totalLocked ?? 0) || bountiesEscrowTotal;
  const loading = isLoading || bountiesLoading;

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-amber-500" />
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Escrow Locked
        </h3>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-40" />
          <div className="pt-2 space-y-2 border-t border-border/50">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ) : (
        <>
          <div>
            <p className="text-2xl font-bold">{formatCurrency(totalLocked)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Funds locked in active bounty escrows
            </p>
          </div>

          <div className="pt-2 border-t border-border/50 space-y-2">
            {activeBounties.length > 0 ? (
              activeBounties.slice(0, 5).map((bounty) => (
                <div
                  key={bounty.id}
                  className="flex items-center justify-between text-xs"
                >
                  <Link
                    href={`/bounty/${bounty.id}`}
                    className="flex items-center gap-1 text-primary hover:underline truncate max-w-[60%]"
                  >
                    <span className="truncate">{bounty.title}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </Link>
                  <span className="font-medium shrink-0 ml-2">
                    {bounty.rewardAmount} {bounty.rewardCurrency}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                No active escrow entries found.
              </p>
            )}
            {activeBounties.length > 5 && (
              <Link
                href="/bounty"
                className="text-xs text-primary hover:underline block pt-1"
              >
                View all {activeBounties.length} active bounties →
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
