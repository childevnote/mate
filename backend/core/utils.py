# backend/core/utils.py
from user_agents import parse

def get_device_name(user_agent_str: str | None) -> str:

    if not user_agent_str:
        return "Unknown Device"
    try:
        ua = parse(user_agent_str)
        
        os_info = ua.os.family

        browser_info = ua.browser.family

        device_type = "Mobile" if ua.is_mobile else "PC"
        if ua.is_tablet: device_type = "Tablet"
        
        return f"{os_info} / {browser_info}"
    
    except Exception:
        return "Unknown Device"