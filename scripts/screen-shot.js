const screenshot = require('node-server-screenshot');
const axios = require('axios');
const chalk = require('chalk');
const path = require('path');
const FormData = require('form-data');
const fs = require('fs-extra');
const config = require('./config');

function upload(filePath) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    const stream = fs.createReadStream(filePath);
    form.append('file', stream);
    form.append('dir', 'f2e/tmp/');
    const formHeaders = form.getHeaders();
    axios({
      method: 'post',
      url: config.uploadUrl,
      data: form,
      timeout: 20000,
      headers: {
        ...formHeaders,
      },
    })
      .then((res) => {
        if (res.status === 200 && res.data.success === 1) {
          resolve(res.data.path);
        } else {
          throw res.data;
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

const sizes = {
  pc: {
    width: 1680,
    height: 1000,
  },
  mobile: {
    width: 375,
    height: 667,
  },
};

const clip = {
  x: 320,
  y: 210,
  width: 1200,
  height: 768,
};

/**
 * @param {Object} options
 * size: mobile | pc
 * type: all | increment
 * route: 区块路由
 */
const main = (options) => {
  return new Promise((resolve, reject) => {
    const { port, size = 'pc', route = '' } = options || {};
    const dirPath = path.join(process.cwd(), `screenshot`);
    fs.ensureDir(dirPath);
    const imgPath = path.join(dirPath, `${route}.png`);
    let url = `http://localhost:${port || 8000}/${route}`;
    screenshot.fromURL(
      url,
      imgPath,
      {
        clip,
        // waitAfterSelector: 'VueCodeBox__StyledPreviewWrapper-*',
        ...sizes[size],
      },
      (err) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        upload(imgPath)
          .then((filePath) => {
            try {
              console.log(chalk.green(`截图已上传：${filePath}`));
              resolve(filePath);
            } catch (err) {
              console.error(err);
              reject(err);
              throw err;
            }
          })
          .catch((err) => {
            reject(err);
            throw err;
          });
      },
    );
  });
};

module.exports = main;

/* main({ route: 'materials/file-import-modal' }).then((filePath) =>
  console.log(filePath),
); */
