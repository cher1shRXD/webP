# 1단계: 빌드
FROM node:21-slim AS builder
WORKDIR /webP/backend

# 의존성 설치용 파일 복사 및 설치
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

# 전체 소스 복사 및 빌드
COPY . .
RUN pnpm build

# 2단계: 실행
FROM node:21-slim AS runner
WORKDIR /webP/backend

# 의존성 파일 복사 후 설치 (프로덕션 의존성만)
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --prod

# 빌드된 파일 복사
COPY --from=builder /webP/backend/dist ./dist

# 기타 필요한 파일 (예: 마이그레이션, 설정 등)
# 또는 ormconfig.json 같은 파일을 사용 중이라면 복사하세요.

EXPOSE 8080

# PM2 또는 node 직접 실행
CMD ["node", "dist/index.js"]
