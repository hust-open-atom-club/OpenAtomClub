---
title: "wiki"
permalink: /wiki/
layout: splash
---

<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/all.css">

<div class="wiki-container" style="display: flex; gap: 30px; margin-top: 20px; align-items: flex-start;">
  <div class="wiki-sidebar" style="width: 260px; flex-shrink: 0; border-right: 1px solid #eaecef; padding-right: 15px;">
    <ul style="list-style: none; padding: 0; margin: 0;">
      {% for post in site.wiki %}
        <li style="margin-bottom: 20px;">
          <a href="javascript:void(0);" 
             onclick="loadPureContent('{{ post.url | relative_url }}', this)" 
             class="wiki-link"
             style="display: block; text-decoration: none; padding: 8px; border-radius: 4px; transition: 0.2s;">
            <div style="font-weight: bold; color: #3d85ad; font-size: 1.1em; line-height: 1.2;">
              {{ post.title }}
            </div>
            <div style="font-size: 14px; color: #666; margin-top: 6px; font-weight: normal;">
              {{ post.excerpt | default: "点击查看详情" }}
            </div>
          </a>
        </li>
      {% endfor %}
    </ul>
  </div>

  <div id="wiki-display-area" style="flex-grow: 1; min-height: 500px; padding: 10px 20px; background: #fff; line-height: 1.6;">
    <div id="loader" style="display:none; color: #666; font-style: italic; margin-bottom: 10px;">正在努力加载中...</div>
    <div id="inner-content">
       <div style="text-align: center; padding: 100px 0; color: #666;">
          <i class="fas fa-book-reader fa-5x" style="color: #3d85ad; margin-bottom: 25px;"></i>

          <h1 style="color: #333; margin-bottom: 10px; font-size: 2em;">欢迎查阅俱乐部知识库</h1>
          <p style="font-size: 0.95em; color: #888;">点击左侧目录开始阅读技术文档</p>
       </div>
    </div>
  </div>
</div>

<style>
  .wiki-link:hover { background-color: #f0f7fb; }
  .wiki-link.active { background-color: #e7f3f9; border-left: 4px solid #3d85ad !important; }
  #inner-content img { max-width: 100%; height: auto; display: block; margin: 10px 0; }
  #inner-content h1, #inner-content h2 { color: #333; margin-top: 0; }
</style>

<script>
function loadPureContent(url, element) {
    const links = document.querySelectorAll('.wiki-link');
    for (let i = 0; i < links.length; i++) {
        links[i].classList.remove('active');
    }
    element.classList.add('active');

    const innerContainer = document.getElementById('inner-content');
    const loader = document.getElementById('loader');
    
    loader.style.display = 'block';
    innerContainer.style.opacity = '0.3';

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector('article') || 
                                doc.querySelector('.post-content') || 
                                doc.querySelector('.content') || 
                                doc.querySelector('main');

            if (mainContent) {
                innerContainer.innerHTML = mainContent.innerHTML;
            } else {
                innerContainer.innerHTML = "<p style='color:orange; text-align:center; padding:40px;'>未能找到正文内容。</p>";
            }
        })
        .catch(err => {
            innerContainer.innerHTML = "<p style='color:red; text-align:center; padding:40px;'>加载失败: " + err + "</p>";
        })
        .finally(() => {
            loader.style.display = 'none';
            innerContainer.style.opacity = '1';
            const displayArea = document.getElementById('wiki-display-area');
            const rect = displayArea.getBoundingClientRect();
            if (rect.top < 0) {
                window.scrollTo({ top: window.scrollY + rect.top - 20, behavior: 'smooth' });
            }
        });
}
</script>
