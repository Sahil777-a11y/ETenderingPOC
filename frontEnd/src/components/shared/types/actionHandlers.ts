import type { ActionKey } from "./actionKey";

export type ActionHandlers<T> = Partial<Record<ActionKey, (row: T) => void>>;
