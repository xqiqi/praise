const defaultOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
};

async function send (url, options) {
  const result = {
    success: false,
    message: '',
  };
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options
    });

    result.statusCode = response.status;
    result.message = response.statusText;

    if (response.ok) {
      result.success = true;
      result.payload = await response.json();

      // add total count if query has pagination
      if (response.headers.has('x-total-count')) {
        result._metadata = {
          total_count: parseInt(response.headers.get('x-total-count')),
        };
      }
    }
  } catch (e) {
    result.statusCode = 500;
    result.message = e.message;
  }
  return result;
}

export async function get (url) {
  return send(url, {
    method: 'GET',
  });
}

export async function post (url, data) {
  return send(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
