import fs from 'fs'

function getRandomInt() {
  const min = 1
  const max = 0xFFFFFFFF
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const url = process.env.RPC_URL
const user = "tracker"
const password = process.env.RPC_PASSWORD

async function getdeploymentinfo() {
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": "Basic " + btoa(`${user}:${password}`)
    },
    body: JSON.stringify({jsonrpc: "2.0", method: "getdeploymentinfo", params: [], id: getRandomInt() })
  });

  const {result} = await r.json();
  console.log(result.height, result.deployments["simplicity"]);
  return result;
}

async function process_from(start_height) {
  let ret = {}
  console.log("fetch: ", start_height)
  let response = await fetch(`https://blockstream.info/liquid/api/blocks/${start_height}`)
  let blocks = await response.json()
  // console.log("process: ", blocks)
  for (const block of blocks) {
    if (block && block.height) {
      const versionhex = block.version.toString(16)
      ret[block.height] = {
        hash: block.id,
        height: block.height,
        version: block.version,
        versionhex,
        simplicity: versionhex === "20200000"
      }
    } else {
      console.error(block)
    }
  }
  return ret
}

async function go() {
  let data = JSON.parse(fs.readFileSync('src/assets/data.json', 'utf8'));
  let keys = Object.keys(data.blocks)
  let last_tip = parseInt(keys[keys.length - 1])
  console.log('last tip', last_tip, typeof (last_tip))

  data["deployments"] = await getdeploymentinfo();
  console.log('write', data["deployments"])

  const response = await fetch('https://blockstream.info/liquid/api/blocks/tip/height')
  const tip = await response.json()
  if (tip > last_tip) {
    const behind = tip - last_tip
    console.log("blocks behind: ", behind)
    for (let start_height = last_tip + 10; start_height < tip; start_height += 10) {
      console.log("start_height", start_height)
      const newblocks = await process_from(start_height)
      data.blocks = { ...data.blocks, ...newblocks }
    }
    console.log("last step", data)
    const newblocks = await process_from(tip)
    data.blocks = { ...data.blocks, ...newblocks }
  }
  // only keep the last 10080
  keys = Object.keys(data.blocks)
  last_tip = parseInt(keys[keys.length - 1])
  let keep_until = last_tip - 10080
  for (let i = keep_until - 1; i > 0; i--) {
    if (data.blocks[i]) delete data.blocks[i]
  }
  //
  fs.writeFileSync('src/assets/data.json', JSON.stringify(data), 'utf8')
  console.log('done', Object.keys(data.blocks).length)
}


go()
