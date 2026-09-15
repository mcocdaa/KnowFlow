type ProgressHandler = ((event: ProgressEvent) => void) | null;

export class MockXMLHttpRequest {
  static instances: MockXMLHttpRequest[] = [];

  static reset() {
    MockXMLHttpRequest.instances = [];
  }

  method = '';
  url = '';
  status = 0;
  statusText = '';
  responseText = '';
  body: Document | XMLHttpRequestBodyInit | null = null;
  headers: Record<string, string> = {};
  upload: { onprogress: ProgressHandler } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    MockXMLHttpRequest.instances.push(this);
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key: string, value: string) {
    this.headers[key] = value;
  }

  send(body?: Document | XMLHttpRequestBodyInit | null) {
    this.body = body ?? null;
  }

  emitProgress(loaded: number, total: number) {
    this.upload.onprogress?.({
      lengthComputable: true,
      loaded,
      total,
    } as ProgressEvent);
  }

  respond(status: number, payload: unknown) {
    this.status = status;
    this.responseText = JSON.stringify(payload);
    this.onload?.();
  }

  fail() {
    this.onerror?.();
  }
}
