"use client";

import { Lock, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EscrowSummaryData } from "@/hooks/use-wallet-data";

interface EscrowSummaryProps {
  data: EscrowSummaryData | undefined;
  isLoading: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  );

export function EscrowSummary({ data, isLoading }: EscrowSummaryProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-amber-500" />
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Escrow Locked
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : (
        <>
          <div>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.totalLocked ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Funds locked in active bounty escrows
            </p>
          </div>

          {data && data.entries.length > 0 ? (
            <div className="space-y-2 pt-2 border-t border-border/50">
              {data.entries.map((entry) => (
                <div
                  key={entry.bountyId}
                  className="flex items-center justify-between text-sm"
                >
                  <a
                    href={`/bounty/${entry.bountyId}`}
                    className="flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    Bounty #{entry.bountyId.slice(0, 8)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="font-medium text-xs">
                    {entry.amount.toLocaleString()} {entry.asset}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
              No active escrow entries found.
            </p>
          )}
        </>
      )}
    </div>
  );
}
