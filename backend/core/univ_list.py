UNIVERSITY_MAP = {
    # --- 서울 주요 상위권 및 과기원 (IST) ---
    "snu.ac.kr": "서울대학교",
    "yonsei.ac.kr": "연세대학교",
    "korea.ac.kr": "고려대학교",
    "kaist.ac.kr": "KAIST (한국과학기술원)",
    "postech.ac.kr": "포항공과대학교",
    "hanyang.ac.kr": "한양대학교",
    "skku.edu": "성균관대학교",
    "sogang.ac.kr": "서강대학교",
    "cau.ac.kr": "중앙대학교",
    "khu.ac.kr": "경희대학교",
    "hufs.ac.kr": "한국외국어대학교",
    "uos.ac.kr": "서울시립대학교",
    "ewha.ac.kr": "이화여자대학교",

    # --- 서울권 주요 사립대 ---
    "konkuk.ac.kr": "건국대학교",
    "dongguk.edu": "동국대학교",
    "hongik.ac.kr": "홍익대학교",
    "kookmin.ac.kr": "국민대학교",
    "sookmyung.ac.kr": "숙명여자대학교",
    "ssu.ac.kr": "숭실대학교",
    "sejong.ac.kr": "세종대학교",
    "dankook.ac.kr": "단국대학교",
    "kw.ac.kr": "광운대학교",
    "mju.ac.kr": "명지대학교",
    "sangmyung.ac.kr": "상명대학교",
    "skuniv.ac.kr": "서경대학교",
    "hansung.ac.kr": "한성대학교",
    "sungshin.ac.kr": "성신여자대학교",
    "dongduk.ac.kr": "동덕여자대학교",
    "duksung.ac.kr": "덕성여자대학교",
    "swu.ac.kr": "서울여자대학교",
    "samhyook.ac.kr": "삼육대학교",

    # --- 지방 거점 국립대학교 (KNU10) ---
    "pusan.ac.kr": "부산대학교",
    "knu.ac.kr": "경북대학교",
    "jnu.ac.kr": "전남대학교",
    "cnu.ac.kr": "충남대학교",
    "chungbuk.ac.kr": "충북대학교",
    "jbnu.ac.kr": "전북대학교",
    "kangwon.ac.kr": "강원대학교",
    "jejunu.ac.kr": "제주대학교",
    "gnu.ac.kr": "경상국립대학교",

    # --- 과학기술원 및 특수목적 ---
    "gist.ac.kr": "GIST (광주과학기술원)",
    "unist.ac.kr": "UNIST (울산과학기술원)",
    "dgist.ac.kr": "DGIST (대구경북과학기술원)",
    "kentech.ac.kr": "한국에너지공과대학교",
    "knue.ac.kr": "한국교원대학교",
    "mmu.ac.kr": "목포해양대학교",
    "kmou.ac.kr": "한국해양대학교",
    "nsu.ac.kr": "남서울대학교",

    # --- 경기/인천 및 주요 지방 사립대 ---
    "inha.ac.kr": "인하대학교",
    "ajou.ac.kr": "아주대학교",
    "gachon.ac.kr": "가천대학교",
    "kyonggi.ac.kr": "경기대학교",
    "inu.ac.kr": "인천대학교",
    "kpu.ac.kr": "한국공학대학교",
    "kau.ac.kr": "한국항공대학교",
    "hnu.kr": "한남대학교",
    "handong.edu": "한동대학교",
    "yeungnam.ac.kr": "영남대학교",
    "chosun.ac.kr": "조선대학교",
    "donga.ac.kr": "동아대학교",
    "ulsan.ac.kr": "울산대학교",
    "wku.ac.kr": "원광대학교",
    "hallym.ac.kr": "한림대학교",
    "inje.ac.kr": "인제대학교",
    "sch.ac.kr": "순천향대학교",
    "konyang.ac.kr": "건양대학교",
    
    "pknu.ac.kr": "부경대학교",
    "hanbat.ac.kr": "한밭대학교",
    "kongju.ac.kr": "공주대학교",
    "ut.ac.kr": "한국교통대학교",
    "koreatech.ac.kr": "한국기술교육대학교",
    "knut.ac.kr": "금오공과대학교",
    "andong.ac.kr": "안동대학교",
    "kunsan.ac.kr": "군산대학교",
    "mokpo.ac.kr": "목포대학교",
    "scnu.ac.kr": "순천대학교",
}

def get_university_name(email: str) -> str | None:
    try:
        domain = email.split("@")[1]
        
        # 등록된 학교인지 확인 (Whitelist)
        if domain in UNIVERSITY_MAP:
            return UNIVERSITY_MAP[domain]
            
        # 등록 안 된 학교라도 .ac.kr 또는 .edu 도메인이면 허용 (Fallback)
        if domain.endswith(".ac.kr") or domain.endswith(".edu"):
            return domain.split(".")[0].upper() + " 대학교(미등록)"
        return None
    except IndexError:
        return None