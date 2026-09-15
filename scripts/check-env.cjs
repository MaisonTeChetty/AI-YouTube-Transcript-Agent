const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd(), true);
const required = ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY", "NEXT_PUBLIC_CONVEX_URL", "SCHEMATIC_API_KEY", "NEXT_PUBLIC_SCHEMATIC_PUBLISHABLE_KEY", "OPENAI_API_KEY", "CLAUDE_API_KEY", "YOUTUBE_API_KEY"];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error('Fill these values in .env.local (values are never printed):');
  missing.forEach((key) => console.error(`  ${key}`));
  process.exitCode = 1;
} else {
  console.log('Required environment values are present. Service access still needs verification.');
}
