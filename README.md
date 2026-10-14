# context-zombie

A Claude Code mod: the Claude logo sits above the prompt (top right) and decays as context fills.

| Context | Look |
|---|---|
| 0-30% | Normal orange |
| 30-65% | Green zombie, growing blood |
| 65-90% | Bone spreads from the top-left of the head |
| 90%+ | Full skeleton |

<img src="assets/0.svg" width="150" alt="0-30%"> <img src="assets/40.svg" width="150" alt="30-55%"> <img src="assets/60.svg" width="150" alt="55-65%"> <img src="assets/70.svg" width="150" alt="65-80%"> <img src="assets/80.svg" width="150" alt="80-90%"> <img src="assets/90.svg" width="150" alt="90%+"> 

It heals when you `/compact` or `/clear`. Test with `/zombie 0-100`, reset with `/zombie off`.

## Install

```
/plugin install context-zombie --marketplace pragmaticbear/context-zombie
```

Answer `y` to add the marketplace, then pick the user scope.
