# AI 施工队 / AI crew

在一个主会话里给不同的活分配不同的模型。

- **default** —— 新会话的默认模型，插件激活时应用。
- **smart** —— 设计、debug、规划、多文件改动这类需要脑子的活。
- **grunt** —— 批量改、跑命令、翻日志、整理数据这类脏活。

工具 `model_route(task, applyDefault?)` 返回对应路由。agent 派子智能体时按这个路由指定
模型，主会话本身不切换模型。

零依赖：不 import 任何 `@deepseek-ai/*` 包，工具定义是普通注册项，配置直接从行的
`config` 读取。因此任何 DSH 版本都能装，不受安装包未发布到 npm 的影响。

## 配置

编辑行里的 `config`（没有表单，直接改 YAML）：

```yaml
config:
  default: { provider: deepseek-official, model: deepseek-flash }
  smart:   { provider: deepseek-official, model: deepseek-flash }
  grunt:   { provider: magpie, model: basalt/IQ3_S }
```

每条路由支持 `provider`、`model`，以及可选的 `reasoningEffort`。id 就是模型选择器里
显示的那些（例如 `magpie` / `basalt/IQ3_S` 或 `deepseek-official` / `deepseek-flash`）。

## 工具

`model_route(task, applyDefault?)`

- `task`：`smart` 或 `grunt`。
- `applyDefault`：把返回的路由设为新会话默认模型。

返回 JSON。它只是“建议路由”：agent 决定派活时用哪个模型，不会改写正在跑的会话。

## 限制

- `default` 在插件激活时应用；之后在会话里切模型会照常更新 profile 条目。
- 路由里的 provider/model 必须存在于当前 profile；解析失败在请求时报错，不是安装时。
- 没有配置表单：要表单就得引 `schemastery`，会重新引入依赖。

## License

MIT.
