# process-on-helper
利用[processon](https://www.processon.com/)的“这是你的专属邀请链接，通过此链接注册`ProcessOn`后，你会获得3张文件数量的奖励”，增加`processon`文件保存数量。

## 用法
```
npm install -g process-on-helper
ph -l 你的专属邀请链接
```

命令行参数：

* `-l`/`--link`：设定你的`ProcessOn`的邀请链接；
* `-c`/`--concurrency`：设定并发量，默认为`5`；
* `-t`/`--times`：设定需要注册小号的次数，增加文件保存量为`times`参数的三倍；

## 效果

![](./images/1.png)

## TODO
- [x] 回调地狱
- [x] 并行执行tasks
- [x] 命令行交互
- [ ] 发布到`npm`

## 协议
[MIT](./LICENSE)