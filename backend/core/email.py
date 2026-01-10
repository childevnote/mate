import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경변수에서 설정 가져오기 (없으면 기본값 사용)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def send_verification_email(to_email: str, code: str) -> bool:
    """
    이메일로 6자리 인증번호를 전송하는 함수
    """
    # 필수 설정값 확인
    if not SMTP_USER or not SMTP_PASSWORD:
        print("❌ [Email Error] .env 파일에 SMTP_USER 또는 SMTP_PASSWORD가 없습니다.")
        return False

    try:
        # 이메일 구성
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = "[Mate] 회원가입 인증번호 안내"

        # HTML 본문
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Mate 커뮤니티 가입</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.5; text-align: center;">
                        안녕하세요!<br>
                        아래 인증번호 6자리를 입력하여 가입을 진행해주세요.
                    </p>
                    <div style="background-color: #EEF2FF; padding: 15px; text-align: center; border-radius: 8px; margin: 30px 0;">
                        <span style="color: #4F46E5; font-size: 32px; font-weight: bold; letter-spacing: 5px;">{code}</span>
                    </div>
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                        본인이 요청하지 않았다면 이 메일을 무시하세요.
                    </p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(html_body, 'html'))

        # 서버 연결 및 전송
        print(f"📧 메일 전송 시도: {SMTP_SERVER}:{SMTP_PORT} -> {to_email}")
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls() # 보안 연결
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ 전송 성공: {to_email}")
        return True

    except Exception as e:
        print(f"❌ 전송 실패: {str(e)}")
        return False