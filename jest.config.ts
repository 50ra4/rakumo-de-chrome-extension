import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['src'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};

export default config;
