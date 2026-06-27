import os
import warnings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import requests
from dotenv import load_dotenv

print("### LOADED CORRECT APP FILE ###")

# Load environment variables
load_dotenv()

# Suppress TensorFlow warnings
warnings.filterwarnings("ignore")
tf.get_logger().setLevel("ERROR")

app = Flask(__name__)
CORS(app)

# ---- Custom preprocessing layer (must match training) ----
class EfficientNetPreprocess(tf.keras.layers.Layer):
    def call(self, inputs):
        return tf.keras.applications.efficientnet.preprocess_input(inputs)

# ---- Load model ----
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.keras")

model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={"EfficientNetPreprocess": EfficientNetPreprocess},
    compile=False
)

CLASS_NAMES = [
    "Healthy",
    "Leaf Blight",
    "Rust",
    "Powdery Mildew"
]

# ---- Root route (browser check) ----
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "message": "Plant disease detection API is running"
    })

# ---- Health check route ----
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None
    })

# ---- Prediction route ----
@app.route("/api/analyze", methods=["POST"])
def analyze_image():
    if "plantImage" not in request.files:
        return jsonify({
            "success": False,
            "message": "No image received"
        }), 400

    try:
        file = request.files["plantImage"]

        # IMPORTANT: no /255 here (handled by model)
        image = Image.open(file).convert("RGB")
        image = image.resize((224, 224))
        image = np.array(image, dtype=np.float32)
        image = np.expand_dims(image, axis=0)

        prediction = model.predict(image, verbose=0)
        index = int(np.argmax(prediction[0]))
        confidence = float(prediction[0][index])

        return jsonify({
            "success": True,
            "result": {
                "disease": CLASS_NAMES[index],
                "confidence": round(confidence, 4),
                "description": "Disease detected using CNN model.",
                "treatment": [
                    "Remove affected leaves",
                    "Use organic fungicide",
                    "Avoid over-watering"
                ],
                "prevention": [
                    "Ensure proper sunlight",
                    "Maintain soil drainage",
                    "Regular plant inspection"
                ]
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ---- Chatbot route ----
@app.route("/api/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    language = request.json.get("language", "English")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return jsonify({
            "reply": "⚠️ Kheti Baadi AI Assistant API key is not configured. Please create a `.env` file in the `backend` folder and add your `GEMINI_API_KEY` to start chatting!"
        })

    try:
        # Use gemini-2.5-flash-lite for ultra-fast, low-latency responses (no thinking delay)
        url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent"
        
        prompt = (
            f"You are Kheti Baadi AI, a helpful assistant for Indian farmers. "
            f"Provide a brief, concise, and highly practical answer (under 100 words). "
            f"You MUST answer in the '{language}' language. Use bullet points where appropriate.\n"
            f"User: {user_message}"
        )
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "maxOutputTokens": 250,
                "temperature": 0.4
            }
        }

        response = requests.post(
            f"{url}?key={api_key}",
            headers={"Content-Type": "application/json"},
            json=payload
        )

        data = response.json()

        # Handle API error
        if "error" in data:
            return jsonify({"error": data["error"]["message"]})

        try:
            reply = data["candidates"][0]["content"]["parts"][0]["text"]
            return jsonify({"reply": reply})
        except (KeyError, IndexError):
            return jsonify({"error": "Invalid response format from Gemini API."})

    except Exception as e:
        return jsonify({"error": str(e)})


# ---- Contact Form route ----
@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data received"}), 400

    name = data.get("name")
    email_address = data.get("email")
    message = data.get("message")

    if not name or not email_address or not message:
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    # Get SMTP configuration
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    receiver_email = os.environ.get("CONTACT_RECEIVER_EMAIL", "kumaraditya007376@gmail.com")

    # If SMTP is not configured, log it and return simulated success
    if not smtp_user or not smtp_password:
        print("\n=== [SIMULATED EMAIL] ===")
        print(f"To Admin ({receiver_email}): Message from {name} ({email_address}): {message}")
        print(f"To Sender ({email_address}): Acknowledgment email sent.")
        print("==========================\n")
        return jsonify({
            "success": True,
            "message": "Message sent successfully (Simulated - SMTP credentials not configured in .env)"
        })

    try:
        # 1. Send notification email to the admin
        admin_msg = MIMEMultipart()
        admin_msg["From"] = smtp_user
        admin_msg["To"] = receiver_email
        admin_msg["Subject"] = f"New Kheti Baadi Contact Message from {name}"

        admin_body = f"""
        You have received a new message from the Kheti Baadi contact form:

        Name: {name}
        Email: {email_address}
        Message:
        {message}
        """
        admin_msg.attach(MIMEText(admin_body, "plain"))

        # 2. Send acknowledgment email to the sender
        sender_msg = MIMEMultipart()
        sender_msg["From"] = smtp_user
        sender_msg["To"] = email_address
        sender_msg["Subject"] = "Thank you for contacting Kheti Baadi!"

        sender_body = f"""
        Dear {name},

        Thank you for reaching out to us at Kheti Baadi. We have received your message and our team will get back to you shortly.

        Your Message:
        "{message}"

        Best regards,
        Kheti Baadi Team
        """
        sender_msg.attach(MIMEText(sender_body, "plain"))

        # Connect to SMTP server and send
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)

        # Send both emails
        server.sendmail(smtp_user, receiver_email, admin_msg.as_string())
        server.sendmail(smtp_user, email_address, sender_msg.as_string())
        server.quit()

        return jsonify({
            "success": True,
            "message": "Message sent successfully! We have sent a confirmation email."
        })

    except Exception as e:
        print(f"SMTP ERROR: {e}")
        return jsonify({
            "success": False,
            "message": f"Failed to send email: {str(e)}"
        }), 500


# ---- Weather Tips route ----
@app.route("/api/weather-tips", methods=["POST"])
def weather_tips():
    data = request.json
    if not data:
        return jsonify({"error": "No data received"}), 400

    temp = data.get("temp")
    humidity = data.get("humidity")
    rain = data.get("rain")
    wind = data.get("wind")
    language = data.get("language", "English")

    def get_fallback_tip(temp, humidity, language):
        try:
            h = float(humidity)
            t = float(temp)
        except (ValueError, TypeError):
            h, t = 50.0, 25.0

        tips = {
            "English": {
                "high_humidity": "⚠️ High humidity increases fungal disease risks. Ensure proper soil drainage and watch for Powdery Mildew.",
                "high_temp": "☀️ High temperatures detected. Irrigate early in the morning or late evening to reduce water evaporation.",
                "stable": "🌱 Weather conditions are stable. Continue regular crop monitoring and check for pests."
            },
            "Hindi": {
                "high_humidity": "⚠️ उच्च आर्द्रता से कवक रोगों का खतरा बढ़ जाता है। जल निकासी सुनिश्चित करें और ख़स्ता फফূন্দি पर नज़र रखें।",
                "high_temp": "☀️ उच्च तापमान दर्ज किया गया। पानी के वाष्पीकरण को कम करने के लिए सुबह जल्दी या शाम को सिंचाई करें।",
                "stable": "🌱 मौसम की स्थिति स्थिर है। नियमित फसल निगरानी जारी रखें और कीटों की जाँच करें।"
            },
            "Punjabi": {
                "high_humidity": "⚠️ ਉੱਚ ਨਮੀ ਉੱਲੀ ਰੋਗਾਂ ਦੇ ਜੋਖਮ ਨੂੰ ਵਧਾਉਂਦੀ ਹੈ। ਪਾਣੀ ਦੇ ਨਿਕਾਸ ਨੂੰ ਯਕੀਨੀ ਬਣਾਓ ਅਤੇ ਪਾਊਡਰਰੀ ਮਿਲਡਿਊ 'ਤੇ ਨਜ਼ਰ ਰੱਖੋ।",
                "high_temp": "☀️ ਉੱਚ ਤਾਪਮਾਨ ਦਰਜ ਕੀਤਾ ਗਿਆ। ਵਾਸ਼ਪੀਕਰਨ ਨੂੰ ਘਟਾਉਣ ਲਈ ਸਵੇਰੇ ਜਲਦੀ ਜਾਂ ਸ਼ਾਮ ਨੂੰ ਸਿੰਚਾਈ ਕਰੋ।",
                "stable": "🌱 ਮੌਸਮ ਸਥਿਰ ਹੈ। ਫਸਲ ਦੀ ਨਿਯਮਤ ਨਿਗਰਾਨੀ ਜਾਰੀ ਰੱਖੋ ਅਤੇ ਕੀੜਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ।"
            },
            "Bengali": {
                "high_humidity": "⚠️ উচ্চ আর্দ্রতা ছত্রাকজনিত রোগের ঝুঁকি বাড়ায়। সঠিক নিষ্কাশন নিশ্চিত করুন এবং পাউডারি মিলডিউ লক্ষ্য করুন।",
                "high_temp": "☀️ উচ্চ তাপমাত্রা সনাক্ত করা হয়েছে। বাষ্পীভবন কমাতে সকালে বা সন্ধ্যায় সেচ দিন।",
                "stable": "🌱 আবহাওয়া স্থিতিশীল রয়েছে। নিয়মিত ফসল পর্যবেক্ষণ চালিয়ে যান এবং পোকা পরীক্ষা করুন।"
            }
        }

        lang_tips = tips.get(language, tips["English"])
        if h > 80:
            return lang_tips["high_humidity"]
        elif t > 35:
            return lang_tips["high_temp"]
        else:
            return lang_tips["stable"]

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        return jsonify({"tip": get_fallback_tip(temp, humidity, language)})

    try:
        url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent"
        prompt = (
            f"You are an expert Indian farming advisor. Generate a single-sentence, highly actionable farming tip (under 25 words) "
            f"based on these weather conditions: Temperature {temp}°C, Humidity {humidity}%, Rain probability {rain}%, Wind speed {wind} km/h. "
            f"You MUST respond in the '{language}' language.\nFarming Tip:"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "maxOutputTokens": 60,
                "temperature": 0.4
            }
        }

        response = requests.post(
            f"{url}?key={api_key}",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=8
        )

        data = response.json()
        if "error" in data:
            # Fallback to local rule-based warning if Gemini fails (e.g. quota/billing limits)
            return jsonify({"tip": get_fallback_tip(temp, humidity, language)})

        try:
            tip = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            return jsonify({"tip": tip})
        except (KeyError, IndexError):
            return jsonify({"tip": get_fallback_tip(temp, humidity, language)})

    except Exception as e:
        return jsonify({"tip": get_fallback_tip(temp, humidity, language)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True, use_reloader=False)
