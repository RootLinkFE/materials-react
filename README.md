# materials-react

## 物料库开发规范

本项目中，已有 base 和 ant-design-vue 两个包目录，在包目录中我们都可以视为一个独立的 npm 工程。所以，我们新建或维护物料的时候需要考虑到 package.json 中的依赖项，其中我们需要维护的主要是 `peerDependencies` 该项。

不管是在使用何种形式的添加物料，package.json 文件都是必须的，`peerDependencies` 的定义则是在添加物料时，对目标项目进行物料所需的依赖进行安装。

### 目录结构

```shell
├── docs #文档
├── index.md
├── src # 区块源码
│   ├── FileImportModal # 依赖 antd 的页面和区块
│          └── material.json #
└── package.json
```

### 物料的定义

每个物料单元的源码目录都应该定义一个 **material.json** 文件，用于标识物料单元。更多的解释可以查看 [物料库设计逻辑和思路](https://roothome.yuque.com/docs/share/8818727b-bc31-42e8-96a9-627c5df4a241)
