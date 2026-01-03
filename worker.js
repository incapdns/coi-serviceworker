// worker.js
self.onconnect = function(e) {
  const port = e.ports[0];

  port.onmessage = function(event) {
    conn.postMessage(`Worker received: ${event.data} [${self.crossOriginIsolated}]`);
  };

  port.start();
};
