# 你不知道的this



## 题目

先从一段代码入手

```javascript
var length = 10;
function fn() {
	return this.length+1;
}
var obj = {
    length: 5,
    test1: function() {
    	return fn();
    }
};
obj.test2=fn;

//下面代码输出是什么
console.log(obj.test1())
console.log(fn()===obj.test2())
```

=======

答案是：

```javascript
// 11
// false
```



## 常规this

在懂得了this绑定优先级从箭头函数 => new => call/apply/bind绑定 => 隐式绑定 => 默认绑定，根据this是谁调用它就指向谁的公式，我依旧不知道该如何解释这个答案。

但是在查阅了大量资料之后，大致了解：



## reference规范

首先要知道根据运算符优先级`obj.test1()`是先运行`obj.test1的`，所以并且**在JavaScript中`.`不是返回一个函数，而是返回一个reference type的值，其中储存着属性的值和它的来源对象，这是为了随后的方法调用 `()` 获取来源对象，然后将 `this` 设为它。**



Reference Type 是 ECMA 中的一个“规范类型”。我们不能直接使用它，但它被用在 JavaScript 语言内部。

Reference Type 的值是一个三个值的组合 `(base, name, strict)`，其中：

- `base` 是对象。
- `name` 是属性名。
- `strict` 在 `use strict` 模式下为 true。

对属性 `obj.test1` 访问的结果不是一个函数，而是一个 Reference Type 的值。对于 `obj.test1`，在非严格模式下是：

```javascript
// Reference Type 的值
var objReference = {
    base: obj,
    name: 'test1',
    strict: false
}
```



同时规范中还提供了获取reference组成部分的方法，如GetBase和IsPropertyReference。

GetBase：返回reference的base value

IsPropertyReference：如果base value是一个对象，就返回true

GetValue(objReference)：返回具体的this值



## 确定this

规范中描述：

1. 计算 MemberExpression（`()`左边的部分） 的结果赋值给 ref

2.判断 ref 是不是一个 Reference 类型

* 如果 ref 是 Reference，并且 IsPropertyReference(ref) 是 true, 那么 this 的值为 GetBase(ref)
* 如果 ref 是 Reference，并且 base value 值是 Environment Record, 那么this的值为 ImplicitThisValue(ref)
* 如果 ref 不是 Reference，那么 this 的值为 undefined

其实就是**如果ref的类型是reference并且base值是对象**那么`this`值就是这个对象，否则就是undefined。



当然在这个例子里：

```javascript
var value = 1;

var foo = {
  value: 2,
  bar: function () {
    return this.value;
  }
}
console.log((false || foo.bar)()); // 1
```

要知道尽管 foo() 和 (foo.bar = foo.bar)() 最后结果都指向了 undefined，但是两者从规范的角度上却有着本质的区别。foo() 是因为 base 的值不是对象类型（全局变量是一个字符串'EnvironmentRecord'），而后者是因为 MemberExpression 根本不是 `reference` 类型。



上述情况针对的就是正常情况下的this指向判断，随着箭头函数的出现，以及各种高阶函数返回函数再执行的特殊情况，虽然实际生产过程中我没见过这么复杂的骚操作，但是还是需要去理解这些情况下的this指向。