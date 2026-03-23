from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.preprocessing import LabelEncoder

load_dotenv()

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# MongoDB Setup
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/healthcare_db")
client = MongoClient(mongo_uri)
db = client['healthcare_db']
users_collection = db['users']

# Initialize label encoders
def gender_encode(value):
    if not isinstance(value, str): return 0
    return 0 if value.lower() == 'female' else 1 if value.lower() == 'male' else 0

# Map smoking history to numeric values
def encode_smoking_history(value):
    if not isinstance(value, str): return 0
    smoking_map = {
        'never': 0,
        'current': 1,
        'former': 2,
        'occasional': 3
    }
    return smoking_map.get(value.lower(), 0) 

# Map obesity-related categorical variables
def encode_yes_no(value):
    if not isinstance(value, str): return 0
    return 1 if value.lower() == 'yes' else 0

def encode_frequency(value):
    if not isinstance(value, str): return 0
    frequency_map = {
        'no': 0,
        'sometimes': 1,
        'frequently': 2,
        'always': 3
    }
    return frequency_map.get(value.lower(), 0)

def encode_transportation(value):
    if not isinstance(value, str): return 0
    transport_map = {
        'automobile': 0,
        'bike': 1,
        'motorbike': 2,
        'public_transportation': 3,
        'walking': 4
    }
    return transport_map.get(value.lower(), 0)

# Load your ML models
try:
    diabetes_model = joblib.load('../models/diabetes.joblib')
    #heart_model = joblib.load('models/heart.pkl')
    obesity_model = joblib.load('../models/obesity_predictor.joblib')
except Exception as e:
    print(f"Error loading models: {e}")

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        existing_user = users_collection.find_one({'email': email})
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        user = {
            'email': email,
            'password': hashed_password,
            'name': name
        }
        users_collection.insert_one(user)

        return jsonify({'message': 'User created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401

        if bcrypt.check_password_hash(user['password'], password):
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'email': user['email'],
                    'name': user.get('name', 'User')
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict/<model_type>', methods=['POST'])
def predict(model_type):
    try:
        data = request.json
        
        if model_type == 'diabetes':
            try:
                # Process diabetes prediction
                print("Received data:", data)  # Debug print
                
                # Label encode categorical variables
                gender_encoded = gender_encode(data.get('gender'))
                smoking_encoded = encode_smoking_history(data.get('smokinghistory', 'never'))
                
                new_data = pd.DataFrame({
                    'gender': [gender_encoded],
                    'age': [float(data.get('age', 0))],
                    'hypertension': [int(data.get('hypertension', 0))],
                    'heart_disease': [int(data.get('heartdisease', 0))],
                    'smoking_history': [smoking_encoded],
                    'bmi': [float(data.get('bmi', 0))],
                    'HbA1c_level': [float(data.get('hba1c_level', 6.0))],  # Default to 6.0 if not provided
                    'blood_glucose_level': [float(data.get('bloodglucoselevel', 0))]
                })
                print("Created DataFrame:", new_data)  # Debug print
                print("DataFrame columns:", new_data.columns)  # Debug print
                prediction = diabetes_model.predict(new_data)
                print("Prediction result:", prediction)  # Debug print
                result = 'Positive for diabetes' if prediction[0] == 1 else 'Negative for diabetes'
                return jsonify({'result': result})
            except Exception as e:
                print(f"Error in diabetes prediction: {str(e)}")  # Debug print
                return jsonify({'error': f"Prediction error: {str(e)}"}), 500
        elif model_type == 'heart':
            return jsonify({'error': 'Heart disease prediction not yet implemented'}), 501
        elif model_type == 'obesity':
            try:
                print("Received obesity data:", data)  # Debug print
                
                # Map categories to exactly match dataset requirements
                # Frontend index values to matching dataset categories/floats
                gender_map = {'male': 'Male', 'female': 'Female'}
                caec_map = {'0': 'no', '1': 'Sometimes', '2': 'Frequently', '3': 'Always'}
                calc_map = {'0': 'no', '1': 'Sometimes', '2': 'Frequently', '3': 'Frequently'} # 'Always' not in model
                mtrans_map = {
                    'automobile': 'Automobile',
                    'bike': 'Bike',
                    'motorbike': 'Motorbike',
                    'public_transportation': 'Public_Transportation',
                    'walking': 'Walking'
                }
                
                fcvc_map = {'0': 1.0, '1': 2.0, '2': 3.0}
                ncp_map = {'0': 1.0, '1': 3.0, '2': 4.0}
                ch2o_map = {'0': 1.0, '1': 2.0, '2': 3.0}
                faf_map = {'0': 0.0, '1': 1.0, '2': 2.0, '3': 3.0}
                tue_map = {'0': 0.0, '1': 1.0, '2': 2.0}
                
                # Assume height > 3 is cm instead of meters
                h = float(data.get('height', 170.0))
                if h > 3.0: 
                    h = h / 100.0

                new_data = pd.DataFrame({
                    'id': [0],
                    'Gender': [gender_map.get(str(data.get('gender')).lower(), 'Male')],
                    'Age': [float(data.get('age', 20.0))],
                    'Height': [h],
                    'Weight': [float(data.get('weight', 70.0))],
                    'family_history_with_overweight': [str(data.get('family_history_with_overweight', 'no')).lower()],
                    'FAVC': [str(data.get('frequent_caloric_food', 'no')).lower()],
                    'FCVC': [fcvc_map.get(str(data.get('vegetable_consumption', '1')), 2.0)],
                    'NCP': [ncp_map.get(str(data.get('daily_meals', '1')), 3.0)],
                    'CAEC': [caec_map.get(str(data.get('eating_between_meals', '1')), 'Sometimes')],
                    'SMOKE': [str(data.get('smoking', 'no')).lower()],
                    'CH2O': [ch2o_map.get(str(data.get('daily_water_consumption', '1')), 2.0)],
                    'SCC': [str(data.get('calorie_monitoring', 'no')).lower()],
                    'FAF': [faf_map.get(str(data.get('physical_activity_frequency', '1')), 1.0)],
                    'TUE': [tue_map.get(str(data.get('technology_use_time', '0')), 0.0)],
                    'CALC': [calc_map.get(str(data.get('alcohol_consumption', '1')), 'Sometimes')],
                    'MTRANS': [mtrans_map.get(str(data.get('transportation_mode', 'automobile')).lower(), 'Automobile')]
                })
                

                print("Created obesity DataFrame:", new_data)  # Debug print
                prediction = obesity_model.predict(new_data)
                print("Obesity prediction result:", prediction)  # Debug print
                
                obesity_levels = {
                    0: "Insufficient Weight",
                    1: "Normal Weight",
                    2: "Overweight Level I",
                    3: "Overweight Level II",
                    4: "Obesity Type I",
                    5: "Obesity Type II",
                    6: "Obesity Type III"
                }
                
                result = obesity_levels.get(prediction[0], "Unknown")
                return jsonify({'result': result})
                
            except Exception as e:
                print(f"Error in obesity prediction: {str(e)}")  # Debug print
                return jsonify({'error': f"Prediction error: {str(e)}"}), 500
        else:
            return jsonify({'error': 'Invalid model type'}), 400

        """ elif model_type == 'cancer':
            # Process cancer prediction
            features = [
                float(data['tumor_size']),
                data['tumor_type'],
                float(data['lymph_nodes']),
                float(data['cell_size']),
                float(data['cell_shape'])
            ]
            prediction = cancer_model.predict([features])[0]
            return jsonify({'prediction': 'Malignant' if prediction == 1 else 'Benign'}) """

        

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 