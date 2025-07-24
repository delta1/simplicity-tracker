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

function Card({ title, value, info }) {
  const loading = <Loading size={24} show={true} />;
  // console.log(value, typeof value);
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

function keepUnique(blocks) {
  return Array.from(
    new Map(blocks.map((block) => [block.hash, block])).values()
  ).sort((a, b) => b.height - a.height);
}

function blocksToTimeframe(blocks) {
  if (blocks <= 0) return "now";

  const futureDate = new Date("2025-07-31T02:38:57Z");
  const now = new Date();
  const diffMs = futureDate.getTime() - now.getTime();
  const minutes = diffMs / (1000 * 60);
  const hours = minutes / 60;
  const days = hours / 24;
  const weeks = days / 7;
  const months = days / 30;
  const years = days / 365;

  if (minutes < 1) return "less than a minute";
  if (minutes < 2) return "~ a minute";
  if (minutes < 60) return `~ ${Math.floor(minutes)} minutes`;
  if (hours < 2) return "~ an hour";
  if (hours < 24) return `~ ${Math.floor(hours)} hours`;
  if (days < 2) return "~ a day";
  if (days < 14) return `~ ${Math.floor(days)} days`;
  if (weeks < 2) return "~ a week";
  if (weeks < 4) return `~ ${Math.floor(weeks)} weeks`;
  if (months < 2) return "~ a month";
  if (months < 12) return `~ ${Math.floor(months)} months`;
  if (years < 2) return "~ a year";
  return `~ ${Math.floor(years)} years`;
}

function blocksToDateTime(blocks) {
  if (blocks <= 0) return "now";

  const futureDate = new Date("2025-07-31T02:38:57Z");

  const dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  };

  return futureDate.toLocaleString(undefined, dateOptions);
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
      statistics: { period, elapsed, count },
    },
  } = simplicity;
  return (
    <div>
      <p>
        <strong>Simplicity BIP-9 deployment</strong>
      </p>
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
        title="Count"
        value={count && count.toLocaleString()}
        info="How many blocks have signalled in this period"
      ></Card>
      <Card
        title="Elapsed"
        value={elapsed && elapsed.toLocaleString()}
        info="How many blocks have elapsed in this period"
      ></Card>
      <Card
        title="Period"
        value={period && period.toLocaleString()}
        info="The number of blocks of each signalling period"
      ></Card>
      <Card
        title="Since"
        value={since && since.toLocaleString()}
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
    <>
      <p>
        Liquid chain height: {tip.height ? link : ""}
        <Loading size={24} show={!tip.height} />
      </p>
      <p>
        Simplicity activation in <strong>{blocks.toLocaleString()}</strong>{" "}
        blocks at height <strong>{activation_height.toLocaleString()}</strong>
      </p>
      <p>Expected: {blocksToDateTime(blocks)}</p>
    </>
  );
}

function App() {
  const [tip, setTip] = useState({ height: null, hash: null });
  const [blocks, setBlocks] = useState([]);
  const [timer, setTimer] = useState(UPDATE_SECS);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [simplicity, setSimplicity] = useState({
    type: "bip9",
    active: null,
    bip9: {
      bit: 21,
      start_time: 3333333,
      timeout: 9223372036854776000n,
      min_activation_height: 0,
      status: "started",
      since: 3336480,
      status_next: "started",
      statistics: {
        period: 10080,
        elapsed: null,
        count: null,
        possible: null,
      },
    },
  });

  const blocksRef = useRef(blocks);

  // Update ref when blocks change
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const doUpdate = async () => {
    try {
      console.log("updating");
      setLoading(true);
      // bip-9
      const deployment = await fetch("/.netlify/functions/deployment");
      const data = await deployment.json();
      setSimplicity(data.simplicity);

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

  // interval
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
