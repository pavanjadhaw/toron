export const __prod__ = process.env.NODE_ENV === 'production';
export const __host__ = process.env.POSTGRES_HOST || 'localhost';
