export type EventCallbackType = (data) => void;

export interface PenEventFilter {
  mac: string[] | undefined;
  allowAll: boolean;
}

interface CallbackItem {
  callback: EventCallbackType;
  filter: PenEventFilter;
}

class DispatcherEvent {
  eventName: string;
  callbacks: CallbackItem[];

  constructor(eventName) {
    this.eventName = eventName;
    this.callbacks = [];
  }

  /**
   *
   * @param {function} callback
   * @param {{mac:string}=} filter
   */
  registerCallback(callback: EventCallbackType, filter?: PenEventFilter) {
    if (!filter) {
      filter = { mac: undefined, allowAll: true };
    }

    this.callbacks.push({ callback, filter });
  }

  /**
   *
   * @param {function} callback
   * @return {boolean}
   */
  unregisterCallback(callback: EventCallbackType): boolean {
    // Get the index of the callback in the callbacks array
    // const index = this.callbacks.indexOf(callback);
    const index = this.callbacks.findIndex((item) => item.callback === callback);

    // If the callback is in the array then remove it
    if (index > -1) {
      this.callbacks.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   *
   * @param {object} data - which can have "mac" property to filter
   */
  fire(data: any) {
    // We loop over a cloned version of the callbacks array
    // in case the original array is spliced while looping
    const callbacks = this.callbacks.slice(0);

    // loop through the callbacks and call each one
    callbacks.forEach((item) => {
      const filter = item.filter;
      if ((data && !data.mac) || filter.allowAll || !filter.mac || filter.mac === data.mac || filter.mac.indexOf(data.mac) > -1) {
        item.callback(data);
      }
    });
  }
}

export class EventDispatcher {
  events: { [key: string]: DispatcherEvent };

  constructor() {
    this.events = {};
  }

  /**
   *
   * @param {string} eventName
   * @param {any} data
   */
  dispatch(eventName: string, data: any) {
    // First we grab the event
    const event = this.events[eventName];
    // If the event exists then we fire it!
    if (event) {
      event.fire(data);
    }
  }

  /**
   *
   * @param {string} eventName
   * @param {function} callback
   * @param {{mac:string}=} filter
   */
  on(eventName: string, callback: EventCallbackType, filter: PenEventFilter) {
    // First we grab the event from this.events
    let event = this.events[eventName];

    // If the event does not exist then we should create it!
    if (!event) {
      event = new DispatcherEvent(eventName);
      this.events[eventName] = event;
    }
    // Now we add the callback to the event
    event.registerCallback(callback, filter);
  }

  /**
   *
   * @param {string} eventName
   * @param {function} callback
   */
  off(eventName: string, callback: EventCallbackType) {
    const event = this.events[eventName];

    // Check that the event exists and it has the callback registered
    if (!event) return;

    const flag = event.unregisterCallback(callback);
    if (flag) {
      // if the event has no callbacks left, delete the event
      if (event.callbacks.length === 0) {
        delete this.events[eventName];
      }
    }
  }
}


