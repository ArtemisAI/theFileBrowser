# ---------- builder stage ----------
FROM node:18-alpine AS build
WORKDIR /app
# Copy package.json and optionally package-lock.json when present
# Project meta-data and configuration --------------------------------------------------
# Copy package manifest and, when present, the deterministic lock-file.  The wildcard
# keeps the copy command from erroring when the lock-file is still missing during
# initial iterations.
COPY package.json ./
COPY package-lock.json* ./

# Vite configuration and application entry-points --------------------------------------
COPY vite.config.js ./
COPY index.html ./index.html   # required by the Vite build

# Static source code -------------------------------------------------------------------
COPY src ./src
COPY public ./public
# ---------------------------------------------------------------------------
#  Dependency installation
# ---------------------------------------------------------------------------
#  • When a lock-file is present we prefer the deterministic `npm ci`.
#  • During early iterations the project may not ship a package-lock.json yet.
#    In that case fall back to the regular `npm install` command so that the
#    Docker build does not abort.  This keeps the developer experience smooth
#    while still allowing future reproducible builds once a lock-file lands.
# ---------------------------------------------------------------------------

RUN if [ -f package-lock.json ]; then \
        echo "Installing dependencies with npm ci (lock-file detected)"; \
        npm ci --loglevel=error; \
    else \
        echo "No package-lock.json found – falling back to npm install"; \
        npm install --loglevel=error --no-audit --no-fund; \
    fi && \
    npm run build

# ---------- runtime stage ----------
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
