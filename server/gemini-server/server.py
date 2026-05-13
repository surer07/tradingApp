from google import genai
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()

client = genai.Client(api_key=os.getenv("API_KEY"))

chat = client.chats.create(model="gemini-2.5-flash")

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/analyze', methods=['POST'])
def analize_stock():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    ticker = data.get('ticker')
    history = data.get('history')
    prompt = data.get('message')
    message = f"{prompt} given a ticker: {ticker}, and a 5 day history: {history}"

    res = chat.send_message(message)

    return jsonify({"result": res.text}), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=os.getenv("PORT"))
