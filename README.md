# Online Animal Interaction Workshop — site template

Simple multi-page static website to advertise a workshop and link to a Google Form signup.

## Pages

- `index.html`: Homepage (mission statement + call for participation + signup button)
- `organisers.html`: Organiser list template
- `schedule.html`: Location, date/time, and a draft schedule
- `outputs.html`: Placeholder page for positionality paragraphs, themes, and outputs

## Customise the signup link (Google Form)

Edit `site.js`:

- Replace `SIGNUP_FORM_URL` with your Google Form URL.
- All “Sign up” buttons across the site update automatically.

## Run locally

You can open `index.html` directly, or run a tiny local server.

### Option A: Python (if installed)

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`.

### Option B: Node (if installed)

```bash
npx serve .
```

