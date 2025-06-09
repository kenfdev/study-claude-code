import { afterEach } from 'vitest';
import { closeDatabase } from '../functions/lib/database';

afterEach(async () => {
  await closeDatabase();
});