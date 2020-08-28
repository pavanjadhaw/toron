declare namespace NodeJS {
  export interface ProcessEnv {
    REDIS_HOST: string;
    POSTGRES_HOST: string;
    SESSION_SECRET: string;
  }
}
