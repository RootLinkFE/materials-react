const inquirer = require('inquirer');
const { genBlockJson } = require('./rh-block');
const execSync = require('child_process').execSync;
const chalk = require('chalk');

inquirer
  .prompt([
    {
      type: 'list',
      name: 'screenShotType',
      message:
        '请选择截图更新方式（no:不截图,increment:增量截图,all:全部截图）',
      choices: ['no', 'increment', 'all'], // 不截图、增量截图、所有都截图
    },
  ])
  .then((answers) => {
    const { screenShotType } = answers;
    genBlockJson(screenShotType).then((newFiles) => {
      for (const file of newFiles) {
        const { error, stdout, stderr } = execSync(`git add ./${file}`);
        if (error) {
          console.error('git add error: ' + error);
          return;
        }
        console.log(`git add ${chalk.yellow(file)} success`);
      }
    });
  });
