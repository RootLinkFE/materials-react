/*
 * @Author: mingxing.zhong
 * @Date: 2021-07-30 14:28:21
 * @Description: 更新blockJson
 */

const childProcess = require('child_process');
const util = require('util');
const { genBlockJson } = require('./rh-block');

const exec = util.promisify(childProcess.exec);
// ci 时无法及时拿到部署后的最新代码（缓存原因），说以这里不截图
genBlockJson('no').then(async (files) => {
  try {
    await exec(`git add .`);
    await exec(`git commit -m "chore: update block json"`);
    console.log(`Update successfully`);
  } catch (error) {
    console.error(`Update unsuccessfully`);
  }
});
