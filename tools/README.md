# tools

Figma Plugin API scripts run through the Figma MCP (`use_figma`) against
`lzCgTFcfrlE8qGqYbBTh7l`. They are part of the AI-native workflow described in the
root `README.md`, not application code.

| Script | Status |
|---|---|
| `figma-spacing-and-homebar-fix.js` | **Pending — not yet applied.** Written while the MCP was authenticated as a different Figma account and had no edit access to the file. |

## figma-spacing-and-homebar-fix.js

Repairs the second wave of the off-grid spacing-token bug (see `CLAUDE.md` → Figma working
agreements → item 3), then adds the iOS home indicator and a deeper bottom safe-area.

Binding `itemSpacing` or a padding to a token that does not exist — `space/6`, `space/10`,
`space/14` — makes Figma **clear** the property to zero rather than fail. The visible symptoms
were dots touching their labels (`●32 g`, `●610 kcal left`) and the serving-size chips
collapsing into circles once their horizontal padding vanished.

It also extends the spacing scale with `80` and `96`, both valid 8pt steps, because a bottom
safe-area that clears the floating nav *and* the home indicator needs more than the previous
maximum of 64.

**Run it, read the returned report, then screenshot every frame.** It is untested.
