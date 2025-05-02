#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

APP_DIR="/var/www/collaborative_code_editor"

# Navigate to the application directory where code was deployed
cd $APP_DIR

echo "Starting Node application from $APP_DIR..."

# Create .env file with hardcoded values (provided by you)
echo "Writing .env file..."
cat > "$APP_DIR/.env" << EOF
PORT=5001
JUDGE0_API_BASE_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=c8ef551d52msh8afd9eaf59e8fc4p1b0b3djsnc8e9e93065f1
DATABASE_URL=mongodb+srv://rohanwagh52005:6iIDo7fC20778zWL@cluster0.c70xh.mongodb.net/CodeEditor
JWT_SECRET=secret

EMAIL_USER=luciferth12@gmail.com
EMAIL_PASS=elxkrjtmciqhtjgq

MAIL_HOST=smtp.gmail.com
MAIL_USER=luciferth12@gmail.com
MAIL_PASS=elxkrjtmciqhtjgq

FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=509504590882-7503kgca320ih25svukd7u0s9gpphg8d.apps.googleusercontent.com
EOF

echo ".env file written successfully."

echo "Starting application with PM2..."

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please ensure Node.js is installed."
    exit 1
fi

# Start the application with PM2 using global path
pm2 start "$APP_DIR/server.js" --name "collaborative_code_editor" --env production

# Ensure PM2 restarts on server reboot
pm2 startup | bash || echo "PM2 startup script failed, you may need to configure it manually"
pm2 save || echo "PM2 save command failed"

echo "Application started successfully."
