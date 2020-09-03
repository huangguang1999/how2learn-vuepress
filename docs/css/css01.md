# 1 居中方案



## 1.1 水平居中

- 对于`行内元素`: text-align: center;
- 对于确定宽度的块级元素：

1. width和margin实现。margin: 0 auto;
2. 绝对定位和margin-left: -width/2, 前提是父元素position: relative

- 对于宽度未知的块级元素

1. table标签配合margin左右auto实现水平居中。使用table标签（或直接将块级元素设值为display:table），再通过给该标签添加左右margin为auto。
2. inline-block实现水平居中方法。display：inline-block和text-align:center实现水平居中。
3. 绝对定位+transform，translateX可以移动本身元素的50%。
4. flex布局使用justify-content:center



## 1.2 垂直居中

1. 利用`line-height`实现居中，这种方法适合纯文字类
2. 通过设置父容器`相对定位`，子级设置`绝对定位`，标签通过margin实现自适应居中
3. 弹性布局`flex`:父级设置display: flex; 子级设置margin为auto实现自适应居中
4. 父级设置相对定位，子级设置绝对定位，并且通过位移`transform`实现
5. `table`布局，父级通过转换成表格形式，然后子级设置`vertical-align`实现。（需要注意的是：vertical-align: middle使用的前提条件是内联元素以及display值为table-cell的元素）。
