# VUE-part10-Computed

现在我们来一个个实现 VUE 中内容，这节，我们先来实现计算属性，Computed。



## 回顾

先捋一下，之前我们实现的 `Vue` 类，主要有一下的功能：

1. 属性和方法的代理 `proxy`
2. 监听属性 `watcher`
3. 事件

对于比与现在的 `Vue` 中的数据处理，我们还有一些东西没有实现：`Computed`、`props`、`provied/inject`。

由于后两者和子父组件有关，先放一放，我们先来实现 `Computed` 。



## Computed

在官方文档中有这么一句话：

计算属性的结果会被缓存，除非依赖的响应式属性变化才会重新计算。

这也是计算属性性能比使用方法来的好的原因所在。

ok 现在我们来实现它，我们先规定一下一个计算属性的形式：

```javascript
{
    get: Function,
    set: Function
}
```

官方给了我们两种形式来写 `Computed` ，看了一眼源码，发现最终是处理成这种形式，所以我们先直接使用这种形式，之后再做统一化处理。

惯例我们通过测试代码来看我们要实现什么功能：

```javascript
let test = new Vue({
    data() {
        return {
            firstName: 'aco',
            lastName: 'Yang'
        }
    },
    computed: {
        computedValue: {
            get() {
                console.log('测试缓存')
                return this.firstName + ' ' + this.lastName
            }
        },
        computedSet: {
            get() {
                return this.firstName + ' ' + this.lastName
            },
            set(value) {
                let names = value.split(' ')
                this.firstName = names[0]
                this.lastName = names[1]
            }
        }
    }
})

console.log(test.computedValue)
// 测试缓存
// aco Yang
console.log(test.computedValue)
// acoYang （缓存成功，并没有调用 get 函数）
test.computedSet = 'accco Yang'
console.log(test.computedValue)
// 测试缓存 （通过 set 使得依赖发生了变化）
// accco Yang
```

我们可以发现：

1. 计算属性是代理到 `Vue` 实例上的一个属性
2. 第一次调用时，调用了 `get` 方法（有 ‘测试缓存’ 输出），而第二次没有输出
3. 当依赖发生改变时，再次调用了 `get` 方法



## 解决

第一点很好解决，使用 `Object.defineProperty` 代理一下就 ok。
接下来看第二点和第三点，**当依赖发生改变时，值就会变化**，这点和我们之前实现 `Watcher` 很像，计算属性的值就是 `get` 函数的返回值，在 `Watcher` 中我们同样保存了监听的值（`watcher.value`），而这个值是会根据依赖的变化而变化的（如果没看过 `Watcher` 实现的同学，去看下 `step3` 和 `step4`），所以计算属性的 `get` 就是 `Watcher` 的 `getter`。

那么 `Watcher` 的 `callback` 是啥？其实这里根本不需要 `callback` ，计算属性仅仅需要当依赖发生变化时，保存的值发生变化。

ok 了解之后我们来实现它，同样的为了方便理解我写成了一个类：

```javascript
function noop() {
}

let uid = 0

export default class Computed {
    constructor(key, option, ctx) {
        // 这里的 ctx 一般是 Vue 的实例
        this.uid = uid++
        this.key = key
        this.option = option
        this.ctx = ctx
        this._init()
    }

    _init() {
        let watcher = new Watcher(
            this.ctx,
            this.option.get || noop,
            noop
        )

        // 将属性代理到 Vue 实例下
        Object.defineProperty(this.ctx, this.key, {
            enumerable: true,
            configurable: true,
            set: this.option.set || noop,
            get() {
                return watcher.value
            }
        })
    }
}

// Vue 的构造函数
export class Vue extends Event {
    constructor(options) {
        super()
        this.uid = uid++
        this._init(options)
    }

    _init(options) {
        let vm = this
        ...
        for (let key in options.computed) {
            new Computed(vm, key, options.computed[key])
        }

    }
}
```

我们实现了代理属性 `Object.defineProperty` 和更新计算属性的值，同时依赖没变化时，也是不会触发 `Watcher` 的更新，解决了以上的 `3` 个问题。

但是，试想一下，计算属性真的需要实时去更新对应的值吗？

首先我们知道，依赖的属性发生了变化会导致计算属性的变化，换句话说就是，当计算属性发生变化了，`data` 下的属性一定有一部分发生了变化，而 `data` 下属性发生变化，会导致视图的改变，所以计算属性发生变化在去触发视图的变化是不必要的。

其次，我们不能确保计算属性一定会用到。

而基于第一点，计算属性是不必要去触发视图的变化的，所以计算属性其实只要在获取的时候更新对应的值即可。



## Watch的脏检查机制

根据我们上面的分析，而 `Computed` 是 `Watcher` 的一种实现，所以我们要实现一个不实时更新的 `Watcher`。

在 `Watcher` 中我们实现值的更新是通过下面这段代码：

```javascript
update() {
    const value = this.getter.call(this.obj)
    const oldValue = this.value
    this.value = value
    this.cb.call(this.obj, value, oldValue)
}
```

当依赖更新的时候，会去触发这个函数，这个函数变更了 `Watcher` 实例保存的 `value` ，所以我们需要在这里做出改变，先看下伪代码：

```javascript
update() {
    if(/* 判断这个 Watcher 需不需要实时更新 */){
        // doSomething
        // 跳出 update
        return
    }
    const value = this.getter.call(this.obj)
    const oldValue = this.value
    this.value = value
    this.cb.call(this.obj, value, oldValue)
}
```

这里的判断是需要我们一开始就告诉 `Watcher` 的，所以同样的我们需要修改 `Watcher` 的构造函数

```javascript
constructor(object, getter, callback, options) {
    ···
    if (options) {
        this.lazy = !!options.lazy
    } else {
        this.lazy = false
    }
    this.dirty = this.lazy
}
```

我们给 `Watcher` 多传递一个 `options` 来传递一些配置信息。这里我们把不需要实时更新的 `Watcher` 叫做 `lazy Watcher`。同时设置一个标志（`dirty`）来标志这个 `Watcher` 是否需要更新，换个专业点的名称是否需要进行脏检查。

ok 接下来我们把上面的伪代码实现下：

```javascript
update() {
    // 如果是 lazy Watcher
    if (this.lazy) {
        // 需要进行脏检查
        this.dirty = true
        return
    }
    const value = this.getter.call(this.obj)
    const oldValue = this.value
    this.value = value
    this.cb.call(this.obj, value, oldValue)
}
```

如果代码走到 `update` 也就说明这个 `Watcher` 的依赖发生了变化，同时这是个 `lazy Watcher` ，那这个 `Watcher` 就需要进行脏检查。

但是，上面代码虽然标志了这个 `Watcher` ，但是 `value` 并没有发生变化，我们需要专门写一个函数去触发变化。

```javascript
/**
 * 脏检查机制手动触发更新函数
 */
evaluate() {
    this.value = this.getter.call(this.obj)
    // 脏检查机制触发后，重置 dirty
    this.dirty = false
}
```

ok 接着我们来修改 `Computed` 的实现：

```javascript
class Computed {
    constructor(ctx, key, option,) {
        this.uid = uid++
        this.key = key
        this.option = option
        this.ctx = ctx
        this._init()
    }

    _init() {
        let watcher = new Watcher(
            this.ctx,
            this.option.get || noop,
            noop,
            // 告诉 Wather 来一个 lazy Watcher
            {lazy: true}
        )

        Object.defineProperty(this.ctx, this.key, {
            enumerable: true,
            configurable: true,
            set: this.option.set || noop,
            get() {
                // 如果是 dirty watch 那就触发脏检查机制，更新值
                if (watcher.dirty) {
                    watcher.evaluate()
                }
                return watcher.value
            }
        })
    }
}
```

ok 测试一下

```javascript
let test = new Vue({
    data() {
        return {
            firstName: 'aco',
            lastName: 'Yang'
        }
    },
    computed: {
        computedValue: {
            get() {
                console.log('测试缓存')
                return this.firstName + ' ' + this.lastName
            }
        },
        computedSet: {
            get() {
                return this.firstName + ' ' + this.lastName
            },
            set(value) {
                let names = value.split(' ')
                this.firstName = names[0]
                this.lastName = names[1]
            }
        }
    }
})
// 测试缓存 （刚绑定 watcher 时会调用一次 get 进行依赖绑定）
console.log('-------------')
console.log(test.computedValue)
// 测试缓存
// aco Yang
console.log(test.computedValue)
// acoYang （缓存成功，并没有调用 get 函数）

test.firstName = 'acco'
console.log(test.computedValue)
// 测试缓存 （当依赖发生变化时，就会调用 get 函数）
// acco Yang

test.computedSet = 'accco Yang'
console.log(test.computedValue)
// 测试缓存 （通过 set 使得依赖发生了变化）
// accco Yang
```

到目前为止，单个 `Vue` 下的数据相关的内容就差不多了，在实现 `props`、`provied/inject` 机制前，我们需要先实现父子组件，这也是下一步的内容。