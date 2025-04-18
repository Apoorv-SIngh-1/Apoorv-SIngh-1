import { useState, useEffect } from 'react'
import './App.css'
import Card from './Card'

function App() {
  const [theme, setTheme] = useState('light');

  // Sample card data - you can add or remove cards as needed
  const testCards = [
    
    {
      title: "Heart Disease Prediction",
      description: "Check your heart health with our predictive model",
      modelEndpoint: "heart",
      form_fields: [
        { name: "Age", type: "number" },
        { name: "Sex", type: "select", options: [
          { value: "0", label: "Female" },
          { value: "1", label: "Male" }
        ]},
        { name: "ChestPainType", type: "select", options: [
          { value: "1", label: "Typical angina" },
          { value: "2", label: "Atypical angina" },
          { value: "3", label: "Non-anginal pain" },
          { value: "4", label: "Asymptomatic" }
        ]},
        { name: "RestingBP", type: "number" },
        { name: "Cholesterol", type: "number" },
        { name: "FastingBS", type: "select", options: [
          { value: "0", label: "No" },
          { value: "1", label: "Yes" }
        ]},
        { name: "RestingECG", type: "select", options: [
          { value: "0", label: "Normal" },
          { value: "1", label: "ST-T wave abnormality" },
          { value: "2", label: "Left ventricular hypertrophy" }
        ]},
        { name: "MaxHR", type: "number" },
        { name: "ExerciseAngina", type: "select", options: [
          { value: "0", label: "No" },
          { value: "1", label: "Yes" }
        ]},
        { name: "Oldpeak", type: "number", step: "0.1" }
      ]
    },
    {
      title: "Diabetes Prediction",
      description: "Predict the likelihood of diabetes based on medical indicators",
      modelEndpoint: "diabetes",
      form_fields: [
        { name: "gender", type: "select", options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" }
        ]},
        { name: "age", type: "number" },
        { name: "hypertension", type: "select", options: [
          { value: "0", label: "No" },
          { value: "1", label: "Yes" }
        ]},
        { name: "heartdisease", type: "select", options: [
          { value: "0", label: "No" },
          { value: "1", label: "Yes" }
        ]},
        { name: "smokinghistory", type: "select", options: [
          { value: "never", label: "Never" },
          { value: "current", label: "Current" },
          { value: "former", label: "Former" },
          { value: "occasional", label: "Occasional" }
        ]},
        { name: "bmi", type: "number", step: "0.1" },
        { name: "hba1c_level", type: "number", step: "0.1" },
        { name: "bloodglucoselevel", type: "number" }
      ]
    },
    {
      title: "Obesity Prediction",
      description: "Check your obesity level with our predictive model",
      modelEndpoint: "obesity",
      form_fields: [
        { name: "gender", type: "select", options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" }
        ]},
        { name: "age", type: "number" },
        { name: "height", type: "number", step: "0.01" },
        { name: "weight", type: "number", step: "0.1" },
        { name: "family_history_with_overweight", type: "select", options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" }
        ]},
        { name: "frequent_caloric_food", type: "select", options: [
          { value: "yes", label: "Frequent consumption of high caloric food" },
          { value: "no", label: "Normal consumption" }
        ]},
        { name: "vegetable_consumption", type: "select", options: [
          { value: "0", label: "Never" },
          { value: "1", label: "Sometimes" },
          { value: "2", label: "Always" }
        ]},
        { name: "daily_meals", type: "select", options: [
          { value: "0", label: "1-2 meals" },
          { value: "1", label: "3 meals" },
          { value: "2", label: "More than 3 meals" }
        ]},
        { name: "eating_between_meals", type: "select", options: [
          { value: "0", label: "No" },
          { value: "1", label: "Sometimes" },
          { value: "2", label: "Frequently" },
          { value: "3", label: "Always" }
        ]},
        { name: "smoking", type: "select", options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" }
        ]},
        { name: "daily_water_consumption", type: "select", options: [
          { value: "0", label: "Less than 1L" },
          { value: "1", label: "1-2L" },
          { value: "2", label: "More than 2L" }
        ]},
        { name: "calorie_monitoring", type: "select", options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" }
        ]},
        { name: "physical_activity_frequency", type: "select", options: [
          { value: "0", label: "No physical activity" },
          { value: "1", label: "1-2 days" },
          { value: "2", label: "2-4 days" },
          { value: "3", label: "4-5 days" }
        ]},
        { name: "technology_use_time", type: "select", options: [
          { value: "0", label: "0-2 hours" },
          { value: "1", label: "3-5 hours" },
          { value: "2", label: "More than 5 hours" }
        ]},
        { name: "alcohol_consumption", type: "select", options: [
          { value: "0", label: "No" },
          { value: "1", label: "Sometimes" },
          { value: "2", label: "Frequently" },
          { value: "3", label: "Always" }
        ]},
        { name: "transportation_mode", type: "select", options: [
          { value: "automobile", label: "Automobile" },
          { value: "bike", label: "Bike" },
          { value: "motorbike", label: "Motorbike" },
          { value: "public_transportation", label: "Public Transportation" },
          { value: "walking", label: "Walking" }
        ]}
      ]
    }
    
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app">
      {/* Hero Section */}
      <header className="hero">
        <nav className="navbar">
          <div>
            <div className="logo">Minor Project</div>
            <div className="nav-links">
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </nav>
        <div className="hero-content">
          <h1>Welcome to our Project</h1>
          <p>Healthcare prediction using Machine Learning </p>
          <button className="cta-button">Get Started</button>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="content-container">
          <h2>What is this project about?</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">1</div>
              <h3>Enhancing healthcare</h3>
              <p>Making healthcare better and efficient using Machine Learning.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">2</div>
              <h3>More accessibility</h3>
              <p>Making healthcare more accessible through the internet.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">3</div>
              <h3>All in one place</h3>
              <p>This project brings different models trained over various datasets for enhanced accuracy in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Test Cards Section */}
      <section className="test-cards-section">
        <div className="content-container">
          <h2>Available Tests</h2>
          <div className="test-cards-grid">
            {testCards.map((card, index) => (
              <Card 
                key={index}
                title={card.title}
                description={card.description}
                form_fields={card.form_fields}
                modelEndpoint={card.modelEndpoint}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="content-container">
          <h2>About Us</h2>
          <p>This project was prepared by Apoorv Singh and Akshay Mandhana, we're passionate engineering students of Manipal university Jaipur.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="content-container">
          <h2>Get In Touch</h2>
          <div className="contact-content">
            <button className="contact-button">Contact Us</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="content-container">
          <p>&copy; 2025 Minor Project.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
