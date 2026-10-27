@AGENTS.md

## Khusus Claude Code

Skill proyek ada di `.agents/skills/`, bukan `.claude/skills/`, supaya satu
salinan dipakai bersama oleh Claude Code dan Codex. Claude Code tidak
memuatnya otomatis: buka `SKILL.md` yang cocok dari tabel di `AGENTS.md`
dengan Read sebelum mengerjakan bagian itu.

Server MCP dipasang dengan scope `local` atau `user`, jangan `project`.
`.mcp.json` diabaikan git supaya URL, header, dan token server tidak ikut
ter-push ke remote, yang bisa dibaca kolaborator mana pun.
