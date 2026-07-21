import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import Loic from './pages/Loic.jsx'
import CollaborateursIA from './pages/CollaborateursIA.jsx'
import Automatisations from './pages/Automatisations.jsx'
import Realisations from './pages/Realisations.jsx'
import Blog from './pages/Blog.jsx'
import Contact from './pages/Contact.jsx'

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"                  element={<Home />} />
          <Route path="/services"          element={<Services />} />
          <Route path="/loic"              element={<Loic />} />
          <Route path="/collaborateurs-ia" element={<CollaborateursIA />} />
          <Route path="/automatisations"   element={<Automatisations />} />
          <Route path="/realisations"      element={<Realisations />} />
          <Route path="/blog"              element={<Blog />} />
          <Route path="/contact"           element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
