# CanvaUI

A server side framework for creating images with React. It is built on top of [satori](https://github.com/vercel/satori) and supports React hooks, allowing you to create complex images with ease.

> **Note:** This project is still in development and is not ready for production use.

## Todo

- Render to `CanvasRenderingContext2D`

## Installation

```bash
npm install canvaui
```

## Usage

### The component

```jsx
import React, { useEffect } from 'react';
import { useDocument, View, Text, Heading } from 'canvaui';

function Component() {
  const document = useDocument();

  useEffect(() => {
    console.log(document.toString()); // <div>...</div>
    document.close(); // close the document
  }, []);

  return (
    <View className="flex flex-col w-full h-full items-center justify-center bg-white">
      <View className="bg-gray-50 flex w-full">
        <View className="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
          <Heading
            level={2}
            className="flex flex-col text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-left"
          >
            <Text>Ready to dive in?</Text>
            <Text className="text-indigo-600">
              Start your free trial today.
            </Text>
          </Heading>
          <View className="mt-8 flex md:mt-0">
            <View className="flex rounded-md shadow">
              <Text className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white">
                Get started
              </Text>
            </View>
            <View className="ml-3 flex rounded-md shadow">
              <Text className="flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600">
                Learn more
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
```

### The renderer

Snapshots are frames that are captured when there is a change in the document.

```jsx
import { createDocument, renderToSvgString } from 'canvaui';

// create a new document
const width = 800;
const height = 400;

const { document, render } = createDocument(width, height);

// 👂 Listen to close event
document.onClose = async () => {
  // get all frames that are not empty
  const frames = document.getSnapshots().filter((frame) => !frame.isEmpty());

  // render the document to svg string
  const svg = await renderToSvgString(frames, {
    // at least one font is required to render text
    fonts: [
      {
        name: 'FontName',
        data: FontBuffer,
      },
    ],
    // embed fonts in the svg
    embedFont: true,
  });

  // do something with the generated svg
  console.log(svg); // { svg: <svg>...</svg>, id: 1, delay: 0, width: 300, height: 300 }
};

// render the component to the document
render(<Component />);
```

#### Resulting SVG

![SVG](/test/output/0.svg)

## The `useDocument` hook

The `useDocument` hook is used to get the current CanvaUI document. This hook only works inside the component. However, this hook can be used conditionally.

```jsx
import { useDocument } from 'canvaui';

// get the current document
const document = useDocument();
```

## Using Timers

Usage of timers inside the component does work, however it takes time to render the document. CanvaUI provides custom timers that can be used to delay the rendering of the document. When using CanvaUI timers, the timers will be executed immediately without any delay while saving the delay metadata in the snapshots. These snapshots can be processed later to render the document with the correct delays.

The timer functions can only be used inside the component. Attempting to use them outside the component will result in an error. This behavior is similar to the react hooks, however you can use it conditionally.

```jsx
import { setTimeout, setInterval, clearTimeout, clearInterval } from 'canvaui';

// schedule an interval
const interval = setInterval(() => {
  console.log('Hello, World!');
}, 1000);

// clear the interval
clearInterval(interval);

// schedule a timeout
const timeout = setTimeout(() => {
  console.log('Hello, World!');
}, 1000);

// clear the timeout
clearTimeout(timeout);
```
