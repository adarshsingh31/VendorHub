// PM2 Ecosystem Configuration
// Usage:
//   Development:  pm2 start ecosystem.config.cjs --env development
//   Production:   pm2 start ecosystem.config.cjs --env production
//
// Commands:
//   pm2 start ecosystem.config.cjs   - Start the app
//   pm2 logs vendorhub-api           - View logs
//   pm2 reload vendorhub-api         - Zero-downtime reload
//   pm2 monit                        - Live monitoring dashboard

module.exports = {
  apps: [
    {
      name: "vendorhub-api",
      script: "src/server.js",
      interpreter: "node",
      interpreter_args: "--experimental-specifier-resolution=node",
      instances: "max",  // Cluster mode: one instance per CPU core
      exec_mode: "cluster",
      watch: false,     // Never watch in production
      max_memory_restart: "500M",
      exp_backoff_restart_delay: 100,

      // Log files
      out_file: "logs/out.log",
      error_file: "logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,

      // Development environment
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },

      // Production environment
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
