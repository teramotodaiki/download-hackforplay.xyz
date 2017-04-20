const fs = require('fs');
const fetch = require('node-fetch');

const fileName = 'graph.json';
const coolTime = 1000; // Delay for next fetch

let graphFile = '[]';
try {
  graphFile = fs.readFileSync(fileName, 'utf-8');
} catch (e) {}
const graph = JSON.parse(graphFile);

main();
async function main() {
  await download('https://hackforplay.xyz/api/stages');
  fs.writeFileSync(fileName, JSON.stringify(graph));
}

async function download(url) {
  const response = await fetch(url);
  console.info(`✅ download ${url}\tfinished!`);
  if (!response.ok) {
    console.error(`🚨 Error response is given`, response);
    console.error(await response.text());
    return;
  }
  const json = await response.text();
  const pagination = JSON.parse(json);

  for (const stage of pagination.data) {
    const {
      id,
      title,
      thumbnail,
      explain,
      user,
      source_id,
    } = stage;

    // キャッシュが存在するところまでやってきた
    if (graph.some(item => item.id === id)) {
      console.log(`Found id=${id}. See you!`, stage);
      return;
    };

    graph.push({
      id,
      'og:title': title || '',
      'og:type': 'website',
      'og:image': thumbnail,
      'og:description': explain,
      'og:author': user && user.nickname,
      'og:url': `https://hackforplay.xyz/s/?id=${id}`,
      'og:homepage': user && `https://hackforplay.xyz/m/?id=${user.id}`,
      'og:original': source_id && `https://hackforplay.xyz/s/?id=${source_id}`,
    });
  }

  // return next page
  if (pagination.next_page_url) {
    await new Promise((resolve, reject) => {
      setTimeout(resolve, coolTime);
    });
    await download(pagination.next_page_url);
  }
}
