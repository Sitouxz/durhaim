# Audit capture tooling

Zero-dependency visual-regression and layout-diagnostic scripts. They drive the system Chrome
over the DevTools Protocol using Node's built-in `WebSocket`, so there is nothing to install and
nothing added to `package.json`.

Requires Node 22+ (for global `WebSocket`) and Chrome at
`C:/Program Files/Google/Chrome/Application/chrome.exe` — edit the `chrome` field in a manifest,
or the constant in `diag.mjs`, for another path.

## Full-page screenshots

```bash
node docs/audit/tools/mkmanifest.mjs      # writes base.json (edit outDir/routes inside)
node docs/audit/tools/shoot.mjs base.json
```

Each shot records page height and horizontal overflow into `<outDir>/_index.json` alongside the
PNGs, which is how F-12 was found — scan that file for any non-zero `overflowPx` before opening
a single image.

Manifest shape:

```json
{
  "outDir": "/abs/path/out",
  "chrome": "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "shots": [
    { "name": "home-375", "url": "https://www.durhaim.com/", "width": 375,
      "dpr": 1, "waitMs": 3200, "dark": false, "clickSelector": null }
  ]
}
```

`dpr: 2` for detail inspection, `dpr: 1` for sweeps (roughly 4x smaller files).

## Layout diagnostics

```bash
node docs/audit/tools/diag.mjs https://www.durhaim.com/ 768
```

Reports every element whose box extends past the viewport, with class list, computed transform
and how far it overhangs on each side. This is what pinpointed the `TopNavBar` search input and
language toggle as the F-12 cause, and the rotated `h4` as F-13.

Note that `scrollWidth` only reports overflow to the *right*. Left overflow — F-13, where the
rotated labels are clipped — shows up in this tool's `overL` column but never in the
`overflowPx` metric. Check both.

## Baseline

`../screenshots/_baseline-index.json` holds the 31-shot public-route baseline captured
2026-07-25 (14 routes × 375/1440, plus tablet and `?lang=en` spot checks). The PNGs are not
committed — only findings-specific evidence is, to keep the repo small. Re-run the two commands
above to regenerate them.
