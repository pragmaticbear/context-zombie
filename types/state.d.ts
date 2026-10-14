export type Percent = number

declare module 'claude-code' {
  interface PluginState {
    'context-zombie': { percent: number; forced: number | null }
  }
}
