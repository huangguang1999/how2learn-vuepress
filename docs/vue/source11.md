# VUE-part11-Extend

一个完整的 VUE 已经实现，那么如何进行扩展呢？一个组件可以是另一个组件的扩展，这样组件就会变的丰富起来。



## 组件的扩展

在 `Vue` 中有 `extend` 方法可以扩展 `Vue` 的实例，在上一步中，有一些实现是必须要通过子父组件才能实现，而子组件相当于一个特殊的 `Vue` 实例，所以这步，我们先把这个扩展实例的方法实现。

我们先来看看官网对于 `extend` 方法的介绍：

使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。

从后面一句和具体的使用方法可以得出其实是我们创建实例时，对于传入参数的扩展。对于这个参入参数我们就叫它 `options`。

我们接着往下想，既然这个 `options` 是能扩展的，那么原 `Vue` 类下，肯定保存着一个默认 `options` ，而创建 `Vue` 实例时，会把传入的 `options` 和默认的 `options` 进行合并。

所以 `extend` 方法，是对默认 `options` 进行扩展，从而实现扩展。



## mergeOption

ok 有了思路，我们来实现它：

首先是默认的 `options` ，同时我们假设一个方法（`mergeOptions`）用来合并 `options`

```javascript
let uid = 0

export class Vue extends Event {
    ···

    _init(options) {
        let vm = this
        // 为了方便引用合并的 options 我们把它挂载在 Vue 实例下
        vm.$options = mergeOptions(
            this.constructor.options,
            options,
            vm
        )
        ···
    }
}
// 默认的 options
Vue.options = {
    // 组件列表
    components: {},
    // 基类
    _base: Vue
}
```

接着我们来实现 `mergeOptions` ：

```javascript
import R from 'ramda'

export function mergeOptions(parent, child) {
    // data/methods/watch/computed
    let options = {}

    // 合并 data 同名覆盖
    options.data = mergeData(parent.data, child.data)

    // 合并 methods 同名覆盖
    options.methods = R.merge(parent.methods, child.methods)

    // 合并 watcher 同名合并成一个数组
    options.watch = mergeWatch(parent.watch, child.watch)

    // 合并 computed 同名覆盖
    options.computed = R.merge(parent.computed, child.computed)

    return options
}

function mergeData(parentValue, childValue) {
    if (!parentValue) {
        return childValue
    }
    if (!childValue) {
        return parentValue
    }
    return function mergeFnc() {
        return R.merge(parentValue.call(this), childValue.call(this))
    }
}

// 由于 watcher 的特殊性，我们不覆盖同名属性，而是都保存在一个数组中
function mergeWatch(parentVal, childVal) {
    if (!childVal) return R.clone(parentVal || {})
    let ret = R.merge({}, parentVal)
    for (let key in childVal) {
        let parent = ret[key]
        let child = childVal[key]
        if (parent && !Array.isArray(parent)) {
            parent = [parent]
        }
        ret[key] = parent
            ? parent.concat(child)
            : Array.isArray(child) ? child : [child]
    }
    return ret
}
```

目前我们仅仅实现了 `data/methods/watch/computed` 这 `4` 个 `options` 中的内容，所以我们先合并这 `4` 项，由于 `data/methods/computed` 这 `3` 项是具有唯一性（比如 `this.a` 应该是一个确定的值），所以采用同名属性覆盖的方式，而 `watch` 是当发生变化时候执行方法，所以所有注册过的方法都应该执行，因而采用同名属性的内容合并成一个数组。

这里我用了 [ramda](http://ramdajs.com/) 这个库提供的合并方法，用来合并两个对象，并不会修改原对象的内容。



## extend

ok 合并 `options` 的方法写好了，我们接着来实现 `extend` 同过上面的分析，`extend` 函数仅仅是对默认 `options` 的扩展

```javascript
Vue.extend = function (extendOptions) {
    const Super = this

    class Sub extends Super {
        constructor(options) {
            super(options)
        }
    }

    Sub.options = mergeOptions(
        Super.options,
        extendOptions
    )

    Sub.super = Super
    Sub.extend = Super.extend

    return Sub
}
```

同样的我们使用 `mergeOptions` 来合并一下 `options` 即可，同时将 `super` 指向父类、获取 `extend` 方法。



## 测试

```javascript
import {Vue} from './Vue.mjs'

let subVue = Vue.extend({
    data() {
        return {
            dataTest: 1
        }
    },
    methods: {
        methodTest() {
            console.log('methodTest')
        }
    },
    watch: {
        'dataTest'(newValue, oldValue) {
            console.log('watchTest newValue = ' + newValue)
        }
    },
    computed: {
        'computedTest': {
            get() {
                return this.dataTest + 1
            }
        }
    }
})

let test = new subVue({
    data() {
        return {
            subData: 11
        }
    },
    methods: {
        subMethod() {
            console.log('subMethodTest')
        }
    },
    watch: {
        'subData'(newValue, oldValue) {
            console.log('subWatch newValue = ' + newValue)
        }
    },
    computed: {
        'subComputed': {
            get() {
                return this.subData + 1
            }
        }
    }
})

console.log(test.dataTest)
// 1
console.log(test.subData)
// 11

console.log(test.computedTest)
// 2
console.log(test.subComputed)
// 12

test.methodTest()
// methodTest
test.subMethod()
// subMethodTest

test.dataTest = 2
// watchTest newValue = 2
test.subData = 12
// subWatch newValue = 12

console.log(test.constructor === subVue)
// true
console.log(subVue.super === Vue)
// true
```

ok 符合我们的预期，`extend` 方法也就实现了，下一步，实现父子组件。