
# Mate

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)
![Next.js](https://img.shields.io/badge/next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-339933?style=flat-square&logo=Node.js&logoColor=white)

**Mate**는 FastAPI(Backend)와 Next.js(Frontend)로 구성된 모노레포(Monorepo) 구조의 러닝 크루 커뮤니티 웹 애플리케이션입니다.

##  Table of Contents

1. [Tech Stack](#-tech-stack)
2. [Project Structure](#-project-structure)
3. [Collaboration Guide](#-collaboration-guide)
4. [Branch Strategy](#branch-strategy)
5. [Commit Convention](#commit-convention)
6. [Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
7. [Environment Variables](#-environment-variables)
8. [Troubleshooting](#-troubleshooting)

---

##  Tech Stack

### Backend
* **Framework**: FastAPI
* **Language**: Python 3.9+
* **Database**: PostgreSQL (Supabase)
* **Auth**: JWT (HS256)

### Frontend
* **Framework**: Next.js (App Router)
* **Runtime**: Node.js 18.17.0+
* **Styling**: Tailwind CSS (권장/예시)

---

##  Project Structure

```bash
mate/
├── backend/            # FastAPI Server
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── frontend/           # Next.js Client
│   ├── package.json
│   └── ...
└── README.md

```

---


## Branch Strategy

우리는 **Git Flow** 전략을 기반으로 명확하고 추적 가능한 브랜치 네이밍 규칙을 따릅니다.

#### 1. Naming Convention

> `타입/이슈번호/설명` 또는 `타입/설명`

* **언어**: 영어 소문자 사용
* **구분자**: 단어 사이는 하이픈(`-`)으로 연결 (Kebab Case)
* **이슈번호**: Jira/Issue 티켓 번호가 있다면 포함

#### 2. Branch Types (Prefix)

| Prefix | 설명 | 예시 |
| --- | --- | --- |
| **`feature`** | 새로운 기능 개발 | `feature/login-page`, `feature/MATE-101/user-api` |
| **`fix`** | 버그 수정 | `fix/header-layout`, `fix/typo-correction` |
| **`hotfix`** | 긴급 버그 수정 (배포 후) | `hotfix/payment-error` |
| **`refactor`** | 코드 구조 개선 (기능 변경 X) | `refactor/optimize-db-query` |
| **`style`** | 포맷팅, 세미콜론 등 스타일 수정 | `style/format-code` |
| **`docs`** | 문서 수정 | `docs/update-readme` |
| **`chore`** | 설정 변경 및 기타 작업 | `chore/update-dependencies` |

---

## Commit Convention

**Conventional Commits** 규칙을 따릅니다. 모노레포 구조이므로 `scope`를 적극 활용하여 변경 사항의 위치를 명시합니다.

#### 1. Structure

> `타입(범위): 제목`
> `본문 (선택 사항)`

#### 2. Commit Types

| Type | 설명 |
| --- | --- |
| **`feat`** | 새로운 기능 추가 |
| **`fix`** | 버그 수정 |
| **`docs`** | 문서 수정 |
| **`style`** | 코드 포맷팅, 세미콜론 누락 등 (로직 변경 없음) |
| **`refactor`** | 코드 리팩토링 |
| **`test`** | 테스트 코드 추가/수정 |
| **`chore`** | 빌드 태스크 업데이트, 패키지 매니저 설정 등 |

#### 3. Scopes (For Monorepo)

* **`backend`**: 백엔드 관련 변경
* **`frontend`**: 프론트엔드 관련 변경
* **`common`**: 공통 설정 또는 루트 디렉토리 변경

#### 4. Examples

* `feat(backend): add user login api`
* `fix(frontend): resolve navbar breakdown on mobile`
* `docs(common): update readme branch strategy`

---

## Getting Started

### Prerequisites

프로젝트 실행을 위해 아래 도구들이 사전에 설치되어 있어야 합니다.

* **Git**: 버전 관리
* **Python**: 3.9 이상 (Backend)
* **Node.js**: 18.17.0 이상 (Frontend)

### Backend Setup

1. **디렉토리 이동**
```bash
cd backend

```


2. **가상환경 생성 및 활성화**
* **Mac/Linux**:
```bash
python3 -m venv venv
source venv/bin/activate

```


* **Windows**:
```bash
python -m venv venv
source .\\venv\\Scripts\\activate

```




3. **패키지 설치**
```bash
pip install -r requirements.txt

```


4. **환경 변수 설정**
`backend` 폴더 내에 `.env` 파일을 생성하고 [Environment Variables](https://www.google.com/search?q=%23-environment-variables) 섹션을 참고하여 내용을 작성합니다.
5. **서버 실행**
```bash
uvicorn main:app --reload

```


* Swagger UI: http://localhost:8000/docs



### Frontend Setup

⚠️ **Note**: 백엔드 서버가 실행 중인 상태에서 진행하는 것을 권장합니다.

1. **디렉토리 이동**
```bash
cd frontend

```


2. **의존성 설치**
```bash
npm install
# or yarn install

```


3. **환경 변수 설정**
`frontend` 폴더 내에 `.env.local` 파일을 생성하고 내용을 작성합니다.
4. **개발 서버 실행**
```bash
npm run dev
# or yarn dev

```


* 접속 주소: http://localhost:3000



---

##  Environment Variables

각 디렉토리의 루트에 `.env` (Backend) 및 `.env.local` (Frontend) 파일을 생성해야 합니다.

### Backend (`backend/.env`)

```ini
# Database (Transaction Mode - Port 6543)
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:6543/[DB_NAME]

# Security
SECRET_KEY=your_secret_key_here  # openssl rand -hex 32 등을 사용하여 생성 권장
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

```

### Frontend (`frontend/.env`)

```ini
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

```

---

##  Troubleshooting

**Q. Backend: `ModuleNotFoundError`**

> 가상환경(`venv`)이 활성화되어 있는지 확인하세요. 터미널 프롬프트 앞에 `(venv)`가 표시되어야 하며, 활성화 후 `pip install -r requirements.txt`를 다시 실행해 보세요.

**Q. Frontend: CORS Error**

> 백엔드(`main.py`)의 `CORSMiddleware` 설정에서 `origins` 리스트에 `http://localhost:3000`이 포함되어 있는지 확인하세요.

**Q. Database: Password Authentication Failed**

> `.env` 파일의 `DATABASE_URL`에 오타가 없는지 확인하세요. 비밀번호에 특수문자가 포함된 경우 URL 인코딩이 필요할 수 있습니다.
