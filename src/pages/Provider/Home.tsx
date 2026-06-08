import React, { useState } from 'react';
import Navbar from '../../components/Provider/Navbar';
import TopBar from '../../components/Provider/TopBar';
import Footer from '../../components/Provider/Footer';

const Home: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('homep');
  const [userName] = useState('');

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-dark-bg transition-colors duration-200">
      {isSidebarOpen && <div className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40" onClick={()=>setIsSidebarOpen(false)}/>}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-surface transform transition-transform duration-300 z-50 ${isSidebarOpen?'translate-x-0':'-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s=>{setActiveSection(s);setIsSidebarOpen(false);}}/>
      </div>

      <main className={`min-h-screen transition-all duration-300 lg:${isSidebarOpen?'ml-64':'ml-0'}`}>
        <TopBar userName={userName} onMenuToggle={()=>setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen}/>

        

        <Footer/>
      </main>
    </div>
  );
};
export default Home;