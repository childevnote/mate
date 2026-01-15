# Mate

**Mate**는 FastAPI(Backend)와 Next.js(Frontend)로 구성된 모노레포(Monorepo) 구조의 웹 애플리케이션 프로젝트입니다.

## 📚 Table of Contents

* [Tech Stack]
* [Project Structure]
* [Prerequisites]
* [Getting Started]
    * [Backend Setup]
    * [Frontend Setup]
* [Environment Variables]
* [Troubleshooting]

---

## 🛠 Tech Stack

### Backend

* **Framework**: FastAPI
* **Language**: Python 3.9+
* **Database**: PostgreSQL (Supabase)
* **Auth**: JWT (HS256)

### Frontend

* **Framework**: Next.js (App Router)
* **Runtime**: Node.js 18.17.0+

---

## 📂 Project Structure

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

## ✅ Prerequisites

프로젝트 실행을 위해 아래 도구들이 사전에 설치되어 있어야 합니다.

* **Git**: 버전 관리
* **Python**: 3.9 이상 (Backend)
* **Node.js**: 18.17.0 이상 (Frontend)

---

## 🚀 Getting Started

이 프로젝트는 백엔드와 프론트엔드가 분리되어 있으므로 각각 설정 및 실행이 필요합니다.

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
`backend` 폴더 내에 `.env` 파일을 생성하고 아래 내용을 작성합니다. ([Environment Variables](https://www.google.com/search?q=%23-environment-variables) 섹션 참고)
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
`frontend` 폴더 내에 `.env.local` 파일을 생성합니다.
4. **개발 서버 실행**
```bash
npm run dev
# or yarn dev

```


* 접속 주소: http://localhost:3000



---

## 🔑 Environment Variables

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

### Frontend (`frontend/.env.local`)

```ini
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

```

---

## 🔧 Troubleshooting

**Q. Backend: `ModuleNotFoundError**`

> 가상환경(`venv`)이 활성화되어 있는지 확인하세요. 터미널 프롬프트 앞에 `(venv)`가 표시되어야 하며, 활성화 후 `pip install -r requirements.txt`를 다시 실행해 보세요.

**Q. Frontend: CORS Error**

> 백엔드(`main.py`)의 `CORSMiddleware` 설정에서 `origins` 리스트에 `http://localhost:3000`이 포함되어 있는지 확인하세요.

**Q. Database: Password Authentication Failed**

> `.env` 파일의 `DATABASE_URL`에 오타가 없는지 확인하세요. 비밀번호에 특수문자가 포함된 경우 URL 인코딩이 필요할 수 있습니다.