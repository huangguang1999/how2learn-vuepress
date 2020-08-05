# VUE-part3-Watcher

Dep可以帮我们维护需要执行的队列，但我们却需要手动调用，如何解决呢？这就需要一个实现一个监听器，来统一协调数据和Dep之间的关联。



## 前言

在step中，我们实现了一个管理依赖的Dep，但是仅仅使用这个类并不能完成我们想实现的功能，而且代码的解耦上也有点小问题。以下是在step2中最后说的几个问题：

1. 解耦不完全，需要传递参数
2. 没有地方可以移除依赖



## 考虑问题

第一个问题显示出来一个问题，由于我们的依赖是函数，为了函数的执行我们只能把参数传进去，这个问题的根源在于我们的依赖是一个函数；

第二个问题其实反映出当前的dep实例只有在defineReactive中使用，而没有暴露出来，只要在外部有这个实例的引用，那么我们就能顺利的调用移除依赖了（removeSub）。

解决第一个问题很简单，我们把某个属性的值、对应值变化时需要执行的函数抽象成一个对象，然后把这个对象当成是依赖，推入依赖管理中。

在第一个问题的基础上第二个问题就能解决了，我们只需要把dep的引用保存在依赖对象中就可以了。



## Watch的实现

基于以上考虑，那个依赖对象在vue中就是Watcher。	

```javascript
let Watcher = function (object, key, callback) {
	this.obj = object
	this.getter = key
	this.cb = callback
	this.dep = null
	this.value = undefined   
    
	this.get = function () {
        Dep.target = this
        let value = this.obj[this.getter]
        Dep.target = null
        return value
    }

    this.update = function () {
        const value = this.obj[this.getter]
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
该类的实例保存了需要监听的对象（object），取值方法（key），对应的回调（callback），需要监听的值（value），以及取值函数（get）和触发函数（update），这样我们酒吧依赖相关的所有内容保存在这个Watcher实例中。

为了保存对Dep的引用，在Watcher中设置了dep，用于存放该监听被那个dep给引用了。

由于在Watcher实例化的时候，我们已经对相应的值取了一次值，就是将以下代码放在Watcher中

```javascript
Dep.target = function(newValue, oldValue){
    console.log('我被添加进去了，新的值是：' + newValue)
}  
object.test
Dep.target = null 
```

对应的代码为

```javascript
this.get = function(){
    Dep.target = this
    let vaule = this.obj[this.getter]
    Dep.target = null
    return value
}

this.value = this.get()
```

所以在编写代码的时候不需要特地的去触发get的依赖。

那么针对 `Watcher` 我们需要改造一下之前实现的 `Dep` 和 `defineReactive` 函数。

1. 由于依赖变成了 `Watcher` 所以在 `Dep` 中 `notify` 应该改成 `Watcher` 下的触发函数：`update`
2. 由于 `watcher` 中存放了变量的状态，所以不需要在 `defineReactive` 函数中传入参数

```javascript
let Dep = function(){

    this.subs = []

    this.addSub = function(sub){
        this.subs.push(sub)
    }

    this.removeSub = function(sub){
        const index = this.subs.indexOf(sub)
        if (index > -1) {
            this.subs.splice(index, 1)
        }
    }

    this.notify = function(){
        // 修改触发方法
        this.subs.forEach(watcher=>watcher.update())
    }
}

Dep.target = null

let defineReactive = function(object, key, value){
    let dep = new Dep()
    Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        get: function(){
            if(Dep.target){
                dep.addSub(Dep.target)
                // 添加 watcher 对 dep 的引用
                Dep.target.addDep(dep)
            }
            return value
        },
        set: function(newValue){
            if(newValue != value){
                value = newValue
                // 不需要特地传入参数
                dep.notify()
            }
        }
    })
}
```

接下来测试一下：

```javascript
let object = {}
defineReactive(object, 'test', 'test') 

let watcher = new Watcher(object, 'test', function(newValue, oldValue){
    console.log('作为 watcher 添加的第一个函数，很自豪。新值：' + newValue)
})
object.test = 'test2'
// 作为 watcher 添加的第一个函数，很自豪。新值：test2

let watcher2 = new Watcher(object, 'test', function(newValue, oldValue){
    console.log('作为 watcher 添加的第二个函数，也很自豪。新值：' + newValue)
})
object.test = 'test3'
// 作为 watcher 添加的第一个函数，很自豪。新值：test3
// 作为 watcher 添加的第二个函数，也很自豪。新值：test3

// 接着我们来试一下删除依赖，把 watcher2 给删除
watcher2.dep.removeSub(watcher2)
object.test = 'test4'
// 作为 watcher 添加的第一个函数，很自豪。新值：test4
```



通过上面代码，我们成功解耦，用一个监听来处理某个属性的内容（`oldValue`, `newValue`, `callback`），而且我们也能够去除 `dep` 中没用的依赖。

当然这个 Watcher 还是需要优化的，比如被多个 `Dep` 引用，这个就得存一个数组，之后继续优化。
