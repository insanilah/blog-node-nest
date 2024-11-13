# Base image untuk Node.js
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh kode aplikasi ke dalam container
COPY . .

# Build aplikasi
RUN npm run build

# Ekspos port yang akan digunakan oleh aplikasi
EXPOSE 8080

# Menjalankan perintah untuk menjalankan aplikasi saat container berjalan
CMD ["npm", "run", "start:prod"]
