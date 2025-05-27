import './App.css'
import { Landing } from './pages'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Footer } from './components'

function App() {


  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />}/>
        </Routes>
        <Footer />
      </BrowserRouter>
  )
}

export default App

