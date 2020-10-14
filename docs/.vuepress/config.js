module.exports = {
  // 页面标题
  title: '光光',
  // 网页描述
  description: '闭上眼睛',
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
          title: 'vue3',
          children: [
            ['vue3-01', 'Vue3之proxy'],
          ]
        },
        {
          title: '封装vue组件库',
          children: [

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
            ['algorithm01', '二叉树'],
            ['algorithm02', '链表'],
            ['algorithm03', '数组'],
            ['algorithm04', '队列和栈'],
            ['algorithm05', '字符串']
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
            ['code03', '手写代码-promise'],
          ]
        },
      ],
      '/webgl/': [
        {
          title: '可视化基础',
          collapsable: false,
          children: [
            "",
            ['visualization01', '前端和可视化'],
          ]
        },
      ],
      '/google/': [
        {
          title: 'Chromium',
          collapsable: false,
          children: [
            ['source01', 'JS代码执行过程'],
            ['secure01', 'XSS/CSRF'],
            ['sort01', 'V8排序'],
            ['ram01', 'js内存模型'],
          ]
        },
      ],
      '/js/': [
        {
          title: 'JavaScript',
          collapsable: false,
          children: [
            "",
            ['js-time01', '异步'],
            ['design01', '设计模式'],
            ['animation01', '动画'],
            ['animation02', 'Vue动画'],
            ['draw01', '绘图'],
            ['request01', '请求'],
            ['this01', 'this'],
            ['type01', '类型转换'],
          ]
        },
      ],
      '/html/': [
        {
          title: 'HTML',
          collapsable: false,
          children: [
            "",
            ['html01', 'HTML基础'],
          ]
        },
      ],
      '/css/': [
        {
          title: 'CSS',
          collapsable: false,
          children: [
            "",
            ['css01', 'CSS基础'],
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
          { text: '浏览器', link: '/google/'},
          { text: 'WebGL', link: '/webgl/'},
          { text: 'JavaScript', link: '/js/'},
          { text: 'HTML', link: '/html/'},
          { text: 'CSS', link: '/css/'},
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
