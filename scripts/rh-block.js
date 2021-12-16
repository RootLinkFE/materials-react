const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const screenShot = require('./screen-shot');
const { materialsDemoUrl, repoGitUrl } = require('./config');

const jsonFileName = 'rh-block.json';
const repoPath = path.join(__dirname, '../');

async function genBlockJson(screenShotType) {
  const newFiles = [];
  // lerna 项目结构
  const blocksPath = path.join(repoPath, 'src');
  // 一级下的目录
  const blockDir = fs.readdirSync(blocksPath);

  let blockList = [];

  // 忽略操作系统产生多余的缓存文件
  const blockDir2 = blockDir.filter(
    (b) => b !== '.DS_Store' && b !== '.umi' && b !== '.umi-production',
  );
  for (let block of blockDir2) {
    const materialJsonPath = path.join(blocksPath, block, 'material.json');
    const json = fs.readJSONSync(materialJsonPath);
    if (json) {
      const _path = path.relative(repoPath, path.join(blocksPath, block));
      json.url = repoGitUrl + _path;
      json.path = _path;
      if (json.tags) {
        json.tags.push('antd');
        json.tags = _.uniq(json.tags);
      } else {
        json.tags = [];
        json.tags.push('antd');
      }
      // ant-design-vue 和 element-ui 放到依赖里
      if (json.dependencies) {
        json.dependencies.push('antd');
        json.dependencies = _.uniq(json.dependencies);
      } else {
        json.dependencies = [];
        json.dependencies.push('antd');
      }
      // 开启自动截图
      if (screenShotType !== 'no') {
        if (
          screenShotType === 'all' || // 全量截图
          (screenShotType === 'increment' && !json.img) //增量截图
        ) {
          try {
            const imgUrl = await screenShot({
              path: _path,
              route: `materials/${_.kebabCase(json.key)}`,
            });
            json.img = imgUrl;
            // 更新保存区块描述信息
            const newMaterialJson = JSON.stringify(json, null, '\t');
            fs.writeFileSync(materialJsonPath, newMaterialJson);
          } catch (e) {
            console.log(e);
          }
        }
      }
      // 在线demo预览地址
      json.previewUrl = `${materialsDemoUrl}/materials/${_.kebabCase(
        json.key,
      )}`;
      console.log('====================================');
      console.log(json.previewUrl);
      console.log('====================================');
    }

    blockList.push(json);
  }
  const jsonFilePath = path.join(repoPath, jsonFileName);
  const str = JSON.stringify({ list: blockList }, null, '\t');
  fs.writeFileSync(jsonFilePath, str);
  console.log(`已生成物料的配置文件  ${chalk.blue(jsonFilePath)} `);
  newFiles.push(path.relative(repoPath, jsonFilePath));

  return newFiles;
}

module.exports = {
  genBlockJson,
};
