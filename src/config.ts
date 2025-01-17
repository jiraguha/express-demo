import * as process from 'process';

interface Config {
  mongodb: {
    host: string;
    port: number;
  }
}

function isRunningInDocker(): boolean {
  try {
    return require('fs').existsSync('/.dockerenv');
  } catch {
    return false;
  }
}

const defaultHost = isRunningInDocker() ? 'host.docker.internal' : 'localhost';

export const config: Config = {
  mongodb: {
    host: process.env.MONGODB_HOST || defaultHost,
    port: parseInt(process.env.MONGODB_PORT || '27017', 10)
  }
};
