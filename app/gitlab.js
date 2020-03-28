const config = require("./config");
const { get, post } = require("./conn");

// data struct
let jobStatus = {};

const extractBranchFromHost = async host => {
  console.log("searching for hostname: ", host);
  const test = "-app.bannersnack.dev";

  if (host.indexOf(test) !== -1) {
    const branch = host.replace(test, "");
    jobStatus.branch = branch;
    return branch;
  }

  return null;
};

const startGitlabPipeline = async branch => {
  const response = await post(
    `${config.GITLAB_HOST}/api/v4/projects/${config.PROJECT_ID}/pipeline/`,
    `{ "ref": "${branch}", "variables": [{"key": "AUTO", "value": "true"}] }`
  );

  return response;
};

const searchGitlabBranches = async branch => {
  const response = await get(
    `${config.GITLAB_HOST}/api/v4/projects/${config.PROJECT_ID}/repository/branches/?per_page=1&page=1&search=${branch}`
  );
  if (response && response.length > 0) {
    const branchName = response[0].name;
    jobStatus.branch = branchName;
    return branchName;
  }
  return 404;
};

const getGitlabPipelineByBranch = async branch => {
  const pipelines = await get(
    `${config.GITLAB_HOST}/api/v4/projects/${config.PROJECT_ID}/pipelines/?per_page=1&ref=${branch}`
  );
  if (pipelines && pipelines.length > 0) {
    return pipelines[0];
  }
  return 404;
};

const getGitlabPipelineDetails = async pipelineId => {
  const pipelineDetails = await get(`${config.GITLAB_HOST}/api/v4/projects/${config.PROJECT_ID}/pipelines/${pipelineId}`);
  return pipelineDetails;
};


const searchAndGetOrStartPipeline = async (hostname, confirmed) => {
  const branchFromHostname = await extractBranchFromHost(hostname);
  if (branchFromHostname == null) {
    // if no branch is found stop running, return 404
    jobStatus.status = "404";
    return jobStatus;
  }

  const gitlabBranchName = await searchGitlabBranches(branchFromHostname);
  if (gitlabBranchName === 404) {
    // if no branch is found stop running, return 404
    jobStatus.status = 404;
    return jobStatus;
  }

  // if found a branch, check for a pipeline that's allready running
  const pipeline = await getGitlabPipelineByBranch(gitlabBranchName);
  if (pipeline === 404) {
    // create a new pipeline
    if (confirmed) {
      const newPipeline = await startGitlabPipeline(gitlabBranchName);
      jobStatus.status = 'pending';
      jobStatus.created_at = newPipeline.created_at;
    } else {
      jobStatus.status = 'confirm';
    }
    return jobStatus;
  } else {
    switch (pipeline.status) {
      case 'failed':
        jobStatus.status = 'failed';
        return jobStatus;
        break;
      case 'pending':
        jobStatus.status = 'pending';
        jobStatus.created_at = pipeline.created_at;
        return jobStatus;
        break;
      case 'running':
        // get more info
        const pipelineDetails = await getGitlabPipelineDetails(pipeline.id);
        jobStatus.status = 'running';
        jobStatus.created_at = pipelineDetails.started_at;
        return jobStatus;
        break;
      default:
        // create a new pipeline then
        if (confirmed) {
          const newPipeline = await startGitlabPipeline(gitlabBranchName);
          jobStatus.status = 'pending';
          jobStatus.created_at = newPipeline.created_at;
        } else {
          jobStatus.status = 'confirm';
        }
        return jobStatus;
        break;
    }
  }
};

const job = async (hostname, confirmed) => {
  await searchAndGetOrStartPipeline(hostname, confirmed);
  // get branches
  // decide what to do
  return jobStatus;
};

module.exports = {
  job
};
