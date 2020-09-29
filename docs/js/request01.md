## Ajax

使用promise封装一个ajax

```javascript
function myAjax ({url = null, method = 'GET', dataType = 'JSON', async = 'true'} {
	return new Promise((resolve, reject) => {
    	let xhr = new XMLHttpRequest()
        xhr.open(method, url, async)
    	xhr.respenseType = dataType
    	xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status = 200) {
                resolve(xhr.responseText)
            }
        }
        xhr.onerror = (err) => {
            reject(err)
        }
        xhr.send()
	})                  
})
myAjax({
    url:'/api',
    method: 'GET'
}).then(res => {
    console.log(result)
}).catch(err => {
  console.log(err)  
})
```



## Axios



### 简介

Axios 是一个基于 promise 的 HTTP 库，可以用在浏览器和 node.js 中。



### 特性

- 从浏览器中创建 XMLHttpRequests
- 从 node.js 创建 http 请求
- 支持 Promise API
- 拦截请求和响应
- 转换请求数据和响应数据
- 取消请求
- 自动转换 JSON 数据
- 客户端支持防御 XSRF

实际上，axios可以用在浏览器和 node.js 中是因为，它会自动判断当前环境是什么，如果是浏览器，就会基于**XMLHttpRequests**实现axios。如果是node.js环境，就会基于node**内置核心模块http**实现axios



### axios的使用



### axios的method实现

从axios(config)的使用上可以看出导出的axios是一个方法。从axios.method(url, data , config)的使用可以看出导出的axios上或者原型上挂有get，post等方法。

实际上导出的axios就是一个Axios类中的一个方法。

如代码所以，核心代码是request。我们把request导出，就可以使用axios(config)这种形式来调用axios了。


```javascript
class Axios {
    constructor () {
        
    }
    
    request (config) {
        return new Promise (reslove => {
            const {url = '', method = 'get', data = {}} = config
            
            const xhr = new XMLHttpRequest()
            xhr.open(method, url, true)
            xhr.onload = function () {
                console.log(xhr.responseText)
                resolve(xhr.responseText)
            }
            xhr.send(data)
        })
    }
}

// 最终到处axios的方法，即实例的request方法
function CreateAxiosFn () {
    let axios = new Axios()
    let req = axios.request.bind(axios)
    return req
}

// 得到最后的全局变量axios
let axios = CreateAxiosFn()
```



现在我们来实现下axios.method()的形式。

思路：我们可以再Axios.prototype添加这些方法。而这些方法内部调用request方法即可，如代码所示：



```javascript
// 定义get,post...方法，挂在到Axios原型上
const methodsArr = ['get', 'delete', 'head', 'options', 'put', 'patch', 'post'];
methodsArr.forEach(met => {
    Axios.prototype[met] = function() {
        console.log('执行'+met+'方法');
        // 处理单个方法
        if (['get', 'delete', 'head', 'options'].includes(met)) { // 2个参数(url[, config])
            return this.request({
                method: met,
                url: arguments[0],
                ...arguments[1] || {}
            })
        } else { // 3个参数(url[,data[,config]])
            return this.request({
                method: met,
                url: arguments[0],
                data: arguments[1] || {},
                ...arguments[2] || {}
            })
        }

    }
})
```



我们通过遍历methodsArr数组，依次在Axios.prototype添加对应的方法，注意的是`'get', 'delete', 'head', 'options'`这些方法只接受两个参数。而其他的可接受三个参数，想一下也知道，get不把参数放body的。

但是，你有没有发现，我们只是在Axios的prototype上添加对应的方法，我们导出去的可是request方法啊，那怎么办？ 简单，把Axios.prototype上的方法搬运到request上即可。

我们先来实现一个工具方法，实现将b的方法混入a;



```javascript
const utils = {
  extend(a,b, context) {
    for(let key in b) {
      if (b.hasOwnProperty(key)) {
        if (typeof b[key] === 'function') {
          a[key] = b[key].bind(context);
        } else {
          a[key] = b[key]
        }
      }
      
    }
  }
}
```



然后我们就可以利用这个方法将Axios.prototype上的方法搬运到request上啦。

我们修改一下之前的`CreateAxiosFn`方法即可



```javascript
function CreateAxiosFn() {
  let axios = new Axios();
  
  let req = axios.request.bind(axios);
  增加代码
  utils.extend(req, Axios.prototype, axios)
  
  return req;
}
```



### 请求和响应拦截器



#### 拦截器的使用

```javascript
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
  }, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  });

```

拦截器是什么意思呢？其实就是在我们发送一个请求的时候会先执行请求拦截器的代码，然后再真正地执行我们发送的请求，这个过程会对config，也就是我们发送请求时传送的参数进行一些操作。

而当接收响应的时候，会先执行响应拦截器的代码，然后再把响应的数据返回来，这个过程会对response，也就是响应的数据进行一系列操作。

怎么实现呢？需要明确的是拦截器也是一个类，管理响应和请求。因此我们先实现拦截器

```javascript
class InterceptorsManage {
  constructor() {
    this.handlers = [];
  }

  use(fullfield, rejected) {
    this.handlers.push({
      fullfield,
      rejected
    })
  }
}
```

我们是用这个语句`axios.interceptors.response.use`和`axios.interceptors.request.use`，来触发拦截器执行use方法的。

说明axios上有一个响应拦截器和一个请求拦截器。那怎么实现Axios呢？看代码

```javascript
class Axios {
    constructor () {
        this.interceptors = {
            request: new InterceptorsManage,
            response: new InterceptorsMangage
        }
    }
}
```

可见，axios实例上有一个对象interceptors。这个对象有两个拦截器，一个用来处理请求，一个用来处理响应。

所以，我们执行语句`axios.interceptors.response.use`和`axios.interceptors.request.use`的时候，实现获取axios实例上的interceptors对象，然后再获取response或request拦截器，再执行对应的拦截器的use方法。

而执行use方法，会把我们传入的回调函数push到拦截器的handlers数组里。

**到这里你有没有发现一个问题**。这个interceptors对象是Axios上的啊，我们导出的是request方法啊（欸？好熟悉的问题，上面提到过哈哈哈~~~额）。处理方法跟上面处理的方式一样，都是把Axios上的方法和属性搬到request过去，也就是遍历Axios实例上的方法，得以将interceptors对象挂载到request上。

所以只要更改下`CreateAxiosFn`方法即可。

```javascript
function CreateAxiosFn() {
  let axios = new Axios();
  
  let req = axios.request.bind(axios);
  // 混入方法， 处理axios的request方法，使之拥有get,post...方法
  utils.extend(req, Axios.prototype, axios)
  新增代码
  utils.extend(req, axios)
  return req;
}
```

好了，现在request也有了interceptors对象，那么什么时候拿interceptors对象中的handler之前保存的回调函数出来执行。

没错，就是我们发送请求的时候，会先获取request拦截器的handlers的方法来执行。再执行我们发送的请求，然后获取response拦截器的handlers的方法来执行。

因此，我们要修改之前所写的request方法

之前是这样的。

```javascript
request(config) {
    return new Promise(resolve => {
        const {url = '', method = 'get', data = {}} = config;
        // 发送ajax请求
        console.log(config);
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onload = function() {
            console.log(xhr.responseText)
            resolve(xhr.responseText);
        };
        xhr.send(data);
    })
}
```

但是现在request里不仅要执行发送ajax请求，还要执行拦截器handlers中的回调函数。所以，最好下就是将执行ajax的请求封装成一个方法

```javascript
request(config) {
    this.sendAjax(config)
}
sendAjax(config){
    return new Promise(resolve => {
        const {url = '', method = 'get', data = {}} = config;
        // 发送ajax请求
        console.log(config);
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onload = function() {
            console.log(xhr.responseText)
            resolve(xhr.responseText);
        };
        xhr.send(data);
    })
}
```

好了，现在我们要获得handlers中的回调

```javascript
request(config) {
    // 拦截器和请求组装队列
    let chain = [this.sendAjax.bind(this), undefined] // 成对出现的，失败回调暂时不处理

    // 请求拦截
    this.interceptors.request.handlers.forEach(interceptor => {
        chain.unshift(interceptor.fullfield, interceptor.rejected)
    })

    // 响应拦截
    this.interceptors.response.handlers.forEach(interceptor => {
        chain.push(interceptor.fullfield, interceptor.rejected)
    })

    // 执行队列，每次执行一对，并给promise赋最新的值
    let promise = Promise.resolve(config);
    while(chain.length > 0) {
        promise = promise.then(chain.shift(), chain.shift())
    }
    return promise;
}
```

我们先把sendAjax请求和undefined放进了chain数组里，再把请求拦截器的handlers的成对回调放到chain数组头部。再把响应拦截器的handlers的承兑回调反倒chain数组的尾部。

然后再 逐渐取数 chain数组的成对回调执行。

```javascript
promise = promise.then(chain.shift(), chain.shift())
```



这一句，实际上就是不断将config从上一个promise传递到下一个promise，期间可能回调config做出一些修改。什么意思？我们结合一个例子来讲解一下

首先拦截器是这样使用的

```javascript
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
  }, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  });
```

然后执行request的时候。chain数组的数据是这样的

```javascript
chain = [
  function (config) {
    // 在发送请求之前做些什么
    return config;
  }, 
  
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
  this.sendAjax.bind(this), 
  
  undefined,
  
  function (response) {
    // 对响应数据做点什么
    return response;
  }, 
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
]
```



执行第一次`promise.then(chain.shift(), chain.shift())`

```javascript
promise.then(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  }, 
  
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
)
```

一般情况，promise是resolved状态，是执行成功回调的，也就是执行

```javascript
function (config) {
    // 在发送请求之前做些什么
    return config
}
```

而promise.then是要返回一个新的promise对象的。

为了区分，在这里，我会把这个新的promise对象叫做**第一个新的promise对象**

这个第一个新的promise对象会把

```javascript
function (config) {
    // 在发送请求之前做些什么
    return config;
}
```

的执行结果传入resolve函数中

```javascript
resolve(config)
```

使得这个返回的第一个新的promise对象的状态为resovled，而且第一个新的promise对象的data为config。



接下来，再执行

```javascript
promise.then(
  sendAjax(config),
  undefined
)
```

注意：这里的promise是 上面提到的第一个新的promise对象。

而promise.then这个的执行又会返回第二个新的promise对象。

因为这里promise.then中的promise也就是第一个新的promise对象的状态是resolved的，所以会执行sendAjax()。而且会取出第一个新的promise对象的data 作为config转入sendAjax()。

当sendAjax执行完，就会返回一个response。这个response就会保存在第二个新的promise对象的data中。



接下来，再执行

```javascript
promise.then(
  function (response) {
    // 对响应数据做点什么
    return response;
  }, 
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
)
```

同样，会把第二个新的promise对象的data取出来作为response参数传入

```javascript
function (response) {
	// 对响应数据做点什么
	return response;
}
```

饭后返回一个promise对象，这个promise对象的data保存了这个函数的执行结果，也就是返回值response。

然后通过`return promise;`

把这个promise返回了。咦？是怎么取出promise的data的。我们看看我们平常事怎么获得响应数据的

```javascript
axios.get('http://localhost:5000/getTest')
    .then(res => {
         console.log('getAxios 成功响应', res);
    })
```

在then里接收响应数据。所以原理跟上面一样，将返回的promise的data作为res参数了。

现在看看我们的myAxios完整代码吧，好有个全面的了解

```javascript
class InterceptorsManage {
    constructor() {
        this.handlers = [];
    }

    use(fullfield, rejected) {
        this.handlers.push({
            fullfield,
            rejected
        })
    }
}

class Axios {
    constructor() {
        this.interceptors = {
            request: new InterceptorsManage,
            response: new InterceptorsManage
        }
    }

    request(config) {
        // 拦截器和请求组装队列
        let chain = [this.sendAjax.bind(this), undefined] // 成对出现的，失败回调暂时不处理

        // 请求拦截
        this.interceptors.request.handlers.forEach(interceptor => {
            chain.unshift(interceptor.fullfield, interceptor.rejected)
        })

        // 响应拦截
        this.interceptors.response.handlers.forEach(interceptor => {
            chain.push(interceptor.fullfield, interceptor.rejected)
        })

        // 执行队列，每次执行一对，并给promise赋最新的值
        let promise = Promise.resolve(config);
        while(chain.length > 0) {
            promise = promise.then(chain.shift(), chain.shift())
        }
        return promise;
    }
    sendAjax(){
        return new Promise(resolve => {
            const {url = '', method = 'get', data = {}} = config;
            // 发送ajax请求
            console.log(config);
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.onload = function() {
                console.log(xhr.responseText)
                resolve(xhr.responseText);
            };
            xhr.send(data);
        })
    }
}

// 定义get,post...方法，挂在到Axios原型上
const methodsArr = ['get', 'delete', 'head', 'options', 'put', 'patch', 'post'];
methodsArr.forEach(met => {
    Axios.prototype[met] = function() {
        console.log('执行'+met+'方法');
        // 处理单个方法
        if (['get', 'delete', 'head', 'options'].includes(met)) { // 2个参数(url[, config])
            return this.request({
                method: met,
                url: arguments[0],
                ...arguments[1] || {}
            })
        } else { // 3个参数(url[,data[,config]])
            return this.request({
                method: met,
                url: arguments[0],
                data: arguments[1] || {},
                ...arguments[2] || {}
            })
        }

    }
})


// 工具方法，实现b的方法混入a;
// 方法也要混入进去
const utils = {
    extend(a,b, context) {
        for(let key in b) {
            if (b.hasOwnProperty(key)) {
                if (typeof b[key] === 'function') {
                    a[key] = b[key].bind(context);
                } else {
                    a[key] = b[key]
                }
            }

        }
    }
}


// 最终导出axios的方法-》即实例的request方法
function CreateAxiosFn() {
    let axios = new Axios();

    let req = axios.request.bind(axios);
    // 混入方法， 处理axios的request方法，使之拥有get,post...方法
    utils.extend(req, Axios.prototype, axios)
    return req;
}

// 得到最后的全局变量axios
let axios = CreateAxiosFn();
```

来测试下拦截器功能是否正常

```html
<script type="text/javascript" src="./myAxios.js"></script>

<body>
<button class="btn">点我发送请求</button>
<script>
    // 添加请求拦截器
    axios.interceptors.request.use(function (config) {
        // 在发送请求之前做些什么
        config.method = "get";
        console.log("被我请求拦截器拦截了，哈哈:",config);
        return config;
    }, function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    });

    // 添加响应拦截器
    axios.interceptors.response.use(function (response) {
        // 对响应数据做点什么
        console.log("被我响应拦截拦截了，哈哈 ");
        response = {message:"响应数据被我替换了，啊哈哈哈"}
        return response;
    }, function (error) {
        // 对响应错误做点什么
        console.log("错了吗");
        return Promise.reject(error);
    });
    document.querySelector('.btn').onclick = function() {
        // 分别使用以下方法调用，查看myaxios的效果
        axios({
          url: 'http://localhost:5000/getTest'
        }).then(res => {
          console.log('response', res);
        })
    }
</script>
</body>
```



## Fetch

JavaScript 可以将网络请求发送到服务器，并在需要时加载新信息。

例如，我们可以使用网络请求来：

- 提交订单，
- 加载用户信息，
- 从服务器接收最新的更新，
- ……等。

……所有这些都没有重新加载页面！

对于来自 JavaScript 的网络请求，有一个总称术语 “AJAX”（**A**synchronous **J**avaScript **A**nd **X**ML 的简称）。但是，我们不必使用 XML：这个术语诞生于很久以前，所以这个词一直在那儿。

有很多方式可以向服务器发送网络请求，并从服务器获取信息。

`fetch()` 方法是一种现代通用的方法，那么我们就从它开始吧。旧版本的浏览器不支持它（可以 polyfill），但是它在现代浏览器中的支持情况很好。

基本语法：

```javascript
let promise = fetch(url, [options])
```

- **`url`** —— 要访问的 URL。
- **`options`** —— 可选参数：method，header 等。

没有 `options`，那就是一个简单的 GET 请求，下载 `url` 的内容。

浏览器立即启动请求，并返回一个该调用代码应该用来获取结果的 `promise`。

获取响应通常需要经过两个阶段。



**第一阶段，当服务器发送了响应头（response header），`fetch` 返回的 `promise` 就使用内建的 class 对象来对响应头进行解析。**

在这个阶段，我们可以通过检查响应头，来检查 HTTP 状态以确定请求是否成功，当前还没有响应体（response body）。

如果 `fetch` 无法建立一个 HTTP 请求，例如网络问题，亦或是请求的网址不存在，那么 promise 就会 reject。异常的 HTTP 状态，例如 404 或 500，不会导致出现 error。

我们可以在 response 的属性中看到 HTTP 状态：

- **`status`** —— HTTP 状态码，例如 200。
- **`ok`** —— 布尔值，如果 HTTP 状态码为 200-299，则为 `true`。

例如：

```javascript
let response = await fetch(url);

if (response.ok) { // 如果 HTTP 状态码为 200-299
  // 获取 response body（此方法会在下面解释）
  let json = await response.json();
} else {
  alert("HTTP-Error: " + response.status);
}
```

**第二阶段，为了获取 response body，我们需要使用一个其他的方法调用。**

`Response` 提供了多种基于 promise 的方法，来以不同的格式访问 body：

- **`response.text()`** —— 读取 response，并以文本形式返回 response，
- **`response.json()`** —— 将 response 解析为 JSON，
- **`response.formData()`** —— 以 `FormData` 对象（在 [下一章](https://zh.javascript.info/formdata) 有解释）的形式返回 response，
- **`response.blob()`** —— 以 [Blob](https://zh.javascript.info/blob)（具有类型的二进制数据）形式返回 response，
- **`response.arrayBuffer()`** —— 以 [ArrayBuffer](https://zh.javascript.info/arraybuffer-binary-arrays)（低级别的二进制数据）形式返回 response，
- 另外，`response.body` 是 [ReadableStream](https://streams.spec.whatwg.org/#rs-class) 对象，它允许你逐块读取 body，我们稍后会用一个例子解释它。



例如，我们从 GitHub 获取最新 commits 的 JSON 对象：

```javascript
let url = 'https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits';
let response = await fetch(url);

let commits = await response.json(); // 读取 response body，并将其解析为 JSON

alert(commits[0].author.login);
```

也可以使用纯 promise 语法，不使用 `await`：

```javascript
fetch('https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits')
  .then(response => response.json())
  .then(commits => alert(commits[0].author.login));
```

要获取响应文本，可以使用 `await response.text()` 代替 `.json()`：

```javascript
let response = await fetch('https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits');

let text = await response.text(); // 将 response body 读取为文本

alert(text.slice(0, 80) + '...');
```

作为一个读取为二进制格式的演示示例，让我们 fetch 并显示一张 [“fetch” 规范](https://fetch.spec.whatwg.org/) 中的图片（`Blob` 操作的有关内容请见 [Blob](https://zh.javascript.info/blob)）：

```javascript
let response = await fetch('/article/fetch/logo-fetch.svg');

let blob = await response.blob(); // 下载为 Blob 对象

// 为其创建一个 <img>
let img = document.createElement('img');
img.style = 'position:fixed;top:10px;left:10px;width:100px';
document.body.append(img);

// 显示它
img.src = URL.createObjectURL(blob);

setTimeout(() => { // 3 秒后将其隐藏
  img.remove();
  URL.revokeObjectURL(img.src);
}, 3000);
```

### Response header

Response header 位于 `response.headers` 中的一个类似于 Map 的 header 对象。

它不是真正的 Map，但是它具有类似的方法，我们可以按名称（name）获取各个 header，或迭代它们：

```javascript
let response = await fetch('https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits');

// 获取一个 header
alert(response.headers.get('Content-Type')); // application/json; charset=utf-8

// 迭代所有 header
for (let [key, value] of response.headers) {
  alert(`${key} = ${value}`);
}
```

### Request header

要在 `fetch` 中设置 request header，我们可以使用 `headers` 选项。它有一个带有输出 header 的对象，如下所示：

```javascript
let response = fetch(protectedUrl, {
  headers: {
    Authentication: 'secret'
  }
});
```

……但是有一些我们无法设置的 header（详见 [forbidden HTTP headers](https://fetch.spec.whatwg.org/#forbidden-header-name)）：

- `Accept-Charset`, `Accept-Encoding`
- `Access-Control-Request-Headers`
- `Access-Control-Request-Method`
- `Connection`
- `Content-Length`
- `Cookie`, `Cookie2`
- `Date`
- `DNT`
- `Expect`
- `Host`
- `Keep-Alive`
- `Origin`
- `Referer`
- `TE`
- `Trailer`
- `Transfer-Encoding`
- `Upgrade`
- `Via`
- `Proxy-*`
- `Sec-*`

这些 header 保证了 HTTP 的正确性和安全性，所以它们仅由浏览器控制。



### POST 请求

要创建一个 `POST` 请求，或者其他方法的请求，我们需要使用 `fetch` 选项：

- **`method`** —— HTTP 方法，例如 `POST`，

- `body`

   

  —— request body，其中之一：

  - 字符串（例如 JSON 编码的），
  - `FormData` 对象，以 `form/multipart` 形式发送数据，
  - `Blob`/`BufferSource` 发送二进制数据，
  - [URLSearchParams](https://zh.javascript.info/url)，以 `x-www-form-urlencoded` 编码形式发送数据，很少使用。

JSON 形式是最常用的。

例如，下面这段代码以 JSON 形式发送 `user` 对象：

```javascript
let user = {
  name: 'John',
  surname: 'Smith'
};

let response = await fetch('/article/fetch/post/user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  body: JSON.stringify(user)
});

let result = await response.json();
alert(result.message);
```

请注意，如果请求的 `body` 是字符串，则 `Content-Type` 会默认设置为 `text/plain;charset=UTF-8`。

但是，当我们要发送 JSON 时，我们会使用 `headers` 选项来发送 `application/json`，这是 JSON 编码的数据的正确的 `Content-Type`。



### 发送图片

我们同样可以使用 `Blob` 或 `BufferSource` 对象通过 `fetch` 提交二进制数据。

例如，这里有一个 `<canvas>`，我们可以通过在其上移动鼠标来进行绘制。点击 “submit” 按钮将图片发送到服务器：

```html
<body style="margin:0">
  <canvas id="canvasElem" width="100" height="80" style="border:1px solid"></canvas>

  <input type="button" value="Submit" onclick="submit()">

  <script>
    canvasElem.onmousemove = function(e) {
      let ctx = canvasElem.getContext('2d');
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
    };

    async function submit() {
      let blob = await new Promise(resolve => canvasElem.toBlob(resolve, 'image/png'));
      let response = await fetch('/article/fetch/post/image', {
        method: 'POST',
        body: blob
      });

      // 服务器给出确认信息和图片大小作为响应
      let result = await response.json();
      alert(result.message);
    }

  </script>
</body>
```

请注意，这里我们没有手动设置 `Content-Type` header，因为 `Blob` 对象具有内建的类型（这里是 `image/png`，通过 `toBlob` 生成的）。对于 `Blob` 对象，这个类型就变成了 `Content-Type` 的值。

可以在不使用 `async/await` 的情况下重写 `submit()` 函数，像这样：

```javascript
function submit() {
  canvasElem.toBlob(function(blob) {
    fetch('/article/fetch/post/image', {
      method: 'POST',
      body: blob
    })
      .then(response => response.json())
      .then(result => alert(JSON.stringify(result, null, 2)))
  }, 'image/png');
}
```



### 总结

典型的 fetch 请求由两个 `await` 调用组成：

```javascript
let response = await fetch(url, options); // 解析 response header
let result = await response.json(); // 将 body 读取为 json
```

或者以 promise 形式：

```javascript
fetch(url, options)
  .then(response => response.json())
  .then(result => /* process result */)
```

响应的属性：

- `response.status` —— response 的 HTTP 状态码，
- `response.ok` —— HTTP 状态码为 200-299，则为 `true`。
- `response.headers` —— 类似于 Map 的带有 HTTP header 的对象。

获取 response body 的方法：

- **`response.text()`** —— 读取 response，并以文本形式返回 response，
- **`response.json()`** —— 将 response 解析为 JSON 对象形式，
- **`response.formData()`** —— 以 `FormData` 对象（form/multipart 编码，参见下一章）的形式返回 response，
- **`response.blob()`** —— 以 [Blob](https://zh.javascript.info/blob)（具有类型的二进制数据）形式返回 response，
- **`response.arrayBuffer()`** —— 以 [ArrayBuffer](https://zh.javascript.info/arraybuffer-binary-arrays)（低级别的二进制数据）形式返回 response。

到目前为止我们了解到的 fetch 选项：

- `method` —— HTTP 方法，
- `headers` —— 具有 request header 的对象（不是所有 header 都是被允许的）
- `body` —— 要以 `string`，`FormData`，`BufferSource`，`Blob` 或 `UrlSearchParams` 对象的形式发送的数据（request body）。