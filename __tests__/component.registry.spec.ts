import { describe, it, expect, beforeEach } from '@jest/globals';
import path from 'path';
import { componentRegistry } from '@/common/core/ComponentRegistry';

// This test asserts autoDiscover works against the source components directory.
// Implementation fix will make it resilient to .js in dist as well.

describe('ComponentRegistry auto-discovery', () => {
  const componentsRoot = path.join(__dirname, '..', 'src', 'components');

  beforeEach(async () => {
    // Clear any previously registered components
    // @ts-ignore
    (componentRegistry as any).components?.clear?.();
  });

  it('should auto-discover components from components directory', async () => {
    await componentRegistry.autoDiscover(componentsRoot);
    const stats = componentRegistry.getStats();
    const names = stats.components.map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(['health', 'users']));
  });
});
