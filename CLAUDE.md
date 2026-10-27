@AGENTS.md

## Claude Code specifics

Project skills live in `.agents/skills/`, not `.claude/skills/`, so Claude
Code and Codex share one copy. Claude Code does not load them automatically:
open the matching `SKILL.md` from the table in `AGENTS.md` with Read before
working on that area.

Install MCP servers with the `local` or `user` scope, never `project`.
`.mcp.json` is git-ignored so server URLs, headers and tokens don't get
pushed to the remote, where any collaborator can read them.
