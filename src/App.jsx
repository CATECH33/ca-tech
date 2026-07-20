import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import Loic from './pages/Loic.jsx'
import CollaborateursIA from './pages/CollaborateursIA.jsx'
import Automatisations from './pages/Automatisations.jsx'
import Realisations from './pages/Realisations.jsx'
import Blog from './pages/Blog.jsx'
import Contact from './pages/Contact.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                 element={<Home />} />
        <Route path="/services"         element={<Services />} />
        <Route path="/loic"             element={<Loic />} />
        <Route path="/collaborateurs-ia" element={<CollaborateursIA />} />
        <Route path="/automatisations"  element={<Automatisations />} />
        <Route path="/realisations"     element={<Realisations />} />
        <Route path="/blog"             element={<Blog />} />
        <Route path="/contact"          element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}
