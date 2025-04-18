from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app)

# Initialize label encoders
gender_encoder = LabelEncoder()
def gender_encode(value):
    if value.lower() == 'female':
        return 0
    elif value.lower() == 'male':
        return 1
    else:
        return 0

# Map smoking history to numeric values
def encode_smoking_history(value):
    smoking_map = {
        'never': 0,
        'current': 1,
        'former': 2,
        'occasional': 3
    }
    return smoking_map.get(value.lower(), 0) 

# Map obesity-related categorical variables
def encode_yes_no(value):
    return 1 if value.lower() == 'yes' else 0

def encode_frequency(value):
    frequency_map = {
        'no': 0,
        'sometimes': 1,
        'frequently': 2,
        'always': 3
    }
    return frequency_map.get(value.lower(), 0)

def encode_transportation(value):
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

@app.route('/predict/<model_type>', methods=['POST'])
def predict(model_type):
    try:
        data = request.json
        
        if model_type == 'diabetes':
            try:
                # Process diabetes prediction
                print("Received data:", data)  # Debug print
                
                # Label encode categorical variables
                gender_encoded = gender_encoder.transform([data.get('gender')])[0]
                smoking_encoded = encode_smoking_history(data.get('smokinghistory', 'never'))
                
                new_data = pd.DataFrame({
                    'gender': [gender_encoded],
                    'age': [float(data.get('age'))],
                    'hypertension': [int(data.get('hypertension'))],
                    'heart_disease': [int(data.get('heartdisease'))],
                    'smoking_history': [smoking_encoded],
                    'bmi': [float(data.get('bmi'))],
                    'HbA1c_level': [float(data.get('hba1c_level'))],  # Default to 6.0 if not provided
                    'blood_glucose_level': [float(data.get('bloodglucoselevel'))]
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
            try:
                # Process heart disease prediction
                print("Received data:", data)  # Debug print
                
                # Label encode categorical variables
                gender_encoded = gender_encoder.transform([data.get('gender')])[0]
            except Exception as e:
                print(f"Error in heart disease prediction: {str(e)}")  # Debug print
                return jsonify({'error': f"Prediction error: {str(e)}"}), 500
        elif model_type == 'obesity':
            try:
                print("Received obesity data:", data)  # Debug print
                
                # Encode categorical variables
                #gender_encoded = gender_encoder.transform([data.get('gender')])[0]
                family_history = encode_yes_no(data.get('family_history_with_overweight', 'no'))
                frequent_caloric = encode_yes_no(data.get('frequent_caloric_food', 'no'))
                smoking = encode_yes_no(data.get('smoking', 'no'))
                calorie_monitoring = encode_yes_no(data.get('calorie_monitoring', 'no'))
                
                new_data = pd.DataFrame({
                    'Gender': [int(gender_encode(data.get('gender')))],
                    'Age': [int(data.get('age'))],
                    'Height': [float(data.get('height'))],
                    'Weight': [float(data.get('weight'))],
                    'family_history_with_overweight': [int(family_history)],
                    'FAVC': [int(frequent_caloric)],
                    'FCVC': [int(data.get('vegetable_consumption', 1))],
                    'NCP': [int(data.get('daily_meals', 1))],
                    'CAEC': [int(encode_frequency(data.get('eating_between_meals', 'no')))],
                    'SMOKE': [int(smoking)],
                    'CH2O': [int(data.get('daily_water_consumption', 1))],
                    'SCC': [int(calorie_monitoring)],
                    'FAF': [int(data.get('physical_activity_frequency', 1))],
                    'TUE': [int(data.get('technology_use_time', 0))],
                    'CALC': [int(encode_frequency(data.get('alcohol_consumption', 'no')))],
                    'MTRANS': [int(encode_transportation(data.get('transportation_mode', 'automobile')))]
                })
                
                if new_data.isna().isna().any():
                    print("Warning: NaN values detected in:", new_data.columns[new_data.isna().any()].tolist())
                

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