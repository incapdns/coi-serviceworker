// 1. Habilitar Navigation Preload no evento 'activate'
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
  // Opcional: Assumir controle imediato dos clientes
  self.clients.claim();
});

// 2. Interceptar requisições no evento 'fetch'
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Verifica se o destino é um dos que você especificou
  if (["document", "iframe", "worker", "sharedworker"].includes(request.destination)) {
    event.respondWith(handleNetworkOnlyWithHeaders(event));
  }
});

// Lógica principal: NetworkOnly + Injeção de Headers
async function handleNetworkOnlyWithHeaders(event) {
  let response;

  try {
    // A. Tenta usar o Navigation Preload primeiro (otimização)
    const preloadResponse = await event.preloadResponse;
    if (preloadResponse) {
      response = preloadResponse;
    }
  } catch (error) {
    console.warn("Falha no navigation preload", error);
  }

  // B. Se não houver preload, faz o fetch na rede (NetworkOnly)
  if (!response) {
    response = await fetch(event.request);
  }

  // C. Injeção dos Headers (Equivalente ao headersPlugin)
  // Precisamos criar uma nova Response porque os headers da original são imutáveis
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
  newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
