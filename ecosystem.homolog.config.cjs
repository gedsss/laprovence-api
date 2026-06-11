module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || 'laprovence-api-homolog',
      script: 'npm',
      args: 'run start',
      cwd: process.cwd(),
      env: {
        NODE_ENV: 'production',
        DOTENV_CONFIG_PATH: '.env.homologacao',
        HOST: '127.0.0.1',
        PORT: process.env.PORT || '3669',
        TRUST_PROXY: process.env.TRUST_PROXY || '1',
      },
      max_memory_restart: '512M',
    },
  ],
}
