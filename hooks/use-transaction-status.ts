"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { rpc } from "@stellar/stellar-sdk";

const STELLAR_RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
  "https://soroban-testnet.stellar.org";

const STELLAR_EXPLORER_URL =
  process.env.NEXT_PUBLIC_STELLAR_EXPLORER_URL ||
  "https://stellar.expert/explorer/testnet";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;

export type TxConfirmationStatus =
  | "idle"
  | "pending"
  | "confirmed"
  | "finalized"
  | "failed"
  | "not_found";

export interface TransactionStatusState {
  hash: string | null;
  status: TxConfirmationStatus;
  ledger?: number;
  errorMessage?: string;
  explorerUrl: string | null;
}

const initialState: TransactionStatusState = {
  hash: null,
  status: "idle",
  explorerUrl: null,
};

export function useTransactionStatus() {
  const [state, setState] = useState<TransactionStatusState>(initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const currentHashRef = useRef<string | null>(null);

  const clearPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  useEffect(() => {
    return clearPolling;
  }, [clearPolling]);

  const pollTransaction = useCallback(
    async (hash: string) => {
      const server = new rpc.Server(STELLAR_RPC_URL, { allowHttp: false });

      const check = async () => {
        if (currentHashRef.current !== hash) {
          clearPolling();
          return;
        }

        pollCountRef.current += 1;

        try {
          const result = await server.getTransaction(hash);

          if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
            clearPolling();
            setState({
              hash,
              status: "confirmed",
              ledger: result.ledger,
              explorerUrl: `${STELLAR_EXPLORER_URL}/tx/${hash}`,
            });

            await new Promise((r) => setTimeout(r, 2000));

            setState((prev) =>
              prev.hash === hash ? { ...prev, status: "finalized" } : prev,
            );
            return;
          }

          if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
            clearPolling();
            const resultXdr = (result as unknown as { resultXdr?: string })
              .resultXdr;
            setState({
              hash,
              status: "failed",
              errorMessage: resultXdr ?? "Transaction failed on-chain.",
              explorerUrl: `${STELLAR_EXPLORER_URL}/tx/${hash}`,
            });
            return;
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          if (message.toLowerCase().includes("not found")) {
            if (pollCountRef.current >= MAX_POLLS) {
              clearPolling();
              setState({
                hash,
                status: "not_found",
                errorMessage: "Transaction not found after timeout.",
                explorerUrl: `${STELLAR_EXPLORER_URL}/tx/${hash}`,
              });
            }
            return;
          }
          clearPolling();
          setState({
            hash,
            status: "failed",
            errorMessage: message,
            explorerUrl: `${STELLAR_EXPLORER_URL}/tx/${hash}`,
          });
        }

        if (pollCountRef.current >= MAX_POLLS) {
          clearPolling();
          setState((prev) =>
            prev.hash === hash
              ? {
                  ...prev,
                  status: "not_found",
                  errorMessage: "Confirmation timeout.",
                }
              : prev,
          );
        }
      };

      await check();
      timerRef.current = setInterval(check, POLL_INTERVAL_MS);
    },
    [clearPolling],
  );

  const track = useCallback(
    (hash: string) => {
      clearPolling();
      currentHashRef.current = hash;
      pollCountRef.current = 0;

      setState({
        hash,
        status: "pending",
        explorerUrl: `${STELLAR_EXPLORER_URL}/tx/${hash}`,
      });

      pollTransaction(hash);
    },
    [clearPolling, pollTransaction],
  );

  const reset = useCallback(() => {
    clearPolling();
    currentHashRef.current = null;
    setState(initialState);
  }, [clearPolling]);

  return { ...state, track, reset };
}
