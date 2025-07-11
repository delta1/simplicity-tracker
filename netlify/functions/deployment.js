function getRandomInt() {
  const min = 1
  const max = 0xFFFFFFFF
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function handler(event, context) {
  try {
    const r = await fetch(process.env.RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Basic " + btoa(`${process.env.RPC_USER}:${process.env.RPC_PASSWORD}`)
      },
      body: JSON.stringify({ jsonrpc: "2.0", method: "getdeploymentinfo", params: [], id: getRandomInt() })
    });

    const { result } = await r.json();
    delete result.deployments.simplicity.bip9.signalling
    return {
      statusCode: 200,
      body: JSON.stringify({ height: result.height, simplicity: result.deployments.simplicity })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    }
  }
}
