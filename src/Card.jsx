import { useState } from 'react';

const Card = ({ title, description, form_fields, modelEndpoint }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    form_fields.forEach(field => {
      const fieldId = field.name.toLowerCase().replace(/\s+/g, '_');
      if (!formData[fieldId] && formData[fieldId] !== 0) {
        newErrors[fieldId] = 'This field is required';
      }
      if (field.type === 'number' && isNaN(formData[fieldId])) {
        newErrors[fieldId] = 'Must be a valid number';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const processedData = {};
    form_fields.forEach(field => {
      const fieldId = field.name.toLowerCase().replace(/\s+/g, '_');
      processedData[fieldId] = field.type === 'number' ?
        parseFloat(formData[fieldId]) :
        formData[fieldId];
    });
    return processedData;
  };

  const handleSubmit = async (e, testMode = false) => {
    e.preventDefault();
    if (!testMode && !validateForm()) return;

    setIsLoading(true);
    setPrediction(null);

    try {
      const payload = buildPayload();
      if (testMode) payload._test = true;

      const response = await fetch(`http://localhost:5000/predict/${modelEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Server response was not ok');

      const result = await response.json();
      if (result.error) {
        setPrediction(`Error: ${result.error}`);
      } else {
        setPrediction(result.result);
      }
    } catch (error) {
      console.error('Error making prediction:', error);
      setPrediction('Error: Could not make prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setPrediction(null);
    try {
      const response = await fetch(`http://localhost:5000/predict/${modelEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _test: true }),
      });
      if (!response.ok) throw new Error('Server response was not ok');
      const result = await response.json();
      if (result.error) setPrediction(`Error: ${result.error}`);
      else setPrediction(result.result);
    } catch (err) {
      setPrediction('Error: Could not make prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = (field) => {
    const fieldId = field.name.toLowerCase().replace(/\s+/g, '_');

    if (field.type === 'select' && field.options) {
      return (
        <div className="form-group" key={fieldId}>
          <label htmlFor={fieldId}>{field.name}</label>
          <select 
            id={fieldId} 
            name={fieldId}
            onChange={handleInputChange}
            value={formData[fieldId] || ''}
            className={errors[fieldId] ? 'error' : ''}
          >
            <option value="">Select {field.name}</option>
            {field.options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors[fieldId] && <span className="error-message">{errors[fieldId]}</span>}
        </div>
      );
    }

    return (
      <div className="form-group" key={fieldId}>
        <label htmlFor={fieldId}>{field.name}</label>
        <input
          type={field.type || 'text'}
          id={fieldId}
          name={fieldId}
          placeholder={`Enter ${field.name.toLowerCase()}`}
          step={field.type === 'number' && field.step ? field.step : undefined}
          onChange={handleInputChange}
          value={formData[fieldId] || ''}
          className={errors[fieldId] ? 'error' : ''}
        />
        {errors[fieldId] && <span className="error-message">{errors[fieldId]}</span>}
      </div>
    );
  };

  return (
    <div className={`test-card ${isExpanded ? 'expanded' : ''}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      <button 
        className="test-button"
        onClick={() => {
          if (isExpanded) {
            // Reset all states when closing
            setFormData({});
            setPrediction(null);
            setErrors({});
            setIsLoading(false);
          }
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? 'Close' : 'Test'}
      </button>
      
      {isExpanded && (
        <div className="card-form">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            {form_fields.map(field => renderFormField(field))}
            <button
              type="button"
              className="submit-button"
              onClick={handleTestConnection}
              disabled={isLoading}
              title="Verify backend connection (no Gemini call)"
            >
              {isLoading ? 'Processing...' : 'Test connection'}
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Submit'}
            </button>
          </form>
          {prediction && (
            <div className={`prediction-result ${prediction.includes('Error') ? 'error' : ''}`}>
              <h4>Prediction Result:</h4>
              <p>{prediction}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Card; 