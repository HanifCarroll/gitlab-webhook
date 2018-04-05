const express = require('express');
const bodyParser = require('body-parser');
const gitlab = require('./gitlab');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('*', async (req, res) => {
  try {
    // Gitlab must receive a valid HTTP response
    res.send('Request handled');

    // If a merge from prestaging to master is approved, set 'merged' flag
    // to true.
    gitlab.checkMergeStatus(req);

    // If a build from prestaging is successful, set 'buildComplete' flag to true
    gitlab.checkBuildStatus(req);

    // If 'merged' is true, and 'buildComplete' is true, then transition the
    // issues in prestaging to staging.
    await gitlab.transitionIssues();
  } catch (error) {
    console.log(error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('App started');
});
