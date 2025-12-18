# Mate 개발 환경 설정 (Backend)

이 프로젝트는 **Python 3.10+** 및 **Django**를 기반으로 실행됩니다.
프로젝트 실행 전 반드시 **가상환경(venv)** 활성화가 필요합니다.

---

## 백엔드 디렉토리 이동

터미널을 열고 프로젝트의 `backend` 폴더로 이동

```bash
cd backend
```

## 가상환경(Virtual Environment) 활성화

OS 환경에 맞는 명령어를 입력하여 활성화

| OS              | Shell      | Command                        |
| --------------- | ---------- | ------------------------------ |
| **Windows**     | Git Bash   | `source venv/Scripts/activate` |
|                 | PowerShell | `.\venv\Scripts\activate`      |
| **Mac / Linux** | Zsh / Bash | `source venv/bin/activate`     |

## 3. 패키지 설치

가상환경이 활성화된 상태에서 필수 라이브러리 설치

```bash
pip install -r requirements.txt
```

## 서버 실행 (Run Server)

환경 설정 완료 후 아래 명령어로 개발 서버 실행

```bash
python manage.py runserver
```

---
