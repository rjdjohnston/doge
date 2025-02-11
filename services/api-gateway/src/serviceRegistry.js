const axios = require('axios');
const config = require('./config');

class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthChecks = new Map();
  }

  register(name, url) {
    this.services.set(name, {
      url,
      status: 'unknown',
      lastCheck: null
    });
    this.startHealthCheck(name);
  }

  async checkHealth(name) {
    const service = this.services.get(name);
    if (!service) return false;

    try {
      const response = await axios.get(`${service.url}${config.healthCheck.path}`, {
        timeout: config.healthCheck.timeout
      });
      
      service.status = response.status === 200 ? 'healthy' : 'unhealthy';
      service.lastCheck = new Date();
      return service.status === 'healthy';
    } catch (error) {
      service.status = 'unhealthy';
      service.lastCheck = new Date();
      console.error(`Health check failed for ${name}:`, error.message);
      return false;
    }
  }

  startHealthCheck(name) {
    if (this.healthChecks.has(name)) {
      clearInterval(this.healthChecks.get(name));
    }

    const interval = setInterval(
      () => this.checkHealth(name),
      config.healthCheck.interval
    );
    
    this.healthChecks.set(name, interval);
  }

  getService(name) {
    const service = this.services.get(name);
    if (!service || service.status !== 'healthy') {
      return null;
    }
    return service.url;
  }

  getAllServices() {
    return Array.from(this.services.entries()).map(([name, service]) => ({
      name,
      url: service.url,
      status: service.status,
      lastCheck: service.lastCheck
    }));
  }
}

module.exports = new ServiceRegistry(); 