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

def _send_smtp_email(to_email: str, subject: str, html_body: str) -> bool:
    """
    (내부 함수) SMTP를 통해 실제 메일을 발송하는 공통 로직
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print("❌ [Email Error] .env 파일에 SMTP_USER 또는 SMTP_PASSWORD가 없습니다.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_body, 'html'))

        print(f"📧 메일 전송 시도: {to_email} (제목: {subject})")
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ 전송 성공: {to_email}")
        return True

    except Exception as e:
        print(f"❌ 전송 실패: {str(e)}")
        return False
    
def send_verification_email(to_email: str, code: str) -> bool:
    """
    회원가입 시 사용하는 이메일 인증 함수
    """
    subject = "[Mate] 회원가입 인증번호 안내"
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 30px;">
                <h2 style="color: #333; text-align: center;">Mate 회원가입</h2>
                <p style="text-align: center;">아래 인증번호를 입력하여 가입을 진행해주세요.</p>
                <div style="background-color: #EEF2FF; padding: 15px; text-align: center; margin: 30px 0; border-radius: 8px;">
                    <span style="color: #4F46E5; font-size: 32px; font-weight: bold; letter-spacing: 5px;">{code}</span>
                </div>
            </div>
        </body>
    </html>
    """
    return _send_smtp_email(to_email, subject, html_body)

def send_school_verification_email(to_email: str, code: str, univ_name: str) -> bool:
    """
    학교 웹메일 인증 시 사용하는 함수
    """
    subject = f"[Mate] {univ_name} 학생 인증 코드를 확인해주세요."
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 40px;">
                <h2 style="color: #111; text-align: center; margin-bottom: 20px;">학교 인증</h2>
                <p style="text-align: center; color: #555;">
                    <strong>{univ_name}</strong> 학생 인증을 위해 요청하신<br>인증번호입니다.
                </p>
                <div style="background-color: #EEF2FF; padding: 20px; text-align: center; border-radius: 12px; margin: 30px 0;">
                    <span style="display: block; color: #4F46E5; font-size: 36px; font-weight: 800; letter-spacing: 8px;">{code}</span>
                </div>
                <p style="text-align: center; color: #EF4444; font-size: 14px;">
                    *인증번호는 5분간 유효합니다.
                </p>
            </div>
        </body>
    </html>
    """
    return _send_smtp_email(to_email, subject, html_body)