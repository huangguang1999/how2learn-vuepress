# VUE-part12-props

有了父子组件，那么父子组件之间的数据传递变的格外重要起来，本节，我们来看看如何给已实现的实例上加上 Props 。



## 前言

在上一步，我们实现 `extend` 方法，用于扩展 `Vue` 类，而我们知道子组件需要通过 `extend` 方法来实现，我们从测试例子来入手，看看这一步我们需要实现什么：

```javascript
let test = new Vue({
    data() {
        return {
            dataTest: {
                subTest: 1
            }
        }
    },
    components: {
        sub: {
            props: {
                propsStaticTest: {
                    default: 'propsStaticTestDefault'
                },
                propsDynamicTest: {
                    default: 'propsDynamicTestDefault'
                }
            },
            watch: {
                'propsDynamicTest'(newValue, oldValue) {
                    console.log('propsDynamicTest newValue = ' + newValue)
                }
            }
        }
    }
})
```

从例子可知： `sub` 是 `test` 的子组件，同时 `test` 组件向 `sub` 组件传递了 `propsStaticTest/propsDynamicTest` 两个 `props` 。

所以我们这一步要做两件事

1. 实现子组件生成树结构
2. 实现 `props` ，从例子上可以看出需要实现静态和动态两种 `prop`



## VUE中组件的生成

虽然在之前的步骤中，我们一直没有涉及到模板，仅仅是把页面的渲染抽象成一个函数，主要是为了把 `MVVM` 中的数据绑定过程给解释清楚，但是父子组件的实现却必须要通过模板来联系，所以我们这里简单的介绍下 `Vue` 中由模板到生成页面渲染函数的过程

1. 得到模板（`DOM` 字符串）或是 `render` 函数
2. 分析模板，得到 `HTML` 语法树（`AST`），生成 `render` 函数。如果直接给的是 `render` 则没有这个步骤
3. 由 `render` 函数生成 `VNode` 这就是虚拟树了
4. 将 `Vnode` 作为参数传入一个函数中，就能得到 `html` 渲染函数

ok 看起来和组件好像没有什么关系，我们分析下组件写法

```javascript
<sub propsStaticTest="propsStatiValue" :propsDynamicTest="dataTest.subTest">
```

由上面这个标签我们可以得到什么？

1. 这是一个子组件，组件名：`sub`
2. 传递了一个静态的 `prop` ：`propsStaticTest`
3. 传递了一个动态的 `prop` ：`propsDynamicTest`

静态说明这个属性不会发生变化，动态会，最明显的区别就是：动态属性有 `:/v-bind` 修饰

结合上面的第2个步骤，会分析出一些东西。仅仅针对 `props` ，假设模板解析引擎会解析出下面这样一个结构

```javascript
let propsOption = [{
    key: 'propsStaticTest',
    value: 'propsStaticValue',
    isDynamic: false
}, {
    key: 'propsDynamicTest',
    value: 'dataTest.subTest',
    isDynamic: true
}]
```

**注：** 这里仅仅是我的假设，方便理解，在 `Vue` 中的模板解析出来的内容要比这个复杂。

ok 有了上面的铺垫我们来实现父子组件和 `props`



## 父子组件

实例初始化的实例我们需要做的仅仅就是保存组件之间的关系就行，ok 我们来实现它

```javascript
class Vue extends Event {
    ···
    _init(options) {
        let vm = this
        ···
        // 获取父节点
        let parent = vm.$options.parent
        // 将该节点放到父节点的 $children 列表中
        if (parent) {
            parent.$children.push(vm)
        }
        // 设置父节点和根节点
        vm.$parent = parent
        vm.$root = parent ? parent.$root : vm
        // 初始化子节点列表
        vm.$children = []
    }
}
```

我们需要做的仅仅就是给传入 `options` 设置 `parent` ，就能明确组件之间的关系。

接着我们模拟一下当模板编译的时候碰到 <sub></sub> 的情况，具体的来说就是会执行以下代码：

```javascript
let testSubClass = Vue.extend(test.$options.components.sub)
let testSub = new testSubClass({parent: test})
console.log(testSub.$parent === test)
// true
```

ok 现在我们先不想模板编译具体是如何进行的，从这两行代码中，我们可以看出我们先使用了 `extend` 扩展了 `Vue` 实例，生成一个子类（`testSubClass`），接着我们实例化该类，传入参数确定父实例。

想象下一，我们为什么要分两步把参数传入。

我们知道当我们写好子组件的配置时，子组件的内部状态就已经确定了，所以我们可以根据这些固定的配置去扩展 `Vue` 类方便我们调用（使用的时候 `new` 一下就可以）。

而该组件实例的父实例却并不固定，所以我们将这些在使用时才能确定的参数在组件实例化的时候传入。

接着我们来想象一下，如果子组件（`sub`）里面还有子组件（`sub-sub`）会怎么样？

1. 使用 `extend` 扩展 `Vue` 类
2. 确定父实例，`new` 的时候传入，而这个 `parent` 就是 `sub`

这样调用过多次之后，一颗 `Vue` 的实例树就生成了，每一个节点都保留着父实例的引用，子组件列表还有根实例。

希望你的脑子里已经长出了这颗树~

ok 接下来我们来实现 `props`



## props

希望你还记得下面这几行代码：

```javascript
let propsOption = [{
    key: 'propsStaticTest',
    value: 'propsStaticValue',
    isDynamic: false
}, {
    key: 'propsDynamicTest',
    value: 'dataTest.subTest',
    isDynamic: true
}]
```

这个是我们模拟模板编译时关于 `props` 的部分产出，具体的来说就是键值对，以及是否有 `:/v-bind` 修饰，而我们知道在 `Vue` 中这个修饰符是表示是否是动态绑定，所以我在这里使用 `isDynamic` 来标志。

首先我们来获取属性的数据，由于动态绑定的 `props` 是取值路径，所以我们得去父对象下获取值。

```javascript
let propsData = {}
propsOption.forEach(item => {
    if (item.isDynamic) {
        // eg: 'dataTest.subTest' => test.dataTest.subTest 将字符串转换成取值
        propsData[item.key] = item.value.split('.').reduce((obj, name) => obj[name], test)
    } else {
        propsData[item.key] = item.value
    }
})
console.log(propsData)
// { propsStaticTest: 'propsStaticValue', propsDynamicTest: 1 }
```

ok 我们拿到中属性对应的值，接着把 `propsData` 给传进去

```javascript
let testSub = new testSubClass({parent: test, propsData})
```

接着我们在 `_init` 方法中来处理 `props`

```javascript
_init(options) {
    ···
    let props = vm._props = {}
    let propsData = vm.$options.propsData
    for (let key in vm.$options.props) {
        let value = propsData[key]
        // 如果没有传值，使用默认值
        if (!value) {
            value = vm.$options.props[key].default
        }
        props[key] = value
    }
    observe(props)
    for (let key in props) {
        proxy(vm, '_props', key)
    }
    ···
}
```

`porps` 的处理和 `data` 类似，需要变成可监听结构，代理到 `this` 对象下，无非 `data` 是从传入的函数取值，而 `props` 从传入的 `propsData` 中取值。

ok 直到现在为止，看起来都很美好，但是部分 `props` 是动态的，父组件相应值的变化是需要同步到子组件中的，但目前我们还没有实现父组件和子组件的联系，仅仅是把值给取出放在子组件内而已。

其实一看到监听变化就理所当然的想到 `Watcher`，ok 我们用 `Watcher` 来实现它：

```javascript
propsOption.forEach(item => {
    if (item.isDynamic) {
        new Watcher({}, () => {
            return item.value.split('.').reduce((obj, name) => obj[name], test)
        }, (newValue, oldValue) => {
            testSub[item.key] = newValue
        })
    }
})
```

