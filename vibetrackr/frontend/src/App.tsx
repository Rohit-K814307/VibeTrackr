import './App.css'
import { Landing, SignIn, SignUp, Overview, InsightsDash } from './pages'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Footer } from './components'
import { ProtectedRoute } from './components'

function App() {


  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<><Landing /> <Footer /></>}/>
          <Route path="/sign-in" element={<SignIn />}/>
          <Route path="/sign-up" element={<SignUp />}/>
          <Route path="/dashboard" element={<ProtectedRoute><Overview /></ProtectedRoute>}/>
          <Route path="/insights" element={<ProtectedRoute><InsightsDash /></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App

