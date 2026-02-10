"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type MessagesCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  openMessages: () => void;
  closeMessages: () => void;
};

const Ctx = createContext<MessagesCtx | null>(null);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      openMessages: () => setOpen(true),
      closeMessages: () => setOpen(false),
    }),
    [open]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMessages() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}