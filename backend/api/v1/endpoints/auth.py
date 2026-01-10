import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import EmailVerification
from core.email import send_verification_email
from schemas.user import EmailSendRequest, EmailVerifyRequest 

router = APIRouter()

# 1. 인증번호 발송 API
@router.post("/email/send")
def send_email_code(
    request: EmailSendRequest,
    db: Session = Depends(get_db)
):
    email = request.email # 스키마에서 꺼내기

    # 6자리 코드 생성
    code = str(random.randint(100000, 999999))

    # 기존 인증 기록 삭제 (재요청 시 갱신)
    db.query(EmailVerification).filter(EmailVerification.email == email).delete()
    
    # 새 기록 저장
    new_verify = EmailVerification(
        email=email,
        code=code,
        is_verified=False
    )
    db.add(new_verify)
    db.commit()

    # 이메일 발송 유틸 호출
    if send_verification_email(email, code):
        return {"message": "인증코드가 발송되었습니다."}
    else:
        raise HTTPException(status_code=500, detail="이메일 전송에 실패했습니다.")

# 2. 인증번호 검증 API
@router.post("/email/verify")
def verify_email_code(
    request: EmailVerifyRequest,
    db: Session = Depends(get_db)
):
    email = request.email
    code = request.code

    record = db.query(EmailVerification).filter(EmailVerification.email == email).first()
    
    if not record:
        raise HTTPException(status_code=400, detail="인증 요청 기록이 없습니다.")
    
    if record.code != code:
        raise HTTPException(status_code=400, detail="인증번호가 틀렸습니다.")
    
    # 인증 성공 처리
    record.is_verified = True
    db.commit()
    
    return {"message": "이메일 인증 성공"}