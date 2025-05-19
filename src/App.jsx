import "./App.css";
import blockdata from "./assets/data.json";

const url = "https://blockstream.info/liquid"

function Block({ block }) {
  let extra = {
    false: { cls: "inactive", icon: "." },
    true: { cls: "active", icon: "✓" },
  };
  const title = `Block height: ${block.height} - version 0x${block.versionhex}`
  const active = block.simplicity
  return (
    <a href={`${url}/block/${block.hash}`} target="_blank" title={title} className={"block " + extra[active].cls}>{extra[active].icon}</a>
  );
}

function Blocks({ blocks }) {
  return blocks.map((block) => <Block key={block.hash} block={block}></Block>);
}

function Card({title, value}) {
  return <div className="card">
    <p class="card-title">{title}</p>
    <p class="card-value">{value}</p>
  </div>
}

function App() {
  const blocks = Object.values(blockdata.blocks).reverse().slice(0, 1500)
  console.log(blockdata)
  const {height, hash, deployments} = blockdata.deployments
  const {simplicity} = deployments
  console.log(simplicity)
  const {bip9} = simplicity
  const stats = bip9.statistics

  return (
    <div>
      <h1>SIMPLICITY Signalling Tracker</h1>
      <p>Liquid chain height: <a href={`${url}/block/${hash}`} target="_blank">{height}</a></p>
      <p>Simplicity BIP-9 deployment: </p>
      <Card title="Active" value={simplicity.active.toString()}></Card>
      <Card title="Status" value={bip9.status}></Card>
      <Card title="Period" value={stats.period}></Card>
      <Card title="Since" value={bip9.since}></Card>
      <Card title="Elapsed" value={stats.elapsed}></Card>
      <Card title="Count" value={stats.count}></Card>
      <Card title="Threshold" value={stats.threshold}></Card>
      <Card title="Possible" value={stats.possible.toString()}></Card>

      <p>Last {blocks.length} blocks</p>
      <Blocks blocks={blocks}></Blocks>
    </div>
  );
}

export default App;
