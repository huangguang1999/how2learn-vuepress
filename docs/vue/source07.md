# VUE-part7-Event

本章与响应式数据无关，主要研究了 VUE 中事件模型的实现，通过实现一个简单的事件对象让 VUE 实例拥有了响应事件的能力。



## 事件是什么？

在标准浏览器中，我们经常使用：`addEventListener` 来为一个 DOM 添加一个事件（`click`、`mousemove`、`tap`等）。

在我看来，一个事件是一种行为（或情况），当发生这种行为（或情况）时，我们要去做的事，比如今天下雨了，那我就得去找伞；闹钟响了，那我就得起床等等。

仔细看这些情况，归结到代码中，无非就是一个行为（或情况）的名称，和一些列的动作，而在 `js` 中动作就是 `function`，一系列的动作就是一个函数的集合。



##　实现

如上所说，我们把事件抽象成一个类

类下属性 `&` 方法

- _events                一个对象 {key: eventName, value: Array<Function,Function...>}
- $on(eventName, func)          添加具体事件的处理函数
- $off(eventName)            取消事件处理函数
- $emit(eventName, data1, data2, ...)  用于触发事件
- $once(eventName, func)         设置仅触发一次的事件

ok 根据我们的构想，在来看这个实现好的 `Event` 类

```javascript
let uid = 0

export class Event {
    constructor() {
        this.id = ++uid
        this._events = {}
    }

    $on(eventName, fn) {
        let ctx = this;
        // 若 _events 对象下无对应事件名，则新建一个数组，然后将处理函数推入数组
        if(!ctx._events[eventName]){
            ctx._events[eventName] = []
        }
        ctx._events[eventName].push(fn)
        return ctx
    }

    $once(eventName, fn) {
        let ctx = this

        function on() {
            // 先取消，然后触发，确保仅触发一次
            ctx.$off(eventName, on)
            fn.apply(ctx, arguments)
        }

        on.fn = fn
        ctx.$on(eventName, on)
        return object
    }

    $off(eventName) {
        let ctx = this
        const cbs = ctx._events[eventName]
        if (cbs) {
            // 取消置空即可
            ctx._events[eventName] = null
        }
        return ctx
    }

    $emit(eventName, ...args) {
        let ctx = this
        let cbs = ctx._events[eventName]
        if (cbs) {
            cbs.forEach(func => func.apply(ctx, args))
        }
        return ctx
    }

}
```

ok 一个简易的事件管理实现了