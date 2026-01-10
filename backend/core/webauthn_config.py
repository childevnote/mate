import os

from webauthn import generate_registration_options, verify_registration_response
from webauthn import generate_authentication_options, verify_authentication_response
from webauthn.helpers.structs import AuthenticatorSelectionCriteria, UserVerificationRequirement

# 우리 서비스 정보 (설정)
RP_ID = os.getenv("WEBAUTHN_RP_ID", "localhost")
RP_NAME = os.getenv("WEBAUTHN_RP_NAME", "Mate Community")
ORIGIN = os.getenv("WEBAUTHN_ORIGIN", "http://localhost:3000")
challenge_store = {}