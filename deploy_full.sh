#!/bin/bash

# === 설정값 ===
GIT_REPO="https://github.com/ytyoung/Yproject-React.git"
SERVER_USER="opc"
SERVER_IP="141.147.164.232"
SERVER_PATH="/var/www/react-app"
NGINX_SERVICE="nginx"

# === 1️⃣ Git 커밋 & 푸시 ===
echo "📦 Git 커밋 & 푸시 중..."
git add .
git commit -m "Auto deploy on $(date '+%Y-%m-%d %H:%M:%S')" || echo "⚠️ Commit skipped (no changes)"
git push origin main || { echo "❌ Git push 실패"; exit 1; }

# === 2️⃣ React build ===
echo "🧱 Building React project..."
npm run build || { echo "❌ Build 실패"; exit 1; }

# === 3️⃣ 서버로 빌드파일 전송 ===
echo "🚀 Deploying build to ${SERVER_IP}..."
scp -r build/* ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/ || { echo "❌ SCP 실패"; exit 1; }

# === 4️⃣ 원격 서버 Nginx 리로드 ===
echo "🔄 Restarting Nginx remotely..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo systemctl restart ${NGINX_SERVICE}" || { echo "❌ Nginx 재시작 실패"; exit 1; }

echo "✅ All done! 배포 완료 🎉"
echo "🌍 Visit: http://${SERVER_IP}"