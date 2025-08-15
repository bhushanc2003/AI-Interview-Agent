from fastapi import FastAPI, WebSocket
from model import get_gemini_response

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ WebSocket connected")
    try:
        while True:
            # Receive speech-to-text result from frontend
            user_text = await websocket.receive_text()
            print(f"🗣 User said: {user_text}")

            # Get Gemini's reply
            bot_reply = get_gemini_response(user_text)
            print(f"🤖 Gemini says: {bot_reply}")

            # Send reply back to frontend
            await websocket.send_text(bot_reply)

    except Exception as e:
        print(f"❌ WebSocket error: {e}")
