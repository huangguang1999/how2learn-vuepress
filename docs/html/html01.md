## 1 HTML5和HTML4的不同

**声明方面**

HTML5文件类型声明由

`<!DOCTYPE>`

变成

`<!DOCTYPE html>`

**标准方面**

HTML5的文档解析不再基于SGML(Standard Generalized Markup Language)标准，而是形成了自己的一套标准。

**标签方面**

新增语义标签，其中包括

```html
<header>、<footer>、<section>、<article>、<nav>、<hgroup>、<aside>、<figure>
```

废除一些网页美化方面的标签，使样式与结构分离更加彻底, 包括

```html
<big>、<u>、<font>、<basefont>、<center>、<s>、<tt>
```

通过增加了`<audio>、<video>`两个标签来实现对多媒体中的音频、视频使用的支持。

**属性方面**

增加了一些表单属性, 主要是其中的input属性的增强

```html
<!-- 此类型要求输入格式正确的email地址 -->
<input type=email >
<!-- 要求输入格式正确的URL地址  -->
<input type=url >
<!-- 要求输入格式数字，默认会有上下两个按钮 -->
<input type=number >
<!-- 时间系列，但目前只有 Opera和Chrome支持 -->
<input type=date >
<input type=time >
<input type=datetime >
<input type=datetime-local >
<input type=month >
<input type=week >
<!-- 默认占位文字 -->
<input type=text placeholder="your message" >
<!-- 默认聚焦属性 -->
<input type=text autofacus="true" >
```

其他标签新增了一些属性,

```html
<!-- meta标签增加charset属性 -->
<meta charset="utf-8">
<!-- script标签增加async属性 -->
<script async></script>
```

使部分属性名默认具有boolean属性

```html
<!-- 只写属性名默认为true -->
<input type="checkbox"  checked/>
<!-- 属性名="属性名"也为true -->
<input type="checkbox"  checked="checked"/>
```

**存储方面**

新增WebStorage, 包括localStorage和sessionStorage

引入了IndexedDB和Web SQL，允许在浏览器端创建数据库表并存储数据, 两者的区别在于IndexedDB更像是一个NoSQL数据库，而WebSQL更像是关系型数据库。W3C已经不再支持WebSQL。

引入了应用程序缓存器(application cache)，可对web进行缓存，在没有网络的情况下使用，通过创建cache manifest文件,创建应用缓存，为PWA(Progressive Web App)提供了底层的技术支持。



## 2 meta属性标签

简介: 常用于定义页面的说明，关键 字，最后修改日期，和其它的元数据。这些元数据将服务于浏览器（如何布局或重载页 面），搜索引擎和其它网络服务。

**charset属性**

```html
<!-- 定义网页文档的字符集 -->
<meta charset="utf-8" />
```

**name + content属性**

```html
<!-- 网页作者 -->
<meta name="author" content="开源技术团队"/>
<!-- 网页地址 -->
<meta name="website" content="https://sanyuan0704.github.io/frontend_daily_question/"/>
<!-- 网页版权信息 -->
 <meta name="copyright" content="2018-2019 demo.com"/>
<!-- 网页关键字, 用于SEO -->
<meta name="keywords" content="meta,html"/>
<!-- 网页描述 -->
<meta name="description" content="网页描述"/>
<!-- 搜索引擎索引方式，一般为all，不用深究 -->
<meta name="robots" content="all" />
<!-- 移动端常用视口设置 -->
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0, user-scalable=no"/>
<!-- 
  viewport参数详解：
  width：宽度（数值 / device-width）（默认为980 像素）
  height：高度（数值 / device-height）
  initial-scale：初始的缩放比例 （范围从>0 到10）
  minimum-scale：允许用户缩放到的最小比例
  maximum-scale：允许用户缩放到的最大比例
  user-scalable：用户是否可以手动缩 (no,yes)
 -->
```

**http-equiv属性**

```html
<!-- expires指定网页的过期时间。一旦网页过期，必须从服务器上下载。 -->
<meta http-equiv="expires" content="Fri, 12 Jan 2020 18:18:18 GMT"/>
<!-- 等待一定的时间刷新或跳转到其他url。下面1表示1秒 -->
<meta http-equiv="refresh" content="1; url=https://www.baidu.com"/>
<!-- 禁止浏览器从本地缓存中读取网页，即浏览器一旦离开网页在无法连接网络的情况下就无法访问到页面。 -->
<meta http-equiv="pragma" content="no-cache"/>
<!-- 也是设置cookie的一种方式，并且可以指定过期时间 -->
<meta http-equiv="set-cookie" content="name=value expires=Fri, 12 Jan 2001 18:18:18 GMT,path=/"/>
<!-- 使用浏览器版本 -->
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
<!-- 针对WebApp全屏模式，隐藏状态栏/设置状态栏颜色，content的值为default | black | black-translucent -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```



## 3 src和href的区别

href是Hypertext Reference的简写，表示超文本引用，指向网络资源所在位置。

常见场景:

```html
<a href="http://www.baidu.com"></a> 
<link type="text/css" rel="stylesheet" href="common.css"> 
```

src是source的简写，目的是要把文件下载到html页面中去。

常见场景:

```html
<img src="img/girl.jpg"></img> 
<iframe src="top.html"> 
<script src="show.js"> 
```

**作用结果**

1. href 用于在当前文档和引用资源之间确立联系
2. src 用于替换当前内容

**浏览器解析方式**

1. 当浏览器遇到href会并行下载资源并且不会停止对当前文档的处理。(同时也是为什么建议使用 link 方式加载 CSS，而不是使用 @import 方式)
2. 当浏览器解析到src ，会暂停其他资源的下载和处理，直到将该资源加载或执行完毕。(这也是script标签为什么放在底部而不是头部的原因)



## 4 link和@import区别

**从属关系区别**

`@import`是css提供的语法规则，只有导入样式表的作用；`link`是html提供的标签，不仅可以加载 CSS 文件，还可以定义 RSS、rel 连接属性等。

**加载顺序区别**

加载页面时，link标签引入的CSS同时加载；@import引入的CSS将在页面加载完毕后被加载。

**兼容新区别**

`@import`是 CSS2.1 才有的语法，故只可在 IE5+ 才能识别；`link`标签作为 HTML 元素，不存在兼容性问题。

**权重区别**

`link`引入的样式权重大于`@import`引入的样式。



**我们上边也说了关于`link`和`@import`的区别，在加载页面的时候，不是说在`link`引入的css样式的时候会先于`@import`加载吗？那为啥`link`引入的样式又会覆盖掉`@import`引入的样式啊？**

首先我们来回顾一下关于浏览器执行过程的一些概念：

**加载：** 根据请求的url进行域名解析，然后向服务器发送请求，接收响应文件（如HTML、CSS、JS、图片等）。

**解析：** 对加载到的资源（HTML、CSS、JS等）进行语法解析，构建响应的内部数据结构（如HTML的DOM树，JS对象的属性表，css样式规则等）。

**渲染：** 构建渲染树，对各个元素进行位置计算、样式计算等，然后根据渲染书完成页面的布局及绘制的过程（产生页面的元素）。

所以根据我们上述的浏览器执行过程的理解以后，我们我继续提出疑问：

**link先于@import加载，是不是也先于@import渲染呢？**

实际上，浏览器渲染的动作一般会执行多次的。最后一次渲染，一定是基于之前加载过的所有样式整合后渲染树进行绘制页面的，已经被渲染过的页面元素，也会被重新渲染。

那么我们就可以把@import这种导入 CSS 文件的方式理解成一种替换，CSS 解析引擎在对一个 CSS 文件进行解析时，如在文件顶部遇到@import，将被替换为该@import导入的 CSS 文件中的全部样式。

终于弄明白为何@import引入的样式，会被层叠掉了。其虽然后被加载，却会在加载完毕后置于样式表顶部，最终渲染时自然会被下面的同名样式层叠。



## 5 script标签中defer和async的区别

默认情况下，脚本的下载和执行将会按照文档的先后顺序同步进行。当脚本下载和执行的时候，文档解析就会被阻塞，在脚本下载和执行完成之后文档才能往下继续进行解析。

下面是async和defer两者区别：

- 当script中有defer属性时，脚本的加载过程和文档加载是异步发生的，等到文档解析完(DOMContentLoaded事件发生)脚本才开始执行。
- 当script有async属性时，脚本的加载过程和文档加载也是异步发生的。但脚本下载完成后会停止HTML解析，执行脚本，脚本解析完继续HTML解析。
- 当script同时有async和defer属性时，执行效果和async一致。
