# VUE-part4-优化Watcher

实现了Watcher，解耦了Dep与数据之间的关系，但是那个只是一个粗糙的实现，一个完美的Watcher该如何呢？



## 回顾

思考一个截止当前都做了什么：

1. 通过defineReactive这个函数，实现了对于数据取值和设置的监听
2. 通过Dep类，实现了依赖的管理
3. 通过Watcher类，抽象出对象下某个属性的依赖，以及属性变换的callback



## 发现问题

对比Vue的MVVM（先把视图层的渲染抽象成一个函数），我们仅仅只是实现了一些基础性的东西。还是有很大的区别，比如：

1. 我们的Watcher仅仅是抽象了对象下的单一属性，而一般视图层的渲染是涉及多个属性的，而这些属性的变化是同一个渲染函数（也就是Vue中编译模板字符串最终生成的函数）。
2. 通过第一点，我们可以得知，对象下的某几个属性是拥有同一个Watcher的，换句话说，多个Dep依赖与同一个Watcher，那么Watcher中如何保存这些Dep，按照之前的实现，都是一个Watcher中仅仅保存一个Dep



## 解决问题

**问题一**

先思考一下，如何将依赖注入到Dep中的

通过取值触发defineProperty中的get，然后添加依赖

换句话说就是，我只要取过对应属性的值，那么就可以添加依赖：

之前的实现：

```javascript
this.get = function () {
    Dep.target = this
    let value = this.obj[this.getter]
    Dep.target = null
    return value
}
```

这段代码就实现了添加相应属性的依赖，归根到底是这段起了作用

```javascript
let value = this.obj[this.getter]
```

这里触发了对应属性的 `get` ，那好针对第一个问题，我们只要在这里触发多个属性的 `get` 即可，至于要触发那些属性，我们交由调用者来控制，顺理成章的这里应该是一个函数。考虑之后便有了以下代码

```javascript
let Watcher = function (object, getter, callback) {
    this.obj = object
    // 这里的 getter 应该是一个函数
    this.getter = getter
    this.cb = callback
    this.dep = null
    this.value = undefined

    this.get = function () {
        Dep.target = this
        // 将取值方式改成函数调用
        let value = this.getter.call(object)
        Dep.target = null
        return value
    }

    this.update = function () {
        const value = this.getter.call(object)
        const oldValue = this.value
        this.value = value
        this.cb.call(this.obj, value, oldValue)
    }

    this.addDep = function (dep) {
        this.dep = dep
    }

    this.value = this.get()
}
```



**问题二**

问题二其实很简单，既然要保存多个 dep 我们把保存的值声明成一个数组即可

```javascript
let Watcher = function (object, getter, callback) {
    this.obj = object
    this.getter = getter
    this.cb = callback
    // 声明成数组
    this.deps = []
    this.value = undefined

    this.get = function () {
        Dep.target = this
        let value = this.getter.call(object)
        Dep.target = null
        return value
    }

    this.update = function () {
        const value = this.getter.call(object)
        const oldValue = this.value
        this.value = value
        this.cb.call(this.obj, value, oldValue)
    }

    this.addDep = function (dep) {
        // 将 dep 推入数组中
        this.deps.push(dep)
    }

    this.value = this.get()
}
```

为了方便取消这个 `Watcher` ，我们在添加一个函数，用于取消所有 `Dep` 对 `Watcher` 的依赖，所以最终 `Watcher` 的代码如下：

```javascript
let Watcher = function (object, getter, callback) {
    this.obj = object
    this.getter = getter
    this.cb = callback
    this.deps = []
    this.value = undefined

    this.get = function () {
        Dep.target = this
        let value = this.getter.call(object)
        Dep.target = null
        return value
    }

    this.update = function () {
        const value = this.getter.call(object)
        const oldValue = this.value
        this.value = value
        this.cb.call(this.obj, value, oldValue)
    }

    this.addDep = function (dep) {
        this.deps.push(dep)
    }

    // 新添加的取消依赖的方法
    this.teardown = function () {
        let i = this.deps.length
        while (i--) {
            this.deps[i].removeSub(this)
        }
        this.deps = []
    }

    this.value = this.get()
}
```



## 测试

我们仅仅优化了 `Watcher` 的实现，其他的代码并没有发生变化

```javascript
let object = {}
defineReactive(object, 'num1', 2)
defineReactive(object, 'num2', 4)

let watcher = new Watcher(object, function () {
    return this.num1 + this.num2
}, function (newValue, oldValue) {
    console.log(`这是一个监听函数，${object.num1} + ${object.num2} = ${newValue}`)
})

object.num1 = 3
// 这是一个监听函数，3 + 4 = 7
object.num2 = 10
// 这是一个监听函数，3 + 10 = 13

let watcher2 = new Watcher(object, function () {
    return this.num1 * this.num2
}, function (newValue, oldValue) {
    console.log(`这是一个监听函数，${object.num1} * ${object.num2} = ${newValue}`)
})

object.num1 = 4
// 这是一个监听函数，4 + 10 = 14
// 这是一个监听函数，4 * 10 = 40
object.num2 = 11
// 这是一个监听函数，4 + 11 = 15
// 这是一个监听函数，4 * 11 = 44

// 测试取消
watcher2.teardown()

object.num1 = 5
// 这是一个监听函数，5 + 11 = 16
object.num2 = 12
// 这是一个监听函数，5 + 12 = 17
```

这就实现了对于多个属性设置同一个监听，当监听函数中的依赖属性发生变化时，自动执行了相应的函数。

关于 `Vue` 中的 `MVVM` 的实现 ，差不多也就这样了，当然这仅仅是基础的实现，而且视图层层渲染抽象成一个函数。

不同于 `Vue` 中的实现，这里少了很多各种标记和应用标记的过程。

这些会增加理解难度，之后有用到再说，实现完整的 `MVVM` 还需要对数组进行特殊的处理，因为数组是不能用 `Object.defineProperty` 来处理索引值的，这个也之后再说。

