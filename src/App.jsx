import { useState, useEffect } from "react";
import "./App.css";
import Logo from "./Logo";
import Loading from "./Loading";

const url = "https://blockstream.info/liquid";
const NUM_TO_SHOW = 150;

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
      <p className="height">{block.height}</p>
    </a>
  );
}

function Blocks({ blocks, loading }) {
  return (
    <div>
      <p>Latest Blocks {<Loading size={24} show={loading} />}</p>
      {blocks.map((block) => (
        <Block key={block.hash} block={block} />
      ))}
    </div>
  );
}

function Card({ title, value, info }) {
  const loading = <Loading size={24} show={true} />;
  return (
    <div className="card">
      <p className="card-title" title={info}>
        {title}
      </p>
      <p className="card-value">
        {value !== null ? value.toString() : loading}
      </p>
    </div>
  );
}

function processBlock(block) {
  const versionhex = block.version.toString(16);
  return {
    hash: block.id,
    height: parseInt(block.height),
    version: block.version,
    versionhex,
    simplicity: versionhex === "20200000",
  };
}

function Intro() {
  return (
    <p>
      <a href="https://blockstream.com/simplicity.pdf" target="_blank">
        Simplicity
      </a>{" "}
      is a typed, combinator-based, functional language without loops or
      recursion. It is formally specified, and can be statically analyzed with
      upper bounds on computation resources prior to execution. Simplicity has
      the desirable property of being Turing incomplete, but can express any
      finitary function.{" "}
      <strong>
        Simplicity is the next generation in smart contract scripting.
      </strong>
    </p>
  );
}

function Bip9({ simplicity }) {
  const {
    active,
    bip9: {
      status,
      since,
      statistics: { period, elapsed, count, threshold, possible },
    },
  } = simplicity;
  return (
    <div>
      <p>Simplicity BIP-9 deployment</p>
      <Card
        title="Active"
        value={active}
        info="Is Simplicity active yet?"
      ></Card>
      <Card
        title="Status"
        value={status}
        info="The BIP-9 status of the Simplicity deployment"
      ></Card>
      <Card
        title="Period"
        value={period}
        info="The number of blocks of each signalling period"
      ></Card>
      <Card
        title="Since"
        value={since}
        info="The block height at which this status started"
      ></Card>
      <Card
        title="Elapsed"
        value={elapsed}
        info="How many blocks have elapsed in this period"
      ></Card>
      <Card
        title="Count"
        value={count}
        info="How many blocks have signalled in this period"
      ></Card>
      <Card
        title="Threshold"
        value={threshold}
        info="How many blocks are required to signal in the period"
      ></Card>
      <Card
        title="Possible"
        value={possible}
        info="Is it still possible to activate in this period?"
      ></Card>
    </div>
  );
}

function Height({ tip }) {
  const { height, hash } = tip;
  const link = (
    <a href={`${url}/block/${hash}`} target="_blank">
      {height}
    </a>
  );
  return (
    <p>
      Chain height: {tip.height ? link : "       "}{" "}
      <Loading size={24} show={!tip.height} />
    </p>
  );
}

function App() {
  const [tip, setTip] = useState({ height: null, hash: null });
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simplicity, setSimplicity] = useState({
    type: "bip9",
    active: null,
    bip9: {
      bit: 21,
      start_time: 3333333,
      timeout: 9223372036854776000,
      min_activation_height: 0,
      status: "started",
      since: 3336480,
      status_next: "started",
      statistics: {
        period: 10080,
        elapsed: null,
        count: null,
        threshold: 10080,
        possible: null,
      },
    },
  });

  // init
  useEffect(() => {
    console.log("init");
    setLoading(true);
    // bip-9
    fetch("/.netlify/functions/deployment")
      .then((r) => r.json())
      .then((data) => setSimplicity(data.simplicity))
      .catch((e) => console.error("Error fetching deployment:", e));

    // most recent 10 blocks
    fetch("https://blockstream.info/liquid/api/blocks/tip")
      .then((r) => r.json())
      .then((b) => {
        const height = b[0].height;
        const hash = b[0].id;
        setTip({ height, hash });
        const initBlocks = [...blocks, ...b.map(processBlock)];
        setBlocks(initBlocks);
        return { height, initBlocks };
      })
      .then(({ height, initBlocks }) => {
        //
        let allBlocks = [...initBlocks];
        for (
          let start = height - 10;
          start > height - NUM_TO_SHOW;
          start -= 10
        ) {
          fetch(`https://blockstream.info/liquid/api/blocks/${start}`)
            .then((r) => r.json())
            .then((b) => {
              allBlocks = [...allBlocks, ...b.map(processBlock)];
              setBlocks(allBlocks);
            })
            .then(() => setLoading(false));
        }
      })
      .catch((e) => {
        console.error("Error fetching deployment:", e);
        setLoading(false);
      });
  }, []);

  // // interval
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     console.log("interval check height");
  //     checkHeight(blocks, setBlocks, setLoading);
  //   }, 60000);
  //   return () => clearInterval(interval);
  // }, [blocks]);

  return (
    <div>
      <Logo />
      <Intro />
      <h2>BIP-9 signalling on The Liquid Network</h2>
      <Height tip={tip} />
      <Bip9 simplicity={simplicity} />
      <Blocks tip={tip} blocks={blocks} loading={loading}></Blocks>
      <footer>
        <p>
          <a
            href="https://github.com/delta1/simplicity-tracker"
            target="_blank"
          >
            source code
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
