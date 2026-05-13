import {useState, useEffect} from 'react'
import ReactMarkdown from 'react-markdown';

function App() {
  const [options, setOptions] = useState([])
  const [selectedTicker, setSelectedTicker] = useState('')
  const [prompt, setPrompt] = useState('')
  const [message, setMessage] = useState('')

  const pullTickers = async () => {
  try {
    const response = await fetch('http://localhost:5000/stocks/tickers');
    const data = await response.json();
    if (Array.isArray(data)) {
      setOptions(data);
    } else {
      console.error("Backend sent back an invalid format instead of an array:", data);
      setOptions([]); 
    }
  } catch (error) {
    console.error("Failed to pull tickers:", error);
    setOptions([]);
  }
};

  useEffect(() => {
    pullTickers()
  }, [])

  const promptGemini = async (ticker, history, prompt) => {
    try {
      const response = await fetch('http://localhost:4000/analyze',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
                            "ticker": ticker,
                            'history': history,
                            "prompt": prompt
        })
      })
      return await response.json()
    } catch (error) {
        console.error('error submitting message: ', error)
        throw error
    }
  }

  const handleSubmit = async (e) => {
  e.preventDefault(); 

  if (!selectedTicker) return alert("Please select a ticker first.");
  
  try {
    const response = await fetch('http://localhost:5000/stocks/tickers/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "ticker": selectedTicker })
    });
    const data = await response.json();
    if (data.stockInfo && data.stockInfo.data) {
      const truncatedHistory = data.stockInfo.data.slice(0, 5); 
      const dataString = JSON.stringify(truncatedHistory);
      const aiData = await promptGemini(selectedTicker, dataString, prompt);
      const aiResponseText = aiData.result || JSON.stringify(aiData);
      setMessage(aiResponseText);
      console.log('AI Response:', aiResponseText); 
    }
    
    return data;
  } catch (error) {
      console.error('error submitting ticker: ', error);
      throw error;
  }
};

  return (
    <div className="App" style={{ padding: '20px' }}>
    <label htmlFor="ticker-select">Choose a Stock Ticker: </label>
    
    <form onSubmit={handleSubmit}>
      <input type="text"
              placeholder="what analysis do you want?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required></input>
      <select id="ticker-select"
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}>
        <option value="">-- Select an option --</option>
        {options.map((ticker) => (
          <option key={ticker.value} value={ticker.value}>
            {ticker.label} ({ticker.value})
          </option>
        ))}
      </select>
      <button type="submit">Submit</button>
    </form>
    <ReactMarkdown>{message}</ReactMarkdown>
  </div>
  );
}

export default App;
