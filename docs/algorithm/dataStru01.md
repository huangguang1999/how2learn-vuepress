# 基本数据结构

* 栈

* 队列

* 链表

* 树

## 栈

数组的push和pop方法实现

```javascript
function Stack() {

  /**
   * 用数组来模拟栈
   */
  var items = [];

  /**
   * 将元素送入栈，放置于数组的最后一位
   */
  this.push = function(element) {
    items.push(element);
  };

  /**
   * 弹出栈顶元素
   */
  this.pop = function() {
    return items.pop();
  };

  /**
   * 查看栈顶元素
   */
  this.peek = function() {
    return items[items.length - 1];
  }

  /**
   * 确定栈是否为空
   * @return {Boolean} 若栈为空则返回true,不为空则返回false
   */
  this.isAmpty = function() {
    return items.length === 0
  };

  /**
   * 清空栈中所有内容
   */
  this.clear = function() {
    items = [];
  };

  /**
   * 返回栈的长度
   * @return {Number} 栈的长度
   */
  this.size = function() {
    return items.length;
  };

  /**
   * 以字符串显示栈中所有内容
   */
  this.print = function() {
    console.log(items.toString());
  };
}
```

<br>


## 队列

数组的push和shift方法实现

<br>

## 链表

用函数对象实现，且节点之间的关系都是通过next指针来**维系**的。因此，链表元素的添加和删除操作本质上都是围绕`next指针`做文章。

### 链表元素的插入

一定要先处理新元素的next指向，然后再处理指向新元素的指针，顺序不对的话就会丢失新元素的指向。

### 链表元素的删除

一定是先处理指向被删除节点的指针，然后再处理被删除节点的指针（也可以不处理，因为此节点会成为一个完全不可达节点，会被JS的垃圾回收器自动回收掉）

重点是**定位目标节点的前驱节点**

<br>

## 树

### 二叉树

* 它可以没有根节点，作为一颗空树存在

* 如果它不是空树，那么必须有根节点、左子树和右子树组成，且左右字树都是二叉树。

**注意** 二叉树不是每个结点的度为2的树。普通的树并不会区分左子树和右子树，但在二叉树中，`左右字树`的位置是严格约定。


#### 代码实现

```javascript
function treeNode (val) {
    this.val = val
    this.left = this.right = null
}
```

如果需要新建一个二叉树结点，直接调用构造函数、传入数据域的值就行：

`const node = new TreeNode(1)`

<br>

下图的数据结构即符合物理逻辑，又符合思维逻辑，推荐（修言大佬小册的）

![image.png](https://i.loli.net/2020/04/24/iLbYNlIQCDG9phU.png)

<br>