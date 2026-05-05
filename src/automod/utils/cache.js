class Cache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    this.store.set(key, value);
  }

  has(key) {
    return this.store.has(key);
  }

  delete(key) {
    this.store.delete(key);
  }

  cleanup(expireMs = 60000) {
    const now = Date.now();

    for (const [key, value] of this.store.entries()) {
      if (value.last && now - value.last > expireMs) {
        this.store.delete(key);
      }
    }
  }
}

module.exports = new Cache();