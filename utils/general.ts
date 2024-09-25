export const validateEmail = (email: string) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const formatDate = (
  input: number | string,
  options: { withTime: boolean } = { withTime: true },
): string => {
  if (!input) return '-';

  const date = new Date(input);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York', // Adjust timezone as needed
  };

  if (options.withTime) {
    formatOptions.hour = 'numeric';
    formatOptions.minute = 'numeric';
    formatOptions.hour12 = true;
  }

  return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
};

export const formatSeconds = (durationInSeconds: number | undefined) => {
  if (!durationInSeconds) return `0 m, 0 s`;
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  return `${minutes} m, ${seconds} s`;
};

export function normalizeTimestamp(
  input:
    | number
    | {
        seconds: number;
        nanoseconds: number;
      },
): number {
  if (typeof input === 'number') {
    // Input is already a Unix timestamp in milliseconds
    return input;
  } else {
    // Input is a Timestamp object
    const { seconds, nanoseconds } = input;
    const milliseconds = seconds * 1000 + Math.floor(nanoseconds / 1000000);
    return milliseconds;
  }
}

function stringifyError(error: unknown) {
  const cache = new Set();
  return JSON.stringify(error, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        // Duplicate reference found, discard key
        return;
      }
      // Store value in our set
      cache.add(value);
    }
    return value;
  });
}

export const parseErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return stringifyError(error);
};

export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getInitials = (firstName: string, lastName: string) => {
  if (!firstName && !lastName) return '?';
  if (!firstName) return lastName?.charAt(0).toUpperCase();
  if (!lastName) return firstName?.charAt(0).toUpperCase();
  return `${firstName?.charAt(0).toUpperCase()}${lastName?.charAt(0).toUpperCase()}`;
};

export const getFullName = (firstName: string, lastName: string) => {
  if (!firstName && !lastName) return 'Anonymous User';
  if (!firstName) return lastName;
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
};
