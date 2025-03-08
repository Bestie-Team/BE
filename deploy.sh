#!/bin/bash

# 로그 파일 경로 설정
LOG_FILE="logs/deploy.log"

# 현재 시간을 로그에 기록
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting deployment" >> $LOG_FILE

# 프로젝트 빌드
echo "Build Project"
npm run build >> $LOG_FILE 2>&1

# 빌드 성공 여부 확인
if [ $? -ne 0 ]; then
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] Build failed. Check $LOG_FILE for details." >> $LOG_FILE
  echo "Build failed. Check $LOG_FILE for details."
  exit 1  # 빌드 실패 시 스크립트 종료
fi

# 서버 프로세스 종료
echo "Kill Server Process"
pkill -f "node dist/main.js" >> $LOG_FILE 2>&1

# 새로운 서버 시작
echo "Start New Server"
NODE_ENV=production nohup node dist/main.js >> $LOG_FILE 2>&1 &
disown

# 성공 로깅
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Successfully restarted the server" >> $LOG_FILE
echo "Success Restart"