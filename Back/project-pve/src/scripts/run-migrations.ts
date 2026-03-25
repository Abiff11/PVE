import dataSource from '../data-source';

async function runMigrations() {
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}

runMigrations().catch(async (error) => {
  console.error('Error al ejecutar migraciones:', error);

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});
