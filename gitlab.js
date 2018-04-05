const jira = require('./jira');

let merged = false;
let buildComplete = false;

module.exports.checkMergeStatus = req => {
  if (req.body.object_kind === 'merge_request') {
    const { source_branch, target_branch, state } = req.body.object_attributes;

    if (
      target_branch === 'master' &&
      source_branch === 'prestaging' &&
      state === 'merged'
    ) {
      merged = true;
    }
  }
};

module.exports.checkBuildStatus = req => {
  if (req.body.object_kind === 'pipeline') {
    const { status, ref } = req.body.object_attributes;

    if (status === 'success' && ref === 'master') {
      buildComplete = true;
    }
  }
};

module.exports.transitionIssues = () => {
  if (merged && buildComplete) {
    jira
      .getAndTransitionIssues()
      .then(() => {
        console.log('Issues successfully transitioned.');
        buildComplete = false;
        merged = false;
      })
      .catch(error => console.log(error));
  }
};
