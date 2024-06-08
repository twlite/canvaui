"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const index_js_1 = require("../dist/index.js");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
function Component() {
    const document = (0, index_js_1.useDocument)();
    (0, react_1.useEffect)(() => {
        console.log(document.toString()); // <root><div>...</div></root>
        document.close(); // close the document
    }, []);
    return (react_1.default.createElement(index_js_1.View, { className: "flex flex-col w-full h-full items-center justify-center bg-white" },
        react_1.default.createElement(index_js_1.View, { className: "bg-gray-50 flex w-full" },
            react_1.default.createElement(index_js_1.View, { className: "flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8" },
                react_1.default.createElement(index_js_1.Heading, { level: 2, className: "flex flex-col text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-left" },
                    react_1.default.createElement(index_js_1.Text, null, "Ready to dive in?"),
                    react_1.default.createElement(index_js_1.Text, { className: "text-indigo-600" }, "Start your free trial today.")),
                react_1.default.createElement(index_js_1.View, { className: "mt-8 flex md:mt-0" },
                    react_1.default.createElement(index_js_1.View, { className: "flex rounded-md shadow" },
                        react_1.default.createElement(index_js_1.Text, { className: "flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white" }, "Get started")),
                    react_1.default.createElement(index_js_1.View, { className: "ml-3 flex rounded-md shadow" },
                        react_1.default.createElement(index_js_1.Text, { className: "flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600" }, "Learn more")))))));
}
function renderFrames() {
    return new Promise((resolve) => {
        const { document, render } = (0, index_js_1.createDocument)(800, 400);
        document.onClose = async () => {
            resolve(document.getSnapshots().filter((snap) => !snap.isEmpty()));
            await (0, promises_1.writeFile)('./output/rendered.html', document.toString());
        };
        render(react_1.default.createElement(Component, null));
    });
}
async function main() {
    const frames = await renderFrames();
    const svgs = await (0, index_js_1.renderToSvgString)(frames, {
        fonts: [
            {
                name: 'Geist',
                data: (0, fs_1.readFileSync)('./geist.ttf'),
            },
        ],
        embedFont: true,
    });
    await Promise.all(svgs.map(({ svg }, i) => (0, promises_1.writeFile)(`./output/${i}.svg`, svg)));
}
main();
