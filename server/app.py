from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import json
import yagmail

from model import LLM

app = Flask(__name__)


# cors open to all origins
CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.route("/api/generate_email", methods=["POST"])
@cross_origin(origin="*", headers=["Content-Type", "Authorization"])
def get_message():
    if request.method == "POST":
        
        
        prompt = request.json.get("prompt")
        if prompt:
            response = LLM(prompt=prompt)
            response = json.loads(response)
            return jsonify({"text": response})
        else:
            return jsonify({"error": "No query provided"})


# send email
@app.route("/api/send_email", methods=["POST"])
@cross_origin(origin="*", headers=["Content-Type", "Authorization"])
def send_email():
    if request.method == "POST":
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        subject = data.get("subject")
        message = data.get("message")
        recipients = data.get("recipients")
        sender = data.get("sender")
        password = data.get("password")

        if not subject or not message or not recipients or not sender or not password:
            return jsonify({"error": "Missing required data"}), 400

        try:
            yag = yagmail.SMTP(sender, password)
            yag.send(to=recipients, subject=subject, contents=message)
            return jsonify({"message": "Email sent successfully"})
        except Exception as e:
            return jsonify({"error": f"An error occurred: {e}"}), 500


@app.route("/api/test", methods=["GET"])
@cross_origin(origin="*", headers=["Content-Type", "Authorization"])
def test():
    return jsonify({"text": "Hello World!"})
