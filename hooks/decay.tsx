import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const forced = atom({ plugin: 'context-zombie', key: 'forced' } as const, null)
const percent = atom({ plugin: 'context-zombie', key: 'percent' } as const, 0)

// Claude Code mascot: the shape never changes, only the colour.
const LOGO = [' ▐▛███▜▌ ', '▝▜█████▛▘', '  ▘▘ ▝▝  ']

// Stable pseudo-random 0..1 per cell, so blood stays put between redraws.
const rnd = (r: number, c: number) => {
  const x = Math.sin((r + 1) * 12.9898 + (c + 1) * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const BONE = 'rgb(230,225,205)'

// percent -> rows of [char, color]: orange -> green -> bloody dark green,
// then from 65% bone spreads from the top-left of the head until all skeleton at 90%.
const zombie = (p: number): [string, string][][] => {
  const skin = p < 30 ? 'claude' : p < 55 ? 'rgb(120,190,90)' : 'rgb(70,130,60)'
  const blood = p < 30 ? 0 : Math.min(0.6, (p - 30) / 60) // share of cells gone red
  const reach = p < 65 ? -1 : (p - 65) / 25 + 0.1 // bone front, 0 = top-left, 1 = bottom-right
  return LOGO.map((row, r) =>
    [...row].map((ch, c): [string, string] => {
      if (ch === ' ') return [ch, skin]
      if ((c + r * 2) / 12 < reach) return [ch, BONE]
      if (rnd(r, c) < blood) {
        // scorched cell: solid dark red (what ▒ looked like), other blood cells bright red
        return r < 2 && rnd(c, r) < 0.5 ? ['█', 'rgb(107,25,25)'] : [ch, 'rgb(170,20,20)']
      }
      return [ch, skin]
    }),
  )
}

async function refresh($: any) {
  try {
    if ((await read($, forced)) !== null) return // /zombie override active
    const { context } = await $.session.usage()
    await update($, percent, () => context.percent ?? 0)
  } catch {
    // session not bound yet
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'zombie',
      description: 'Fake the context percent to test the logo: /zombie 0-100, or /zombie off',
    })
    await refresh($)
    $.clock.every(3000, () => refresh($)) // catches /clear and auto-compact too
    return next(e)
  })
  on('command.run', { command: 'zombie' }, async ($, e) => {
    const arg = e.args.trim()
    if (arg === 'off' || arg === '') {
      await update($, forced, () => null)
      await refresh($)
      return { text: 'Zombie override off; tracking real context.' }
    }
    const n = Math.min(100, Math.max(0, Number(arg)))
    if (Number.isNaN(n)) return { text: 'Usage: /zombie 0-100 | off' }
    await update($, forced, () => n)
    await update($, percent, () => n)
    return { text: `Context faked at ${n}%.` }
  })
  on('turn.complete', async ($, e, next) => (await refresh($), next(e)))
  on('session.compact', async ($, e, next) => {
    const out = await next(e)
    await refresh($)
    return out
  })

  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const p = await read($, percent)
    const { Box, Text } = $.ui.resolve(e)
    const rows = zombie(p)

    return (
      <Box flexDirection="row" justifyContent="flex-end" width="100%">
        <Box flexDirection="column">
          {rows.map(row => (
            <Box flexDirection="row">
              {row.map(([ch, color]) => (
                <Text color={color}>{ch}</Text>
              ))}
            </Box>
          ))}
        </Box>
        <Text dimColor> {Math.round(p)}%</Text>
      </Box>
    )
  })
}
