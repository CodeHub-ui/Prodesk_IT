(function () {
  'use strict';

  const ENDPOINT_URL = 'https://jsonplaceholder.typicode.com/users';
  const TIMEOUT_MS = 5000;

 
  class ApiError extends Error {
    constructor(type, message, meta) {
      super(message);
      this.name = 'ApiError';
      this.type = type;  
      this.meta = meta || {};
    }
  }

  async function timeoutAwareFetch(url, options = {}) {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {

      controller.abort();
    }, TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new ApiError('timeout', `Request exceeded the ${TIMEOUT_MS}ms timeout ceiling.`, { url });
      }

      throw new ApiError('network', 'The network request failed before a response was received.', { url, cause: err.message });
    } finally {
      clearTimeout(timeoutId);
    }
  }


  async function fetchUsers() {
    const response = await timeoutAwareFetch(ENDPOINT_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
 

    if (!response.ok) {
      throw new ApiError(
        'http',
        'The service responded with an unexpected status.',
        { status: response.status, statusText: response.statusText }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      throw new ApiError('parse', 'The response body could not be parsed as JSON.', { cause: parseErr.message });
    }

    if (!Array.isArray(data)) {
      throw new ApiError('parse', 'The response body was not in the expected array format.');
    }

    return { data, endpoint: ENDPOINT_URL };
  }


  async function simulateHttpError() {
    await wait(450); 
    throw new ApiError('http', 'Simulated failure for demonstration purposes.', {
      status: 503,
      statusText: 'Service Unavailable',
      simulated: true
    });
  }

 
  async function simulateTimeout() {
    await wait(TIMEOUT_MS + 300);
    throw new ApiError('timeout', `Simulated request exceeded the ${TIMEOUT_MS}ms timeout ceiling.`, { simulated: true });
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  window.ApiLayer = {
    ENDPOINT_URL,
    TIMEOUT_MS,
    ApiError,
    fetchUsers,
    simulateHttpError,
    simulateTimeout
  };
})();
