## 说明

以下部分为笔记，从【你不知道的JavaScript（中）】中摘抄，只适合查漏补缺，不适合系统地学习。



## 特殊的null

```javascript
typeof null === 'object' // true
```

正确的返回结果应该是 `null` ，但是这个 bug 由来已久，在 JavaScript 中已经存在了近二十年，也许永远也不会修复，因为这**牵涉到太多的 web 系统**， 修复它会产生更多的 bug ，令许多系统无法正常工作。



## 特殊的typeof处理

typeof 处理 undeclared 变量的方式非常特殊：

```javascript
var a;
typeof a; // 'undefined'
typeof b; // 'undefined'
```

对于 undeclared （或者 not defined ）变量， typeof 照样返回 “undefined” 。请注意虽然 b 是一个 undeclared 变量，但 typeof b 并没有报错。这是因为 typeof 有一个特殊的安全规范机制。

此时 typeof 如果能返回 undeclared （而非 undefined ）的话，情况会好很多。



与此同时还有在全局对象 window 上访问未定义的变量也不会报错，一般可以使用这些安全防范机制来实现特定功能。



## 奇怪的数组

创建空数组时要注意”空白单元“会被赋值为 undefined

```javascript
var a = [];
a[0] = 1;
// 此处没有设置a[1]单元
a[2] = [3];
a[1]; // undefined
a.length; // 3
```



特别注意如果字符串键值能被强制类型转换为十进制数字的话，它就会被当作数字索引来处理。

```javascript
var a = [];
a["13"] = 42;
a.length; // 14
```



## 奇怪的逻辑运算符

```javascript
var a = 42;
var b = 'abc';
var c = null;

a || b; // 42
a && b; // 'abc'

c || b; // 'abc'
c && b; // null
```



在 JavaScript 中：

|| 和 && 首先会对第一个操作数（ a 和 c ）执行条件判断，如果其不是布尔值就会吸纳进行 ToBoolean 强制类型转换，然后再执行条件判断。

对于 || 来说，如果条件判断结果为 true 就返回第一个操作数 （ a 和 c ）的值，如果为 false 就返回第二个操作数（ b ）的值。

&& 则相反，如果条件判断结果为 true 就返回第二个操作数 （b）的值，如果为 false 就返回第一个操作数（ a 和 c ）的值。

|| 和 && 返回它们其中一个操作数的值，而非条件判断的结果（其中可能涉及到强制类型转换）。c && b 中 c 为 null ，是一个假值，因此 && 表达式的结果是 null （即 c 的值），而非条件判断的结果 false 。



换一个角度来理解：

```javascript
a || b;
// 相当于
a ? a : b;

a && b;
// 相当于
a ? b : a
```



## 奇怪的宽松相等

ES5规范中定义了 == 运算符的行为，该算法覆盖了所有可能出现了类型组合，以及它们进行强制类型转换的方式。



先注意几个非常规的情况：

* NaN 不等于 NaN
* +0 等于 -0
* null == undefined
* 当两个对象指向同一个值时即视为相等，不发生强制类型转换



### 1 字符串和数字之间的相等比较

优先级：数组 > 字符串

简单来说就是字符串会被强制类型转换为数字以便进行相等比较。



### 2 其它类型和布尔类型之间的相等比较

```javascript
var a = '42';
var b = true;

a == b // fasle
```



规范中说到 **如果有布尔类型一定会先转换为数值**再做比较；

所以 true 会被转换为 1 ，然后字符串再转换为数值，所以不能相等。



### 3 对象和非对象之间的比较

规范中说到非对象会调用 ToPrimitive() 方法

## ToPrimitive

那接下来就要看看 ToPrimitive 了，在了解了 toString 和 valueOf 方法后，这个也很简单。

让我们看规范 9.1，函数语法表示如下：

```javascript
ToPrimitive(input[, PreferredType])
```

第一个参数是 input，表示要处理的输入值。

第二个参数是 PreferredType，非必填，表示希望转换成的类型，有两个值可以选，Number 或者 String。

当不传入 PreferredType 时，如果 input 是日期类型，相当于传入 String，否则，都**相当于传入 Number**。

如果传入的 input 是 Undefined、Null、Boolean、Number、String 类型，直接返回该值。



**对象转字符串**可以概括为：

1. 如果对象具有 toString 方法，则调用这个方法。如果他返回一个原始值，JavaScript 将这个值转换为字符串，并返回这个字符串结果。
2. 如果对象没有 toString 方法，或者这个方法并不返回一个原始值，那么 JavaScript 会调用 valueOf 方法。如果存在这个方法，则 JavaScript 调用它。如果返回值是原始值，JavaScript 将这个值转换为字符串，并返回这个字符串的结果。
3. 否则，JavaScript 无法从 toString 或者 valueOf 获得一个原始值，这时它将抛出一个类型错误异常。



**对象转数字**的过程中，JavaScript 做了同样的事情，只是它会首先尝试 valueOf 方法

1. 如果对象具有 valueOf 方法，且返回一个原始值，则 JavaScript 将这个原始值转换为数字并返回这个数字
2. 否则，如果对象具有 toString 方法，且返回一个原始值，则 JavaScript 将其转换并返回。
3. 否则，JavaScript 抛出一个类型错误异常。



有一些**非常规**的比较：

```javascript
"0" == false // true
false == 0 // true
false == "" // true
false == [] // true
"" == 0 // true
"" == [] // true
0 == [] // true
```



首先从第一个分析，当比较两方出现一个 Boolean 值的时候， false 就转换为数字 0 ，"0" 也转换为数字 0 ，所以相等；

**第四个中，首先 false 转换成数字 0 ，然后右边调用 ToPrimitive([]) ，内部 valueof() 得到 []，继续 tostring() 得到 “” ，返回后 “” 再转换为数字 0 ，最终相等。**



还有个**极端**情况：

```javascript
[] == ![] // true
```

根据 ToBoolean 规则，它会进行布尔值得显式强制类型转换（同时反转奇偶校验位）。所以 [] == ![] 变成了 [] == false 。



## 4 对象和对象之间的比较

比较引用