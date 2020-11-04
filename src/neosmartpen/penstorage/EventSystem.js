class DispatcherEvent {
  constructor(eventName) {
    this.eventName = eventName;
    this.callbacks = [];
  }

  /**
   * 
   * @param {function} callback 
   * @param {{mac:string}=} filter 
   */
  registerCallback(callback, filter) {
    this.callbacks.push({ callback, filter });
  }

  /**
   * 
   * @param {function} callback 
   */
  unregisterCallback(callback) {
    // Get the index of the callback in the callbacks array
    // const index = this.callbacks.indexOf(callback);
    const sameCallback = (item) => item.callback === callback;
    const index = this.callbacks.findIndex(sameCallback);

    // If the callback is in the array then remove it
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * 
   * @param {object} data 
   */
  fire(data) {
    // We loop over a cloned version of the callbacks array
    // in case the original array is spliced while looping
    const callbacks = this.callbacks.slice(0);
    // loop through the callbacks and call each one
    callbacks.forEach((item) => {
      let filter = item.filter;
      if (!filter || !data.mac || !filter.mac || filter.mac === data.mac || filter.mac.indexOf(data.mac) > -1) {
        item.callback(data);
      }
    });
  }
}

export default class EventDispatcher {
  constructor() {
    this.events = {};
  }

  /**
   * 
   * @param {string} eventName 
   * @param {object} data 
   */
  dispatch(eventName, data) {
    // First we grab the event

    /** @type {DispatcherEvent} */
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
  on(eventName, callback, filter) {
    // First we grab the event from this.events

    /** @type {DispatcherEvent} */
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
  off(eventName, callback) {
    /** @type {DispatcherEvent} */
    const event = this.events[eventName];
    // Check that the event exists and it has the callback registered
    if (event && event.callbacks.indexOf(callback) > -1) {
      // if it is registered then unregister it!
      event.unregisterCallback(callback);
      // if the event has no callbacks left, delete the event
      if (event.callbacks.length === 0) {
        delete this.events[eventName];
      }
    }
  }
}


