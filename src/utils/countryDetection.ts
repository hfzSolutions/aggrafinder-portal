// Utility functions for country detection

interface CountryDetectionResponse {
  country: string;
  countryCode: string;
  ip: string;
}

// Function to detect user's country based on IP geolocation
export const detectUserCountry = async (): Promise<string> => {
  try {
    // Check if we're running on localhost/development
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '::1' ||
      window.location.hostname.includes('localhost');

    if (isLocalhost) {
      return detectCountryFromTimezone();
    }

    // Try multiple geolocation services as fallback
    const services = [
      {
        url: 'https://ipapi.co/json/',
        parseResponse: (data: any) => data.country_name,
      },
      {
        url: 'https://ipinfo.io/json',
        parseResponse: (data: any) => data.country,
      },
      {
        url: 'https://api.ipify.org?format=json',
        parseResponse: async (data: any) => {
          // This service only gives IP, we need another call
          const response = await fetch(`https://ipapi.co/${data.ip}/json/`);
          const locationData = await response.json();
          return locationData.country_name;
        },
      },
    ];

    for (const service of services) {
      try {
        const response = await fetch(service.url);
        if (!response.ok) continue;

        const data = await response.json();

        const country = await service.parseResponse(data);

        if (country) {
          // Just return the detected country as-is

          return country.trim() || 'Global';
        }
      } catch (error) {
        console.warn(
          'Failed to detect country from service:',
          service.url,
          error
        );
        continue;
      }
    }

    // If all services fail, return 'Global' as default
    return 'Global';
  } catch (error) {
    console.error('Error detecting user country:', error);
    return 'Global';
  }
};

// Function to detect country from user's timezone (fallback method)
export const detectCountryFromTimezone = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const timezoneToCountryMap: Record<string, string> = {
      'America/New_York': 'United States',
      'America/Chicago': 'United States',
      'America/Denver': 'United States',
      'America/Los_Angeles': 'United States',
      'America/Phoenix': 'United States',
      'America/Detroit': 'United States',
      'America/Toronto': 'Canada',
      'America/Vancouver': 'Canada',
      'America/Montreal': 'Canada',
      'Europe/London': 'United Kingdom',
      'Europe/Berlin': 'Germany',
      'Europe/Paris': 'France',
      'Europe/Amsterdam': 'Netherlands',
      'Europe/Stockholm': 'Sweden',
      'Europe/Zurich': 'Switzerland',
      'Asia/Kolkata': 'India',
      'Asia/Mumbai': 'India',
      'Asia/Shanghai': 'China',
      'Asia/Beijing': 'China',
      'Asia/Tokyo': 'Japan',
      'Asia/Seoul': 'South Korea',
      'Asia/Singapore': 'Singapore',
      'Australia/Sydney': 'Australia',
      'Australia/Melbourne': 'Australia',
      'Australia/Brisbane': 'Australia',
      'Australia/Perth': 'Australia',
      'America/Sao_Paulo': 'Brazil',
    };

    if (timezoneToCountryMap[timezone]) {
      const detectedCountry = timezoneToCountryMap[timezone];

      return detectedCountry;
    }

    // Try to extract basic info from timezone for unmapped timezones
    const parts = timezone.split('/');
    if (parts.length >= 2) {
      const continent = parts[0];

      // Very basic continent-based fallback - just return the continent region
      switch (continent) {
        case 'America':
          return 'United States'; // Default for America/* timezones
        case 'Europe':
          return 'Global'; // Too many countries in Europe to guess
        case 'Asia':
          return 'Global'; // Too many countries in Asia to guess
        case 'Australia':
          return 'Australia';
        case 'Africa':
          return 'Global';
        default:
          return 'Global';
      }
    }

    return 'Global';
  } catch (error) {
    console.error('Error detecting country from timezone:', error);
    return 'Global';
  }
};

// Combined function that tries IP geolocation first, then falls back to timezone
export const detectUserCountryWithFallback = async (): Promise<string> => {
  try {
    // First try IP-based detection
    const ipCountry = await detectUserCountry();

    // If IP detection succeeded and didn't return 'Global', use it
    if (ipCountry && ipCountry !== 'Global') {
      return ipCountry;
    }

    // Fallback to timezone-based detection
    return detectCountryFromTimezone();
  } catch (error) {
    console.error('Error in country detection with fallback:', error);
    return 'Global';
  }
};
