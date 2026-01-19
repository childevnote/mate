import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import EmailVerification, User, University
from core.email import send_verification_email, send_school_verification_email
from core.univ_list import get_university_name
from schemas.user import (
    EmailSendRequest, 
    EmailVerifyRequest, 
    SchoolEmailSendRequest, 
    SchoolEmailVerifyRequest,
    UserResponse
)
from api import deps

router = APIRouter()

# ==============================================================================
# 1. 회원가입용 이메일 인증 (목적: 본인 확인)
# ==============================================================================

@router.post("/email/send")
def send_email_code(
    request: EmailSendRequest,
    db: Session = Depends(get_db)
):
    email = request.email

    # 1. 이미 가입된 이메일인지 확인
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="이미 가입된 이메일입니다. 로그인해주세요."
        )

    # 2. 6자리 코드 생성
    code = str(random.randint(100000, 999999))

    # 3. 기존 '회원가입용' 인증 기록 삭제 (재요청 시 갱신)
    db.query(EmailVerification).filter(
        EmailVerification.email == email,
        EmailVerification.purpose == "register"
    ).delete()
    
    # 4. 새 기록 저장
    new_verify = EmailVerification(
        email=email,
        code=code,
        is_verified=False,
        purpose="register"
    )
    db.add(new_verify)
    db.commit()

    # 5. 회원가입용 메일 발송
    if send_verification_email(email, code):
        return {"message": "인증코드가 발송되었습니다."}
    else:
        raise HTTPException(status_code=500, detail="이메일 전송에 실패했습니다.")


@router.post("/email/verify")
def verify_email_code(
    request: EmailVerifyRequest,
    db: Session = Depends(get_db)
):
    email = request.email
    code = request.code

    record = db.query(EmailVerification).filter(
        EmailVerification.email == email,
        EmailVerification.purpose == "register"
    ).first()
    
    if not record:
        raise HTTPException(status_code=400, detail="인증 요청 기록이 없습니다.")
    
    if record.code != code:
        raise HTTPException(status_code=400, detail="인증번호가 틀렸습니다.")
    
    # 인증 성공 처리
    record.is_verified = True
    db.commit()
    
    return {"message": "이메일 인증 성공"}


# ==============================================================================
# 2. 학교/학생 인증 (목적: 재학생 확인)
# ==============================================================================

@router.post("/school/send")
def send_school_email_code(
    request: SchoolEmailSendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user) # 👈 로그인 필수
):
    email = request.email

    # 1. 지원하는 학교 도메인인지 확인 (Whitelist)
    univ_name = get_university_name(email)
    if not univ_name:
        raise HTTPException(
            status_code=400, 
            detail="지원하지 않는 학교 도메인입니다. 관리자에게 문의해주세요."
        )

    # 2. 이미 다른 계정에서 사용 중인 학교 이메일인지 중복 체크
    existing_email_user = db.query(User).filter(User.school_email == email).first()
    if existing_email_user and existing_email_user.id != current_user.id:
        raise HTTPException(
            status_code=400, 
            detail="이미 다른 계정에 등록된 학교 이메일입니다."
        )

    # 3. 인증 코드 생성
    code = str(random.randint(100000, 999999))

    # 4. 기존 '학교 인증용' 기록 삭제
    db.query(EmailVerification).filter(
        EmailVerification.email == email,
        EmailVerification.purpose == "school" # 🔥 목적: 학교 인증
    ).delete()
    
    # 5. 새 기록 저장
    new_verify = EmailVerification(
        email=email,
        code=code,
        is_verified=False,
        purpose="school"
    )
    db.add(new_verify)
    db.commit()

    # 6. 학교 인증 전용 메일 발송
    if send_school_verification_email(email, code, univ_name):
        return {"message": f"{univ_name} 메일로 인증코드가 발송되었습니다."}
    else:
        raise HTTPException(status_code=500, detail="이메일 전송에 실패했습니다.")


@router.post("/school/verify")
def verify_school_email_code(
    request: SchoolEmailVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    email = request.email
    code = request.code

    # 1. 인증 기록 조회 (purpose="school")
    record = db.query(EmailVerification).filter(
        EmailVerification.email == email,
        EmailVerification.purpose == "school"
    ).first()
    
    if not record:
        raise HTTPException(status_code=400, detail="인증 요청 기록이 없습니다.")
    
    if record.code != code:
        raise HTTPException(status_code=400, detail="인증번호가 틀렸습니다.")
    
    # 2. 학교 정보 처리 (University 테이블)
    univ_name = get_university_name(email)
    if not univ_name:
         raise HTTPException(status_code=400, detail="유효하지 않은 학교 도메인입니다.")

    # DB에 학교가 있는지 확인하고, 없으면 생성 (Auto-Registration)
    university = db.query(University).filter(University.name == univ_name).first()
    
    if not university:
        try:
            domain = email.split("@")[1]
            university = University(name=univ_name, domain=domain)
            db.add(university)
            db.commit()
            db.refresh(university)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="학교 정보 등록 중 오류가 발생했습니다.")

    # 3. 유저 정보 업데이트 (학교 연동)
    try:
        current_user.school_email = email
        current_user.university_id = university.id
        current_user.is_student_verified = True
        
        # 인증 기록 삭제 (일회용이므로 사용 후 삭제)
        db.delete(record)
        
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="유저 정보 업데이트 실패")
    
    return {
        "message": "학교 인증이 완료되었습니다.",
        "university": univ_name,
        "is_verified": True
    }


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(deps.get_current_user)):
    return current_user