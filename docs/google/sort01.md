## sort排序

在V8中，数组的长度如果小于10，sort使用插入排序；数组的长度如果大于10，sort使用快速排序。



### 插入排序

#### 原理

将第一个元素视为有序序列，遍历数组，将之后的元素依次插入这个构建的有序序列中。

#### 实现

```javascript
function insertSort (arr) {
    for (let i = 1; i < arr.length; i++) {
        let ele = arr[i]
        for (let j = i - 1; j >= 0; j--) {
            let tmp = arr[j]
            let order = tmp - ele
            if (order > 0) {
                arr[j + 1] = tmp
            } else {
                break
            }
        }
        arr[j + 1] = ele
    } 
}
```



### 快速排序

#### 原理

1. 选择一个元素作为"基准"
2. 小于"基准"的元素，都移到"基准"的左边；大于"基准"的元素，都移到"基准"的右边。
3. 对"基准"左边和右边的两个子集，不断重复第一步和第二步，直到所有子集只剩下一个元素为止。

```javascript
var quickSort = function(arr) {
　　if (arr.length <= 1) { return arr; }
    // 取数组的中间元素作为基准
　　var pivotIndex = Math.floor(arr.length / 2);
　　var pivot = arr.splice(pivotIndex, 1)[0];

　　var left = [];
　　var right = [];

　　for (var i = 0; i < arr.length; i++){
　　　　if (arr[i] < pivot) {
　　　　　　left.push(arr[i]);
　　　　} else {
　　　　　　right.push(arr[i]);
　　　　}
　　}
　　return quickSort(left).concat([pivot], quickSort(right));
};
```

