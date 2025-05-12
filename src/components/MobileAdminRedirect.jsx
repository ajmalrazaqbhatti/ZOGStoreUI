import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Monitor, LogOut, ExternalLink } from "lucide-react";
import logo from "../assets/logo.svg";
import overlay from "../assets/overlay.png";

function MobileAdminRedirect() {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Check on mount
    checkScreenSize();

    // Check on resize
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isMobile) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0A0A0B] flex flex-col items-center justify-center p-6 text-white"
      style={{
        backgroundImage: `url(${overlay})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <img
            src={logo}
            alt="ZOG Store Logo"
            className="h-16 mb-6 drop-shadow-[0_0_10px_rgba(167,139,250,0.3)]"
          />
        </div>
        <h1 className="text-2xl font-bold mb-3">Desktop View Required</h1>
        <p className="text-gray-400 mb-6">
          The admin interface is optimized for desktop screens. Please switch to
          a desktop device or increase your window size to access these
          features.
        </p>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleLogout}
            className="bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-all py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
          >
            <LogOut size={18} />
            Logout
          </button>
          <a
            href="https://www.whatismybrowser.com/detect/is-this-a-mobile-device"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 text-sm text-[#7C5DF9] hover:text-[#9F7AFF] transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink size={14} />
            What is a desktop device?
          </a>
        </div>
      </div>
    </div>
  );
}

export default MobileAdminRedirect;
