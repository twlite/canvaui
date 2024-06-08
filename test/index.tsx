import React, { useEffect } from 'react';
import {
  createDocument,
  DocumentSnapshot,
  renderToSvgString,
  useDocument,
  Text,
  View,
  Heading,
} from '../dist/index.js';
import { writeFile } from 'fs/promises';
import { readFileSync } from 'fs';

function Component() {
  const document = useDocument();

  useEffect(() => {
    console.log(document.toString()); // <root><div>...</div></root>
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

function renderFrames() {
  return new Promise<DocumentSnapshot[]>((resolve) => {
    const { document, render } = createDocument(800, 400);

    document.onClose = async () => {
      resolve(document.getSnapshots().filter((snap) => !snap.isEmpty()));
      await writeFile('./output/rendered.html', document.toString());
    };

    render(<Component />);
  });
}

async function main() {
  const frames = await renderFrames();

  const svgs = await renderToSvgString(frames, {
    fonts: [
      {
        name: 'Geist',
        data: readFileSync('./geist.ttf'),
      },
    ],
    embedFont: true,
  });

  await Promise.all(
    svgs.map(({ svg }, i) => writeFile(`./output/${i}.svg`, svg))
  );
}

main();
