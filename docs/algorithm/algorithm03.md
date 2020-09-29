# 数组



## 排序



## 扁平化



### reduce

```javascript
function flatten (arr) {
    return arr.reduce((result, item) => {
        return result.concat(Array.isArray(item) ? flatten(item) : item)
    }, [])
}
```

reduce是数组的一种方法，它接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值。

reduce包含两个参数：回调函数，传给total的初始值

```javascript
// 求数组的各项值相加的和： 
arr.reduce((total, item)=> {  // total为之前的计算结果，item为数组的各项值
    return total + item;
}, 0);
```



### toString & split

```javascript
function flatten (arr) {
    return arr.toString().spilt(',').map(function(item) {
        return Number(item)
    })
}
```

因为split分割后形成的数组的每一项值为字符串，所以需要用一个map方法遍历数组将其每一项转换为数值型



### join & spilt

```javascript
function flatten (arr) {
    return arr.join(',').split(',').map(function(item) {
        return parseInt(item)
    })
}
```



### 递归

```javascript
function flatten (arr) {
    const res = []
    arr.map(item => {
        if (Array.isArray(item)) {
            res = res.concat(flatten(item))
        } else {
            res.push(item)
        }
    })
    return res
}
```



### 扩展运算符

扩展运算符能将二维数组变为一维

```javascript
function flatten (arr) {
    while (arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr)
    }
}
```



### 总结

核心：遍历数组arr，若arr[i]为数组则递归遍历，直至arr[i]不为数组然后与之前的结果concat。



## 去重



### 双层循环

```javascript
let array = [1, 1, '1', '1']

function unique (array) {
    const res  = []
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < res.length; j++) {
            if (array[i] === res[j]) {
                break;
            }
        }
        if (j === res.length) {
            res.push(array[i])
        }
    }
    return res
}

console.log(unique(array))
```



### indexOf

我们可以用 indexOf 简化内层的循环：

```javascript
let array = [1, 1, '1', '1']

function unique (array) {
    const res = []
    for (let i = 0; i < array.length; i++) {
        let cur = array[i]
        if (res.indexOf(cur) !== -1) {
            res.push(cur)
        }
    }
    return res
}

console.log(unique(array))
```



### 排序后去重

```javascript
let array = [1, 1, '1', '1']

function unique (array) {
    const res = []
    const sortedArr = array.sort()
    let seen
    for (let i = 0; i < sortedArr.length; i++) {
        if (!i || seen !== sortedArray[i]) {
            res.push(sortedArray[i])
        }
        seen = sortedArray[i]
    }
    return res
}

console.log(unique(array))
```



### Set

```javascript
[...new Set(arr)]
```



### fliter

```javascript
let array = [1, 1, '1', '1']

function unique (array) {
    return array.filter(function (item, index, array) {
        return array.indexOf(item) === index
    })
}

console.log(unique(array))
```



### Object键值对



### 存在对象或数组时去重





## 乱序（洗牌算法）

洗牌算法核心（保证每个数在每个位置的概率都是相同的）：

```javascript
rand_num = Math.floor(Math.random() * (len - i) + i)
```

1. 当 i = 0 时 ，我们从索引 0 ~ len-1中选出一个数，安排在位置0处，那么每个数出现在位置0的概率就是1/len；此时索引0处的位置已经排好序；

2. 当 i = 1 时， 我们从索引 1 ~ len-1中选出一个数，安排在位置1处 ,那么每个数出现在位置1的概率就是(len-1/len)*(1/len-1)；此时，索引1处位置已经排好序；
3. 依次类推，出现数字在每个位置的概率都是 1/len。

代码如下：

```javascript
var Solution = function(nums) {
    this.nums = nums;
};
Solution.prototype.reset = function() {
    return this.nums;
};
Solution.prototype.shuffle = function() {
    let arr = [... (this.nums)];
    let len =arr.length;
    for(let i =0 ; i < len; i++){ 
        rand_num = Math.floor(Math.random() * (len - i) + i);
        [ arr[i] , arr[rand_num] ]= [arr[rand_num] , arr[i] ]; 
    }
    return arr;
};
```

