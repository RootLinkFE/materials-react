const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const screenShot = require('./screen-shot');
const { materialsDemoUrl, repoGitUrl } = require('./config');

const jsonFileName = 'rh-block.json';
const repoPath = path.join(__dirname, '../');

const isLerna = () => {
  const filePath = path.join(repoPath, 'lerna.json');
  return fs.pathExistsSync(filePath);
};

async function genBlockJson(screenShotType) {
  const newFiles = [];
  if (isLerna()) {
    // lerna 项目结构
    const packagePath = path.join(repoPath, 'packages');
    // 一级下的目录
    const packageRepoNames = fs.readdirSync(packagePath);
    console.log(
      '子项目有：' + chalk.yellow(packageRepoNames),
      '进行子项目遍历…',
    );
    let materialsArr = [];
    for (let name of packageRepoNames) {
      const blockList = [];
      const repoPackagePath = path.join(packagePath, name, 'src');
      const blocksPath = path.join(repoPackagePath, 'blocks');
      const blockDir = fs.readdirSync(blocksPath);
      // 忽略操作系统产生多余的缓存文件
      const blockDir2 = blockDir.filter((b) => b !== '.DS_Store');
      for (let block of blockDir2) {
        const materialJsonPath = path.join(blocksPath, block, 'material.json');
        const json = fs.readJSONSync(materialJsonPath);
        if (json) {
          const _path = path.relative(repoPath, path.join(blocksPath, block));
          json.url = repoGitUrl + _path;
          json.path = _path;
          if (json.tags) {
            json.tags.push(name);
            json.tags = _.uniq(json.tags);
          } else {
            json.tags = [];
            json.tags.push(name);
          }
          // ant-design-vue 和 element-ui 放到依赖里
          if (name !== 'base') {
            if (json.dependencies) {
              json.dependencies.push(name);
              json.dependencies = _.uniq(json.dependencies);
            } else {
              json.dependencies = [];
              json.dependencies.push(name);
            }
          }
          // 开启自动截图
          if (screenShotType !== 'no') {
            if (
              screenShotType === 'all' || // 全量截图
              (screenShotType === 'increment' && !json.img) //增量截图
            ) {
              const imgUrl = await screenShot({
                path: _path,
                route: _.kebabCase(json.key),
              });
              json.img = imgUrl;
              // 更新保存区块描述信息
              const newMaterialJson = JSON.stringify(json, null, '\t');
              fs.writeFileSync(materialJsonPath, newMaterialJson);
            }
          }
          // 在线demo预览地址
          json.previewUrl = `${materialsDemoUrl}/${_.kebabCase(json.key)}`;
        }

        blockList.push(json);
      }
      materialsArr = materialsArr?.concat(blockList);
    }
    const jsonFilePath = path.join(repoPath, jsonFileName);
    const str = JSON.stringify({ list: materialsArr }, null, '\t');
    fs.writeFileSync(jsonFilePath, str);
    console.log(`已生成物料的配置文件  ${chalk.blue(jsonFilePath)} `);
    newFiles.push(path.relative(repoPath, jsonFilePath));
  }

  return newFiles;
}

module.exports = {
  genBlockJson,
};
