/********************************************************
 * useAuthCheck Hook
 * Custom hook for authentication and authorization
 ********************************************************/
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Custom hook to check if user is authenticated and has appropriate role
 * Redirects to login page if not authenticated
 * Redirects admin to admin dashboard if trying to access user routes
 * Redirects regular users to home if trying to access admin routes
 */
const useAuthCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verify user authentication status
    const checkAuthentication = async () => {
      try {
        // Request auth status from backend
        const response = await fetch("http://localhost:3000/auth/status", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();

          // Redirect if not authenticated
          if (!data.isAuthenticated) {
            navigate("/");
            return;
          }

          // Determine current route type
          const isAdminRoute = location.pathname.startsWith("/admin");
          const isUserRoute = ["/home", "/game", "/cart", "/orders"].some(
            (route) => location.pathname.startsWith(route),
          );

          // Role-based redirects
          if (data.user.role === "admin" && isUserRoute) {
            navigate("/admin");
            return;
          }

          if (data.user.role !== "admin" && isAdminRoute) {
            navigate("/home");
            return;
          }

          // Update local storage
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          // Handle invalid response
          localStorage.removeItem("user");
          navigate("/");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        // Handle network errors gracefully
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (!storedUser || !storedUser.id) {
          navigate("/");
        }
      }
    };

    checkAuthentication();
  }, [navigate, location.pathname]);
};

export default useAuthCheck;
