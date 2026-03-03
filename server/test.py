from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from urllib.parse import quote_plus
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content
from dotenv import load_dotenv
from pathlib import Path
from pymongo import MongoClient
from datetime import datetime, timezone

# Load environment variables first (before any getenv use)
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

def _mongo_uri_with_encoded_password(uri):
    """Encode password in URI so special chars (e.g. @) are valid (RFC 3986)."""
    if not uri or "://" not in uri:
        return uri
    scheme, rest = uri.split("://", 1)
    if "@" not in rest:
        return uri
    auth, host = rest.rsplit("@", 1)
    if ":" not in auth:
        return uri
    user, password = auth.split(":", 1)
    return f"{scheme}://{user}:{quote_plus(password)}@{host}"

# MongoDB setup
mongo_uri = os.getenv("MONGO_URI")
if mongo_uri:
    mongo_uri = _mongo_uri_with_encoded_password(mongo_uri)
client = MongoClient(mongo_uri)
db = client['healthcare_predictions']  # database name
diabetes_collection = db['diabetes_predictions']
heart_collection = db['heart_predictions']
obesity_collection = db['obesity_prediction']

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure Gemini with generation settings
try:
    genai.configure(api_key=os.getenv("GEMINI_KEY"))
    generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 50,
    "response_schema": content.Schema(
        type = content.Type.OBJECT,
        properties = {
        "response": content.Schema(
            type = content.Type.STRING,
        ),
        },
    ),
    "response_mime_type": "application/json",
}

    model = genai.GenerativeModel(
    model_name="gemini-2.5-pro",
    generation_config=generation_config,
    )

    chat_session = model.start_chat(
    history=[]
    )

    model_2 = genai.GenerativeModel(
    model_name="gemini-2.5-pro",
    generation_config=generation_config,
    )

    chat_session_2 = model_2.start_chat(
    history=[]
    )

    model_3 = genai.GenerativeModel(
    model_name="gemini-2.5-pro",
    generation_config=generation_config,
    )

    chat_session_3 = model_3.start_chat(
        history=[]
    )
    
except Exception as e:
    print(f"Error configuring Gemini: {e}")
    exit(1)

def store_prediction(collection, data, prediction_result):
    """Store the prediction data and result in MongoDB"""
    document = {
        "timestamp": datetime.now(timezone.utc),
        "input_data": data,
        "prediction_result": prediction_result
    }
    try:
        collection.insert_one(document)
        print(f"Stored prediction in database")
    except Exception as e:
        print(f"Error storing in database: {e}")

def analyze_medical_data(data, condition_type):
    
    try:
        # Test mode: return mock result without calling Gemini (for frontend connection checks)
        if data.pop("_test", None):
            mock_results = {
                "diabetes": "Mock result: Low risk of diabetes based on provided values. (Test mode)",
                "heart": "Mock result: Heart health indicators within normal range. (Test mode)",
                "obesity": "Mock result: Normal weight category. (Test mode)",
            }
            return {"result": mock_results.get(condition_type, "OK")}, 200

        # Filter out internal keys like _test
        clean_data = {k: v for k, v in data.items() if not k.startswith('_')}
        data_str = json.dumps(clean_data)

        if condition_type == "diabetes":
            # System instruction already provides context
            prompt = f"Predict diabetes status for: {data_str}"
        elif condition_type == "heart":
            # System instruction already provides context
            prompt = f"Predict heart disease risk for: {data_str}"
        elif condition_type == "obesity":
            # Obesity model has empty system instructions, so we must be explicit
            prompt = f"Predict the obesity level based on this patient data: {data_str}. Return a JSON with key 'response'."
        else:
            return {"error": "Invalid condition type"}, 400

        # Get prediction from Gemini
        response = None
        if condition_type == "diabetes":
            response = chat_session.send_message(prompt)
        elif condition_type == "heart":
            response = chat_session_2.send_message(prompt)
        elif condition_type == "obesity":
            response = chat_session_3.send_message(prompt)
            
        result = response.text
        print(f"Gemini Response: {result}")

        # Robust JSON parsing
        try:
            # Clean up potential markdown code blocks if present
            cleaned_result = result.replace("```json", "").replace("```", "").strip()
            parsed_json = json.loads(cleaned_result)
            
            # Try to find the response in likely keys
            text = parsed_json.get("response") or parsed_json.get("prediction")
            
            # Fallback if keys don't match but we have values
            if not text and parsed_json:
                text = list(parsed_json.values())[0]
                
        except json.JSONDecodeError:
            # Fallback to raw text if JSON parsing fails
            text = result.strip()
            
        return {
            "result": text
        }, 200

    except Exception as e:
        print(f"Error in analysis: {e}")
        return {"error": str(e)}, 500

@app.route('/predict/<condition_type>', methods=['POST'])
def predict(condition_type):
    """
    Endpoint for medical condition prediction
    """
    try:
        data = request.json
        print(data)
        if not data:
            return jsonify({"error": "No data provided"}), 400

        result, status_code = analyze_medical_data(data, condition_type)
        if status_code == 200:
            if condition_type == "diabetes":
                collection = diabetes_collection
            elif condition_type == 'heart':
                collection = heart_collection
            elif condition_type == 'obesity':
                collection = obesity_collection
            else:
                collection = None
            if collection is not None:
                store_prediction(collection, data, result)
        return jsonify(result), status_code

    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint
    """
    return jsonify({"status": "healthy", "model": "gemini-2.5-pro"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000) 