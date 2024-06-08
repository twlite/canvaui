import { setTimeout as setTimeoutNative } from 'node:timers';
import createReconciler from 'react-reconciler';
import satori, { type SatoriOptions } from 'satori';
import { Callback, Document, DocumentSnapshot } from './dom/document.js';

import type { Element } from './dom/element.js';
import * as React from 'react';
import { createAsyncContext, useAsyncContext } from './async-context.js';

const DocumentContext = createAsyncContext<Document | null>(null);

/**
 * Hook to get the current document instance.
 */
export function useDocument() {
  const document = useAsyncContext(DocumentContext);

  if (!document) {
    throw new Error('useDocument must be called inside a component');
  }

  return document;
}

/**
 * Custom interval function that execute immediately without delay.
 * @param callback The callback function to execute
 * @param delay The delay in milliseconds
 */
export function setInterval(callback: Callback, delay: number) {
  const document = useDocument();
  return document.setInterval(callback, delay);
}

/**
 * Clear the interval timer.
 * @param id The interval timer ID
 */
export function clearInterval(id: number) {
  const document = useDocument();
  return document.clearInterval(id);
}

/**
 * Custom timeout function that execute immediately without delay.
 * @param callback The callback function to execute
 * @param delay The delay in milliseconds
 */
export function setTimeout(callback: Callback, delay: number) {
  const document = useDocument();
  return document.setTimeout(callback, delay);
}

/**
 * Clear the timeout.
 * @param id The timeout ID
 */
export function clearTimeout(id: number) {
  const document = useDocument();
  return document.clearTimeout(id);
}

/**
 * Create a new document instance and the component renderer.
 * @param width The width of the document
 * @param height The height of the document
 */
export function createDocument(width: number, height: number) {
  const document = new Document(width, height);

  const Reconciler = createReconciler<
    Element,
    any,
    Element,
    Element,
    Element,
    Element,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown
  >({
    supportsMicrotasks: true,
    scheduleMicrotask(fn) {
      queueMicrotask(fn);
    },
    createInstance(type, props, rootContainer, hostContext, internalHandle) {
      const el = document.createElement(type as any);

      for (const [key, value] of Object.entries(props)) {
        el.attributes.setAttribute(key as string, value as string);
      }

      return el;
    },
    createTextInstance(text, rootContainer, hostContext, internalHandle) {
      return document.createTextNode(text);
    },
    appendChildToContainer(container, child) {
      container.appendChild(child);
    },
    appendChild(parentInstance, child) {
      parentInstance.appendChild(child);
    },
    appendInitialChild(parentInstance, child) {
      parentInstance.appendChild(child);
    },
    removeChildFromContainer(container, child) {
      container.removeChild(child);
    },
    removeChild(parentInstance, child) {
      parentInstance.removeChild(child);
    },
    insertInContainerBefore(container, child, beforeChild) {
      container.document.insertBefore(child, beforeChild);
    },
    insertBefore(parentInstance, child, beforeChild) {
      parentInstance.document.insertBefore(child, beforeChild);
    },
    prepareUpdate(
      instance,
      type,
      oldProps,
      newProps,
      rootContainer,
      hostContext
    ) {
      const payload = { instance, oldProps, newProps };
      return payload;
    },
    prepareForCommit(containerInfo) {
      return null;
    },
    preparePortalMount(containerInfo) {
      return null;
    },
    prepareScopeUpdate(scopeInstance, instance) {
      return null;
    },
    afterActiveInstanceBlur() {},
    beforeActiveInstanceBlur() {},
    cancelTimeout(id) {
      clearTimeout(id as number);
    },
    detachDeletedInstance(node) {
      document.remove(node);
      return null;
    },
    finalizeInitialChildren(instance, type, props, rootContainer, hostContext) {
      return false;
    },
    getChildHostContext(parentHostContext, type, rootContainer) {
      return parentHostContext;
    },
    getCurrentEventPriority() {
      return 0;
    },
    getInstanceFromNode(node) {
      return node;
    },
    getInstanceFromScope(scopeInstance) {
      return scopeInstance;
    },
    getPublicInstance(instance) {
      return instance;
    },
    getRootHostContext(rootContainer) {
      return null;
    },
    scheduleTimeout(fn, delay) {
      return setTimeoutNative(fn, delay);
    },
    shouldSetTextContent(type, props) {
      return false;
    },
    resetTextContent(instance) {
      instance.textContent = '';
    },
    resetAfterCommit(containerInfo) {},
    clearContainer(container) {
      container.children = [];
    },
    commitTextUpdate(textInstance, oldText, newText) {
      textInstance.textContent = newText;
    },
    commitUpdate(
      instance,
      updatePayload,
      type,
      prevProps,
      nextProps,
      internalHandle
    ) {
      for (const [key, value] of Object.entries(nextProps)) {
        if (typeof key !== 'string') continue;
        instance.attributes.setAttribute(key, value as string);
      }
    },
    commitMount(instance, type, newProps, internalHandle) {},
    isPrimaryRenderer: true,
    noTimeout: -1,
    supportsHydration: false,
    supportsMutation: true,
    supportsPersistence: false,
  });

  /**
   * Render the component to the document.
   * @param element The component to render
   */
  function render(element: React.ReactNode) {
    return DocumentContext.provide(document, () => {
      // @ts-ignore
      const container = Reconciler.createContainer(document.root, false, false);
      Reconciler.updateContainer(element, container, null);
    });
  }

  return {
    render,
    document,
  };
}

export type ErrorBoundaryProps = React.PropsWithChildren<{
  onError?: (error: Error) => void;
  fallback?: (error: Error) => React.ReactNode;
}>;

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { error: Error | null }
> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  public static getDerivedStateFromError(error: Error) {
    return { error };
  }

  public componentDidCatch(error: Error) {
    this.setState({ error });

    const { onError } = this.props;

    if (onError) return onError(error);

    console.error(`Caught Error [ErrorBoundary]: ${error.message}`);
  }

  public render() {
    if (this.state.error) {
      return (
        this.props.fallback?.(this.state.error) ??
        React.createElement('pre', null, this.state.error?.message)
      );
    }

    return this.props.children;
  }
}

export interface SvgString {
  svg: string;
  delay: number;
  id: number;
  width: number;
  height: number;
}

function resolveSnaps(
  document: Document | DocumentSnapshot | DocumentSnapshot[]
): DocumentSnapshot[] {
  if (document instanceof Document) {
    return document.getSnapshots();
  }

  if (document instanceof DocumentSnapshot) {
    return [document];
  }

  return document;
}

/**
 * Render the document to SVG string
 * @param document The document to render
 * @param options The options to render the document
 * @returns The SVG string array
 */
export async function renderToSvgString(
  document: Document | DocumentSnapshot | DocumentSnapshot[],
  options: Omit<SatoriOptions, 'width' | 'height'>
): Promise<SvgString[]> {
  const snaps = resolveSnaps(document);

  return Promise.all(
    snaps.map(async ({ width, height, tree, delay, id }) => {
      const element = (
        Document.isRoot(tree) ? (tree as any).children : tree
      ) as React.ReactNode;

      const node = Array.isArray(element)
        ? element.length > 1
          ? element
          : element[0]
        : element;

      const svg = await satori(node, {
        ...options,
        width,
        height,
      });

      return {
        svg,
        delay,
        id,
        width,
        height,
      } satisfies SvgString;
    })
  );
}

export async function renderToCanvasRenderingContext2d(
  document: Document | DocumentSnapshot | DocumentSnapshot[],
  ctx: CanvasRenderingContext2D
) {
  const _snaps = resolveSnaps(document);

  throw new Error('Not implemented');
}

export function View(
  props: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
) {
  if (['string', 'number'].includes(typeof props.children)) {
    throw new Error('Text content must be rendered inside a Text element');
  }

  return React.createElement('div', props);
}

export function Text(
  props: React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>
) {
  return React.createElement('span', props);
}

export function Image(
  props: React.PropsWithChildren<React.HTMLAttributes<HTMLImageElement>>
) {
  return React.createElement('img', props);
}

export function Heading(
  props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>> & {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  }
) {
  return React.createElement(`h${props.level}`, props);
}

export function Paragraph(
  props: React.PropsWithChildren<React.HTMLAttributes<HTMLParagraphElement>>
) {
  return React.createElement('p', props);
}

export function HorizontalRule(props: React.HTMLAttributes<HTMLHRElement>) {
  return React.createElement('hr', props);
}

export type {
  Font,
  FontStyle,
  FontWeight,
  Locale,
  SatoriNode,
  SatoriOptions,
} from 'satori';
