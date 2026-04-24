FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# IMPORTANT: Provide dummy values for build time
ENV NEXT_TELEMETRY_DISABLED 1
ENV MONGODB_URI="mongodb://localhost:27017/dummy"
ENV NEXTAUTH_SECRET="dummy_secret_for_build"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV OPENAI_API_KEY="sk-dummy-key-for-build"
ENV PINECONE_API_KEY="pcsk_dummy_key_for_build"
ENV PINECONE_INDEX_NAME="dummy-index"
ENV CLOUDINARY_CLOUD_NAME="dummy"
ENV CLOUDINARY_API_KEY="000000"
ENV CLOUDINARY_API_SECRET="dummy"
ENV RESEND_API_KEY="re_dummy"
ENV STRIPE_SECRET_KEY="sk_test_dummy"

RUN npm run build || { echo "---------------------------------------"; echo "BUILD FAILED! Scroll up to see the Error above."; echo "---------------------------------------"; exit 1; }

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
