import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import './App.css'
import Card from './Card'
import Login from './Login'

function App() {
  const [theme, setTheme] = useState('light');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: 'Hello! I am your local healthcare assistant. How can I help you today?' }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Sample card data - you can add or remove cards as needed
  const testCards = [

    {
      title: "Heart Disease Prediction",
      description: "Check your heart health with our predictive model",
      modelEndpoint: "heart",
      form_fields: [
        { name: "Age", type: "number" },
        {
          name: "Sex", type: "select", options: [
            { value: "0", label: "Female" },
            { value: "1", label: "Male" }
          ]
        },
        {
          name: "ChestPainType", type: "select", options: [
            { value: "1", label: "Typical angina" },
            { value: "2", label: "Atypical angina" },
            { value: "3", label: "Non-anginal pain" },
            { value: "4", label: "Asymptomatic" }
          ]
        },
        { name: "RestingBP", type: "number" },
        { name: "Cholesterol", type: "number" },
        {
          name: "FastingBS", type: "select", options: [
            { value: "0", label: "No" },
            { value: "1", label: "Yes" }
          ]
        },
        {
          name: "RestingECG", type: "select", options: [
            { value: "0", label: "Normal" },
            { value: "1", label: "ST-T wave abnormality" },
            { value: "2", label: "Left ventricular hypertrophy" }
          ]
        },
        { name: "MaxHR", type: "number" },
        {
          name: "ExerciseAngina", type: "select", options: [
            { value: "0", label: "No" },
            { value: "1", label: "Yes" }
          ]
        },
        { name: "Oldpeak", type: "number", step: "0.1" }
      ]
    },
    {
      title: "Diabetes Prediction",
      description: "Predict the likelihood of diabetes based on medical indicators",
      modelEndpoint: "diabetes",
      form_fields: [
        {
          name: "gender", type: "select", options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" }
          ]
        },
        { name: "age", type: "number" },
        {
          name: "hypertension", type: "select", options: [
            { value: "0", label: "No" },
            { value: "1", label: "Yes" }
          ]
        },
        {
          name: "heartdisease", type: "select", options: [
            { value: "0", label: "No" },
            { value: "1", label: "Yes" }
          ]
        },
        {
          name: "smokinghistory", type: "select", options: [
            { value: "never", label: "Never" },
            { value: "current", label: "Current" },
            { value: "former", label: "Former" },
            { value: "occasional", label: "Occasional" }
          ]
        },
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
        {
          name: "gender", type: "select", options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" }
          ]
        },
        { name: "age", type: "number" },
        { name: "height", type: "number", step: "0.01" },
        { name: "weight", type: "number", step: "0.1" },
        {
          name: "family_history_with_overweight", type: "select", options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" }
          ]
        },
        {
          name: "frequent_caloric_food", type: "select", options: [
            { value: "yes", label: "Frequent consumption of high caloric food" },
            { value: "no", label: "Normal consumption" }
          ]
        },
        {
          name: "vegetable_consumption", type: "select", options: [
            { value: "0", label: "Never" },
            { value: "1", label: "Sometimes" },
            { value: "2", label: "Always" }
          ]
        },
        {
          name: "daily_meals", type: "select", options: [
            { value: "0", label: "1-2 meals" },
            { value: "1", label: "3 meals" },
            { value: "2", label: "More than 3 meals" }
          ]
        },
        {
          name: "eating_between_meals", type: "select", options: [
            { value: "0", label: "No" },
            { value: "1", label: "Sometimes" },
            { value: "2", label: "Frequently" },
            { value: "3", label: "Always" }
          ]
        },
        {
          name: "smoking", type: "select", options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" }
          ]
        },
        {
          name: "daily_water_consumption", type: "select", options: [
            { value: "0", label: "Less than 1L" },
            { value: "1", label: "1-2L" },
            { value: "2", label: "More than 2L" }
          ]
        },
        {
          name: "calorie_monitoring", type: "select", options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" }
          ]
        },
        {
          name: "physical_activity_frequency", type: "select", options: [
            { value: "0", label: "No physical activity" },
            { value: "1", label: "1-2 days" },
            { value: "2", label: "2-4 days" },
            { value: "3", label: "4-5 days" }
          ]
        },
        {
          name: "technology_use_time", type: "select", options: [
            { value: "0", label: "0-2 hours" },
            { value: "1", label: "3-5 hours" },
            { value: "2", label: "More than 5 hours" }
          ]
        },
        {
          name: "alcohol_consumption", type: "select", options: [
            { value: "0", label: "No" },
            { value: "1", label: "Sometimes" },
            { value: "2", label: "Frequently" },
            { value: "3", label: "Always" }
          ]
        },
        {
          name: "transportation_mode", type: "select", options: [
            { value: "automobile", label: "Automobile" },
            { value: "bike", label: "Bike" },
            { value: "motorbike", label: "Motorbike" },
            { value: "public_transportation", label: "Public Transportation" },
            { value: "walking", label: "Walking" }
          ]
        }
      ]
    }

  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentInput.trim() || isTyping) return;

    const userMsg = currentInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setCurrentInput('');
    setIsTyping(true);

    try {
      // Add a temporary AI typing message
      setChatMessages(prev => [...prev, { role: 'ai', content: '...', isTypingMsg: true }]);

      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3', // User can change this to their specific Ollama model like 'medllama2'
          prompt: "You are a helpful healthcare assistant. " + userMsg,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to local LLM. Is Ollama running?');
      }

      const data = await response.json();
      
      // Replace the typing message with the actual response
      setChatMessages(prev => {
        const newMsgs = [...prev];
        newMsgs.pop(); // remove typing indicator
        newMsgs.push({ role: 'ai', content: data.response });
        return newMsgs;
      });

    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => {
        const newMsgs = [...prev];
        newMsgs.pop();
        newMsgs.push({ role: 'ai', content: `Error: ${error.message}. Please ensure Ollama is running locally.` });
        return newMsgs;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app">
      {/* Navbar will show on all pages */}
      <nav className="navbar">
        <div>
          <div className="logo"><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Major Project</Link></div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {user ? (
              <div className="user-menu">
                <span className="user-greeting">Hi, {user.name.split(' ')[0]}</span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <Link to="/login" className="login-icon" title="Login / Signup">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <>
            {/* Hero Section */}
            <header className="hero">
              <div className="hero-content">
                <h1>Welcome to My Project</h1>
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

            {/* Chat Assistant Section */}
            <section id="assistant" className="chat-section">
              <div className="content-container">
                <h2>Healthcare Assistant</h2>
                <div className="chat-container">
                  <div className="chat-messages">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`chat-message ${msg.role}`}>
                        {msg.content}
                      </div>
                    ))}
                  </div>
                  <form className="chat-input-area" onSubmit={handleSendMessage}>
                    <input 
                      type="text" 
                      placeholder="Ask a healthcare question..." 
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      disabled={isTyping}
                    />
                    <button type="submit" className="chat-send-btn" disabled={isTyping || !currentInput.trim()}>
                      <svg viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </section>

            {/* About Section */}
            <section id="about" className="about">
              <div className="content-container">
                <h2>About Us</h2>
                <p>This project was prepared by Apoorv Singh, I am a passionate engineering student of Manipal university Jaipur.</p>
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
                <p>&copy; 2026 Major Project.</p>
              </div>
            </footer>
          </>
        } />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  )
}

export default App
