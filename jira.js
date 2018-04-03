const JiraApi = require('jira-client');

const jira = new JiraApi({
  protocol: 'https',
  host: '8base-dev.atlassian.net',
  username: process.env.JIRA_USERNAME,
  password: process.env.JIRA_PASSWORD,
  apiVersion: '2',
  strictSSL: true
});

module.exports.getAndTransitionIssues = async function getAndTransitionIssues() {
  try {
    let issues = await getPrestagingIssues();
    let transition = await transitionIssues(issues);
  } catch (err) {
    console.log(err);
  }
};

async function getPrestagingIssues() {
  try {
    // Search jira for all issues in project with status = deploy-prestaging
    const { issues } = await jira.searchJira(
      'project=QWT and status = deploy-prestaging'
    );

    const allIssues = [];
    // Add all the issue IDs to an array, and return the array
    issues.forEach(issue => allIssues.push(issue.id));
    return allIssues;
  } catch (error) {
    console.log(error);
  }
}

async function transitionIssues(issues) {
  try {
    // For every ID in the issues array, transition the issue to deploy-staging
    await Promise.all(
      issues.map(async issue => {
        await jira.transitionIssue(issue, {
          transition: { id: '101' }
        });
      })
    );
  } catch (error) {
    console.log(error);
  }
}
