FROM node:20-slim

# Install Chromium + all necessary dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
  chromium \
  chromium-sandbox \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libglib2.0-0 \
  libgbm1 \
  libasound2 \
  libfontconfig1 \
  libcairo2 \
  libexpat1 \
  libstdc++6 \
  ca-certificates \
  fonts-liberation \
  wget \
  xdg-utils \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install --production

# Copy rest of the app
COPY . .

# Puppeteer env
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Expose port
EXPOSE 5236

# Start app
CMD ["node", "index.js"]
