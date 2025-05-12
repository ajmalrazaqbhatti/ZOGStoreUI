import { Link } from "react-router-dom";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import logo from "../assets/logo.svg";
import overlay from "../assets/overlay.png";

function NotFoundPage() {
  return (
    <div
      className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: `url(${overlay})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[40px] p-8 max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <img
            src={logo}
            alt="ZOG Store Logo"
            className="h-16 mb-6 drop-shadow-[0_0_10px_rgba(167,139,250,0.3)]"
          />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/home"
            className="bg-[#7C5DF9] hover:bg-[#6A4FF0] transition-all py-3 px-5 rounded-xl text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
