# VUE-part13-inject&总结

最后一个内容，inject 跨组件传递，让子孙组件直接获取父组件的数据，最后总结一下。



## provide/inject

在上一步我们实现了，父子组件，和 `props` 一样 `provide / inject` 也是基于父子组件实现的，相比于 `props` 它的实现还要更简单一点。我们先来看看官网上对 `provide / inject` 的描述。

这对选项需要一起使用，以允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在起上下游关系成立的时间里始终生效。

首先，由官网的例子可知，`provide` 的值是静态的，并不会去绑定到 `data` 中的内容。

so 静态的，简单~，那实现一下。

```javascript
export class Vue extends Event {
    ···
    _init(options) {
        ···
        // 用实例下的 _provide 属性，保存传入的 provide
        vm._provide = vm.$options.provide

        // 从父组件的 _provide 取对应属性，若没有继续往上找，直到找到根节点
        // 若找到根节点还没有，就使用默认值
        let inject = vm._inject = {}
        for (let key in  vm.$options.inject) {
            inject[key] = getProvideForInject(vm, key, vm.$options.inject[key].default)
        }
        // 代理到 this 下
        for (let key in inject) {
            proxy(vm, '_inject', key)
        }
    }
}
```

测试代码：

```javascript
import {Vue} from './Vue.mjs'

let test = new Vue({
    provide: {
        foo: 'bar'
    },
    components: {
        sub: {
            inject: {
                foo: {default: 'foo'},
                bar: {default: 'subBar'}
            },
            components: {
                subSub: {
                    inject: {
                        foo: {default: 'foo'},
                        bar: {default: 'subSubBar'}
                    }
                }
            }
        }
    }
})

let testSubClass = Vue.extend(test.$options.components.sub)
let testSub = new testSubClass({parent: test})

let testSubSubClass = Vue.extend(testSub.$options.components.subSub)
let testSubSub = new testSubSubClass({parent: testSub})

console.log(testSub.foo)
// bar
console.log(testSub.bar)
// subBar
console.log(testSubSub.foo)
// bar
console.log(testSubSub.bar)
// subSubBar
```

ok 其实这对属性的实现挺简单的，就是取值而已。

到此为止，`Vue` 中关于数据绑定的部分基本上实现的差不多了（不包括 `directives/filters/slot/ref` ···这些与页面渲染的东西）

但也有以下东西没实现内容简单就不过多的介绍了

1. mixins: 就是 `options` 的合并
2. 生命周期函数: 在特定的时间触发特定名称的事件即可
3. $nextTick: 可以去看看 `JS Event Loop` 的相关内容，优先使用微任务来实现

接下来我们来想想，目前我们实现的东西都能干嘛？



## 总结

总的来说，我们实现了一个可响应的对象，我们可以拿到这个对象下数据的变化。

通过装作这些变化，我们实现了 `Computed`、`Watcher` 从而到达了数据变化触发函数的过程。

于此同时，我们还实现了 `Event` 来扩展这个可响应的结构，让这个对象拥有了触发和响应事件的能力。

最后我们实现了实例的树结构，在这个基础上实现了 `props` 和 `provide/inject` 。

那么还是那个问题，这个东西能干嘛用？

我想了想，前端的应用很明显，我们只要加一个视图层的渲染函数，就能补充成一个 `MVVM` 框架，`Vue` 也是在这个基础上实现的。当然你也可以实现自己虚拟节点，创造一个属于你自己的 `MVVM` 框架。

或者小型的项目，并不需要虚拟节点，那么绑定一个 `HTML` 渲染函数即可，所以我们实现的这个可响应结构对于 `MVVM` 来说，仅仅少了一层 `VIEW` ，所以我想叫 `MVM` 也是没问题的。

但是我想这个东西是纯 `Js` 的，所以能发挥的能力也肯定不仅仅是在前端，我之所以将这个完全的脱离模板来分析，也是想把这块单独出来成为一个工具。

对于这个可响应结构，我想了想用处：

1. 项目自动化配置，打包，初始化
2. 根据配置筛选数据
3. ···

对于第一点，假设我们有一个项目的配置（一个 `js` 对象），然后我们把这个对象变成响应结构，那么当这个对象发生变化的时候，比如说版本号变动，那么可以触发更新代码，打包编译代码，发送代码到服务等一些列的步骤。

对于第二点，假设在后端，我们有一堆数据，我们的需求是根据需求去筛选数据，比如 `pageNo/pageSize` 等等，那么我们可以根据需求定下一个 `js` 配置对象，然后针对每个属性添加一系列定义好的 `Watcher` ，那么我们就可以根据这个对象的变动执行特定的方法，而我们所需要做的仅仅是把配置对象的属性改一下就好，比如说当执行 `obj.pageNo = 2` ，然后程序就自动的把对应的数据给筛选出来了。

当然，这个可响应的结构的用处远不至于此，只要以数据驱动或是配置化的地方，都有用武之地。

ok finally 这个系列的文章算是结束了，至于 `VUE` 中关于，模板解析和虚拟 `DOM` 的实现，会有单独的系列，但模板解析大部分是在正则解析，所以可能会没有。