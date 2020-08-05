# V8+编译原理



## V8执行流程-JIT（Just In Time）技术

![微信截图_20200803170954.png](https://i.loli.net/2020/08/03/vL8fq1YPsISjxAG.png)

1. 根据高级语言生成AST和作用域
2. 根据AST和作用域生成字节码
3. 解释执行字节码
4. 对热点代码（项目中反复使用的代码）进行监控
5. 编译热点代码为二进制的机器代码
6. 如果热点代码有所改变，需要进行反优化操作



## 生成AST

生成 AST 分为两步——词法分析和语法分析。

词法分析即分词，它的工作就是将一行行的代码分解成一个个token。 比如下面一行代码:

```javascript
let name = 'hg'
```

![let.png](https://i.loli.net/2020/08/03/c8PGDu7a1Nh9vnz.png)

即解析成了四个token，这就是词法分析的作用。

接下来语法分析阶段，将生成的这些 token 数据，根据一定的语法规则转化为AST。举个例子:

```javascript
let name = 'hg'
console.log(name)
```

```javascript
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "name"
          },
          "init": {
            "type": "Literal",
            "value": "hg",
            "raw": "'hg'"
          }
        }
      ],
      "kind": "let"
    },
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "computed": false,
          "object": {
            "type": "Identifier",
            "name": "console"
          },
          "property": {
            "type": "Identifier",
            "name": "log"
          }
        },
        "arguments": [
          {
            "type": "Identifier",
            "name": "name"
          }
        ]
      }
    }
  ],
  "sourceType": "script"
}
```

当生成了 AST 之后，接下来会生成执行上下文。



## 生成字节码

开头就已经提到过了，生成 AST 之后，直接通过 V8 的解释器(也叫Ignition)来生成字节码。但是`字节码`并不能让机器直接运行，那你可能就会说了，不能执行还转成字节码干嘛，直接把 AST 转换成机器码不就得了，让机器直接执行。确实，在 V8 的早期是这么做的，但后来因为机器码的体积太大，引发了严重的内存占用问题。

给一张对比图让大家直观地感受以下三者代码量的差异:

![微信截图_20200803191535.png](https://i.loli.net/2020/08/03/yi5aKrPWIuAGxFm.png)

子节码是介于AST 和 机器码之间的一种代码，但是与特定类型的机器码无关，字节码需要通过解释器将其转换为机器码然后执行。

字节码仍然需要转换为机器码，但和原来不同的是，现在不用一次性将全部的字节码都转换成机器码，而是通过解释器来逐行执行字节码，省去了生成二进制文件的操作，这样就大大降低了内存的压力。



## 执行代码

接下来，就进入到字节码解释执行的阶段啦！

在执行字节码的过程中，如果发现某一部分代码重复出现，那么 V8 将它记做`热点代码`(HotSpot)，然后将这么代码编译成`机器码`保存起来，这个用来编译的工具就是V8的`编译器`(也叫做`TurboFan`) , 因此在这样的机制下，代码执行的时间越久，那么执行效率会越来越高，因为有越来越多的字节码被标记为`热点代码`，遇到它们时直接执行相应的机器码，不用再次将转换为机器码。

其实当你听到有人说 JS 就是一门解释器语言的时候，其实这个说法是有问题的。因为字节码不仅配合了解释器，而且还和编译器打交道，所以 JS 并不是完全的解释型语言。而编译器和解释器的 根本区别在于前者会编译生成二进制文件但后者不会。

并且，这种字节码跟编译器和解释器结合的技术，我们称之为`即时编译`, 也就是我们经常听到的`JIT`。

然后，众所周知，JavaScript 是一门动态语言，运行时可以修改对象，但是经过优化编译器编译的代码只是针对某一种固定的结构，一旦对象的结构被动态修改，那么这部分编译优化的代码就需要**反优化**操作，否则就是无效代码。经过反优化的代码，下次执行时就会回退到解释器解释执行。

那除了 V8，还有哪些地方也用了 JIT 技术呢？？

- 著名的JVM以及luajit
- Oracle 的 GraaIVM
- 苹果 SquirrelFish Extreme
- Mozilla 的 SpiderMonkey