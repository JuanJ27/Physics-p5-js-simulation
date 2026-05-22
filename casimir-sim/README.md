# Dynamic Casimir Effect - Minimal p5.js Local Simulation

This deliverable is a minimal local visualization of a **dynamic Casimir cavity**:

- two ideal mirrors in vacuum,
- one fixed mirror and one oscillating mirror,
- oscillation can generate visible photons/waves between mirrors,
- faster oscillation leads to stronger visible intensity.

## Run locally

Option 1 (quickest):
- Open `index.html` directly in your browser.

Option 2 (recommended static server):
- From this folder run:
  - `python3 -m http.server 8000`
- Then open `http://localhost:8000`.

## Controls

- **Start oscillation / Stop oscillation** toggles mirror motion.
- **Motion mode** lets you choose:
  - non-accelerated (constant frequency), or
  - accelerated (frequency increases over time).
- **Speed multiplier** changes how fast the oscillation runs.

## What you should observe

- With no oscillation, the cavity stays dark.
- During oscillation, light-like waves appear between mirrors.
- Increasing speed increases the visual light intensity.

> Note: this is a pedagogical qualitative model, not a full experimental simulator.
