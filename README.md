# mate

## 개발 환경 설정 (Backend Setup)

이 프로젝트는 **Python 3.10+** 및 **Django**를 기반으로 실행됩니다.
프로젝트를 실행하기 전에 반드시 가상환경(venv)을 활성화해야 합니다.

### 1. 백엔드 디렉토리로 이동

터미널을 열고 프로젝트의 `backend` 폴더로 이동합니다.

```bash
cd backend
```

2. 가상환경(Virtual Environment) 활성화
   OS에 맞는 명령어를 입력하여 가상환경을 실행합니다. 활성화에 성공하면 터미널 프롬프트 앞부분에 (venv) 표시가 나타납니다.

Windows (Git Bash / PowerShell)

# Git Bash

source venv/Scripts/activate

# PowerShell

.\venv\Scripts\activate

# Mac / Linux

source venv/bin/activate

3. 패키지 설치
   가상환경이 켜진 상태에서 필요한 라이브러리를 설치합니다.

pip install -r requirements.txt
(주의: 새로운 라이브러리를 설치했다면 pip freeze > requirements.txt로 리스트를 업데이트해주세요.)

# 서버 실행 (Run Server)

환경 설정이 완료되었다면 아래 명령어로 개발 서버를 실행합니다.

Bash

python3 manage.py runserver
