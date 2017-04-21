const fs = require('fs');
const fetch = require('node-fetch');

const fileName = 'graph.json';
const coolTime = 500; // Delay for next fetch
const skip = parseInt(process.argv[2] || '0');

const graphFile = fs.readFileSync(fileName, 'utf-8');
const graph = JSON.parse(graphFile).reverse();

main();
async function main() {

  for (const item of graph) {
    if (item.id > skip) {
      await upload(item);
    }
  }

}

async function upload(openGraph) {

  for (const key of Object.keys(openGraph)) {
    const value = openGraph[key];
    if (typeof value === 'string' && value.length > 8190) {
      console.warn(`💧 Upload failed because ${key} is too long.\t${openGraph['og:url']}`);
      return;
    }
  }

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
    fs.writeFileSync('error.html', await response.text());
    throw new Error(`🚨 Error response is given! see error.html`);
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
