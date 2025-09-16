import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface CountrySelectorWrapperProps {
  children: React.ReactNode;
}

const CountrySelectorWrapper = ({ children }: CountrySelectorWrapperProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const country = searchParams.get("country");

    // If no country is specified, redirect to country selector
    if (!country) {
      navigate("/country-select");
      return;
    }

    // Validate country parameter
    if (country !== "US" && country !== "CA") {
      navigate("/country-select");
      return;
    }
  }, [location, navigate]);

  const searchParams = new URLSearchParams(location.search);
  const country = searchParams.get("country");

  // Only render children if we have a valid country
  if (!country || (country !== "US" && country !== "CA")) {
    return null;
  }

  return <>{children}</>;
};

export default CountrySelectorWrapper;