# VUE-MVVM-part1-defineProperty

首先了解一个Object对象中自带的一个API：`Object.defineProperty()`

PS：需要在Object构造器上调用此方法，而不是在任意一个Object类型的实例上调用。

语法：`Object.defineProperty(obj, prop, descriptor)`

参数：

`obj` --- 要定义属性的对象
`prop` --- 要定义或修改的属性的名称或`Symbol`
`descriptor` --- 要定义或修改的属性描述符

返回值：

被传递给函数的对象。


---

所以我们能使用`Object.defineProperty`给一个对象去赋值

```javascript
let object = {}, test = 'test'
Object.defineProperty(object, 'test', {
    configurable: true,             // 描述该属性的描述符能否被改变，默认值为 false
    enumerable: true,               // 能否被遍历，比如 for in，默认值为 false
    get: function(){                // 取值的时候调用，object.test，默认值为 false
        console.log('enter get')
        return test
    },
    set: function(newValue){        // 设置值的时候使用
        console.log('enter set')
        test = newValue
    }
})
```

虽然这样写会让代码量变得很多，但是可以拥有控制属性值和设置值的权利

```javascript
object.test
// enter get
// test
object.test = 'test2'
// enter set
// test2
```

同时我们可以把`definedProperty`这个函数封装同时改造一下，方便我们调用

```javascript
let callback = {
    target: null
}
let defineReactive = function(object, key, value){
    let array = []
    Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        get: function(){
            if(callback.target){
                array.push(callback.target)
            }
            return value
        },
        set: function(newValue){
            if(newValue != value){
                array.forEach((fun)=>fun(newValue, value))
            }
            value = newValue
        }
    })
}
```

可以从代码中看出来，函数内部声明了一个数组用来存放`callback`中的`target`，当对`object`进行`get`操作（取值操作）的时候，就会往`array`中存放函数，
进行`set`操作（设置值）的时候执行`array`中的函数。

```javascript
let object = {}
defineReactive(object, 'test', 'test')
callback.target = function(newValue, oldValue){
    console.log('我被添加进去了，新的值是：' + newValue)
}
object.test
// test

callback.target = null
object.test = 'test2'
// 我被添加进去了，新的值是：test2

callback.target = function(newValue, oldValue){
    console.log('添加第二个函数，新的值是：' + newValue)
}
object.test
// test

callback.target = null
object.test = 'test3'
// 我被添加进去了，新的值是：test3
// 添加第二个函数，新的值是：test3
```

这样我们就达成了在`object.test`的值发生改变时，运行一个函数队列的目的。

换个说法，当我们取值的时候，函数自动帮我们添加针对当前值的依赖，当这个值发生变化的时候，处理了这些依赖，比如说`DOM`节点的变化

这个也是VUE中实现MVVM的最核心的代码，当然在VUE中，这个依赖收集的过程远比现在的代码要复杂，这里是简单实现了依赖的收集和触发，对于依赖的管理这里的代码还做不到。

