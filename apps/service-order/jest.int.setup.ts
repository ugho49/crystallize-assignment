import { dirname, join } from 'node:path';
import { AbstractStartedContainer, Wait } from 'testcontainers';

import * as dotenv from 'dotenv';
import { DockerComposeEnvironment } from 'testcontainers';

const setup = async () => {
  const rootFolder = dirname(dirname(process.cwd()));
  const dockerFolder = join(rootFolder, 'docker');

  console.log('Setting up integration tests with Docker');

  const environment = await new DockerComposeEnvironment(rootFolder, [
    join(dockerFolder, 'docker-compose.yml'),
    join(dockerFolder, 'docker-compose.test.yml'),
  ])
    .withWaitStrategy('localstack-1', Wait.forHealthCheck())
    .up();

  // // Wait for the containers to be ready
  // console.log('Wait for containers to be ready...');
  // await new Promise((resolve) => setTimeout(resolve, 10_000));
  console.log('Ready!');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const containers = environment.startedGenericContainers as Record<
    string,
    AbstractStartedContainer
  >;

  for (const container of Object.values(containers)) {
    const containerName = container.getName().split('-')[0].toUpperCase();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const boundedPorts = container.boundPorts as { ports: Map<number, number> };
    for (const [internal, external] of boundedPorts.ports) {
      const variable = `DOCKER_${containerName}_PORT_${internal}`;
      process.env[variable] = external.toString();
      console.log(`export ${variable}=${external}`);
    }

    const configOutput = dotenv.config({ path: './.env.test:int' });

    const envVariableRegex = /\$\{(\w+)\}/g;
    for (const [key, value] of Object.entries(configOutput.parsed ?? {})) {
      if (envVariableRegex.test(value)) {
        // Replace all occurrences of ${VAR_NAME} by their value
        process.env[key] = value.replace(
          envVariableRegex,
          (_, v) => process.env[v] || ''
        );
      }
    }

    // Add environment to global in order to use it in teardown
    global.environment = environment;
  }
};

export default setup;
