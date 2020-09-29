# 手写代码-基础篇01



`call、apply、bind改变this指向`

## call

```javascript
function myCall (context, ...args) {
    context = (context ?? window) || new Object(context)
    const key = Symbol()
    context[key] = this
    const result = context[key](...args)
    delete context[key]
    return result
}
```



## bind

```javascript
function myBind (context, ...args) {
    const fn = this
    const bindFn = function (...newArgs) {
        return fn.call(
        	this instanceof bindFn ? this : context,
            ...args,...newArgs
        )
    }
    bindFn.prototype = Object.create(fn.prototype)
    return bindFn
}
```



# new

```javascript
function myNew (context, ...args) {
    const obj = {}
    Object.setPrototype(obj, context.prototype)
    let result = context.apply(obj, args)
    return result instanceof Object ? result : obj
}
```

