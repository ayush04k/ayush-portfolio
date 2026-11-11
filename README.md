# Ayush Kumar — Portfolio

Personal portfolio site. Plain HTML, CSS and JavaScript with no build step and no dependencies.

## Structure

```
index.html      page content
styles.css      design (arctic blue / white palette, light + dark themes)
main.js         animations, theme toggle, toolkit tabs
assets/         photo and résumé PDF
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 5173
```

## Deploy on Vercel

Import the repo in Vercel and use the defaults: Framework Preset "Other", no build command, output directory = project root.

## Updating

- Content (jobs, projects, skills) lives in `index.html`.
- Colors are CSS variables at the top of `styles.css` (`:root` for light, `[data-theme="dark"]` for dark).
- Replace `assets/Ayush_Kumar_Resume.pdf` to update the downloadable résumé.
