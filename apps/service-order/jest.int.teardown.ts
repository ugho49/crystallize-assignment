import type { StartedDockerComposeEnvironment } from 'testcontainers';

const teardown = async () => {
  console.log('Stopping Docker...');

  const environment = global.environment as StartedDockerComposeEnvironment;

  await environment.down();
  await environment.stop();

  console.log('Docker stopped');
};

export default teardown;
