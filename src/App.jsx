import { useState } from "react";
import "./App.css";
import blocks from "./assets/blocks.json";

function Block({ block }) {
  const version = block.version.toString(16);
  let active = version === "20200000";
  let extra = {
    false: { cls: "inactive", icon: "x" },
    true: { cls: "active", icon: "✓" },
  };
  const url = `https://blockstream.info/liquid/block/${block.id}`
  const title = `Block height: ${block.height} - version 0x${block.version.toString(16)}`
  return (
    <a href={url} target="_blank" title={title} className={"block " + extra[active].cls}>{extra[active].icon}</a>
  );
}

function Blocks({ blocks }) {
  return blocks.map((block) => <Block key={block.id} block={block}></Block>);
}

function App() {
  return (
    <div>
      <h1>SIMPLICITY Signalling Tracker</h1>
      <p>Current Liquid tip: </p>
      <p>Simplicity BIP-9 deployment status: </p>
      <p>Signalling period: 10080 blocks (1 week)</p>
      <p>Signalling threshold: 100% required to lock-in</p>
      <p>Last 10080 blocks</p>
      <Blocks blocks={blocks}></Blocks>
    </div>
  );
}

export default App;
