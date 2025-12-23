#!/bin/bash
# === React 프로젝트 자동 빌드 + Git 커밋 + 서버 배포 ===

# 1️⃣ 환경 설정
LOCAL_PATH=~/my-react-app
REMOTE_USER=opc
REMOTE_HOST=141.147.164.232
REMOTE_DIR=/home/opc/react-app
SSH_KEY=~/Desktop/Yproject/SSH/ssh-key-2025-12-18.key
GIT_MESSAGE="Auto deploy on $(date '+%Y-%m-%d %H:%M:%S')"

# 2️⃣ Git 커밋 & 푸시
echo "📦 Committing and pushing to GitHub..."
cd $LOCAL_PATH || exit
git add .
git commit -m "$GIT_MESSAGE"
git push origin main

# 3️⃣ React 빌드
echo "🧱 Building React project..."
npm run build

# 4️⃣ 기존 서버 파일 정리
echo "🧹 Cleaning old files on server..."
ssh -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST "sudo rm -rf $REMOTE_DIR/*"

# 5️⃣ build 폴더 업로드
echo "🚀 Uploading new build files..."
scp -i $SSH_KEY -r $LOCAL_PATH/build/* $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

# 6️⃣ 권한 수정
ssh -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST "sudo chmod -R 755 $REMOTE_DIR"

# 7️⃣ Nginx 재시작
echo "🔄 Restarting Nginx..."
ssh -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST "sudo systemctl restart nginx"

# 8️⃣ 완료
echo "✅ Deployment complete! View site at: http://$REMOTE_HOST"
