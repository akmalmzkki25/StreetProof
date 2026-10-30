# Demo photos

Synthetic images made with GPT Image 2.5 through Higgsfield. They show no real building or person, and the demo should describe them as generated.

`pnpm db:seed:demo` uses the file named after each scene in `DEMO_SCENES` (`.jpg`, `.png` or `.webp`). A scene without a file falls back to the drawing in `src/demo-photos.ts`, which the model recognises as an illustration. The repaired scenes were generated from their matching damage photo, so before and after show the same place.

Only add synthetic or permissioned images here. Files are stripped of metadata and kept to about 100 KB.
