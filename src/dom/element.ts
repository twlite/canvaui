import { AttributeStore } from './attributesStore';
import type { Document } from './document';

const selfClosingTags = new Set([
  'img',
  'input',
  'br',
  'hr',
  'area',
  'base',
  'col',
  'embed',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export type TagName = string;

function assertTagName(tagName: string) {
  return tagName.toLowerCase();
}

export interface UINode {
  type: TagName;
  children: ElementJSON[];
  props: Record<string, string | number | boolean>;
}

export type ElementJSON = string | UINode;

export class Element {
  public readonly tagName: TagName;
  public children: Element[];
  #parentNode: Element | null = null;
  public readonly attributes = new AttributeStore(this);

  public constructor(
    public readonly document: Document,
    tagName: TagName,
    private readonly _isTextNode = false
  ) {
    this.tagName = assertTagName(tagName);
    this.children = [];
  }

  public get textContent(): string | null {
    return this.attributes.getAttribute('textContent') ?? null;
  }

  public set textContent(value: string | null) {
    const prev = this.attributes.getAttribute('textContent');

    if (prev != null && prev === value) return;

    if (value != null) {
      this.attributes.setAttribute('textContent', value);
      // @ts-ignore
      this.document._createSnapshot();
    }
  }

  public firstChild(): Element | null {
    return this.children[0] || null;
  }

  public get parentNode(): Element | null {
    return this.#parentNode;
  }

  public set parentNode(parent: Element | null) {
    this.#parentNode = parent;
  }

  public setParentNode(parent: Element | null) {
    this.#parentNode = parent;
  }

  public nextSibling(): Element | null {
    if (this.parentNode) {
      const siblings = this.document.findSiblings(this);
      const index = siblings.indexOf(this);
      return siblings[index + 1] || null;
    }
    return null;
  }

  public appendChild(child: Element) {
    if (this.isSelfClosing() || this.isTextNode()) return;

    child.setParentNode(this);

    this.children.push(child);

    // @ts-ignore
    this.document._createSnapshot();
  }

  public removeChild(child: Element) {
    if (this.isSelfClosing() || this.isTextNode()) return;

    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children[index].setParentNode(null);
      this.children.splice(index, 1);
      // @ts-ignore
      this.document._createSnapshot();
    }
  }

  public isRoot(): boolean {
    return this.tagName === 'root';
  }

  public isTextNode(): boolean {
    return this._isTextNode;
  }

  public toJSON(): ElementJSON {
    if (this.isTextNode()) {
      return this.textContent || '';
    }

    const props = this.attributes.toJSON();
    const children = this.isSelfClosing()
      ? []
      : this.children.map((child) => child.toJSON());

    // @ts-ignore
    if (props.children != null) props.children = children;

    return {
      type: this.tagName,
      children,
      props,
    };
  }

  public isSelfClosing(): boolean {
    return selfClosingTags.has(this.tagName);
  }

  public toString() {
    if (this.isSelfClosing()) {
      return `<${this.tagName}${this.attributes.toString()} />`;
    }

    if (this.isTextNode()) {
      return this.textContent || '';
    }

    const stack: string[] = [];

    if (!this.isRoot())
      stack.push(`<${this.tagName}${this.attributes.toString()}>`);

    for (const child of this.children) {
      stack.push(child.toString());
    }

    if (!this.isRoot()) stack.push(`</${this.tagName}>`);

    return stack.join('');
  }
}
