# 队列和栈



## 栈&递归

给定一个只包括 '(', ')', '{', '}', '[', ']' 的字符串，判断字符串是否有效

有效字符串需满足：

左括号必须用相同类型的右括号闭合。左括号必须已正确的顺序闭合。注意空字符串可被认为是有效字符串。



### 代码实现

```javascript
function isVaild (str) {
  const stack = []
  for (let i = 0; i < str.length; i++) {
    let ch = str.charAt(i)
    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch)
    }
    if ((ch === ')') && stack.pop() !== '(') return false 
    if ((ch === '}') && stack.pop() !== '{') return false
    if ((ch === ']') && stack.pop() !== '[') return false  
  }
  return stack.length === 0
}
```



## 优先队列

所谓优先队列，就是一种特殊的队列，其底层使用堆的结构，使得每次添加或者删除，让队首元素始终是优先级最高的。关于优先级通过什么字段、按照什么样的比较方式来设定，可以由我们自己来决定，要实现优先队列，首先来实现一个堆的结构。



### 关于堆的说明

可能你以前没有接触过堆这种数据结构，但是其实是很简单的一种结构，其本质是一颗二叉树。但是这颗二叉树比较特殊，除了用数组来依次存储各种节点（节点对应的数组下标和层序遍历的序号一致）之外。它需要保证**任何一个父节点的优先级大于子节点**，这也是它最关键的性质，因为保证了根元素一定是优先级最高的。

举例：

![img](https://gitee.com/huangguang1999/blog-image/raw/master/img/001.webp)

现在这个堆的数组就是：[10, 7, 2, 5, 1]

因此也会产生两个非常关键的操作—— siftUp 和 siftDown。

对于**siftUp**操作，我们试想一下现在有一个正常的堆，满足任何父元素优先级大于子元素，这时候向这个堆的数组末尾又添加了一个元素，那现在可能就不符合`堆`的结构特点了。那么现在我将新增的节点和其父节点进行比较，如果父节点优先级小于它，则两者交换，不断向上比较直到根节点为止，这样就保证了**堆**的正确结构。而这样的操作就是**siftUp**。

**siftDown**是与其相反方向的操作，从上到下比较，原理相同，也是为了保证堆的正确结构。



### 实现一个最大堆

```javascript
class MaxHeap {
    constructor(arr = [], compare = null) {
        this.data = arr
        this.size = arr.length
        this.compare = compare
    }
    getSize() {
        return this.size
    }
    isEmpty() {
        return this.size === 0
    }
    // 增加元素
    add(value) {
        this.data.push(value)
        this.size++
        this._siftUp(this.getSize() - 1)
    }
    // 找到优先级最高的元素
    findMax() {
        if (this.getSize() === 0) {
            return
        }
        return this.data[0]
    }
    // 让优先级最高的元素（即队首元素）出队
    extractMax() {
        let ret this.findMax()
        this._swap(0, this.getSize() - 1)
        this.data.pop()
        this.size--
        this._siftDowm(0)
        return ret
    }
    toString() {
        console.log(this.data)
    }
    _swap(i, j) {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]]
    }
    _parent(index) {
        return Math.floor((index - 1)/2)
    }
    _leftChild(index) {
        return 2 * index + 1
    }
    _rightChild(index) {
        return 2 * index + 2
    }
    _siftUp(k) {
        while (k > 0 && this.compare(this.data[k], this.data[this._parent(k)])) {
            this._swap(k, this._parent(k))
            k = this._parent(k)
        }
    }
    _siftDown(k) {
        while (this._leftChild(k) < this.size) {
            let j = this._leftChild(k)
            if (this._rightChild(k) < this.size &&
                this.compare(this.data[this._rightChild(k)], this.data[j])) {
                j++
            }
            if (this.compare(this.data[k], this.data[j])) {
                return
            }
            this._swap(k, j)
            k = j
        }
    }
}
```



### 实现优先队列

```javascript
class PriorityQueue {
    constructor (max, compare) {
        this.max = max
        this.compare = compare
        this.maxHeap = new MaxHeap([], compare)
    }
    getSize() {
        return this.maxHeap.getSize()
    }
    isEmpty() {
        return this.maxHeap.isEmpty()
    }
    getFront() {
        return this.maxHeap.findMax()
    }
    enqueue(e) {
        if (this.getSize() === this.max) {
            if (this.compare(e, this.getFront())) {
                return
            }
            this.dequeue()
        }
        return this.maxHeap.add(e)
    }
    dequeue() {
        if (this.getSize() === 0) {
            return null
        }
        return this.maxHeap.extractMax()
    }
}
```



## 双端队列

双端队列是一种特殊的队列，首尾都可以添加或者删除元素，是一种加强版的队列。

JS 中的数组就是一种典型的双端队列。push、pop 方法分别从**尾部**添加和删除元素，unshift、shift 方法分别从**首部**添加和删除元素。



### 滑动窗口最大值

给定一个数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 k 个数字。滑动窗口每次只向右移动一位。

返回滑动窗口中的最大值。

**示例:**

```javascript
输入: nums = [1,3,-1,-3,5,3,6,7], 和 k = 3
输出: [3,3,5,5,6,7] 
解释: 

  滑动窗口的位置                最大值
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7
```

要求: 时间复杂度应为线性。

来源: [LeetCode第239题](https://leetcode-cn.com/problems/sliding-window-maximum/)

### 

### 思路

这是典型地使用双端队列求解的问题。

建立一个双端队列 window，每次 push 进来一个新的值，就将 window 中目前`前面所有比它小的值`都删除。利用双端队列的特性，可以从后往前遍历，遇到小的就删除之，否则停止。

这样可以保证队首始终是最大值，因此寻找最大值的时间复杂度可以降到 O(1)。由于 window 中会有越来越多的值被淘汰，因此整体的时间复杂度是线性的。

### 

### 代码实现

```javascript
function maxSlidingWindow (nums, k) {
    let window = [], res = []
    for (let i = 0; i < nums.length; i++) {
        // 保证元素在滑动窗口内
        if (window[0] !== undefined && window[0] <= i - k) {
            window.shift()
        }
        // 保证队首元素最大
        while (nums[window[window.length - 1]] < nums[i]) {
            window.pop()
        }
        window.push(i)
        if (i >= k - 1) {
            res.push(nums[window[0]])
        }
    }
    return res
}
```

