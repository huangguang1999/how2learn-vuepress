# 二叉树


## 二叉树的递归遍历

### 先序遍历

```javascript
const preorder = function (root) {
    // 边界检测
    if (!root) {
        return    
    }
    // 处理节点逻辑
    console.log(root.val)
    // 递归遍历左子树
    preorder(root.left)
    // 递归遍历右子树
    preorder(root.right)
}
```

### 中序遍历

```javascript
const preorder = function (root) {
    // 边界检测
    if (!root) {
        return
    }
    // 递归遍历处理左子树
    preorder(root.left)
    // 处理节点逻辑
    console.log(root.val)
    // 递归遍历右子树
    preorder(root.right)
}
```

### 右序遍历

```javascript
const preorder = function(root) {
    // 边界检测
    if (!root) {
        return
    }
    // 递归处理左子树
    preorder(root.left)
    // 递归处理右子树
    preorder(root.right)
    // 处理节点逻辑
    console.log(root.val)
}
```

## 最大/最小深度

### 最大深度

给定一个二叉树，找出**最大深度**。

二叉树的深度为根节点到最远叶子节点的最长路径上的节点数。

说明：叶子节点时**没有子节点**的节点

示例：给定二叉树[3, 9, 20, null, null, 15, 7]

#### 递归实现

```javascript
const maxDepth = function (root) {
    // 递归终止条件
    if (!root) {
        return
    }
    return Math.max(maxDepth(root.left) + 1, maxDepth(root.right) + 1)
}
```

#### 非递归实现

**采用层级遍序**

```javascript
const maxDepth = function (root) {
    if (!root) {
        return
    }
    let queue = [root]
    let level = 0
    while (queue.length) {
        let size = queue.length
        while (size--) {
            let front = queue.shift()
            if (front.left) {
                queue.push(front.left)           
            }    
            if (front.right) {
                queue.push(front.right)
            }
        }
        level ++
    }
    return level
}
```

### 最小深度

#### 递归实现

不能像最大深度那样去实现，因为在孩子节点为空的时候，还是会返回1，但是我们需要的最小高度是**根节点到最近叶子节点**的最小路径，而不是到一个空节点的路径。

```javascript
const minDepth = function (root) {
    if (!root) {
        return
    }
    // 左右子节点都不为空才能递归调用
    if (root.left && root.right) {
        return Math.min(minDepth(root.left) + 1, minDepth(root.right) + 1)
    } else if (root.left) {
        return minDepth(root.right) + 1
    } else if (root.right) {
        return minDepth(root.left) + 1
    } else {
        return 1
    }
}
```

#### 非递归实现

**采用层级遍序**

```javascript
const minDepth = function (root) {
    if (!root) {
        return
    }
    let queue = [root]
    let level = 0
    while (queue.length) {
        let size = queue.length
        while (size--) {
            let front = queue.shift()
            if (!front.left && !front.right) {
                return level + 1
            }
            if (front.left) {
                queue.push(front.left)
            }
            if (front.right) {
                queue.push(front.right)
            }
        }
        level++
    }
    return level
}
```

## LCA问题

LCA（Lowest Common Ancestor）即最近公共祖先问题

### 二叉树的最近公共祖先

对于一个普通的二叉树：


```javascript
输入: root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 1
输出: 3

    3
   / \
  5   1
 / \ / \
6  2 0 8
  / \
 7   4
```


### 思路分析

* 思路一 

首先遍历一遍二叉树，记录下每个节点的父节点，然后对于题目中的p节点，根据这个记录不断的找p的上层节点，直到根，记录下**p的上层节点集合**。然后对于q节点，
根据记录不断向上找它的上层节点，在找寻过程中一旦发现这个**上层节点已经包含在刚刚的集合中**，说明发现了最近公共祖先，直接返回。

```javascript
const lowestCommonAncestor = function (root, p, q) {
    if (!root || root == p || root == q) {
        return root
    }
    let set = new Set()
    let map = new WeakMap()
    let queue = []
    queue.push(root)
    // 层序遍历
    while (queue.length) {
        let size = queue.length
        while (size --) {
            let front = queue.shift()
            if (front.left) {
                queue.push(front.left)
                map.set(front.left, front)
            }
            if (front.right) {
                queue.push(front.right)
                map.set(front.right, front)
            }
        }
    }
    // 构建p的上层节点集合
    while (p) {
        set.add(p)
        p = map.get(p)
    }
    while (q) {
        // 一旦发现公共节点重合，直接返回
        if (set.has(q)) {
            return q
        }
        q = map.get(q)
    }
}
```

* 思路二

深度优先遍历二叉树，如果当前节点为p或者q就直接返回这个节点，否则去查看左右孩子，左孩子中**不包含**p或者q则去找右孩子，右孩子**不包含**p或者q就去找左孩子，
剩下的情况就是左右孩子中**都存在**p或者q。简单的说就是要不就是一个一边，要不就是都在一边

```javascript
const lowestCommonAncestor = function (root, p, q) {
    if (!root || root == p || root == q) {
        return root
    }
    let left = lowestCommonAncestor(root.left, p, q)
    let right = lowestCommonAncestor(root.right, p, q)
    if (left == null) {
        return right    
    } else if (right == null) {
        return left
    } else {
        return root
    }
}
```

### 二叉搜索树的最近公共祖先

题目如上

二叉搜索树是一种特殊的二叉树，有序的，左子树不空的情况下左子树所有节点的值小于根节点的值，右子树不空的情况下右子树所有节点的值大于或等于它根节点的值，
借助二叉搜索树有序的特性，可以得到另外一个版本的深度优化遍历。

#### 递归版

```javascript
const lowestCommonAncestor = function (root, p, q) {
    if (root == null || root == p || root == q) {
        return root
    }
    if (root.val > p.val && root.val > q.val) {
        return lowestCommonAncestor(root.left, p, q)
    } else if (root.val < p.val && root.val < q.val) {
        return lowestCommonAncestor(root.right, p, q)
    } else {
        return root
    }
}
```

#### 非递归版

```javascript
const lowestCommonAncestor = function (root, p, q) {
    let node = root
    while (node) {
        if (p.val > node.val && q.val > node.val) {
            node = node.right
        } else if (p.val < node.val && q.val < node.val) {
            node = node.left
        } else {
            return node
        }
    }
}
```

## 对称二叉树

给定一个二叉树，检查是否镜像对称的

```javascript
       1
      / \
     2   2
    / \ / \
   3  4 4  3
```

### 递归实现

```javascript
const isSymmetric = function (root) {
    let help = (node1, node2) => {
        if (!node1 && !node2) {
            return true
        }
        if (!node1 || !node2 ||node1.val !== node2.val) {
            return false
        }
        return help(node1.left, node2.right) && help(node1.right, node2.left)
    }
    if (!root) {
        return true
    }
    return help(root.left, root.right)
}
```

### 非递归实现

```javascript
const isSymmetric = function (root) {
    if (!root) {
        return true
    }
    let queue = [root.left, root.right]
    let node1, node2
    while (queue.length) {
        node1 = queue.shift()
        node2 = queue.shift()
        // 两节点均为空
        if (!node1 && node2) {
            continue
        }
        // 一个为空一个不为空，或者两个节点值不相等
        if (!node1 || !ndoe2 || node1.val !== node2.val) {
            return false
        }
        queue.push(node1.left)
        queue.push(node2.right)
        queue.push(node1.right)
        queue.push(ndoe2.left)
    }
    return true
}
```

## 二叉树中的路径问题

给定二叉树，求两个节点的路径长度。不一定经过根节点

本质上就是求树中节点左右字树**高度的最大值**

### 二叉树的直径


#### 初步解法

```javascript
const diameterOfBinaryTree = function (root) {
    // 求最大深度
    let maxDepth = (node) => {
        if (!node) {
            return 0
        }
        return Math.max(maxDepth(node.left) + 1, maxDepth(node.right) + 1)
    }
    let help = (node) => {
        if (!node) {
            return 0
        }
        let rootSum = maxDepth(node.left) + maxDepth(node.right)
        let childSum = Math.max(help(node.left), help(node.right))
        return Math.max(rootSum, childSum)
    }
    if (root == null) {
        return 0
    }
    return help(root)
}
```

#### 优化解法

```javascript
const diameterOfBinaryTree = function (root) {
    let help = (node) => {
        if (!node) {
            return 0
        }
        let left = node.left ? help(node.left) + 1 : 0
        let right = node.right ? help(node.right) + 1 : 0
        let cur = left + right
        if (cur > max) {
            max = cur
        }
        return Math.max(left, right)
    }
    let max = 0
    if (root == null) {
        return 0
    }
    help(root)
    return max
}
```

通过设置一个全局变量`max`，深度优先遍历这棵树。每遍历完一个节点就更新`max`，并通过返回值的方式`自底向上`把当前节点左右子树的最大高度传给父函数使用，
使得每个节点只需要访问一次即可。

### 二叉树的所有路径

给定一个二叉树，返回所有从根节点到叶子节点的路径

#### 递归解法

利用DFS(**深度优先遍历**)的方式进行遍历

```javascript
const binaryTreePaths = function (root) {
    let path = []
    let res = []
    let dfs = (node) => {
        if (!node) {
            return
        }
        path.push(node)
        dfs(node.left)
        dfs(node.right)
        if (!node.left && !node.right) {
            res.push(path.map(item => item.val).join('->'))
        }
        // 每访问完一个节点就把它从path中删除，达到回溯效果
        path.pop()
    }
    dfs(root)
    return res
}
```

#### 非递归解法

所有非递归的解法本质上都是用**循环判断**去代替递归

```javascript
const binaryTreePaths = function (root) {
    if (!root) {
        return []
    }
    let stack = []
    let p = root    
    let set = new Set()
    res = []
    while (stack.length || p) {
        // 从左节点开始
        while (p) {
            stack.push(p)
            p = p.left
        }
        let node = stack[stack.length - 1]
        // 叶子节点
        if (!node.right && !node.left) {
            res.push(stack.map(item => item.val).join('->'))
        }
        // 右孩子存在，且右孩子未被访问
        if (node.right && !set.has(node.right)) {
            p = node.right
            set.add(node.right)
        } else {
            stack.pop()
        }
    }
    return res
}
```

### 二叉树的最大路径和

给定一个非空二叉树，返回其最大路径和。

#### 递归解

```javascript
const maxPathSum = function (root) {
    let help = (node) => {
        if (!node) {
            return 0
        }
        let left = Math.max(help(node.left), 0)
        let right = Math.max(help(node.right), 0)
        let cur = left + node.val +right
        if (cur > max) {
            max = cur
        }
        return Math.max(left, right) + node.val
    }
    let max = Number.MIN_SAFE_INTEGER
    help(root)
    return max
}
```


## 二叉搜索树

### 验证二叉搜索树

给定一个二叉树，判断是否是一个有效的二叉搜索树

假设一个二叉搜索树具有如下特征：

* 节点的左子树只包含小于当前节点的数

* 节点的右子树只包含大于当前节点的数

* 所有左子树和右子树自身也是二叉搜索树


```javascript
输入: 
        2
       / \
      1   3
```

#### 中序遍历

通过中序遍历，保存前一个节点的值，扫描到当前节点时，和前一个节点的值比较，如果大于前一个节点的，则满足条件，否则不是二叉树。

```javascript
const isValidBST = function (roor) {
    let prev = null
    const help = (node) => {
        if (node == null) {
            return true
        }
        if (!help(node.left)) {
            return false 
        }
        if (prev !== null && prev >= node.val) {
            return false
        }
        // 保存当前节点，为下一个节点的遍历做准备
        prev = node.val
        return help(node.right)
    }
    return help(root)
}
```


#### 限定上下界进行DFS

二叉搜索树每一个节点的值，都有一个**上界和下界**，深度优先遍历的过程中，如果访问左孩子，则通过当前节点的值来更新左孩子节点的上界，同时访问右孩子，
则更新右孩子的下界，只要出现节点值越界的情况，则不满足二叉搜索树的条件。

###### 递归实现

```javascript
const isValidBST = function (root) {
    const help = (node, max, min) => {
        if (!node) {
            return true
        }
        if (node.val >= max || node.val <= min) {
            return help(node.left, node.val, min) && help(node.right, max, node.val)
        }
        return help(root, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER)
    }
}
```


###### 非递归实现

```javascript
const isValidBST = function (root) {
    if (!root) {
        return true
    }
    let stack = [root]
    let min = Number.MIN_SAFE_INTEGER
    let max = Number.MAX_SAFE_INTEGER
    root.max = max
    root.min = min
    while (stack.length) {
        let node = stack.pop()
        if (node.val < node.min || node.val > node.max) {
            return false
        }
        if (node.left) {
            stack.push(node.left)
            node.left.max = node.max
            node.left.min = node.min
        }
        if (node.right) {
            stack.push(node.right)
            node.right.max = node.max
            node.right.min = node.min
        }
    }
    return true
}
```


### 将有序数组转换成二叉搜索树

