const NOOP = () => {};

/**
 * Simple AJAX Http caller that expects JSON response. Handles standard parameter posting and
 * file uploading.
 *
 * Usage (POST parameters):
 * let params = {
 *     key: "value"
 * }
 * let h = new Http("/post", params).done(data => {
 *     // do something with data
 * }).fail(() => {
 *     // do something when failed
 * })
 *
 * Usage (file uplaod):
 * let file = ...
 * let params = {
 *     file1: file
 * }
 * let h = new Http("/upload", params).progress((p => {
 *     // upload progress bar, p = percentage done
 * }).done(data => {
 *     // do something with data
 * }).fail(() => {
 *     // do something when failed
 * })
 *
 * @class
 */
export class Http {

  /**
   * @param url URL to post to
   * @param params Object of parameters in the form of key:values
   */
  constructor(url, params = {}, headers = {}) {
    this._url = url;
    this._params = params;
    this._headers = headers;
    this._progress = NOOP;
    this._done = NOOP;
    this._fail = NOOP;
    this._post();
  }

  /**
   * @param progress Progress handler for file upload, passed a the only parameters a value
   * between 0 and 100
   * @returns {Http} Returns this Http instance for chaining
   */
  progress(progress) {
    if (typeof progress === 'function') {
      this._progress = progress;
    }
    return this;
  }

  /**
   * @param done Done handler when the request is complete with success status code. Passed a
   * parameter of a successfully parsed JSON object.
   * @returns {Http} Returns this Http instance for chaining
   */
  done(done) {
    if (typeof done === 'function') {
      this._done = done;
    }
    return this;
  }

  /**
   * @param fail Fail handler when the request fails (non success http status code) or JSON
   * parse fails.
   * @returns {Http} Returns this Http instance for chaining
   */
  fail(fail) {
    if (typeof fail === 'function') {
      this._fail = fail;
    }
    return this;
  }

  /**
   * @private
   */
  _post() {
    const data = new FormData();
    Object.keys(this._params).forEach((key) => {
      const val = this._params[key];
      if (Array.isArray(val)) {
        val.forEach(v => {
          if (v.type && v.name) {
            data.append(key, v, v.name);
          } else {
            data.append(key, v);
          }
        });
      } else {
        if (val.type && val.name) {
          data.append(key, val, val.name);
        } else {
          data.append(key, val);
        }
      }
    });

    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        if (request.status >= 200 && request.status < 300) {
          try {
            this._done(JSON.parse(request.response));
          } catch (e) {
            this._fail();
          }
        } else {
          this._fail();
        }
      }
    };

    request.upload.addEventListener('progress', e => {
      this._progress(Math.ceil((e.loaded / e.total) * 100));
    }, false);

    request.open('POST', this._url, true);
    if (this._headers) {
      Object.keys(this._headers).forEach((key) => {
        request.setRequestHeader(key, this._headers[key]);
      });
    }
    request.send(data);
  }
}
