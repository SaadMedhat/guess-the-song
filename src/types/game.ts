import type { DeezerTrack } from "./deezer"

export type GameMode = "classic" | "timed" | "challenge" | "local"

export type Difficulty = "easy" | "medium" | "hard"

export type GamePhase =
  | "IDLE"
  | "LOADING_TRACKS"
  | "READY"
  | "PLAYING_AUDIO"
  | "WAITING_ANSWER"
  | "CORRECT"
  | "WRONG"
  | "SKIPPED"
  | "TIME_UP"
  | "NEXT_ROUND"
  | "GAME_OVER"

export type TimedStep = 2 | 5 | 10 | 15 | 30

export type ChallengeConfig = {
  readonly type: "genre" | "decade"
  readonly genreId?: number | undefined
  readonly decade?: number | undefined
}

export type GameConfig = {
  readonly mode: GameMode
  readonly totalRounds: number
  readonly timePerRound: number
  readonly maxSkips: number
  readonly difficulty?: Difficulty | undefined
  readonly challenge?: ChallengeConfig | undefined
  readonly playerNames?: ReadonlyArray<string> | undefined
}

export type RoundResult = {
  readonly roundNumber: number
  readonly track: DeezerTrack
  readonly isCorrect: boolean
  readonly isSkipped: boolean
  readonly isTimedOut: boolean
  readonly answer: string
  readonly pointsEarned: number
  readonly timeUsed: number
  readonly timedStep?: TimedStep | undefined
}

export type Player = {
  readonly id: string
  readonly name: string
  readonly score: number
  readonly streak: number
  readonly bestStreak: number
}

export type GameState = {
  readonly mode: GameMode
  readonly config: GameConfig
  readonly phase: GamePhase
  readonly currentRound: number
  readonly totalRounds: number
  readonly score: number
  readonly streak: number
  readonly bestStreak: number
  readonly skipsRemaining: number
  readonly trackPool: ReadonlyArray<DeezerTrack>
  readonly currentTrack: DeezerTrack | null
  readonly roundResults: ReadonlyArray<RoundResult>
  readonly players: ReadonlyArray<Player>
  readonly currentPlayerIndex: number
  readonly timedStep: TimedStep
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  mode: "classic",
  totalRounds: 10,
  timePerRound: 30,
  maxSkips: 3,
} as const

export const TIMED_STEPS: ReadonlyArray<TimedStep> = [2, 5, 10, 15, 30]

export const TIMED_MULTIPLIERS: Readonly<Record<TimedStep, number>> = {
  2: 5,
  5: 3,
  10: 2,
  15: 1.5,
  30: 1,
}

// --- Local Multiplayer ---

export type LocalGamePhase =
  | "IDLE"
  | "LOADING_TRACKS"
  | "READY"
  | "BUZZER_WAIT"
  | "PLAYER_ANSWERING"
  | "ANSWER_CORRECT"
  | "ANSWER_WRONG"
  | "ROUND_OVER"
  | "GAME_OVER"

export type LocalRoundResult = {
  readonly roundNumber: number
  readonly track: DeezerTrack
  readonly winnerId: string | null
  readonly winnerName: string | null
  readonly pointsEarned: number
  readonly buzzOrder: ReadonlyArray<string>
  readonly timeUsed: number
}

export type LocalGameState = {
  readonly phase: LocalGamePhase
  readonly players: ReadonlyArray<Player>
  readonly currentRound: number
  readonly totalRounds: number
  readonly difficulty: Difficulty
  readonly trackPool: ReadonlyArray<DeezerTrack>
  readonly currentTrack: DeezerTrack | null
  readonly answeringPlayerId: string | null
  readonly eliminatedPlayerIds: ReadonlyArray<string>
  readonly roundResults: ReadonlyArray<LocalRoundResult>
}

export const BUZZER_ANSWER_TIME = 10
