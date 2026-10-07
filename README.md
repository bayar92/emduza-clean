This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploying on Railway

Uploaded files (news images, member photos, videos, PDFs) are written to disk.
Railway's container filesystem is **ephemeral**: it is wiped on every deploy,
so uploads vanish unless they live on a persistent **Volume**.

1. In the Railway project, open the web service → **Settings → Volumes** (or
   right-click the canvas → **Volume**) and create a Volume mounted at `/data`.
2. Redeploy. Railway injects `RAILWAY_VOLUME_MOUNT_PATH=/data` and the app
   stores uploads in `/data/uploads` automatically. (To use another path, set
   `UPLOAD_DIR` explicitly.)
3. Set the other required variables: `DATABASE_URL`, `JWT_SECRET`.
4. Check the deploy logs after the first upload. If you see
   `[uploads] ... WILL BE LOST on the next deploy`, no Volume is attached.

Files uploaded *before* the Volume was attached are already gone — re-upload
them from the admin panel. Files committed under `public/uploads/` are part of
the image and keep working (the `/uploads/*` route falls back to them).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
