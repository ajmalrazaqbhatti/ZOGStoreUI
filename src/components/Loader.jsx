/********************************************************
 * Loader Component
 * Shows loading spinner during async operations
 ********************************************************/
import { Loader as LoaderIcon } from "lucide-react";

function Loader({ size = "default" }) {
  // Size variations for the loader
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-6 w-6",
    large: "h-8 w-8",
    default: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="relative">
        <LoaderIcon
          className={`${sizeClasses[size]} text-[#7C5DF9] animate-spin`}
        />
      </div>
    </div>
  );
}

export default Loader;
