const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const jira = require('./jira.js');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('*', (req, res) => {
  handleRequest(req);
  // Gitlab must receive a valid HTTP response
  res.send('Request handled');
});

async function handleRequest(req) {
  try {
    if (req.body.object_kind === 'merge_request') {
      const {
        source_branch,
        target_branch,
        merge_status,
        state
      } = req.body.object_attributes;

      // If the merge request is completed, source
      // branch = 'prestaging', and target branch = 'master'
      if (
        target_branch === 'master' &&
        source_branch === 'prestaging' &&
        state === 'merged'
      ) {
        // find all tickets in Jira with status 'Prestaging' and update their
        // status to 'Staging'.
        await jira.getAndTransitionIssues();
        console.log('Transitions completed');
      }
    }
  } catch (error) {
    console.log(error);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('App started');
});
