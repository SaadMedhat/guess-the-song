import { create } from "zustand"
import type { GameMode } from "@/types/game"

type GameStoreState = {
  readonly isInGame: boolean
  readonly currentMode: GameMode | null
  readonly setInGame: (isInGame: boolean) => void
  readonly setCurrentMode: (mode: GameMode | null) => void
}

export const useGameStore = create<GameStoreState>((set) => ({
  isInGame: false,
  currentMode: null,
  setInGame: (isInGame: boolean): void => set({ isInGame }),
  setCurrentMode: (mode: GameMode | null): void =>
    set({ currentMode: mode }),
}))
