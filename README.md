# Surya & Subi Baby Shower — SRINUMA Digital Solutions

React + TypeScript + Vite digital invitation. Latest V20 mobile photo-frame layout: original couple photo, caption below photo, ivory double-door opening, music control, countdown, RSVP, wishes, venue and SRINUMA footer.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`. For deployment use `npm run build` and output folder `dist` (Vercel framework: Vite).

## Backend: RSVP and Wishes

The serverless API routes are in `api/`. In **Vercel → Project → Settings → Environment Variables**, configure these **server-side only** variables:

- `SHEETS_WEBHOOK_URL` — Google Apps Script `/exec` endpoint (obtain from project owner)
- `SHEETS_WEBHOOK_SECRET` — matching secret stored in Google Apps Script Script Properties
- `VITE_SRINUMA_WHATSAPP_NUMBER` — public WhatsApp number in digits, country code included

Do **not** put secrets in GitHub, `.env.example`, screenshots or chat. The existing live invitation project already has the working Google Sheet connection. Connecting a new Vercel project requires configuring its environment variables separately.

## Music

The song file is provided separately by the project owner, rather than being redistributed through this **public** GitHub branch. To restore playback, copy the authorized audio file to:

`public/music/surya-subi-babyshower-song.mp3`

The rest of the source can be built without that file, but music will be silent until it is added.

## Add the invitation under srinuma.com

The apex `srinuma.com` is managed through **Cloudflare**, and currently serves another SRINUMA website. **Do not move its DNS records or assign the apex domain to this invitation project.**

**Simple and safe option: Cloudflare Redirect Rule**

1. Log in to the Cloudflare zone for `srinuma.com`.
2. Create a single URL Redirect Rule matching exactly `https://srinuma.com/surya-subi-babyshower` (also consider `www` only if enabled).
3. Destination: `https://surya-subi-babyshower.vercel.app/`
4. Choose 302 (temporary) for testing and verify invitation, photos, song, forms and preview on mobile.
5. Other SRINUMA URLs stay unchanged.

A redirect changes the browser's displayed URL to the Vercel domain. **To keep the exact branded path in the browser**, the domain admin needs a correctly configured reverse proxy/Worker with asset and API routing, or a Vercel routing setup for the website hosting the apex; do not apply a naive single-path rewrite because absolute `/assets`, `/images`, `/music`, and `/api` requests may fail.

## Live reference

https://surya-subi-babyshower.vercel.app/

## Git branch note

This standalone project is on an isolated branch of the existing `SRINUMA` repository; `main` is untouched.
