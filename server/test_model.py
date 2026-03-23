import joblib
import pandas as pd

m = joblib.load('../models/obesity_predictor.joblib')

print("EXPECTED FEATURES:", getattr(m, 'feature_names_in_', 'Unknown'))

if hasattr(m, 'named_steps') and 'preprocessor' in m.named_steps:
    prep = m.named_steps['preprocessor']
    print("\nPREPROCESSOR TRANSFORMERS:")
    for name, trans, cols in prep.transformers_:
        print(f"Name: {name}")
        print(f"Columns: {cols}")
        if hasattr(trans, 'named_steps'): # It's a pipeline
            print("Steps:", trans.named_steps.keys())
            if 'onehot' in trans.named_steps:
                print("Categories:", trans.named_steps['onehot'].categories_)
        elif hasattr(trans, 'categories_'):
            print("Categories:", trans.categories_)

# Try a dummy prediction with empty strings/zeros to see the exact error
try:
    cols = getattr(m, 'feature_names_in_', [])
    dummy = pd.DataFrame(columns=cols)
    dummy.loc[0] = [''] * len(cols)
    m.predict(dummy)
except Exception as e:
    print(f"\nDummy Predict Error (strings): {e}")

try:
    cols = getattr(m, 'feature_names_in_', [])
    dummy = pd.DataFrame(columns=cols)
    dummy.loc[0] = [0] * len(cols)
    m.predict(dummy)
except Exception as e:
    print(f"\nDummy Predict Error (ints): {e}")
