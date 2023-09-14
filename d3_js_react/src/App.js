import React from 'react';
import './App.css';
import D3Chart from './components/d3';
import { select } from "d3"; 

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>d3.js</h1>
      </header>
      <main>
        <D3Chart /> 
      </main>
    </div>
  );
}

export default App;
