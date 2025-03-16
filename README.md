# 사용자 등록 API

NestJS 기반의 사용자 등록 백엔드 서비스

## 요구사항
- Nest.js
- Node.js
- Docker
- MySQL

## 프로젝트 구조

```plaintext
src/
├── users/
│   ├── dto/
│   │   └── create-user.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── app.module.ts
└── main.ts