@AGENTS.md

## Claude Code notes

- Project skills live in `.claude/skills/<name>/SKILL.md`; user-level skills in `~/.claude/skills/`.
- Invoke a skill with `/<skill-name>` (e.g. `/jpay-hackathon`) or let Claude load it when relevant.
- `/init` regenerates project context; prefer editing this file and `AGENTS.md` manually to avoid churn.
- Use plan mode for multi-file changes, then run `npx tsc --noEmit` and `npm run lint` before declaring done.
