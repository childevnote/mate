"""
Expo Push Notification helper.
Sends push notifications via the Expo Push API.

Docs: https://docs.expo.dev/push-notifications/sending-notifications/
"""
import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


async def send_push_notification(
    expo_push_token: str,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> bool:
    """
    Sends a single push notification via Expo Push API.
    Returns True on success, False on failure.
    """
    if not expo_push_token or not expo_push_token.startswith("ExponentPushToken"):
        return False

    payload = {
        "to": expo_push_token,
        "title": title,
        "body": body,
        "sound": "default",
        "channelId": "default",
    }
    if data:
        payload["data"] = data

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                EXPO_PUSH_URL,
                json=payload,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )
            result = response.json()
            status = result.get("data", {}).get("status")
            if status == "error":
                logger.warning(
                    "Expo push failed for token %s: %s",
                    expo_push_token,
                    result.get("data", {}).get("message"),
                )
                return False
            return True
    except Exception as exc:
        logger.error("Push notification error: %s", exc)
        return False
