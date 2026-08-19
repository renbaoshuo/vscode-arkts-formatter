# ArkTS Formatter

一个使用 [oxc-ark](https://github.com/ohos-rs/oxc-ark) 格式化 ArkTS `.ets` 文件的 VSCode 插件。同时支持桌面版 VS Code 和 VS Code for the Web。

[在 VSCode 扩展市场中查看&安装 >>](https://marketplace.visualstudio.com/items?itemName=baoshuo.arkts-formatter)

## 使用

打开 `.ets` 文件后运行「格式化文档」，或在工作区设置中启用保存时格式化：

```jsonc
{
  "[arkts]": {
    "editor.defaultFormatter": "baoshuo.arkts-formatter",
    "editor.formatOnSave": true
  }
}
```

## 开发

```bash
yarn install
yarn compile
yarn test
```

在 VS Code 中按 `F5` 启动 Extension Development Host，即可调试插件。

构建 WebAssembly 版本需要安装上游的 WASI 可选依赖：

```bash
yarn install --frozen-lockfile --ignore-platform --force
yarn package:web
```

### 使用 `.oxfmtrc`

插件从当前 `.ets` 文件所在目录开始，向上查找到当前 workspace folder 根目录，读取最近的 `.oxfmtrc.json` 或 `.oxfmtrc.jsonc`。同一目录同时存在两种文件时，`.oxfmtrc.json` 优先。

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

也可以通过 `arktsFormatter.configPath` 指定配置文件。相对路径以当前 workspace folder 为基准。

### 使用 VS Code settings

没有配置文件时，可以把 oxfmt 兼容选项写到 `arktsFormatter.config`：

```jsonc
{
  "arktsFormatter.config": {
    "printWidth": 120,
    "singleQuote": true,
    "semi": false
  }
}
```

VS Code settings 是基础配置；如果找到了 `.oxfmtrc.json/.jsonc`，配置文件中的同名字段优先，settings 中未被覆盖的字段仍然生效。插件支持 JSONC 注释和尾逗号，修改配置文件后下一次格式化立即生效。

## 配置优先级

从低到高为：

1. `oxc-ark` 默认值
2. `arktsFormatter.config`
3. 最近的 `.oxfmtrc.json/.oxfmtrc.jsonc`，或 `arktsFormatter.configPath` 指定的文件

当前发布版按 ArkTS 1.1 解析 `.ets`。上游仓库已开始加入 Static ETS / ArkTS 1.2 支持，待对应 API 正式发布后再接入该模式。

## Author

**vscode-arkts-formatter** © [Baoshuo](https://github.com/renbaoshuo), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by Baoshuo with help from [contributors](https://github.com/renbaoshuo/vscode-arkts-formatter/contributors).

> [Personal Website](https://baoshuo.ren) · [Blog](https://blog.baoshuo.ren) · GitHub [@renbaoshuo](https://github.com/renbaoshuo) · Twitter [@renbaoshuo](https://twitter.com/renbaoshuo)
