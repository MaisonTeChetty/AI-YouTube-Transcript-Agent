# Running AI-YouTube-Transcript-Agent

## Local development

Use Node.js 22 or newer (Node.js 24 was used during recovery). Use the package manager matching the committed lockfile.

```powershell
npm ci
# Only if .env.local does not already exist:
# Copy-Item .env.example .env.local
# Fill the blank values in .env.local using your service dashboards.
npm run check:env
npm run dev
```

Open http://localhost:3000. To run several projects, give each a separate port, for example `npm run dev -- -p 3001`.

`.env.local` is present in the recovered working folder. `.env.example` is committed to GitHub; real environment values stay local. Blank values mean they have not yet been recovered. Do not replace an existing local file with the template.

`check:env` checks that required values are present without printing them. It does not validate credentials, database contents, account access or subscriptions. A successful build also does not prove that external services work.

## Verification

```powershell
npm run build
npm run start
```

For a type check without contacting services, run `npm run typecheck`.

## Service setup

- Clerk: fill both API keys. The sign-in and sign-up paths are already set in the template.
- Convex: recover the original deployment URL to retain existing data. Run `npm run dev:convex` in a second terminal when working on backend functions. Configure the Clerk JWT template named `convex`, then set `CLERK_JWT_ISSUER_DOMAIN` in the **Convex deployment environment**. The older `CLERK_ISSUE_URL` spelling remains supported.
- Schematic: recover the secret key, publishable key and plan component ID. Recreate the feature/event names from `features/flags.ts` if using a replacement account. Billing requires the corresponding Schematic/Stripe configuration.
- YouTube: enable the YouTube Data API for `YOUTUBE_API_KEY`.
- AI: supply `OPENAI_API_KEY` and `CLAUDE_API_KEY`. `CLAUDE_MODEL` defaults to `claude-sonnet-4-6`; the original Claude 3.7 model was [retired](https://platform.claude.com/docs/en/docs/about-claude/model-deprecations).

Routes: `/`, `/sign-in`, `/sign-up`, `/video/<videoId>/analysis`, `/manage-plan`.

AI requests and generated images incur usage charges on the service accounts. No paid API calls are made by the setup or type-check commands.

Image generation now uses `OPENAI_IMAGE_MODEL` (default `gpt-image-2.5-sunburst`) and decodes PNG data before uploading to Convex. DALL-E 3 has been [removed from the API](https://developers.openai.com/api/docs/models/dall-e-3). The [current image API](https://developers.openai.com/api/docs/guides/image-generation) returns base64 image data. Run `npm test` for the image-response checks, which make no network requests.
