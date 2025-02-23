这属于华中科技大学开放原子开源俱乐部的官网页面。

## 添加与修改页面

本网站采用 [Minimal Mistakes 主题](https://mmistakes.github.io/minimal-mistakes/)，各自定义项目参见主题的文档。

添加新页面（Wiki / News）请分别在 `pages/_wiki`，`pages/_news` 中参考 `_template.md`。

设置文章作者请在 [`_data/authors.yml`](_data/authors.yml) 中添加作者信息（参考已有内容），然后在页面中指定 `author: key`（只支持一个作者）。

## 本地预览与构建

1. 安装 Ruby 开发环境：根据[Ruby安装-菜鸟教程](https://www.runoob.com/ruby/ruby-installation-windows.html) 安装 Ruby，运行`gem install bundler`
2. 运行 `bundle install --path=vendor/bundle` 以安装依赖的软件包
3. 运行 `bundle exec jekyll serve`，此时即可在 <http://localhost:4000/> 预览网站
4. 编译整个网站的命令为

   ```shell
   bundle exec jekyll build
   ```

   在命令行末尾添加 `--profile` 可以查看编译性能分析（每个源文件耗时），添加 `--trace` 可以在出错时输出 stack trace

   正式部署时需要添加环境变量 `JEKYLL_ENV=production`，详情请见 GitHub Actions 的 workflow 配置

## 使用docker环境开发

1. 构建
 
```
docker build -t <docker-name> .
```

2. 运行


```
docker run -name <docker-name>
```

3. 开发

- 需要配置代理,方法多样，详见[https://docs.docker.com/engine/cli/proxy/]

- 在宿主机中查看网页

运行容器后，Jekyll 服务会启动。在宿主机的浏览器中访问 `http://localhost:<port>` ,你将看到 Jekyll 生成的网页, 端口默认为4000,请确定该端口空闲。
