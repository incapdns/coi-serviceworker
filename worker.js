// worker.js
self.onconnect = function(e) {
  const port = e.ports[0];

  port.onmessage = function(event) {
    port.postMessage(`Worker received: ${event.data} [${self.crossOriginIsolated}]`);
  };

  port.start();
};
