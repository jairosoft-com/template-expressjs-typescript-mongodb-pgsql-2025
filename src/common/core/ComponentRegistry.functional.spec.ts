import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ComponentRegistry } from './ComponentRegistry';
import { BaseComponent } from '@common/base/BaseComponent';
import { IComponentMetadata } from '@common/types/component';
import { Router } from 'express';
import express from 'express';

// Create realistic test components using the same pattern as real components
class TestHealthComponent extends BaseComponent {
  constructor() {
    const metadata: IComponentMetadata = {
      name: 'test-healths',
      version: '1',
      description: 'Test health component',
      enabled: true,
      dependencies: [],
      tags: ['health', 'test'],
    };
    super(metadata);
  }

  protected initializeRoutes(): void {
    this.router.get('/health', (req, res) => {
      res.json({ status: 'ok', component: 'test-healths' });
    });
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    this.logger.info('Test health component initialized');
  }

  public async shutdown(): Promise<void> {
    await super.shutdown();
    this.logger.info('Test health component shutdown');
  }
}

class TestUsersComponent extends BaseComponent {
  constructor() {
    const metadata: IComponentMetadata = {
      name: 'test-users',
      version: '1', 
      description: 'Test users component',
      enabled: true,
      dependencies: ['test-healths'], // Depends on health component
      tags: ['users', 'auth', 'test'],
    };
    super(metadata);
  }

  protected initializeRoutes(): void {
    this.router.get('/profile', (req, res) => {
      res.json({ user: 'test', component: 'test-users' });
    });
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    this.logger.info('Test users component initialized');
  }

  public async shutdown(): Promise<void> {
    await super.shutdown();
    this.logger.info('Test users component shutdown');
  }
}

class TestNotificationComponent extends BaseComponent {
  constructor() {
    const metadata: IComponentMetadata = {
      name: 'test-notifications',
      version: '2',
      description: 'Test notification component',
      enabled: true,
      dependencies: ['test-users'], // Depends on users component
      tags: ['notifications', 'messaging', 'test'],
    };
    super(metadata);
  }

  protected initializeRoutes(): void {
    this.router.post('/send', (req, res) => {
      res.json({ message: 'sent', component: 'test-notifications' });
    });
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    this.logger.info('Test notification component initialized');
  }

  public async shutdown(): Promise<void> {
    await super.shutdown();
    this.logger.info('Test notification component shutdown');
  }
}

describe('ComponentRegistry Functional Tests', () => {
  let registry: ComponentRegistry;
  let app: express.Express;

  beforeEach(() => {
    registry = new ComponentRegistry();
    app = express();
  });

  afterEach(() => {
    registry.clear();
  });

  describe('Component Registration and Lifecycle', () => {
    it('should register and manage realistic components', async () => {
      const healthComponent = new TestHealthComponent();
      const usersComponent = new TestUsersComponent();
      const notificationComponent = new TestNotificationComponent();

      // Register components
      registry.register(healthComponent);
      registry.register(usersComponent);
      registry.register(notificationComponent);

      const stats = registry.getStats();
      expect(stats.total).toBe(3);
      expect(stats.initialized).toBe(false);

      // Verify components are properly registered
      expect(registry.get('test-healths')).toBe(healthComponent);
      expect(registry.get('test-users')).toBe(usersComponent);
      expect(registry.get('test-notifications')).toBe(notificationComponent);
    });

    it('should initialize components in dependency order', async () => {
      const healthComponent = new TestHealthComponent();
      const usersComponent = new TestUsersComponent();
      const notificationComponent = new TestNotificationComponent();

      const initOrder: string[] = [];

      // Override initialize methods to track order
      const originalHealthInit = healthComponent.initialize.bind(healthComponent);
      const originalUsersInit = usersComponent.initialize.bind(usersComponent);
      const originalNotificationInit = notificationComponent.initialize.bind(notificationComponent);

      healthComponent.initialize = async () => {
        await originalHealthInit();
        initOrder.push('test-healths');
      };

      usersComponent.initialize = async () => {
        await originalUsersInit();
        initOrder.push('test-users');
      };

      notificationComponent.initialize = async () => {
        await originalNotificationInit();
        initOrder.push('test-notifications');
      };

      registry.register(notificationComponent); // Register in reverse dependency order
      registry.register(usersComponent);
      registry.register(healthComponent);

      await registry.initializeAll();

      // Should initialize in dependency order: healths -> users -> notifications
      expect(initOrder).toEqual(['test-healths', 'test-users', 'test-notifications']);

      const stats = registry.getStats();
      expect(stats.initialized).toBe(true);
    });

    it('should shutdown components in reverse order', async () => {
      const healthComponent = new TestHealthComponent();
      const usersComponent = new TestUsersComponent();
      const notificationComponent = new TestNotificationComponent();

      const shutdownOrder: string[] = [];

      // Override shutdown methods to track order
      const originalHealthShutdown = healthComponent.shutdown.bind(healthComponent);
      const originalUsersShutdown = usersComponent.shutdown.bind(usersComponent);
      const originalNotificationShutdown = notificationComponent.shutdown.bind(notificationComponent);

      healthComponent.shutdown = async () => {
        await originalHealthShutdown();
        shutdownOrder.push('test-healths');
      };

      usersComponent.shutdown = async () => {
        await originalUsersShutdown();
        shutdownOrder.push('test-users');
      };

      notificationComponent.shutdown = async () => {
        await originalNotificationShutdown();
        shutdownOrder.push('test-notifications');
      };

      registry.register(healthComponent);
      registry.register(usersComponent);
      registry.register(notificationComponent);

      await registry.initializeAll();
      await registry.shutdownAll();

      // Should shutdown in reverse order: notifications -> users -> healths
      expect(shutdownOrder).toEqual(['test-notifications', 'test-users', 'test-healths']);

      const stats = registry.getStats();
      expect(stats.initialized).toBe(false);
    });
  });

  describe('Component Mounting and Routing', () => {
    it('should mount component routes correctly', async () => {
      const healthComponent = new TestHealthComponent();
      const usersComponent = new TestUsersComponent();

      registry.register(healthComponent);
      registry.register(usersComponent);

      await registry.initializeAll();

      // Track mounted routes
      const mountedRoutes: Array<{ path: string, router: Router }> = [];
      app.use = jest.fn().mockImplementation((path: string, router: Router) => {
        mountedRoutes.push({ path, router });
        return app;
      }) as any;

      registry.mountRoutes(app);

      expect(mountedRoutes).toHaveLength(2);
      expect(mountedRoutes[0].path).toBe('/api/v1/test-healths');
      expect(mountedRoutes[1].path).toBe('/api/v1/test-users');
    });

    it('should provide component metadata correctly', () => {
      const healthComponent = new TestHealthComponent();
      const usersComponent = new TestUsersComponent();
      const notificationComponent = new TestNotificationComponent();

      registry.register(healthComponent);
      registry.register(usersComponent);
      registry.register(notificationComponent);

      const stats = registry.getStats();

      expect(stats.components).toHaveLength(3);
      
      const healthStats = stats.components.find(c => c.name === 'test-healths');
      expect(healthStats).toEqual({
        name: 'test-healths',
        version: '1',
        basePath: '/api/v1/test-healths',
      });

      const notificationStats = stats.components.find(c => c.name === 'test-notifications');
      expect(notificationStats).toEqual({
        name: 'test-notifications',
        version: '2',
        basePath: '/api/v2/test-notifications',
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle component initialization errors', async () => {
      const healthComponent = new TestHealthComponent();
      const usersComponent = new TestUsersComponent();

      // Make health component throw during initialization
      healthComponent.initialize = jest.fn(() => {
        throw new Error('Health component initialization failed');
      });

      registry.register(healthComponent);
      registry.register(usersComponent);

      await expect(registry.initializeAll()).rejects.toThrow('Health component initialization failed');

      const stats = registry.getStats();
      expect(stats.initialized).toBe(false);
    });

    it('should handle component shutdown errors gracefully', async () => {
      const healthComponent = new TestHealthComponent();
      const usersComponent = new TestUsersComponent();

      registry.register(healthComponent);
      registry.register(usersComponent);

      await registry.initializeAll();

      // Make health component throw during shutdown
      healthComponent.shutdown = jest.fn(() => {
        throw new Error('Health component shutdown failed');
      });

      // Should not throw - shutdown errors are logged but don't stop the process
      await expect(registry.shutdownAll()).resolves.not.toThrow();

      const stats = registry.getStats();
      expect(stats.initialized).toBe(false);
    });

    it('should detect circular dependencies', async () => {
      // Create components with circular dependencies
      class CircularA extends BaseComponent {
        constructor() {
          super({
            name: 'circular-a',
            version: '1',
            dependencies: ['circular-b'],
          });
        }
        protected initializeRoutes(): void {
          // No routes needed for this test
        }
      }

      class CircularB extends BaseComponent {
        constructor() {
          super({
            name: 'circular-b',
            version: '1',
            dependencies: ['circular-a'],
          });
        }
        protected initializeRoutes(): void {
          // No routes needed for this test
        }
      }

      const componentA = new CircularA();
      const componentB = new CircularB();

      registry.register(componentA);
      registry.register(componentB);

      await expect(registry.initializeAll()).rejects.toThrow('Circular dependency detected');
    });

    it('should handle missing dependencies gracefully', async () => {
      const usersComponent = new TestUsersComponent(); // Depends on 'test-healths'

      registry.register(usersComponent);

      // Should initialize without the missing dependency (dependency is just skipped)
      await expect(registry.initializeAll()).resolves.not.toThrow();
    });

    it('should prevent double initialization', async () => {
      const healthComponent = new TestHealthComponent();
      const initSpy = jest.spyOn(healthComponent, 'initialize');

      registry.register(healthComponent);

      await registry.initializeAll();
      await registry.initializeAll(); // Try to initialize again

      expect(initSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Versioning and Metadata', () => {
    it('should handle different component versions', () => {
      const v1Component = new TestHealthComponent(); // version 1
      const v2Component = new TestNotificationComponent(); // version 2

      registry.register(v1Component);
      registry.register(v2Component);

      const stats = registry.getStats();

      const v1Stats = stats.components.find(c => c.name === 'test-healths');
      const v2Stats = stats.components.find(c => c.name === 'test-notifications');

      expect(v1Stats?.basePath).toBe('/api/v1/test-healths');
      expect(v2Stats?.basePath).toBe('/api/v2/test-notifications');
    });

    it('should provide accurate component statistics', async () => {
      expect(registry.getStats().total).toBe(0);
      expect(registry.getStats().initialized).toBe(false);

      const healthComponent = new TestHealthComponent();
      registry.register(healthComponent);

      expect(registry.getStats().total).toBe(1);
      expect(registry.getStats().initialized).toBe(false);

      await registry.initializeAll();

      expect(registry.getStats().total).toBe(1);
      expect(registry.getStats().initialized).toBe(true);

      await registry.shutdownAll();

      expect(registry.getStats().total).toBe(1);
      expect(registry.getStats().initialized).toBe(false);
    });
  });
});
