import "./App.css";
import blockdata from "./assets/data.json";

function Block({ block }) {
  let extra = {
    false: { cls: "inactive", icon: "." },
    true: { cls: "active", icon: "✓" },
  };
  const url = `https://blockstream.info/liquid/block/${block.hash}`
  const title = `Block height: ${block.height} - version 0x${block.versionhex}`
  const active = block.simplicity
  return (
    <a href={url} target="_blank" title={title} className={"block " + extra[active].cls}>{extra[active].icon}</a>
  );
}

function Blocks({ blocks }) {
  return blocks.map((block) => <Block key={block.hash} block={block}></Block>);
}

function App() {
  const blocks = Object.values(blockdata.blocks).reverse().slice(0, 1500)

  return (
    <div>
      <h1>SIMPLICITY Signalling Tracker</h1>
      <p>Current Liquid tip: </p>
      <p>Simplicity BIP-9 deployment status: </p>
      <p>Signalling period: 10080 blocks (1 week)</p>
      <p>Signalling threshold: 100% required to lock-in</p>
      <p>Last {blocks.length} blocks</p>
      <Blocks blocks={blocks}></Blocks>
    </div>
  );
}

export default App;
