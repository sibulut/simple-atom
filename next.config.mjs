import { config } from 'dotenv';
config({ path: '.env.production' }); // Load environment variables from your custom .env file

const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  env: {
    USER_POOL_ID: process.env.USER_POOL_ID,
    USER_POOL_CLIENT_ID: process.env.USER_POOL_CLIENT_ID,
    IDENTITY_POOL_ID: process.env.IDENTITY_POOL_ID,
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
    APP_SECRET_ACCESS_KEY: process.env.APP_SECRET_ACCESS_KEY,
    APP_REGION: process.env.APP_REGION,
    APP_ACCESS_KEY_ID: process.env.APP_ACCESS_KEY_ID,
  },
};

export default nextConfig;