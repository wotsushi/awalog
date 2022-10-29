export class DefaultObject<V> {
  defaultValue: V;
  data: Record<string, V>;

  constructor(defaultValue: V) {
    this.defaultValue = defaultValue;
    this.data = {};
  }

  get(key: string | number) {
    if (!(key in this.data)) {
      this.data[key] = JSON.parse(JSON.stringify(this.defaultValue));
    }
    return this.data[key];
  }
}
