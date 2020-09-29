# 链表

## 反转链表

### 简单的反转链表

```text
输入: 1->2->3->4->5->NULL
输出: 5->4->3->2->1->NULL
```



#### 循环解决方案

这道题是链表中的经典题目，充分体现链表这种数据结构`操作思路简单`, 但是`实现上`并没有那么简单的特点。

那在实现上应该注意一些什么问题呢？

保存后续节点。作为新手来说，很容易将当前节点的 `next`指针直接指向前一个节点，但其实当前节点`下一个节点`的指针也就丢失了。因此，需要在遍历的过程当中，先将下一个节点保存，然后再操作`next`指向。

链表结构声定义如下:

```js
function ListNode(val) {
  this.val = val;
  this.next = null;
}
```

实现如下：

```javascript
let reverseList = (head) => {
    if (!head) return null
    let pre = null, cur = head
    while (cur) {
        let next = cur.next
        cur.next = pre
        pre = cur
        cur = next
    }
    return pre
}
```



#### 递归解决方案

由于之前的思路已经介绍得非常清楚了，因此在这我们贴上代码。

```javascript
let reverseList = (head) => {
    let reverse = (pre, cur) => {
        if (!cur) return pre
        let next = cur.next
        cur.next = pre
        reverse(cur, next)
    }
    return reverse(null, head)
}
```



### 区间反转

反转从位置 m 到 n 的链表。请使用一趟扫描完成反转。

**说明:** 1 ≤ m ≤ n ≤ 链表长度。

**示例:**

```text
输入: 1->2->3->4->5->NULL, m = 2, n = 4
输出: 1->4->3->2->5->NULL
```

**思路**

1. 找到并保存前节点
2. 保存区间首节点
3. 区间反转
4. 前节点的next指向区间末尾
5. 区间首节点的next指向后节点



#### 循环解法

```javascript
let reverseBetween = (head, m, n) {
    let count = n - m
    let p = dummyHead = new ListNode()
    let pre, cur, front, tail
    p.next = head
    for (let i = 0; i < m - 1; i++) {
        p = p.next
    }
    front = p
    pre = tail = p.next
    cur = pre.next
    for (let i = 0; i < count; i++) {
        let next = cur.next
        cur.next = pre
        pre = cur
        cur = next
    }
    front.next = pre
    tail.next = cur
    return dummyHead.next
}
```



## 环形链表



### 检测链表是否形成环



#### 思路

1. 循环一边，用set数据结构保存节点，利用节点的内存地址来判重，如果同样的节点走过两次，则表明已经形成了环。
2. 利用快慢指针，快指针一次走两步，慢指针一次走一步，如果两者相遇，则表明已经形成了环，如果有环，两者一定同时走到环中，那么在环中，**选慢指针为参考系**，快指针每次`相对参考系`向前走一步，终究会绕回原点，也就是回到慢指针的位置，从而让两者相遇。如果没有环，则两者的相对距离越来越远，永远不会相遇。



#### set判重

```javascript
const hasCycle = (head) => {
    let set = new Set()
    let p = head
    while (p) {
        if (set.has(p)) {
            return true
        }
        set.add(p)
        p = p.next
    }
    return false
}
```





#### 快慢指针

```javascript



```



获取url参数

1. 指定参数名称，返回该参数的值，或者空字符串
2. 不指定参数名称，返回全部的参数对象 或者 {}\
3. 如果存在多个同名参数，则返回数组

```javascript
function getUrlParam (url, key) {
    var arr = {}
    url.replace(/\??(\w+)=(\w+)&?)/g, function(match, matchKey, matchValue) {
        
    }
}
```



