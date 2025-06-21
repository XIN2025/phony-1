FROM node:22.16.0 AS base
WORKDIR /app
RUN npm i -g pnpm

# install uv for mcp server -> later we will build our own tool
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:/root/.local/bin:$PATH"
RUN uv --version && which uvx || ln -s /root/.cargo/bin/uv /root/.cargo/bin/uvx

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm prisma generate
RUN pnpm run build:local
CMD ["node", "dist/main.js"]
