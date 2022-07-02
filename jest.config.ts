import type { Config } from '@jest/types';

/**
 * https://zenn.dev/sprout2000/articles/182d3294fe4645
 */
const config: Config.InitialOptions = {
  roots: ['src'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};

export default config;
