const fs = require('fs');
const fetch = require('node-fetch');

const fileName = 'graph.json';
const coolTime = 500; // Delay for next fetch

const graphFile = fs.readFileSync(fileName, 'utf-8');
const graph = JSON.parse(graphFile).reverse();

main();
async function main() {

  for (const item of graph) {
    await upload(item);
  }

}

async function upload(openGraph) {

  const body = {
    ogp: JSON.stringify(openGraph)
  };

  const response = await fetch('https://www.feeles.com/api/v1/products', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    console.error(`🚨 Error response is given`, response);
    throw new Error(await response.text());
  }
  const text = await response.text();
  try {
    const product = JSON.parse(text);
    console.info(`⚡️ Upload success! ${product.url}`);
  } catch (e) {
    console.error(`🚨 Parse error`);
    console.error(text);
    throw e;
  }
}
