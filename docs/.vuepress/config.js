module.exports = {
  // 页面标题
  title: '光光',
  // 网页描述
  description: '个人网站',
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
            ['source01', 'VUE-part1-defineProperty'],
            ['source02', 'VUE-part2-Dep'],
            ['source03', 'VUE-part3-Watcher'],
            ['source04', 'VUE-part4-优化Watcher'],
            ['source05', 'VUE-part5-Observe'],
            ['source06', 'VUE-part6-Array'],
            ['source07', 'VUE-part7-Event'],
            ['source08', 'VUE-part8-优化Event'],
            ['source09', 'VUE-part9-Vue'],
            ['source10', 'VUE-part10-Computed'],
            ['source11', 'VUE-part11-Extend'],
            ['source12', 'VUE-part12-props'],
            ['source13', 'VUE-part13-inject&总结']
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
      ],
      '/learning/': [
        {
          title: '学习方法',
          collapsable: false,
          children: [
            "",
            ['learning01', '学习方法-原理'],
          ]
        },
      ],
      '/code/': [
        {
          title: '手写代码',
          collapsable: false,
          children: [
            "",
            ['code01', '手写代码-基础篇'],
            ['code02', '手写代码-函数篇'],
          ]
        },
      ],
      '/webgl/': [
        {
          title: 'openlayers',
          collapsable: false,
          children: [
            "",
            ['openlayers01', 'openlayers01-原理篇'],
          ]
        },
      ],
      '/google/': [
        {
          title: 'Chromium',
          collapsable: false,
          children: [
            "",
            ['source01', 'JS代码执行过程'],
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
      { text: '数据结构与算法', link: '/algorithm/'},
      { text: '学习方法', link: '/learning/'},
      {
        text: '其它',
        items: [
          { text: '手写代码', link: '/code/'},
          { text: 'Chromium', link: '/google/'},
          { text: 'WebGL', link: '/webgl/'},
        ]
      }
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
