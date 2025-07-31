import { useState, useEffect, useRef } from "react";
import "./App.css";
import Logo from "./Logo";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";
import CircularTimer from "./CircularTimer";

const url = "https://blockstream.info/liquid";
const NUM_TO_SHOW = 60;
const UPDATE_SECS = 60;

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

function Blocks({ blocks, loading, timer }) {
  return (
    <div>
      <p>
        Latest blocks{" "}
        {loading ? (
          <Loading size={24} show={loading} />
        ) : (
          <CircularTimer timer={timer} maxTime={60} size={22} />
        )}
      </p>
      <div className="blocks">
        {blocks.map((block) => (
          <Block key={block.hash} block={block} />
        ))}
      </div>
    </div>
  );
}

function Card({ title, value, info = "" }) {
  const loading = <Loading size={24} show={true} />;
  // console.log(value, typeof value);
  return (
    <div className="card">
      <p className="card-title" title={info}>
        {title}
      </p>
      <p className="card-value">{value ? value : loading}</p>
    </div>
  );
}

function keepUnique(blocks) {
  return Array.from(
    new Map(blocks.map((block) => [block.hash, block])).values()
  ).sort((a, b) => b.height - a.height);
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
    <div>
      <p>
        <a href="https://simplicity-lang.org" target="_blank">
          Simplicity
        </a>{" "}
        is a typed, combinator-based, functional language without loops or
        recursion. It is formally specified, and can be statically analyzed with
        upper bounds on computation resources prior to execution. Simplicity has
        the desirable property of being Turing incomplete, but can express any
        finitary function.{" "}
      </p>
      <p>
        <strong>
          Simplicity is the next generation in smart contract scripting.
        </strong>
      </p>
    </div>
  );
}

function Bip9({ simplicity }) {
  const {
    active,
    bip9: { status, since },
  } = simplicity;

  const statistics = simplicity.bip9.statistics || {
    period: null,
    elapsed: null,
    count: null,
  };
  const height = 3_477_600;
  const link = (
    <a
      href="https://blockstream.info/liquid/block/0bb176dc0a6a41833d0be504a3ea89fdd7e1c01b6db8e95a1be0de6e01c3fd8b"
      target="_blank"
    >
      {height.toLocaleString()}
    </a>
  );

  return (
    <div>
      <p>
        <strong>Simplicity BIP-9 deployment</strong>
      </p>
      <Card
        title="Active"
        value={active && active.toLocaleString()}
        info="Is Simplicity active yet?"
      ></Card>
      <Card
        title="Status"
        value={status && status.toLocaleString()}
        info="The BIP-9 status of the Simplicity deployment"
      ></Card>
      <Card
        title="Since"
        value={link}
        info="The block height at which this status started"
      ></Card>
    </div>
  );
}

function Height({ tip }) {
  const { height, hash } = tip;
  const activation_height = 3_477_600;
  const blocks = activation_height - tip.height;
  const link = (
    <a href={`${url}/block/${hash}`} target="_blank">
      {height && height.toLocaleString()}
    </a>
  );
  return (
    <div>
      <p>
        Liquid chain height: {tip.height ? link : ""}
        <Loading size={24} show={!tip.height} />
      </p>
      <p>
        Simplicity has been active for <strong>{Math.abs(blocks)}</strong>{" "}
        blocks since height{" "}
        <a
          href="https://blockstream.info/liquid/block/0bb176dc0a6a41833d0be504a3ea89fdd7e1c01b6db8e95a1be0de6e01c3fd8b"
          target="_blank"
        >
          {activation_height.toLocaleString()}
        </a>
      </p>
    </div>
  );
}

function App() {
  const [tip, setTip] = useState({
    height: null,
    hash: null,
  });
  const [blocks, setBlocks] = useState([]);
  const [timer, setTimer] = useState(UPDATE_SECS);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const simplicity = {
    type: "bip9",
    height: 3477600,
    active: true,
    bip9: {
      start_time: 3333333,
      timeout: 9223372036854776000n,
      min_activation_height: 0,
      status: "active",
      since: 3477600,
      status_next: "active",
    },
  };

  const blocksRef = useRef(blocks);

  // Update ref when blocks change
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const doUpdate = async () => {
    try {
      console.log("updating");
      setLoading(true);

      // most recent 10 blocks
      const request = await fetch(
        "https://blockstream.info/liquid/api/blocks/tip"
      );
      const response = await request.json();
      const height = response[0].height;
      const hash = response[0].id;
      setTip({ height, hash });

      let allBlocks = keepUnique([
        ...blocksRef.current,
        ...response.map(processBlock),
      ]);
      setBlocks(allBlocks);

      for (let start = height - 10; start > height - NUM_TO_SHOW; start -= 10) {
        if (!allBlocks.map((b) => b.height).includes(start)) {
          const blocksreq = await fetch(
            `https://blockstream.info/liquid/api/blocks/${start}`
          );
          const blocksresponse = await blocksreq.json();
          allBlocks = keepUnique([
            ...allBlocks,
            ...blocksresponse.map(processBlock),
          ]);
          setBlocks(allBlocks);
        }
      }

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
      setError("Something went wrong.");
    }
  };

  // init
  useEffect(() => {
    async function update() {
      await doUpdate();
    }
    update();
  }, []);

  // // interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          // do update
          async function update() {
            await doUpdate();
          }
          update();
          return UPDATE_SECS;
        }
        return (prev -= 1);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <ErrorMessage message={error} />
      <Logo />
      <Intro />
      <h4>
        Simplicity is <strong>{simplicity.bip9.status.toUpperCase()}</strong> on
        The Liquid Network
      </h4>
      <Height tip={tip} />
      <Bip9 simplicity={simplicity} />
      <Blocks blocks={blocks} loading={loading} timer={timer}></Blocks>
      <footer>
        <ul>
          <li>
            <a href="https://simplicity-lang.org" target="_blank">
              simplicity-lang.org
            </a>
          </li>
          <li>
            <a href="https://blockstream.com/simplicity.pdf" target="_blank">
              simplicity.pdf
            </a>
          </li>
          <li>
            <a href="https://research.blockstream.com" target="_blank">
              research.blockstream.com
            </a>
          </li>
          <li>
            <a href="https://blockstream.com" target="_blank">
              blockstream.com
            </a>
          </li>
        </ul>
      </footer>
      <p className="source">
        source code @&nbsp;
        <a href="https://github.com/delta1/simplicity-tracker" target="_blank">
          delta1/simplicity-tracker
        </a>
      </p>
    </div>
  );
}

export default App;
