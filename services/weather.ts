import * as Location from "expo-location";

export type WeatherData = {
  temperature: number;
  weatherCode: number;
  city: string;
};

// Mapira Open-Meteo "weather code" u kratak opis na srpskom
function describeWeatherCode(code: number): string {
  if (code === 0) return "Vedro";
  if ([1, 2, 3].includes(code)) return "Delimično oblačno";
  if ([45, 48].includes(code)) return "Magla";
  if ([51, 53, 55, 56, 57].includes(code)) return "Rosulja";
  if ([61, 63, 65, 66, 67].includes(code)) return "Kiša";
  if ([71, 73, 75, 77].includes(code)) return "Sneg";
  if ([80, 81, 82].includes(code)) return "Pljuskovi";
  if ([95, 96, 99].includes(code)) return "Grmljavina";
  return "Nepoznato";
}

export { describeWeatherCode };

export async function getCurrentWeather(): Promise<WeatherData> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Dozvola za lokaciju nije odobrena.");
  }

  const location = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = location.coords;

  const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
  const city = geocode[0]?.city ?? geocode[0]?.region ?? "Nepoznata lokacija";

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`,
  );

  if (!response.ok) {
    throw new Error("Greška pri dobavljanju vremenske prognoze.");
  }

  const data = await response.json();

  return {
    temperature: Math.round(data.current.temperature_2m),
    weatherCode: data.current.weather_code,
    city,
  };
}
export function getWeatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "🌧️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

export function getSeasonsForTemperature(temp: number): string[] {
  const seasons: string[] = [];

  if (temp < 10) seasons.push("Zima");
  if (temp >= 5 && temp < 20) seasons.push("Prolece/Jesen");
  if (temp >= 18) seasons.push("Leto");

  return seasons;
}
