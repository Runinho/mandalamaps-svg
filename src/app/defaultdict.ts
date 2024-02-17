// generated from ChatGPT
export class DefaultDict<T> {
  private _defaultFactory: () => T;
  private _data: { [key: string]: T } = {};

  constructor(defaultFactory: () => T) {
    this._defaultFactory = defaultFactory;
  }

  get(key: string): T {
    if (!(key in this._data)) {
      this._data[key] = this._defaultFactory();
    }
    return this._data[key];
  }

  set(key: string, value: T): void {
    this._data[key] = value;
  }

  has(key: string): boolean {
    return key in this._data;
  }

  keys(): string[] {
    return Object.keys(this._data);
  }
}