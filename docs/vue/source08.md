# VUE-part8-优化Event

  一个简单的事件类在上一章就能实现，但那真的是最佳实现吗？



## 回顾

在上一步我们实现了一个简易的事件管理的类，接下来我们把它给优化下，方便我们的使用。主要优化内容：

1. 方便为多个事件添加同一个函数
2. 方便为一个事件添加多个函数
3. 有针对性的取消事件的函数

第一点和第二点都要修改 `$on` 函数，所以我们一起改：

之前的代码

```javascript
$on(eventName, fn) {
    let ctx = this;
    if(!ctx._events[eventName]){
        ctx._events[eventName] = []
    }
    ctx._events[eventName].push(fn)
    return ctx
}
```

优化后的代码

```javascript
$on(eventName, fn) {
    let ctx = this
    // 处理事件名是数组的情况
    if (Array.isArray(eventName)) {
        // 递归调用 $on 函数
        eventName.forEach(name => this.$on(name, fn))
    } else {
        // 处理处理函数为数组的情况
        // 将处理函数统一成数组方便添加
        if (!Array.isArray(fn)) {
            fn = [fn]
        }
        if(!ctx._events[eventName]){
            ctx._events[eventName] = []
        }
        ctx._events[eventName].push(fn)
    }
    return ctx
}
```

很简单的优化，但却让 `$on` 函数更加方便的使用。

接着我们来优化 `$off` 。我们先看看之前的代码：

```javascript
$off(eventName) {
    let ctx = this
    const cbs = ctx._events[eventName]
    if (cbs) {
        // 取消置空即可
        ctx._events[eventName] = null
    }
    return ctx
}
```

我们只做了清空特定事件，其实我们能做的还有很多，

1. 清空所有事件
2. 清空多个事件
3. 取消特定事件的特定处理函数

优化的细节看代码中的注释

```javascript
$off(eventName, fn) {
    let ctx = this
    // 清空所有事件
    if (!arguments.length) {
        ctx._events = Object.create(null)
        return ctx
    }
    // 清空多个事件
    if (Array.isArray(eventName)) {
        eventName.forEach(name => this.$off(name, fn))
        return ctx
    }
    // 若没有事件对应的函数列表则不用处理
    const cbs = ctx._events[eventName]
    if (!cbs) {
        return ctx
    }
    // 清空特定事件
    if (!fn) {
        ctx._events[eventName] = null
        return ctx
    }
    // 取消特定事件的特定处理函数
    if (fn) {
        let cb
        let i = cbs.length
        // 处理一次取消多个的情况
        if (Array.isArray(fn)) {
            fn.forEach(fnc => this.$off(eventName, fnc))
        }
        while (i--) {
            cb = cbs[i]
            if (cb === fn || cb.fn === fn) {
                cbs.splice(i, 1)
                break
            }
        }
    }
    return ctx
}
```

ok 优化好了，测试一下：

```javascript
import {Event} from "./Event";

let eventTest = new Event()

eventTest.$on('eventName1', (e) => {
    console.log('一次添加一个处理函数')
    console.log(e)
})

eventTest.$on('eventName2', [(e) => {
    console.log('一次添加多个处理函数，第一个')
    console.log(e)
}, (e) => {
    console.log('一次添加多个处理函数，第二个')
    console.log(e)
}])

eventTest.$on(['eventName3', 'eventName4'], (e) => {
    console.log('多个事件添加同一处理函数')
    console.log(e)
})

eventTest.$on(['eventName5', 'eventName6'], [(e) => {
    console.log('多个事件添加多个处理函数，第一个')
    console.log(e)
}, (e) => {
    console.log('多个事件添加多个处理函数，第二个')
    console.log(e)
}])

eventTest.$emit('eventName1', '传入参数1')
// 一次添加一个处理函数
// 传入参数1
eventTest.$emit('eventName2', '传入参数2')
// 一次添加多个处理函数，第一个
// 传入参数2
// 一次添加多个处理函数，第二个
// 传入参数2
eventTest.$emit('eventName3', '传入参数3')
// 多个事件添加同一处理函数
// 传入参数3
eventTest.$emit('eventName4', '传入参数4')
// 多个事件添加同一处理函数
// 传入参数4
eventTest.$emit('eventName5', '传入参数5')
// 多个事件添加多个处理函数，第一个
// 传入参数5
// 多个事件添加多个处理函数，第二个
// 传入参数5
eventTest.$emit('eventName6', '传入参数6')
// 多个事件添加多个处理函数，第一个
// 传入参数6
// 多个事件添加多个处理函数，第二个
// 传入参数6
console.log('------------------------------')

eventTest.$off('eventName1')
eventTest.$off(['eventName2', 'eventName3'])

eventTest.$emit('eventName1', '传入参数1')
// 无输出
eventTest.$emit('eventName2', '传入参数2')
// 无输出
eventTest.$emit('eventName3', '传入参数3')
// 无输出
eventTest.$emit('eventName4', '传入参数4')
// 多个事件添加同一处理函数
// 传入参数4
eventTest.$emit('eventName5', '传入参数5')
// 多个事件添加多个处理函数，第一个
// 传入参数5
// 多个事件添加多个处理函数，第二个
// 传入参数5
eventTest.$emit('eventName6', '传入参数6')
// 多个事件添加多个处理函数，第一个
// 传入参数6
// 多个事件添加多个处理函数，第二个
// 传入参数6
console.log('------------------------------')

eventTest.$off()
eventTest.$emit('eventName1', '传入参数1')
// 无输出
eventTest.$emit('eventName2', '传入参数2')
// 无输出
eventTest.$emit('eventName3', '传入参数3')
// 无输出
eventTest.$emit('eventName4', '传入参数4')
// 无输出
eventTest.$emit('eventName5', '传入参数5')
// 无输出
eventTest.$emit('eventName6', '传入参数6')
// 无输出
console.log('------------------------------')
```

这两节吧，事件介绍了下，一个健壮的事件的类也编写好了，接下来我们把这 `8` 步实现的内容集合到一个对象下，也就是 `Vue` 中。