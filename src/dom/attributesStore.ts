import { stringify } from '../utils';
import type { Element } from './element';

export class AttributeStore {
  private readonly attributes = new Map<string, string>();

  public constructor(private readonly element: Element) {}

  public setAttribute(name: string, value: string) {
    if (name === 'textContent') value = String(value);

    const prev = this.attributes.get(name);

    if (prev != null && prev === value) return;

    this.attributes.set(name, value);

    if (name === 'className' || name === 'class') {
      this.attributes.set('tw', value);
    }

    this.element.document.onChange?.();
  }

  public getAttribute(name: string): string | undefined {
    return this.attributes.get(name);
  }

  public removeAttribute(name: string) {
    const success = this.attributes.delete(name);
    if (success) this.element.document.onChange?.();
  }

  public entries() {
    return this.attributes.entries();
  }

  public toJSON() {
    const entries = Object.fromEntries(this.entries());

    return entries;
  }

  public toString() {
    if (!this.attributes.size) return '';

    const filterAttributes = (name: string) => {
      if (name === 'children') return false;
      return true;
    };

    const attr = Array.from(this.entries())
      .filter(([name, value]) => value != null && filterAttributes(name))
      .map(([name, value]) => `${name}="${stringify(name, value)}"`);

    return attr.length ? ` ${attr.join(' ')}` : '';
  }
}
