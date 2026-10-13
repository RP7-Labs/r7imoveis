"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function CopyrightYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return <>{year}</>;
}
