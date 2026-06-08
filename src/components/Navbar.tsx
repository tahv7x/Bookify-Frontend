import React from "react";
import logo from "../assets/LogoB.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm px-8 py-0 h-20" >
      <div className="max-w-8xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              className="
                  h-16 w-auto
                  cursor-pointer
                  -translate-y-[-8px]
                  transition-transform duration-300
                  hover:scale-105
                  active:scale-95
                "
            />
          </Link>
        </div>
        <button onClick={() => navigate("/login")}
        className="relative overflow-hidden
                          bg-[#0059B2]
                          text-white
                          px-6 py-2.5
                          rounded-xl
                          font-semibold
                          tracking-wide
                          shadow-md
                          -translate-y-[-8px]
                          transition-all duration-100 ease-out
                          hover:shadow-xl
                          hover:bg-[#004a96]
                          active:scale-95
                          ">
          Se connecter
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
