type RequiredEnv = 'DATABASE_URL' | 'JWT_SECRET';

function getEnv(name: RequiredEnv): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get DATABASE_URL() {
    return getEnv('DATABASE_URL');
  },
  get JWT_SECRET() {
    return getEnv('JWT_SECRET');
  },
};
