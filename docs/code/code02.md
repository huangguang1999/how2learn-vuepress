# 手写代码-函数篇



## 函数防抖

```javascript
function debounce(fn, delay) {
    let timer = null
    return function (...args) {
        let context = this
        if (timer) clearTimeout(timer)
        timer = setTimeout (function () {
            fn.apply(context, args)
        }, delay)
    }
}
```

## 函数节流

```javascript
function throttle (fn, delay) {
    let last = 0, timer = null
    return function (...args) {
        let context = this
        let now = new Date()
        if (now - last > delay) {
            clearTimeout(timer)
            timer = setTimeout(() => {
                last = now
                fn.apply(context, args)
            }, delay)
        } else {
            last = now
            fn.apply(contexst, args)
        }
    }
}
```

