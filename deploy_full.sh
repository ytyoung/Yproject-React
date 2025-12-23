#!/bin/bash
# === React 프로젝트 자동 빌드 + Git 커밋 + 서버 배포 ===

# 🌐 환경 설정
LOCAL_PATH=~/my-react-app
REMOTE_USER=opc
REMOTE_HOST=141.147.164.232
REMOTE_DIR=/home/opc/react-app
SSH_KEY=~/Desktop/Yproject/SSH/ssh-key-2025-12-18.key
GIT_MESSAGE="Auto deploy on $(date '+%Y-%m-%d %H:%M:%S')"

# === 1️⃣ Git 커밋 & 푸시 ===
echo "📦 Committing and pushing to GitHub..."
cd $LOCAL_PATH || exit
git add .
git commit -m "$GIT_MESSAGE"
git push origin main

# === 2️⃣ React 빌드 ===
echo "⚙️  Building React project..."
npm run build

# === 3️⃣ 서버 기존 빌드 정리 ===
echo "🧹 Cleaning old build folder on server..."
ssh -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST "sudo rm -rf $REMOTE_DIR/build"

# === 4️⃣ 새 빌드 업로드 ===
echo "🚀 Uploading new build folder..."
scp -i $SSH_KEY -r $LOCAL_PATH/build $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

# === 5️⃣ 권한 수정 ===
ssh -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST "sudo mkdir -p $REMOTE_DIR && sudo chown -R opc:opc $REMOTE_DIR && sudo chmod -R 755 $REMOTE_DIR"

# === 6️⃣ Nginx 재시작 ===
echo "🔄 Restarting Nginx..."
ssh -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST "sudo nginx -t; sudo systemctl restart nginx" 

# === 7️⃣ 완료 알림 ===
echo "✅ Deployment complete!"
echo "✅ Deployment complete! View at: http://$REMOTE_HOST"
