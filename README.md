# ArkTS Formatter

基于 [oxc-ark](https://github.com/ohos-rs/oxc-ark) 的 ArkTS（`.ets`）代码格式化插件，支持桌面版 VS Code 与 VS Code for the Web，兼容 ArkTS 1.1 与 ArkTS 1.2（Static ETS）语法。

[在 VS Code 扩展市场中安装 >>](https://marketplace.visualstudio.com/items?itemName=baoshuo.arkts-formatter)<br />[在 Open VSX 中安装 >>](https://open-vsx.org/extension/baoshuo/arkts-formatter)

## 快速开始

打开 `.ets` 文件后，在编辑器右键菜单中选择「格式化文档」（或使用对应快捷键）即可完成格式化。

如需设为默认格式化工具并开启保存时自动格式化，可在工作区 `settings.json` 中添加：

```jsonc
{
  "[arkts]": {
    "editor.defaultFormatter": "baoshuo.arkts-formatter",
    "editor.formatOnSave": true
  }
}
```

## 格式化配置

插件支持通过工作区配置文件或 VS Code 设置自定义格式化风格，支持 JSONC 注释与尾逗号，修改配置后会在下一次格式化时立即生效。

### 使用 `.oxfmtrc` 配置文件

插件会从当前 `.ets` 文件所在目录开始，向上查找到当前工作区根目录，并读取最近的 `.oxfmtrc.json` 或 `.oxfmtrc.jsonc`（同一目录下同时存在时，`.oxfmtrc.json` 优先）：

```jsonc
// .oxfmtrc.jsonc
{
  "printWidth": 100,
  "tabWidth": 2,
  "singleQuote": true,
  "semi": false,
  "trailingComma": "all"
}
```

如果配置文件不在上述默认查找路径中，可以通过 `arktsFormatter.configPath` 手动指定路径（相对路径以当前工作区根目录为基准）。

### 使用 VS Code 设置

如果没有使用 `.oxfmtrc` 配置文件，也可以直接在 VS Code 设置中通过 `arktsFormatter.config` 配置 `oxfmt` 兼容选项：

```jsonc
{
  "arktsFormatter.config": {
    "printWidth": 120,
    "singleQuote": true,
    "semi": false
  }
}
```

### 配置优先级

配置项按以下顺序从低到高合并，高优先级配置会覆盖低优先级的同名字段，未覆盖的字段保持生效：

1. `oxc-ark` 默认值
2. VS Code 设置（`arktsFormatter.config`）
3. 工作区中最近的 `.oxfmtrc.json` / `.oxfmtrc.jsonc`，或 `arktsFormatter.configPath` 指定的文件

### ArkTS 1.2（Static ETS）支持

插件默认按 ArkTS 1.1 语法解析 `.ets` 文件。如果项目使用 ArkTS 1.2（Static ETS），请在 `arktsFormatter.config` 中显式设置 `"lang": "ets-static"`：

```jsonc
{
  "arktsFormatter.config": {
    "lang": "ets-static"
  }
}
```

## 本地开发

安装依赖、编译并运行单元测试：

```bash
yarn install
yarn compile
yarn test
```

在 VS Code 中按 `F5` 启动 Extension Development Host 即可调试插件。

如需构建 VS Code for the Web 版本，需要先安装上游的 WASI 可选依赖再打包：

```bash
yarn install --frozen-lockfile --ignore-platform --force
yarn package:web
```

## Author

**vscode-arkts-formatter** © [Baoshuo](https://github.com/renbaoshuo), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by Baoshuo with help from [contributors](https://github.com/renbaoshuo/vscode-arkts-formatter/contributors).

> [Personal Website](https://baoshuo.ren) · [Blog](https://blog.baoshuo.ren) · GitHub [@renbaoshuo](https://github.com/renbaoshuo) · Twitter [@renbaoshuo](https://twitter.com/renbaoshuo)
