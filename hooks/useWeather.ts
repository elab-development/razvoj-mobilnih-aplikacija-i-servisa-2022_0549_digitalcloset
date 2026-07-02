import { useEffect, useState } from "react";
import { getCurrentWeather, WeatherData } from "../services/weather";

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentWeather()
      .then(setWeather)
      .catch((err) => setError(err.message ?? "Greška pri dobavljanju vremena"))
      .finally(() => setLoading(false));
  }, []);

  return { weather, loading, error };
}
