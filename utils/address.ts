/* eslint-disable no-console */
// Address parsing utilities

export interface ParsedAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * Parse Google Places API address_components into structured address
 * This is more reliable than parsing formatted_address
 */
export const parseAddressComponents = (
  addressComponents: GoogleAddressComponent[]
): ParsedAddress | null => {
  try {
    let streetNumber = '';
    let route = '';
    let city = '';
    let state = '';
    let zip = '';

    for (const component of addressComponents) {
      const { long_name, short_name, types } = component;

      if (types.includes('street_number')) {
        streetNumber = long_name;
      } else if (types.includes('route')) {
        route = long_name;
      } else if (types.includes('locality')) {
        city = long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = short_name; // Use short_name for state abbreviation (e.g., "CA")
      } else if (types.includes('postal_code')) {
        zip = long_name;
      }
    }

    // Combine street number and route into full street address
    const street =
      streetNumber && route
        ? `${streetNumber} ${route}`
        : route || streetNumber || '';

    return {
      street: street || '',
      city: city || '',
      state: state || '',
      zip: zip || '',
    };
  } catch (error) {
    console.error('Error parsing address components:', error);

    return null;
  }
};

/**
 * Parse Google Places API formatted address into components
 * Handles various address formats robustly
 */
export const parseAddress = (
  formattedAddress: string
): ParsedAddress | null => {
  try {
    const parts = formattedAddress.split(', ').map((part) => part.trim());

    if (parts.length < 2) {
      console.warn('Address format unexpected:', formattedAddress);

      return null;
    }

    // Street address is typically the first part
    const street = parts[0];

    // Last part usually contains state and zip (e.g., "CA 90210" or "California 90210")
    const lastPart = parts[parts.length - 1];
    const stateZipMatch = lastPart.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);

    let state = '';
    let zip = '';

    if (stateZipMatch) {
      // Format: "CA 90210"
      state = stateZipMatch[1].toUpperCase();
      zip = stateZipMatch[2];
    } else {
      // Try to split by space - last two parts might be state and zip
      const lastPartWords = lastPart.split(/\s+/);

      if (lastPartWords.length >= 2) {
        // Assume last word is zip, second to last is state
        zip = lastPartWords[lastPartWords.length - 1];
        state = lastPartWords.slice(0, -1).join(' ').toUpperCase();
      } else {
        // Fallback: try to extract zip code
        const zipMatch = lastPart.match(/\d{5}(?:-\d{4})?/);

        if (zipMatch) {
          zip = zipMatch[0];
          state = lastPart.replace(zip, '').trim().toUpperCase();
        }
      }
    }

    // City is typically the second-to-last part, or second part if only 2 parts
    let city = '';

    if (parts.length === 2) {
      // Format: "Street, City State Zip"
      city = parts[1].replace(/\s+\w{2}\s+\d{5}.*$/, '').trim();
    } else {
      // Format: "Street, City, State Zip"
      city = parts[parts.length - 2] || parts[1] || '';
    }

    // Clean up city (remove state/zip if accidentally included)
    city = city.replace(/\s+\w{2}\s+\d{5}.*$/, '').trim();

    return {
      street: street || '',
      city: city || '',
      state: state || '',
      zip: zip || '',
    };
  } catch (error) {
    console.error('Error parsing address:', error, formattedAddress);

    return null;
  }
};
