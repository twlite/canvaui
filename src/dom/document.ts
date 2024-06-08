import { Element, ElementJSON, type TagName } from './element';

export type Callback = () => void;
export type CallbackWithSnapshot = (snapshot: DocumentSnapshot) => void;

export class Document {
  public readonly root = new Element(this, 'root');
  #onClose: Callback | null = null;
  #onChange: Callback | null = null;
  #onSnapshot: CallbackWithSnapshot | null = null;
  #width: number;
  #height: number;
  #prevSnapshot: DocumentSnapshot | null = null;
  #prevDelay: number = -1;
  #delay: number = 0;
  #lastSnapshot = 0;
  #snapshots: DocumentSnapshot[] = [];

  public constructor(width: number, height: number) {
    if (!width || !height || width <= 0 || height <= 0) {
      throw new Error('Width and height must be greater than 0');
    }

    this.#width = width;
    this.#height = height;
  }

  public static isRoot(target: any) {
    if (target instanceof Element) return target.tagName === 'root';
    if ('type' in target) return target.type === 'root';
    if ('tagName' in target) return target.tagName === 'root';

    return false;
  }

  public isEmpty() {
    return !this.root.children.length;
  }

  public set width(value: number) {
    if (value <= 0) {
      throw new Error('Width must be greater than 0');
    }

    this.#width = value;
    this._createSnapshot();
  }
  public get width() {
    return this.#width;
  }

  public set height(value: number) {
    if (value <= 0) {
      throw new Error('Height must be greater than 0');
    }

    this.#height = value;
    this._createSnapshot();
  }
  public get height() {
    return this.#height;
  }

  public set onChange(callback: Callback | null) {
    this.#onChange = callback;
  }

  public get onChange() {
    return this.#onChange;
  }

  public set onClose(callback: Callback | null) {
    this.#onClose = callback;
  }

  public get onClose() {
    return this.#onClose;
  }

  public set onSnapshot(callback: CallbackWithSnapshot | null) {
    this.#onSnapshot = callback;
  }

  public get onSnapshot() {
    return this.#onSnapshot;
  }

  public createTextNode(textContent: any): Element {
    const textNode = new Element(this, 'text', true);
    textNode.textContent = String(textContent ?? '');

    return textNode;
  }

  public createElement(tagName: Exclude<TagName, 'root'>): Element {
    return new Element(this, tagName);
  }

  public appendChild(child: Element) {
    return this.root.appendChild(child);
  }

  public append(parent: Element, child: Element) {
    parent.appendChild(child);
  }

  public remove(element: Element) {
    const parent = element.parentNode;
    if (parent) {
      parent.removeChild(element);
    }
  }

  public findChild(parent: Element, tagName: string): Element | null {
    return parent.children.find((child) => child.tagName === tagName) || null;
  }

  public findSiblings(element: Element): Element[] {
    return element.parentNode
      ? element.parentNode.children.filter((child) => child !== element)
      : [];
  }

  public insertBefore(newElement: Element, referenceElement: Element) {
    const parent = referenceElement.parentNode;
    if (parent) {
      const index = parent.children.indexOf(referenceElement);
      if (index !== -1) {
        parent.children.splice(index, 0, newElement);
      }
    }
    this._createSnapshot();
  }

  public insertAfter(newElement: Element, referenceElement: Element) {
    const parent = referenceElement.parentNode;
    if (parent) {
      const index = parent.children.indexOf(referenceElement);
      if (index !== -1) {
        parent.children.splice(index + 1, 0, newElement);
      }
    }
    this._createSnapshot();
  }

  public updateTextContent(element: Element, newTextContent: string) {
    element.textContent = newTextContent;
    this._createSnapshot();
  }

  public toJSON() {
    return this.root.toJSON();
  }

  public toString() {
    return this.root.toString();
  }

  public setDelay(delay: number) {
    this.#prevDelay = this.#delay;
    this.#delay = delay;
  }

  public close() {
    process.nextTick(() => this.#onClose?.());
  }

  public clearSnapshots() {
    this.#snapshots = [];
    this.#lastSnapshot = 0;
  }

  public getSnapshots(): DocumentSnapshot[] {
    return this.#snapshots.sort((a, b) => a.id - b.id);
  }

  public captureSnapshot(): DocumentSnapshot {
    this.#prevSnapshot = new DocumentSnapshot(
      this,
      this.toJSON(),
      this.#delay
    ).setId(this.#lastSnapshot++);

    this.#snapshots.push(this.#prevSnapshot);

    return this.#prevSnapshot;
  }

  private _createSnapshot() {
    this.#onChange?.();

    const snapshot = this.toJSON();

    if (Object.is(snapshot, this.#prevSnapshot)) {
      if (this.#prevDelay === this.#delay) return;
    }

    const snap = this.captureSnapshot();

    this.#onSnapshot?.(snap);
  }

  public setInterval(callback: Callback, delay: number) {
    this.setDelay(delay);
    return setInterval(callback, 0);
  }

  public clearInterval(id: number | NodeJS.Timeout) {
    this.setDelay(0);
    return clearInterval(id);
  }

  public setTimeout(callback: Callback, delay: number) {
    this.setDelay(delay);
    return setTimeout(callback, 0);
  }

  public clearTimeout(id: number | NodeJS.Timeout) {
    return clearTimeout(id);
  }
}

export class DocumentSnapshot {
  #id = -1;

  constructor(
    private readonly document: Document,
    public readonly tree: ElementJSON,
    public readonly delay: number
  ) {}

  public get width() {
    return this.document.width;
  }

  public get height() {
    return this.document.height;
  }

  public get id() {
    return this.#id;
  }

  public setId(id: number) {
    if (this.#id !== -1) throw new Error('Snapshot ID is already set');
    this.#id = id;
    return this;
  }

  public isEmpty() {
    if (typeof this.tree === 'string') return this.tree.length === 0;

    return this.tree.children.length === 0;
  }

  public toJSON() {
    return {
      width: this.width,
      height: this.height,
      delay: this.delay,
      tree: this.tree,
    };
  }

  public toString() {
    return `<DocumentSnapshot width=${this.width} height=${this.height} delay=${this.delay} />`;
  }
}
