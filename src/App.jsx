import { useState, useEffect } from "react";
import "./App.css";
import blockdata from "./assets/data.json";

const url = "https://blockstream.info/liquid";

function Block({ block }) {
  let extra = {
    false: { cls: "inactive", icon: "." },
    true: { cls: "active", icon: "✓" },
  };
  const title = `Block height: ${block.height} - version 0x${block.versionhex}`;
  const active = block.simplicity;
  return (
    <a
      href={`${url}/block/${block.hash}`}
      target="_blank"
      title={title}
      className={"block " + extra[active].cls}
    >
      {block.height}
      {/* {extra[active].icon} */}
    </a>
  );
}

function Blocks({ blocks }) {
  return blocks.map((block) => <Block key={block.hash} block={block}></Block>);
}

function Card({ title, value }) {
  return (
    <div className="card">
      <p className="card-title">{title}</p>
      <p className="card-value">{value}</p>
    </div>
  );
}

function processBlocks(blocks) {
  let processed = {};

  for (const block of blocks) {
    const versionhex = block.version.toString(16);
    processed[block.height] = {
      hash: block.id,
      height: block.height,
      version: block.version,
      versionhex,
      simplicity: versionhex === "20200000",
    };
  }

  return processed;
}

async function fetchBlocks(start) {
  console.log("fetchblocks", start);
  const response = await fetch(
    `https://blockstream.info/liquid/api/blocks/${start}`
  );

  const blocks = await response.json();
  return processBlocks(blocks);
}

async function checkHeight(last, blocks, setBlocks) {
  console.log("check for newer tip than", last);
  const response = await fetch(
    "https://blockstream.info/liquid/api/blocks/tip/height"
  );
  const tip = await response.json();
  const behind = tip - last;
  if (behind > 0) {
    console.log("behind", behind);
    const newBlocks = await fetchBlocks(start);
    setBlocks({ ...blocks, ...newBlocks });
  } else {
    console.log("no update needed");
  }
}

function App() {
  const [deploymentInfo, setDeploymentInfo] = useState(blockdata.deployments);
  const [blocks, setBlocks] = useState(blockdata.blocks);
  const showBlocks = Object.values(blocks).reverse().slice(0, 1500);
  const keys = Object.keys(blocks);
  const height = keys[keys.length - 1];
  const hash = blocks[height].hash;

  const { deployments } = deploymentInfo;
  const { simplicity } = deployments;
  const { bip9 } = simplicity;
  const stats = bip9.statistics;

  // useEffect(() => {
  //   const interval = setInterval(
  //     () => checkHeight(height, showBlocks, setBlocks),
  //     60000
  //   );
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div>
      <h1>SIMPLICITY Signalling Tracker</h1>
      <a href="#" onClick={(e) => checkHeight(height, blocks, setBlocks)}>
        check height
      </a>
      <p>
        Liquid chain height:{" "}
        <a href={`${url}/block/${hash}`} target="_blank">
          {height}
        </a>
      </p>
      <p>Simplicity BIP-9 deployment: </p>
      <Card title="Active" value={simplicity.active.toString()}></Card>
      <Card title="Status" value={bip9.status}></Card>
      <Card title="Period" value={stats.period}></Card>
      <Card title="Since" value={bip9.since}></Card>
      <Card title="Elapsed" value={stats.elapsed}></Card>
      <Card title="Count" value={stats.count}></Card>
      <Card title="Threshold" value={stats.threshold}></Card>
      <Card title="Possible" value={stats.possible.toString()}></Card>

      <p>Last {showBlocks.length} blocks</p>
      <Blocks blocks={showBlocks}></Blocks>
    </div>
  );
}

export default App;
