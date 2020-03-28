const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const app = express();
const moment = require("moment");
const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms));

// load env
require("dotenv").config();

// populate config
const config = {
  PRIVATE_TOKEN: process.env.PRIVATE_TOKEN,
  GITLAB_HOST: process.env.GITLAB_HOST,
  GITLAB_API_VERSION: 4,
  PROJECT_ID: 259
};

// data struct
const data = {
  status: null,
  started_at: null
};

// helper functions
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

const extractBranchFromHost = async host => {
  //TODO: extract the branchName
  console.log('searching for hostname: ', host);
  const test = '-app.bannersnack.dev';

  if (host.indexOf(test) !== -1){
    return host.replace(test,'');
  }

  return null;
};

const startPipeline = async branch => {
  const response = await post(
    `${config.GITLAB_HOST}/api/v4/projects/${config.PROJECT_ID}/pipeline/`,
    `{ "ref": "${branch}", "variables": [{"key": "AUTO", "value": "true"}] }`
  );

  return response;
};

const searchAndStartBranch = async host => {
  const branch = await extractBranchFromHost(host);
  if (branch == null) {
    data.status = null;
    return data;
  }

  // search for a matching branch
  const branches = await get(
    `${config.GITLAB_HOST}/api/v4/projects/${config.PROJECT_ID}/repository/branches/?per_page=1&page=1&search=${branch}`
  );
  if (branches && branches.length > 0) {
    // if found a branch, check for a pipeline that's allready running
    const pipelines = await get(
      `${config.GITLAB_HOST}/api/v4/projects/${config.PROJECT_ID}/pipelines/?per_page=1&ref=${branches[0].name}`
    );
    if (pipelines && pipelines.length > 0 && pipelines[0].status == "failed") {
      // pipeline is failed
      console.log("pipeline is failed, abort");
      data.status = 'failed'
      return data;
    } else if (pipelines && pipelines.length > 0 && pipelines[0].status !== 'success') {
      // get more info about the pipeline
      const pipeline = await get(
        `${config.GITLAB_HOST}/api/v4/projects/${config.PROJECT_ID}/pipelines/${pipelines[0].id}`
      );
      if (pipeline) {
          data.started_at = pipeline.started_at;
          data.status = pipeline.status;
          return data;
        }
    } else {
      // create a pipeline
      const newPipeline = await startPipeline(branches[0].name);
      data.started_at = newPipeline.created_at;
      data.status = newPipeline.status;
      return data;
    }
  }

  return data;
};

// express
app.use("/public", express.static(path.join(__dirname, "static")));
app.set("x-powered-by", false);
app.set("view engine", "ejs");
app.set("views", "app/views");
app.get("/", async (req, res) => {
  // const data = await searchAndStartBranch(req.hostname);
  const data = await searchAndStartBranch('tst-app.bannersnack.dev');
  console.log(data);
  switch (data.status) {
    case 'pending':
    case 'running':
      res.render("index", {
        data: {
          name: "tst",
          date: new Date(data.started_at).setMinutes(new Date(data.started_at).getMinutes() + 7)
        }
      });
      break;
    default:
      res.render("error", {
        data: {
          error: "404 Not Found"
        }
      });
  }
  res.end();
});

// start server
app.listen(8080);

// pipeline logic

// get all branches
// 	- check if branch exists

// if status = success, check finished_at > 10 mintues, then create new pipeline
// if status = running or pending, check duration and report to user
// if status = failed or canceled, report to user that we can't do nothing about it

// default: create pipeline

// race problems will occur!
// refs are case sensitive
// slugs != refs always
