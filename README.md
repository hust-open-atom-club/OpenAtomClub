<div align="center">

<img src="https://github.com/hust-open-atom-club/.github/blob/main/profile/assets/header.png" style="width:60%">

<h3><a href="https://hust.openatom.club">hust.openatom.club</a></h3>


<!-- 参考：https://shields.io/badges/static-badge -->
<!-- [![](https://dcbadge.limes.#FB7299/api/server/EMJqcQCCpW)](https://discord.gg/EMJqcQCCpW) -->
[![](https://img.shields.io/badge/Join_QQ-HUST_OPEN_ATOM_CLUB_|_OS2EDU-white?style=for-the-badge&color=76bad9&logo=qq&logoColor=76bad9)](https://qm.qq.com/q/2uEd11lkWk)
[![](https://img.shields.io/badge/Join_Discord-HUST_OPEN_ATOM_CLUB-white?style=for-the-badge&color=5662f6&logo=discord&logoColor=5662f6)](https://discord.gg/EMJqcQCCpW)
[![](https://img.shields.io/badge/Visit_Bilibili-%E5%8D%8E%E7%A7%91%E5%BC%80%E6%94%BE%E5%8E%9F%E5%AD%90%E4%BF%B1%E4%B9%90%E9%83%A8-white?style=for-the-badge&color=FB7299&logo=bilibili&logoColor=FB7299)](https://space.bilibili.com/3537107102468877)
[![](https://img.shields.io/badge/%E5%85%AC%E4%BC%97%E5%8F%B7-%E5%BC%80%E6%BA%90%E5%86%85%E6%A0%B8%E5%AE%89%E5%85%A8%E4%BF%AE%E7%82%BC-white?style=for-the-badge&color=06cb64E&logo=wechat&logoColor=06cb64)](https://mp.weixin.qq.com/s/5BRqbmsE9lfhai7mjt1gRQ)


<h1>华科开放原子开源俱乐部</h1>



</div>
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