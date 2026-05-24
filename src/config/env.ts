import * as dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '' || value.includes('_here')) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Copy .env.example to .env and fill in real values.`,
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== '' ? value : fallback;
}

/**
 * Typed, validated access to environment configuration.
 * Credentials are read lazily so non-credentialed commands (e.g. typecheck) don't throw.
 */
export const env = {
  get username(): string {
    return required('LT_USERNAME');
  },
  get email(): string {
    return required('LT_EMAIL');
  },
  get password(): string {
    return required('LT_PASSWORD');
  },
  get accessKey(): string {
    return required('LT_ACCESS_KEY');
  },
  get baseUrl(): string {
    return optional('LT_BASE_URL', 'https://test-manager.lambdatest.com');
  },
  get apiBaseUrl(): string {
    return optional('LT_API_BASE_URL', 'https://test-manager-api.lambdatest.com/api/v1');
  },
  /** Basic Auth header value for the LambdaTest API (username:accessKey). */
  get basicAuthHeader(): string {
    const token = Buffer.from(`${this.username}:${this.accessKey}`).toString('base64');
    return `Basic ${token}`;
  },
};
