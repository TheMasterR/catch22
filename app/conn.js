const fetch = require("node-fetch");
const config = require("./config");

const get = async url => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "PRIVATE-TOKEN": config.PRIVATE_TOKEN
      }
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.log(error);
  }
};

const post = async (url, body) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PRIVATE-TOKEN": config.PRIVATE_TOKEN
      },
      body: body
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.log(error);
  }
};

const del = async url => {
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "PRIVATE-TOKEN": config.PRIVATE_TOKEN
      }
    });
    const res = await response.text();
    return res;
  } catch (error) {
    console.log(error);
    return {};
  }
};

module.exports = {
  get,
  post,
  del
};
