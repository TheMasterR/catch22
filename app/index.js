const http = require('http');
const fetch = require("node-fetch");
const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

require('dotenv').config();

const config = {
    "PRIVATE_TOKEN": process.env.PRIVATE_TOKEN,
    "GITLAB_HOST": process.env.GITLAB_HOST,
    "GITLAB_API_VERSION": 4,
    "PROJECT_ID": 259
};

const get = async url => {
    try {
        const response = await fetch(url, {
            method: 'get',
            headers: { 'Content-Type': 'application/json', 'PRIVATE-TOKEN': config.PRIVATE_TOKEN },
        });
        const json = await response.json();
        return json;
        // console.log(json);
    } catch (error) {
        console.log(error);
    }
}

http.createServer((req, res) => {
    res.write(`${JSON.stringify(req.headers)}`);
    res.end();
}).listen(8080);


// (async () => {
//     const json = await get(`https://gitlab.bannersnack.net/api/v4/projects/${config.PROJECT_ID}/pipelines/?per_page=10&ref=tst`);
//     console.log(json)
// })();
