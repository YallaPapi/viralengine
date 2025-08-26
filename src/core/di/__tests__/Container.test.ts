/**
 * Unit tests for Dependency Injection Container
 */

import { Container, ServiceTokens, ServiceLifetime } from '../Container';

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    // Clear the singleton and create fresh instance
    Container['instance'] = undefined as any;
    container = Container.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const container1 = Container.getInstance();
      const container2 = Container.getInstance();
      expect(container1).toBe(container2);
    });
  });

  describe('register', () => {
    it('should register transient service', () => {
      const factory = jest.fn(() => ({ value: Math.random() }));
      
      container.register('test-service', factory, ServiceLifetime.TRANSIENT);
      
      const instance1 = container.resolve('test-service');
      const instance2 = container.resolve('test-service');
      
      expect(factory).toHaveBeenCalledTimes(2);
      expect(instance1).not.toBe(instance2);
    });

    it('should register scoped service', () => {
      const factory = jest.fn(() => ({ value: Math.random() }));
      
      container.register('test-service', factory, ServiceLifetime.SCOPED);
      
      const instance1 = container.resolve('test-service');
      const instance2 = container.resolve('test-service');
      
      // In same scope, should return same instance
      expect(factory).toHaveBeenCalledTimes(1);
      expect(instance1).toBe(instance2);
    });

    it('should register singleton service', () => {
      const factory = jest.fn(() => ({ value: Math.random() }));
      
      container.register('test-service', factory, ServiceLifetime.SINGLETON);
      
      const instance1 = container.resolve('test-service');
      const instance2 = container.resolve('test-service');
      
      expect(factory).toHaveBeenCalledTimes(1);
      expect(instance1).toBe(instance2);
    });

    it('should override existing registration', () => {
      const factory1 = jest.fn(() => ({ value: 1 }));
      const factory2 = jest.fn(() => ({ value: 2 }));
      
      container.register('test-service', factory1, ServiceLifetime.TRANSIENT);
      container.register('test-service', factory2, ServiceLifetime.TRANSIENT);
      
      const instance = container.resolve<any>('test-service');
      
      expect(factory1).not.toHaveBeenCalled();
      expect(factory2).toHaveBeenCalledTimes(1);
      expect(instance.value).toBe(2);
    });
  });

  describe('registerSingleton', () => {
    it('should register singleton instance directly', () => {
      const instance = { value: 42 };
      
      container.registerSingleton('test-service', instance);
      
      const resolved1 = container.resolve('test-service');
      const resolved2 = container.resolve('test-service');
      
      expect(resolved1).toBe(instance);
      expect(resolved2).toBe(instance);
    });

    it('should override factory registration', () => {
      const factory = jest.fn(() => ({ value: 1 }));
      const instance = { value: 2 };
      
      container.register('test-service', factory, ServiceLifetime.TRANSIENT);
      container.registerSingleton('test-service', instance);
      
      const resolved = container.resolve('test-service');
      
      expect(factory).not.toHaveBeenCalled();
      expect(resolved).toBe(instance);
    });
  });

  describe('resolve', () => {
    it('should resolve registered service', () => {
      const expectedValue = { data: 'test' };
      const factory = jest.fn(() => expectedValue);
      
      container.register('test-service', factory, ServiceLifetime.TRANSIENT);
      
      const instance = container.resolve('test-service');
      
      expect(instance).toBe(expectedValue);
    });

    it('should throw error for unregistered service', () => {
      expect(() => container.resolve('unknown-service')).toThrow(
        'No registration found for token: unknown-service'
      );
    });

    it('should handle factory that throws error', () => {
      const factory = jest.fn(() => {
        throw new Error('Factory error');
      });
      
      container.register('test-service', factory, ServiceLifetime.TRANSIENT);
      
      expect(() => container.resolve('test-service')).toThrow('Factory error');
    });

    it('should support factory with dependencies', () => {
      const dep1 = { name: 'dep1' };
      const dep2 = { name: 'dep2' };
      
      container.registerSingleton('dep1', dep1);
      container.registerSingleton('dep2', dep2);
      
      const factory = jest.fn(() => {
        return {
          dependency1: container.resolve('dep1'),
          dependency2: container.resolve('dep2')
        };
      });
      
      container.register('test-service', factory, ServiceLifetime.TRANSIENT);
      
      const instance = container.resolve<any>('test-service');
      
      expect(instance.dependency1).toBe(dep1);
      expect(instance.dependency2).toBe(dep2);
    });
  });

  describe('has', () => {
    it('should return true for registered service', () => {
      container.register('test-service', () => ({}), ServiceLifetime.TRANSIENT);
      
      expect(container.has('test-service')).toBe(true);
    });

    it('should return false for unregistered service', () => {
      expect(container.has('unknown-service')).toBe(false);
    });

    it('should return true for singleton instance', () => {
      container.registerSingleton('test-service', {});
      
      expect(container.has('test-service')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all registrations', () => {
      container.register('service1', () => ({}), ServiceLifetime.TRANSIENT);
      container.registerSingleton('service2', {});
      container.register('service3', () => ({}), ServiceLifetime.SINGLETON);
      
      container.clear();
      
      expect(container.has('service1')).toBe(false);
      expect(container.has('service2')).toBe(false);
      expect(container.has('service3')).toBe(false);
    });

    it('should clear scoped instances', () => {
      const factory = jest.fn(() => ({}));
      container.register('test-service', factory, ServiceLifetime.SCOPED);
      
      container.resolve('test-service');
      container.clear();
      container.register('test-service', factory, ServiceLifetime.SCOPED);
      container.resolve('test-service');
      
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  describe('createScope', () => {
    it('should create new scope for scoped services', () => {
      const factory = jest.fn(() => ({ id: Math.random() }));
      container.register('test-service', factory, ServiceLifetime.SCOPED);
      
      // Resolve in default scope
      const instance1 = container.resolve('test-service');
      const instance2 = container.resolve('test-service');
      
      // Create new scope
      const scopedContainer = container.createScope();
      const instance3 = scopedContainer.resolve('test-service');
      const instance4 = scopedContainer.resolve('test-service');
      
      expect(instance1).toBe(instance2);
      expect(instance3).toBe(instance4);
      expect(instance1).not.toBe(instance3);
      expect(factory).toHaveBeenCalledTimes(2);
    });

    it('should not affect singleton services', () => {
      const factory = jest.fn(() => ({ id: Math.random() }));
      container.register('test-service', factory, ServiceLifetime.SINGLETON);
      
      const instance1 = container.resolve('test-service');
      
      container.createScope();
      const instance2 = container.resolve('test-service');
      
      expect(instance1).toBe(instance2);
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should not affect transient services', () => {
      const factory = jest.fn(() => ({ id: Math.random() }));
      container.register('test-service', factory, ServiceLifetime.TRANSIENT);
      
      const instance1 = container.resolve('test-service');
      
      container.createScope();
      const instance2 = container.resolve('test-service');
      
      expect(instance1).not.toBe(instance2);
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  describe('ServiceTokens', () => {
    it('should have predefined service tokens', () => {
      expect(ServiceTokens.EVENT_BUS).toBe('EventBus');
      expect(ServiceTokens.SCRIPT_GENERATOR).toBe('IScriptGenerator');
      expect(ServiceTokens.MEDIA_SOURCER).toBe('IMediaSourcer');
      expect(ServiceTokens.AUDIO_PROCESSOR).toBe('IAudioProcessor');
      expect(ServiceTokens.VIDEO_COMPOSITOR).toBe('IVideoCompositor');
      expect(ServiceTokens.CONFIG).toBe('Configuration');
      expect(ServiceTokens.LOGGER).toBe('Logger');
    });
  });
});