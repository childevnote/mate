<div align="left">

# Mate

**대학생 익명 커뮤니티 플랫폼**

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=awslambda&logoColor=white)

</div>

---

## Overview

Mate는 대학생을 위한 익명 커뮤니티 웹 애플리케이션입니다.  
FastAPI + Next.js 모노레포 구조로, **패스키(WebAuthn) 인증**과 **학교 이메일 인증**을 지원합니다.

### 핵심 기능

| 기능 | 설명 |
|---|---|
| **패스키 로그인** | 비밀번호 없이 생체인증/보안키로 로그인 (WebAuthn) |
| **학교 인증** | 학교 이메일 인증으로 재학생 확인 |
| **게시판** | 카테고리별 게시글 (자유, 정보, 질문, 유머, 홍보, 스터디, 장터) |
| **댓글/대댓글** | 계층형 댓글 시스템 |
| **좋아요/스크랩** | 게시글 좋아요 및 스크랩 토글 |
| **인기글** | 조회수·좋아요·댓글 가중치 기반 인기글 |

---

## 🛠 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Backend
| | |
|---|---|
| Framework | FastAPI 0.128 |
| Language | Python 3.9+ |
| Database | PostgreSQL (Supabase) |
| ORM | SQLAlchemy |
| Auth | JWT + WebAuthn (Passkey) |
| Deploy | AWS Lambda + Mangum |
| Migration | Alembic |

</td>
<td valign="top" width="50%">

### Frontend
| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| State | Jotai + React Query v5 |
| Styling | Tailwind CSS 3 |
| HTTP | Axios (인터셉터 기반 토큰 갱신) |
| Auth | @simplewebauthn/browser |

</td>
</tr>
</table>

---

## Project Structure

```
mate/
├── backend/                  # FastAPI Server
│   ├── main.py               # 앱 엔트리 + CORS + 라우터 등록
│   ├── database.py            # DB 엔진 & 세션
│   ├── api/
│   │   ├── deps.py            # 인증 의존성 (JWT 디코딩)
│   │   └── v1/endpoints/
│   │       ├── auth.py        # 이메일/학교 인증
│   │       ├── community.py   # 게시글·댓글·좋아요·스크랩
│   │       ├── login.py       # 로그인·토큰 갱신
│   │       ├── passkey.py     # WebAuthn 등록/인증
│   │       └── users.py       # 회원가입·프로필
│   ├── core/                  # 설정·보안·이메일·유틸
│   ├── crud/                  # DB CRUD 로직
│   ├── models/                # SQLAlchemy 모델
│   ├── schemas/               # Pydantic 스키마
│   └── alembic/               # DB 마이그레이션
│
├── frontend/                  # Next.js Client
│   └── src/
│       ├── app/               # App Router 페이지
│       │   ├── login/         # 패스키 로그인
│       │   ├── signup/        # 회원가입 (이메일 인증 → 패스키 등록)
│       │   ├── posts/         # 게시판 목록 & 상세
│       │   ├── write/         # 글 작성/수정
│       │   └── mypage/        # 마이페이지
│       ├── components/        # UI 컴포넌트
│       ├── services/          # API 서비스 계층
│       ├── store/             # Jotai 상태관리
│       ├── types/             # TypeScript 타입 정의
│       └── lib/               # Axios 인스턴스 & 인터셉터
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Python** 3.9+
- **Node.js** 18.17+
- **Git**

### Backend

```bash
# 1. 디렉토리 이동
cd backend

# 2. 가상환경 생성 & 활성화
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# 3. 의존성 설치
pip install -r requirements.txt

# 4. .env 파일 생성 (아래 환경변수 섹션 참조)

# 5. 서버 실행
uvicorn main:app --reload
```

> Swagger UI: http://localhost:8000/docs

### Frontend

```bash
# 1. 디렉토리 이동
cd frontend

# 2. 의존성 설치
npm install

# 3. .env 파일 생성 (아래 환경변수 섹션 참조)

# 4. 개발 서버 실행
npm run dev
```

> 접속: http://localhost:3000

---

## Environment Variables

### `backend/.env`

```ini
# Database
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:6543/[DB_NAME]

# Security
SECRET_KEY=your-secret-key      # openssl rand -hex 32 로 생성 권장
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (콤마 구분)
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# WebAuthn
RP_ID=localhost
RP_ORIGIN=http://localhost:3000

# Email (SMTP)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### `frontend/.env`

```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Branch Strategy

> `타입/이슈번호/설명` — Git Flow 기반, Kebab Case

| Prefix | 용도 | 예시 |
|---|---|---|
| `feature` | 새 기능 | `feature/login-page` |
| `fix` | 버그 수정 | `fix/header-layout` |
| `hotfix` | 긴급 수정 | `hotfix/payment-error` |
| `refactor` | 구조 개선 | `refactor/optimize-db-query` |
| `docs` | 문서 | `docs/update-readme` |
| `chore` | 설정/기타 | `chore/update-dependencies` |

---

## Commit Convention

> **Conventional Commits**: `타입(범위): 제목`

| Type | 설명 |
|---|---|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 포맷팅 (로직 변경 없음) |
| `refactor` | 리팩토링 |
| `test` | 테스트 |
| `chore` | 빌드/설정 변경 |

**Scope**: `backend` · `frontend` · `common`

```
feat(backend): add passkey login endpoint
fix(frontend): resolve navbar logout storage key mismatch
docs(common): update readme with project analysis
```