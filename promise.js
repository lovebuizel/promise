class Promise {
  constructor(executor) {
    this.PromiseState = "pending";
    this.PromiseResult = null;
    this.callbacks = [];

    let self = this;
    function resolve(data) {
      if (self.PromiseState !== "pending") return;
      self.PromiseState = "fulfilled";
      self.PromiseResult = data;
      setTimeout(() => {
        self.callbacks.forEach((item) => {
          item.onResolved(data);
        });
      });
    }

    function reject(data) {
      if (self.PromiseState !== "pending") return;
      self.PromiseState = "rejected";
      self.PromiseResult = data;
      setTimeout(() => {
        self.callbacks.forEach((item) => {
          item.onRejected(data);
        });
      });
    }

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onResolved, onRejected) {
    if (typeof onRejected !== "function") {
      onRejected = (reason) => {
        throw reason;
      };
    }

    if (typeof onResolved !== "function") {
      onResolved = (value) => value;
    }

    const self = this;
    return new Promise((resolve, reject) => {
      function callback(type) {
        try {
          let result = type(self.PromiseResult);
          if (result instanceof Promise) {
            result.then(
              (v) => resolve(v),
              (r) => reject(r)
            );
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      }
      if (this.PromiseState === "fulfilled") {
        setTimeout(() => callback(onResolved));
      }
      if (this.PromiseState === "rejected") {
        setTimeout(() => callback(onRejected));
      }
      if (this.PromiseState === "pending") {
        this.callbacks.push({
          onResolved: function () {
            callback(onResolved);
          },
          onRejected: function () {
            callback(onRejected);
          },
        });
      }
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  static resolve(value) {
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(
          (v) => resolve(v),
          (r) => reject(r)
        );
      } else {
        resolve(value);
      }
    });
  }

  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  }

  static all(promises) {
    return new Promise((resolve, reject) => {
      let count = 0;
      let arr = [];
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(
          (v) => {
            count++;
            arr[i] = v;
            if (count === promises.length) {
              resolve(arr);
            }
          },
          (r) => reject(r)
        );
      }
    });
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(
          (v) => resolve(v),
          (r) => reject(r)
        );
      }
    });
  }
}
