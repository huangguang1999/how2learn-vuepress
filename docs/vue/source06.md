# VUE-part6-Array

之前的文章中，完美处理的对象的函数依赖绑定，那么数组又该如何处理，数组并不是固定的键值存储方式，这种特殊的结构该如何处理呢？



## 回顾

在前面的几个 `step` 中，我们实现对象的属性的监听，但是有关于数组的行为我们一直没有处理。
我们先分析下导致数组有哪些行为：

1. 调用方法：`arr.sp lice(1, 2, 'something1', 'someting2')`
2. 直接赋值：`arr[1] = 'something'`



## 解决行为一

首先我们知道数组下的一些方法是会对原数组照成影响的，有以下几个：

- push
- pop
- shift
- unshift
- splice
- sort
- reverse

这几个方法总的来说会照成几个影响：

- 数组长度发生变化
- 数组内元素顺序发生变化

不像对象，如果对象的 `key` 值的顺序发生变化，是不会影响视图的变化，但数组的顺序如果发生变化，视图是要变化的。

也就是说当着几个方法触发的时候，我们需要视图的更新，也就是要触发 `Dep` 中的 `notify` 函数。

但是纵观我们现在实现的代码（ `step5` 中的代码），我们并没有特地的为数组提供一个 `Dep`。

并且上述的几个数组方法是数组对象提供的，我们要想办法去触发 `Dep` 下的 `notify` 函数。

我们先为数组提供一个 `Dep` ，完善后的 `Observer` ：

```javascript
export class Observer {

    constructor(value) {
        this.value = value
        if (Array.isArray(value)) {
            // 为数组设置一个特殊的 Dep
            this.dep = new Dep()
            this.observeArray(value)
        } else {
            this.walk(value)
        }
        Object.defineProperty(value, '__ob__', {
            value: this,
            enumerable: false,
            writable: true,
            configurable: true
        })
    }

    /**
     * 遍历对象下属性，使得属性变成可监听的结构
     */
    walk(obj) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }

    /**
     * 同上，遍历数组
     */
    observeArray (items) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i])
        }
    }

}
```

同样的在 `defineReactive` 我们需要处理数组添加依赖的逻辑

```javascript
export function defineReactive(object, key, value) {
    let dep = new Dep()
    let childOb = observe(value)
    Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        get: function () {
            if (Dep.target) {
                dep.addSub(Dep.target)
                Dep.target.addDep(dep)
                // 处理数组的依赖
                if(Array.isArray(value)){
                    childOb.dep.addSub(Dep.target)
                    Dep.target.addDep(childOb.dep)
                }
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

ok 我们现在完成了依赖的添加，剩下的我们要实现依赖的触发。

处理方法：在数组对象调用特定方法时，首先找到的应该是我们自己写的方法，而这个方法中调用了原始方法，并触发依赖。

我们先来包装一下方法，得到一些同名方法：

```javascript
const arrayProto = Array.prototype
// 复制方法
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]

/**
 * 改变数组的默认处理，将新添加的对象添加监听
 */
methodsToPatch.forEach(function (method) {
    // 原始的数组处理方法
    const original = arrayProto[method]
    let mutator = function (...args) {
        const result = original.apply(this, args)
        const ob = this.__ob__
        let inserted
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2)
                break
        }
        // 新添加的对象需要添加监听
        if (inserted) ob.observeArray(inserted)
        // 触发 notify 方法
        ob.dep.notify()
        return result
    }
    Object.defineProperty(arrayMethods, method, {
        value: mutator,
        enumerable: false,
        writable: true,
        configurable: true
    })
})
```

ok 我们现在得到了一些列同名的方法，我只要确保在调用时，先调用到我们的方法即可。

有两种方式可以实现：

1. 数组对象上直接有该方法，这样就不会去找对象上的原型链
2. 覆盖对象的 `__proto__` ，这样寻找原型链时，就会先找到我们的方法

具体到代码中的实现：

```javascript
export class Observer {

    constructor(value) {
        this.value = value
        if (Array.isArray(value)) {
            this.dep = new Dep()
            const augment = ('__proto__' in {})
                ? protoAugment
                : copyAugment
            // 覆盖数组中一些改变了原数组的方法，使得方法得以监听
            augment(value, arrayMethods, arrayKeys)
            this.observeArray(value)
        } else {
            this.walk(value)
        }
        ...
    }
    ...
}

/**
 * 如果能使用 __proto__ 则将数组的处理方法进行替换
 */
function protoAugment (target, src, keys) {
    target.__proto__ = src
}

/**
 * 如果不能使用 __proto__ 则直接将该方法定义在当前对象下
 */
function copyAugment (target, src, keys) {
    for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i]
        Object.defineProperty(target, key, {
            value: src[key],
            enumerable: false,
            writable: true,
            configurable: true
        })
    }
}
```

测试一下：

```javascript
let object = {
    arrayTest: [1, 2, 3, 4, 5]
}

observe(object)

let watcher = new Watcher(object, function () {
    return this.arrayTest.reduce((sum, num) => sum + num)
}, function (newValue, oldValue) {
    console.log(`监听函数，数组内所有元素 = ${newValue}`)
})

object.arrayTest.push(10)
// 监听函数，数组内所有元素 = 25
```

到现在为止，我们成功的在数组调用方法的时候，添加并触发了依赖。



## 解决方案二

首先先说明，数组下的索引是和对象下的键有同样的表现，也就是可以用 `defineReactive` 来处理索引值，但是数组是用来存放一系列的值，我们并不能一开始就确定数组的长度，并且极有可能刚开始数组长度为 `0`，之后数组中的索引对应的内容也会不断的变化，所以为索引调用 `defineReactive` 是不切实际的。

但是类似于 `arr[1] = 'something'` 这样的赋值在数组中也是常见的操作，在 `Vue` 中实现了 `$set` 具体的细节这里不谈，这里实现了另一种方法，我们仅仅需要在数组对象下添加一个方法即可：

```javascript
arrayMethods.$apply = function () {
    this.__ob__.observeArray(this)
    this.__ob__.dep.notify()
}
```

测试一下：

```javascript
object.arrayTest[1] = 10
object.arrayTest.$apply()
// 监听函数，数组内所有元素 = 33
```

到目前为了，一个完整的数据监听的模型也就完成了，我们可以使用 `observe` 方法来得到一个可监听结构，然后用 `Watcher` 添加依赖。

在设置值的时候就能成功触发依赖。
