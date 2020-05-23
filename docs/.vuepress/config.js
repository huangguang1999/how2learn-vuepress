module.exports = {
  // 页面标题
  title: '小黄',
  // 网页描述
  description: '黄广的个人站点',
  head: [
    // 页面icon
    ['link', { rel: 'icon', href: '/icon.png' }]
  ],
  // 端口号
  port: 3000,
  markdown: {
    // 代码块行号
    lineNumbers: true
  },
  themeConfig: {
    // 最后更新时间
    lastUpdated: '最后更新时间',
    // 所有页面自动生成侧边栏
    sidebar: {
      '/vue/': [
        {
          title: 'vue知识体系',
          children: [
              ''
          ]
        },
        {
          title: 'vue基础',
          children: [
            ['base', 'vue基础']
          ]
        },
        {
          title: 'vue源码',
          children: [
            ['source01', 'MVVM响应式原理'],
            ['first', 'vue的第一个文章'],
            ['second', 'vue的第二个文章']
          ]
        },
        {
          title: '封装vue组件库',
          children: [
            ['first', 'vue的第一个文章'],
            ['second', 'vue的第二个文章']
          ]
        },
      ],
      '/react/': [
        {
          title: 'react基础知识',
          collapsable: false,
          children: [
            "",
            ['first', 'react的第一个文章']
          ]
        },
      ],
      '/algorithm/': [
        {
          title: '数据结构与算法',
          collapsable: false,
          children: [
            "",
            ['dataStru01', '数据结构'],
            ['algorithm01', '二叉树']
          ]
        },
      ],
      '/node/': [
        {
          title: 'node',
          collapsable: false,
          children: [
            "",
            ['node01', 'node核心模块']
          ]
        },
      ]
    },
    // 仓库地址
    repo: 'https://github.com/huangguang1999',
    // 仓库链接label
    repoLabel: 'Github',
    // 导航
    nav: [
      { text: 'Vue', link: '/vue/'},
      { text: 'React', link: '/react/'},
      { text: 'NodeJS', link: '/node/'},
      { text: 'Chromium', link: '/google/'},
      { text: 'WebGL', link: '/webgl/'},
      { text: '数据结构与算法', link: '/algorithm/'},
      { text: '学习方法', link: '/learning/'}
  ]},
  configureWebpack: {
    resolve: {
      // 静态资源的别名
      alias: {
        '@vuepress': '../images/vuepress',
        '@vue': '../images/vue'
      }
    }
  }
}