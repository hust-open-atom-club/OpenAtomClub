---
title: GitHub前端项目部署到Netlify的教程
layout: splash
excerpt: 2025-09-12
header:
  overlay_image: /assets/images/index.jpg
  overlay_filter: 0.25
---

<a>Netlify</a><sup>[1]</sup>是一个前端应用部署平台，和其他同类产品一样，可以链接至GitHub、GitLab等代码托管平台，关联某个仓库，并且监听各种事件触发构建和部署。相比同样被广泛使用的Vercel，Netlify的免费版支持GitHub Organization下的仓库部署，同时拥有默认启用的Pull Request预览功能，因此更加适合小型学生团队使用。本文将介绍如何将一个托管在GitHub的前端项目部署在Netlify上，并且绑定自定义域名。

### 创建项目

![GitHub前端项目部署到Netlify的教程_002.jpg](/assets/images/20250918_nestify_deploy/GitHub前端项目部署到Netlify的教程_002.jpg)

首先，假设我们已经拥有了一个Netlify账号并登录进入控制台，可以直接在添加项目处选择“Import from Git”。


![GitHub前端项目部署到Netlify的教程_003.jpg](/assets/images/20250918_nestify_deploy/GitHub前端项目部署到Netlify的教程_003.jpg)

这里有几个不同的托管提供商可以选择，俱乐部大部分仓库托管在GitHub，我们选择GitHub即可。

![GitHub前端项目部署到Netlify的教程_004.jpg](/assets/images/20250918_nestify_deploy/GitHub前端项目部署到Netlify的教程_004.jpg)

选择提供商后会弹出登录窗口，登录自己的账号后，会提示安装Netlify应用到仓库。在为俱乐部组织安装后，弹出窗口会显示已授权并关闭，就进入了Netlify仓库选择页面，这时可以在红框的位置选择个人或是某个组织，然后在下面选择要接入哪个仓库。

![GitHub前端项目部署到Netlify的教程_005.jpg](/assets/images/20250918_nestify_deploy/GitHub前端项目部署到Netlify的教程_005.jpg)

下面就进入到了项目的配置阶段。我们可以看到，Netlify会自动匹配项目使用的技术栈，由于俱乐部主页使用Jekyll，Netlify自动应用了对应的模板。如果你曾经在项目中配置过不同的构建命令或者输出目录，抑或是需要额外的环境变量，需要在这一步进行修改。如果没有要修改的地方，为项目命名后就可以进入下一步。


![GitHub前端项目部署到Netlify的教程_006.jpg](/assets/images/20250918_nestify_deploy/GitHub前端项目部署到Netlify的教程_006.jpg)

### 域名绑定

为项目绑定域名要在项目页面的“Domain management”标签页中，由于我们已经购买了域名，所以直接选择添加已有的域名。值得注意的是，Netlify会为每个项目分配一个默认以项目名开头，“netlify.app”结尾的三级域名，所以如果你对项目的辨识度要求不高，可以直接使用，或者在这个页面修改三级域名的内容。


![GitHub前端项目部署到Netlify的教程_007.jpg](/assets/images/20250918_nestify_deploy/GitHub前端项目部署到Netlify的教程_007.jpg)

Netlify会要求验证域名的所有权，在域名对应的解析控制台添加一行TXT记录并点击添加进行检查即可。

验证完成后，我们会发现还是不能生效，这是因为我们只验证了域名的所有权，但是并没有将子域名解析到Netlify服务器。

点击“Awaiting External DNS”后，根据弹出窗口的提示为子域名设置CNAME解析记录，等待一段时间后刷新页面，应该就能看到子域名变绿，正常解析。

最后，等待TLS证书生成，整个部署过程就完成了，现在我们应该可以通过自定义域名访问部署在Netlify上的前端服务。

### 参考资料

<i>Netlify: https://www.netlify.com</i>



