## 实现大体框架

promise使用

```javascript
let p = new Promise(function (resolve, reject) {
    console.log('start')
    resolve('data1')
})
p.then(
	v => {
        console.log('success: ' + v)
    },
    v => {
        console.log('error: ' + v)
    }
)
console.log('end')
```

promise特性：

1. Promise是构造函数，new出来的实例有then方法；
2. 呢哇 Promise时，传递一个参数，这个参数时是函数，又被称为执行器函数（executor），并执行器会被立即调用，也就是上面结果start最先输出的原因；
3. executor是函数，它接受两个参数resolve reject，同时这两个参数也是函数；
4. new Promise后的实例具有状态，默认状态是等待，当执行器调用resolve后，实例状态为成功状态，当执行器调用reject后，实例状态为失败状态；
5. promise翻译是承诺的意思，实例的状态一经改变，不能再次修改，不能成功再变失败，或者反过来也不行；
6. 每一个promise实例都有方法then，then中有两个参数，第一个参数是then的成功回调，第二个参数是then的失败回调，这两个参数也都是函数，当执行器调用resolve后，then中第一个参数函数会执行。当执行器调用reject后，then中第二个参数函数会执行。

1 构造函数的参数，在new的过程中会立即执行

```javascript
function MyPromise (executor) {
    executor(resolve, reject)
}
```

2 new出来的实例具有then方法

```javascript
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    
}
```

3 new出来的实例具有默认状态，执行器执行resolve或者reject，修改状态

```javascript
function MyPromise (executor) {
    let self = this
    self.status = 'pending'
    function resolve (value) {
        self.status = 'resolved'
    }
    function reject (reason) {
        self.reason = 'reject'
    }
    executor(resolve, reject)
}
```

4 当执行器调用resolve后，then中的第一个参数函数（成功回调）会执行，当执行器调用reject后，then中的第二个参数会执行

```javascript
MyPromise.prototype.then = function(onFulfilled, onRejected){
  let self = this
  if(self.status === 'resolved'){
    onFulfilled()
  }
  if(self.status === 'rejected'){
    onRejected()
  }
}
```

5 保证promise实例状态一旦变更不能再次改变，只有在pending时候才可以变状态

```javascript
function MyPromise (executor) {
    let self = this
    self.status = 'pending'
    function resolve (value) {
        if (self.status === 'pending') {
            self.value = value
            self.status = status
        }
    }
    function reject (value) {
        if (self.status === 'pending') {
            self.reason = reason
            self.status = status
        }
    }
    executor(resolve, reject)
}
```

6 执行器执行resolve方法传的值，传递给then中第一个参数函数中

```javascript
function MyPromise (executor) {
    let self = this
    self.value = undefined
    self.reason = undefined
    self.status = 'pending'
    function reslove (value) {
        if (self.status === 'pending') {
            self.value = value
            self.status = 'resolved'
        }
    }
    function reject (reason) {
        if (self.status === 'pending') {
            self.reason = reason
            self.status = 'rejected'
        }
    }
    exector(resolve, reject)
}

MyPromise.prototype.then = function (onFullfilled, onRejected) {
    let self = this
    if (self.status === 'resolved') {
        onFullfilled(self.value)
    }
    if (self.status === 'rejected') {
        onRejected(self.reason)
    }
}
```

运行用一下，打印的顺序还是同步的，需要继续完善



## 添加异步处理和多次调用then



## promse.all()

### 实现思路

1. 获得数组长度
2. 返回一个promise
3. 遍历数组
4. 数组内部用Promise.resolve(实例).then(resolve, reject)去执行   
5. 每次循环count++，直至count等于数组长度

```javascript
function promiseAll (list) {
    let len = list.length
    let res = new Array(len)
    let count = 0
    return new Promise((resolve, reject) => {
        list.forEach((p, index) => {
            Promise.resolve(p).then(data => {
                res[index] = data
                count++
                if (count === len) {
                    resolve(res)
                }
            }, err => {
                reject(err)
            })
        })
    })
}
```

> promise.all中任意一个promise出现错误的时候都会执行reject，导致其它正常返回的数据也无法使用。

### 解决方案

1 遍历参数数组中每个promise，对其定义catch请求

```javascript
function getData(api){
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        var ok = Math.random() > 0.5  // 模拟请求成功或失败
        if(ok)
          resolve('get ' + api + ' data')
        else{
          reject('error') // 正常的reject
        }
      },2000)
    })
  }
  function getDatas(arr){
    var promises = arr.map(item => getData(item))
    return Promise.all(promises.map(p => p.catch(e => e))).then(values => { // 关键步骤，map(p => p.catch(e => e)) 在每个请求后加上 catch 捕获错误；
      values.map((v,index) => {
        if(v == 'error'){
          console.log('第' + (index+1) + '个请求失败')
        }else{
          console.log(v)
        }
      })
    }).catch(error => {
      console.log(error)
    })
  }
  getDatas(['./api1','./api2','./api3','./api4']).then(() => '请求结束')
```

2 出现错误请求之后不进行reject操作，而是继续resolve('error')，之后同意交给promise.all()进行处理

```javascript
 function getData(api){
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        var ok = Math.random() > 0.5  // 模拟请求成功或失败
        if(ok)
          resolve('get ' + api + ' data')
        else{
          // reject(api + ' fail')   // 如果调用reject就会使Promise.all()进行失败回调
          resolve('error')    // Promise all的时候做判断  如果是error则说明这条请求失败
        } 
      },2000)
    })
  }
  function getDatas(arr){
    var promises = arr.map(item => getData(item))
    return Promise.all(promises).then(values => {
      values.map((v,index) => {
        if(v == 'error'){
          console.log('第' + (index+1) + '个请求失败')
        }else{
          console.log(v)
        }
      })
    }).catch(error => {
      console.log(error)
    })
  }
  getDatas(['./api1','./api2','./api3','./api4']).then(() => '请求结束')
```

