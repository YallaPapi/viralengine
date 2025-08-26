/**
 * Unit tests for EventBus
 */

import { EventBus, PipelineEvent } from '../EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    // Get a fresh instance and clear any existing handlers
    eventBus = EventBus.getInstance();
    eventBus.clear();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const bus1 = EventBus.getInstance();
      const bus2 = EventBus.getInstance();
      expect(bus1).toBe(bus2);
    });
  });

  describe('on', () => {
    it('should register event handler', () => {
      const handler = jest.fn();
      const id = eventBus.on(PipelineEvent.PROJECT_CREATED, handler);
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should allow multiple handlers for same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const id1 = eventBus.on(PipelineEvent.PROJECT_CREATED, handler1);
      const id2 = eventBus.on(PipelineEvent.PROJECT_CREATED, handler2);
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('emit', () => {
    it('should trigger registered handlers', async () => {
      const handler = jest.fn();
      const testData = { id: '123', name: 'test' };
      
      eventBus.on(PipelineEvent.PROJECT_CREATED, handler);
      await eventBus.emit(PipelineEvent.PROJECT_CREATED, testData);
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(testData);
    });

    it('should trigger multiple handlers in order', async () => {
      const callOrder: number[] = [];
      const handler1 = jest.fn(() => { callOrder.push(1); });
      const handler2 = jest.fn(() => { callOrder.push(2); });
      
      eventBus.on(PipelineEvent.PROJECT_CREATED, handler1);
      eventBus.on(PipelineEvent.PROJECT_CREATED, handler2);
      await eventBus.emit(PipelineEvent.PROJECT_CREATED);
      
      expect(callOrder).toEqual([1, 2]);
    });

    it('should not trigger handlers for different events', async () => {
      const handler = jest.fn();
      
      eventBus.on(PipelineEvent.PROJECT_CREATED, handler);
      await eventBus.emit(PipelineEvent.SCRIPT_GENERATED);
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle async handlers', async () => {
      const handler = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      
      eventBus.on(PipelineEvent.PROJECT_CREATED, handler);
      await eventBus.emit(PipelineEvent.PROJECT_CREATED);
      
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should continue even if handler throws error', async () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });
      const successHandler = jest.fn();
      
      eventBus.on(PipelineEvent.PROJECT_CREATED, errorHandler);
      eventBus.on(PipelineEvent.PROJECT_CREATED, successHandler);
      
      await eventBus.emit(PipelineEvent.PROJECT_CREATED);
      
      expect(errorHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();
    });
  });

  describe('off', () => {
    it('should remove handler by id', async () => {
      const handler = jest.fn();
      const id = eventBus.on(PipelineEvent.PROJECT_CREATED, handler);
      
      eventBus.off(id);
      await eventBus.emit(PipelineEvent.PROJECT_CREATED);
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should not affect other handlers', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const id1 = eventBus.on(PipelineEvent.PROJECT_CREATED, handler1);
      eventBus.on(PipelineEvent.PROJECT_CREATED, handler2);
      
      eventBus.off(id1);
      await eventBus.emit(PipelineEvent.PROJECT_CREATED);
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('once', () => {
    it('should trigger handler only once', async () => {
      const handler = jest.fn();
      
      eventBus.once(PipelineEvent.PROJECT_CREATED, handler);
      await eventBus.emit(PipelineEvent.PROJECT_CREATED);
      await eventBus.emit(PipelineEvent.PROJECT_CREATED);
      
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear', () => {
    it('should remove all handlers', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.on(PipelineEvent.PROJECT_CREATED, handler1);
      eventBus.on(PipelineEvent.SCRIPT_GENERATED, handler2);
      
      eventBus.clear();
      
      await eventBus.emit(PipelineEvent.PROJECT_CREATED);
      await eventBus.emit(PipelineEvent.SCRIPT_GENERATED);
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });
});