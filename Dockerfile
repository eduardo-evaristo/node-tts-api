FROM node:23-slim

# Install Python, pip, and dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    libopenblas-dev libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment and install piper-tts
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir piper-tts

# Ensure the virtual environment is used
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory to be /app/
WORKDIR /app/

# Copy all from here to /app/
COPY . .

# Install dependencies needed
RUN npm install

# Run server
CMD ["npm", "start"]
