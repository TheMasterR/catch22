// load env
require("dotenv").config();

// populate config
module.exports = {
  PRIVATE_TOKEN: process.env.PRIVATE_TOKEN,
  GITLAB_HOST: process.env.GITLAB_HOST,
  GITLAB_API_VERSION: 4,
  PROJECT_ID: 259
};
