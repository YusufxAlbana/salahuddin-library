module.exports = {
  apps: [
    {
      name: 'salahuddin-library-backend',
      script: './server.js',
      instances: 'max', // Use all CPU cores available (Cluster mode)
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      }
    }
  ]
};
