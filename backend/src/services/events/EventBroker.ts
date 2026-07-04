type EventHandler = (data: any) => void | Promise<void>;

class EventBroker {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Subscribes a handler to a specific event.
   */
  subscribe(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
    console.log(`[EventBroker] Subscribed handler to event: "${event}"`);
  }

  /**
   * Unsubscribes a handler from a specific event.
   */
  unsubscribe(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) return;
    const list = this.handlers.get(event)!;
    const index = list.indexOf(handler);
    if (index !== -1) {
      list.splice(index, 1);
      console.log(`[EventBroker] Unsubscribed handler from event: "${event}"`);
    }
  }

  /**
   * Publishes an event, executing all registered handlers asynchronously.
   */
  async publish(event: string, data: any): Promise<void> {
    const list = this.handlers.get(event) || [];
    console.log(`[EventBroker] Publishing event: "${event}" to ${list.length} subscriber(s)`);
    // Run handlers concurrently in the background
    const promises = list.map(async (handler) => {
      try {
        await handler(data);
      } catch (err) {
        console.error(`[EventBroker] Error in handler for event "${event}":`, err);
      }
    });
    // Fire and forget: wait for all to complete asynchronously
    Promise.all(promises).catch(err => {
      console.error(`[EventBroker] Error running handlers for "${event}":`, err);
    });
  }

  /**
   * Clears all registered handlers (mainly for testing).
   */
  clear(): void {
    this.handlers.clear();
  }
}

export const eventBroker = new EventBroker();
