import { Outlet } from 'react-router-dom'
import Navbar from '../components/navigation/Navbar.jsx'
import Footer from '../components/navigation/Footer.jsx'

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout