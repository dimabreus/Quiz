import './App.sass'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './components/Register/Register'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
