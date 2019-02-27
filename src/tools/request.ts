import { _seralize } from './utils';

export function ajax({
  url,
  data = {},
  method = 'GET',
  headers
}: {
  url: string;
  data?: Object | string;
  method?: string;
  headers?: Object;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let body: string = '';

    xhr.open(method, url);

    xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
    if (headers) {
      for (let item in headers) {
        if (headers.hasOwnProperty(item) && headers[item] !== null) {
          xhr.setRequestHeader(item, headers[item]);
        }
      }
    }

    if (method === 'GET') {
      if (typeof data === 'object') {
        url = url + _seralize(data);
      }
      if (typeof data === 'string') {
        url = url + data;
      }
    } else {
      body = JSON.stringify(data);
    }

    xhr.withCredentials = true;

    xhr.send(body);

    xhr.onerror = function(error) {
      reject(error);
    };

    xhr.onreadystatechange = function() {
      const requestDone = xhr.readyState === 4;
      if (requestDone) {
        if (xhr.status.toString().startsWith('2')) {
          try {
            resolve(getBody(xhr));
          } catch (error) {
            reject(error);
          }
        } else {
          const { status, response, responseText } = xhr;
          reject({ status, response: responseText || response });
        }
      }
    };
  });
}

function getBody(xhr: XMLHttpRequest) {
  const text = xhr.responseText || xhr.response;

  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}
