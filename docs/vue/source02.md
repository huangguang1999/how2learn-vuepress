# VUE-part2-Dep

上面我们使用数组去维护依赖，这样虽然容易理解，但是不好维护，为了更容易的维护这些依赖，可以实现一个维护依赖的类。

## 确定功能

首先可以先确定这个类下的属性，以及一些功能：

属性：
* target --- 函数，用于存放需要添加的依赖

实例下属性及方法：
* subs{Array} --- 用于存放依赖
* addSub{Function} --- 用于添加依赖
* removeSub{Function} --- 用于移除依赖
* notify{Function} --- 用于执行依赖

## 实现

是要在浏览器上执行，所以直接用ES5的类写法

```javascript
let Dep = function () {
    // 实例属性
    this.subs = []
    // 实例方法
    this.addSub = function (sub) {
        this.subs.push(sub)
    }

    this.removeSub = function(sub){
        const index = this.subs.indexOf(item)
        if (index > -1) {
            this.subs.splice(index, 1)
        }
    }
    
    this.notify = function(newValue, oldVaule){
        this.subs.forEach(fnc=>fnc(newValue, oldVaule))
    }
}

// 类属性
Dep.target = null
```

这样就拥有一个管理依赖的类（这里将依赖简化为一个方法），现在我们就可以动手来改一下之前的代码了。

```javascript
let defineReactive = function(object, key, value){
    let dep = new Dep()
    Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        get: function(){
            if(Dep.target){
                dep.addSub(Dep.target)
            }
            return value
        },
        set: function(newValue){
            if(newValue != value){
                dep.notify(newValue, value)
            }
            value = newValue
        }
    })
}
```

可以发现，之前我们用来存放依赖的数组变成了一个依赖管理（Dep）的实例。同样的，在取值时收集依赖，在设置值（当值发生变化）时触发依赖。

由于依赖的处理由 Dep 的实例管理了，这里仅仅调用一下相关方法即可。

```javascript
let object = {}
defineReactive(object, 'test', 'test')
Dep.target = function(newValue, oldValue){
    console.log('我被添加进去了，新的值是：' + newValue)
}
object.test
// test

Dep.target = null
object.test = 'test2'
// 我被添加进去了，新的值是：test2

Dep.target = function(newValue, oldValue){
    console.log('添加第二个函数，新的值是：' + newValue)
}
object.test
// test

Dep.target = null
object.test = 'test3'
// 我被添加进去了，新的值是：test3
// 添加第二个函数，新的值是：test3
```

但是上面的代码暴露了几个问题

1. Dep 这个类将监听属性和处理依赖进行了解耦，但是却没有完全解耦，在触发依赖的时候，还是得传新旧值。
2. 上面代码中 Dep 中定义的 removeSub 在代码中并没有用到，因为 Dep 的实例是在 defineReactive 函数的作用域中，外部并不能直接调用，而删除依赖肯定是在外部的环境中，也就是说即使我们将代码改成这样，我们还是不能直接取删除已经没用的依赖。
Vue 中实现了一个 Watcher 的类来处理以上两个问题，之后再说。

以下 ES6 语法下的 Dep ，Vue 源码中差不多就这样

```javascript
class Dep {

    constructor() {
        this.subs = []
    }

    addSub(sub) {
        this.subs.push(sub)
    }

    removeSub(sub) {
        const index = this.subs.indexOf(item)
        if (index > -1) {
            this.subs.splice(index, 1)
        }
    }

    notify() {
        this.subs.forEach(fnc=>fnc(oldValue, newValue))
    }
}

Dep.target = null
```
