module.exports = {
  apps: [
    {
      name: 'crm-backend',
      script: 'dist/index.js',
      cwd: './apps/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'crm-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './apps/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
