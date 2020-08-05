# VUE-part5-Observe

现在万事具备，有了依赖管理，有了关联关系的抽象，那么只需要变量数据就好了，如何进行遍历呢，是否可以抽象成一个过程呢？



## 回顾

在 `step4` 中，我们大致实现了一个 `MVVM` 的框架，由3个部分组成：

1. `defineReactive` 控制了对象属性，使变为可监听结构
2. `Dep` 收集管理依赖
3. `Watcher` 一个抽象的依赖

`defineReactive` 和 `Dep` 改造了对象下的某个属性，将目标变成了观察者模式中的目标，当目标发生变化时，会调用观察者；

`Watcher` 就是一个具体的观察者，会注册到目标中。

之前的代码实现了观察者模式，使得数据的变化得以响应，但是还是有两个需要优化的地方:

1. 如果我们想让对象的属性都得以响应，那我们必须对对象下的所有属性进行遍历，依次调用 `defineReactive` 这不是很方便
2. 代码都在一个文件中，不利于管理



## 解决

#### 问题2

使用 `webpack/babel` 进行打包和转码，然后放到浏览器上运行即可。



#### 问题1

对于问题1，我们需要做的仅仅是实现一个方法进行遍历对象属性即可。我们把这个过程抽象成一个对象 `Observe` 。至于为什么要把这个过程抽象成一个对象，后面会说。

**注：** 由于是在 `node` 环境下运行代码，这里就直接用 `ES6` 的语法了。同样的我把别的模块也用 `ES6` 语法写了一遍。

```javascript
export class Observer {

    constructor(value) {
        this.value = value
        this.walk(value)
        // 标志这个对象已经被遍历过，同时保存 Observer
        Object.defineProperty(value, '__ob__', {
            value: this,
            enumerable: false,
            writable: true,
            configurable: true
        })
    }

    walk(obj) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }
}
```

从代码可以看出，这个类在实例化的时候自动遍历了传入参数下的所有属性（`value`），并把每个属性都应用了 `defineReactive` 。
为了确保传入的值为对象，我们再写一个方法来判断。

```javascript
export function observe (value) {
    // 确保 observe 为一个对象
    if (typeof value !== 'object') {
        return
    }
    let ob
    // 如果对象下有 Observer 则不需要再次生成 Observer
    if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__
    } else if (Object.isExtensible(value)) {
        ob = new Observer(value)
    }
    return ob
}
```

函数返回该对象的 `Observer` 实例，这里判断了如果该对象下已经有 `Observer` 实例，则直接返回，不再去生产 `Observer` 实例。这就确保了一个对象下的 `Observer` 实例仅被实例化一次。

上面代码实现了对某个对象下所有属性的转化，但是如果对象下的某个属性是对象呢？
所以我们还需改造一下 `defineReactive` 具体代码为：

```javascript
export function defineReactive(object, key, value) {
    let dep = new Dep()
    // 遍历 value 下的属性，由于在 observe 中已经判断是否为对象，这里就不判断了
    observe(value)
    Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        get: function () {
            if (Dep.target) {
                dep.addSub(Dep.target)
                Dep.target.addDep(dep)
            }
            return value
        },
        set: function (newValue) {
            if (newValue !== value) {
                value = newValue
                dep.notify()
            }
        }
    })
}
```

ok 我们来测试下

```javascript
import Watcher from './Watcher'
import {observe} from "./Observe"

let object = {
    num1: 1,
    num2: 1,
    objectTest: {
        num3: 1
    }
}

observe(object)

let watcher = new Watcher(object, function () {
    return this.num1 + this.num2 + this.objectTest.num3
}, function (newValue, oldValue) {
    console.log(`监听函数，${object.num1} + ${object.num2} + ${object.objectTest.num3} = ${newValue}`)
})

object.num1 = 2
// 监听函数，2 + 1 + 1 = 4
object.objectTest.num3 = 2
// 监听函数，2 + 1 + 2 = 5
```

当然为了更好的了解这个过程，最好把 `step5` 目录中的代码拉下来一起看。至于之前实现的功能这里就不专门写测试了。

最后解释下为什么要把**遍历对象属性这个过程抽象成一个对象**

- 对象在 `js` 下存放是是引用，也就是说有可能几个对象下的某个属性是同一个对象下的引用，如下 `let obj1 = {num1: 1} let obj2 = {obj: obj1} let obj3 = {obj: obj1} `如果我们抽象成对象，而仅仅是函数调用的话，那么 `obj1` 这个对象就会遍历两次，而抽象成一个对象的话，我们可以把这个对象保存在 `obj1` 下（**ob** 属性），遍历的时候判断一下就好。
- 当然解决上面问题我们也可以在 `obj1` 下设置一个标志位即可，但是这个对象在之后会有特殊的用途，先这样写吧。（与数组和 `Vue.set` 有关）

在代码中我为 `Dep` 和 `Watch` 添加了 `id` 这个暂时用不到，先加上。
