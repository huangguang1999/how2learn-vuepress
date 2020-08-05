# VUE-part9-Vue

响应式数据和事件模型都已经实现，是时候将这一切聚合到一个统一的对象下了。对！这个对象就是 VUE。



##　前言

激动人心的时候即将来临，之前我们做的 `8` 步，其实都在为这一步打基础，这一步，我们来简单实现一个 `Vue` 对象，还没有看过之前代码的同学，请确认看过之前的文章。



## 主要实现内容

我们从测试代码入手，来看我们这个 `Vue` 实现了什么，然后在根据要实现的内容来编写这个 `Vue` 对象：

```javascript
let test = new Vue({
    data() {
        return {
            baseTest: 'baseTest',
            objTest: {
                stringA: 'stringA',
                stringB: 'stringB'
            }
        }
    },
    methods: {
        methodTest() {
            console.log('methodTest')
            this.$emit('eventTest', '事件测试')
        }
    },
    watch: {
        'baseTest'(newValue, oldValue) {
            console.log(`baseTest change ${oldValue} => ${newValue}`)
        },
        'objTest.stringA'(newValue, oldValue) {
            console.log(`objTest.stringA change ${oldValue} => ${newValue}`)
        }
    }
})

test.$on('eventTest', function (event) {
    console.log(event)
})

test.methodTest()

test.baseTest
```

主要实现的内容有：

1. 有属性的监听 `Watcher`
2. 实例下 `data/methods` 数据的代理（直接使用 `this.xxx` 就能访问到具体的属性/方法）
3. 有事件 `$on/$emit`



## 实现

我们根据实现的难易程度来实现上面 `3` 点。

实现第 `3` 点，只要继承 `Event` 这个类即可：

**注：** 在 `Vue` 源码中并不是通过这个方式实现的事件，有兴趣的可以自己去了解下，但是在我看来这样是最容易理解的方式。

```javascript
class Vue extends Event {
    constructor() {
        // 调用父类的 constructor 方法
        super()
        ...
    }
    ...
}
```

`Event` 类在我们上一步已经实现。

接着我们来处理第二点。为了方便代码的管理，我们在类下定义一个 `_init` 方法，来实现 `Vue` 的初始化。

我们先实现 `methods` 的绑定，因为 `data` 是要被监听，所以要进行进一步的处理。

```javascript
class Vue extends Event {
    constructor(options) {
        // 调用父类的 constructor 方法
        super()
        this._init(options)
    }
    
    _init(options) {
        let vm = this
        if (options.methods) {
            for (let key in options.methods) {
                vm[key] = options.methods[key].bind(vm)
            }
        }
    }
}
```

ok `methods` 方法绑定完事，其实就这么简单。

接下来我们来处理 `data` ，由于 `data` 是需要被变换成可监听结构，所以我们先处理一下，然后代理到 `this` 对象下，如果直接赋值而不代理的话 `data` 的可监听结构就会被破坏，我们需要一个完整的对象，这个可监听结构才能完整。

这里先实现一下代理的方法：

```javascript
export function proxy(target, sourceKey, key) {
    const sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get() {
        },
        set() {
        }
    }
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

原理还是通过 `Object.defineProperty` 方法来实现，当访问（`get`） `target` 下的某个属性的时候，就会去找 `target[sourceKey]` 下的同名属性，设置（`set`） `target` 下的某个属性，就会让设置 `target[sourceKey]` 下的同名属性。这就实现了代理。

ok 代理实现，我们继续为 `_init` 添加方法，具体的步骤看代码中的注释

```javascript
class Vue extends Event {
    constructor(options) {
        // 调用父类的 constructor 方法
        super()
        this._init(options)
    }
    
    _init(options) {
        let vm = this
        if (options.methods) {
            for (let key in options.methods) {
                // 绑定 this 指向
                vm[key] = options.methods[key].bind(vm)
            }
        }
        // 由于 data 是个函数，所以需要调用，并绑定上下文环境
        vm._data = options.data.call(vm)
        // 将 vm._data 变成可监听结构，实现 watcher 的添加
        observe(vm._data)
        // 代理属性，这保证了监听结构是一个完成的对象
        for (let key in vm._data) {
            proxy(vm, '_data', key)
        }
    }
}
```

最后一步，添加 `watcher` ，仔细分析我们在实例化时写的 `watcher`：

```javascript
watch: {
    'baseTest'(newValue, oldValue) {
        console.log(`baseTest change ${oldValue} => ${newValue}`)
    },
    'objTest.stringA'(newValue, oldValue) {
        console.log(`objTest.stringA change ${oldValue} => ${newValue}`)
    }
}
```

`key` 为需要监听的属性的路径，`value` 为触发监听时的回调。

ok 我们来实现它

```javascript
class Vue extends Event {
    constructor(options) {
        super()
        this._init(options)
    }

    _init(options) {
        ...

        // 循环取出 key/value
        for (let key in options.watch) {
            // 用我们之前实现的 Watcher 来注册监听
            // 参一：watcher 的运行环境
            // 参二：获取注册该 watcher 属性
            // 参三：触发监听时的回调 
            new Watcher(vm, () => {
                // 需要监听的值，eg: 'objTest.stringA' ==> vm.objTest.stringA
                return key.split('.').reduce((obj, name) => obj[name], vm)
            }, options.watch[key])
        }

    }
}
```

ok `watcher` 也已经实现，以下就是完整的代码：

```javascript
export function proxy(target, sourceKey, key) {
    const sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get() {
        },
        set() {
        }
    }
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

let uid = 0

export class Vue extends Event {
    constructor(options) {
        super()
        this._init(options)
    }

    _init(options) {
        let vm = this
        vm.uid = uid++

        if (options.methods) {
            for (let key in options.methods) {
                vm[key] = options.methods[key].bind(vm)
            }
        }

        vm._data = options.data.call(vm)
        observe(vm._data)
        for (let key in vm._data) {
            proxy(vm, '_data', key)
        }

        for (let key in options.watch) {
            new Watcher(vm, () => {
                return key.split('.').reduce((obj, name) => obj[name], vm)
            }, options.watch[key])
        }

    }
}
```

接下来，我们来测试一下

```javascript
let test = new Vue({
    data() {
        return {
            baseTest: 'baseTest',
            objTest: {
                stringA: 'stringA',
                stringB: 'stringB'
            }
        }
    },
    methods: {
        methodTest() {
            console.log('methodTest')
            this.$emit('eventTest', '事件测试')
        }
    },
    watch: {
        'baseTest'(newValue, oldValue) {
            console.log(`baseTest change ${oldValue} => ${newValue}`)
        },
        'objTest.stringA'(newValue, oldValue) {
            console.log(`objTest.stringA change ${oldValue} => ${newValue}`)
        }
    }
})

test.$on('eventTest', function (event) {
    console.log(event)
})

test.methodTest()
// methodTest
// 事件测试

test.baseTest = 'baseTestChange'
// baseTest change baseTest => baseTestChange

test.objTest.stringA = 'stringAChange'
// objTest.stringA change stringA => stringAChange
```

刚开始使用 `Vue` 的时候，感觉代码里面都是些黑魔法，在看了源码之后惊觉：其实 `Vue` 的整个实现并没有什么黑魔法，有的是精心的结构和处理，耐心点看下去，我相信我的收获会很大。