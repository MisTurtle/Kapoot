import React from "react";
import { createRoot } from "react-dom/client";

import HelloWorldComponent from "./components/HelloWorldComponent.js";

const domNode = document.getElementById("container");
const root = createRoot(domNode);
root.render(<HelloWorldComponent />);