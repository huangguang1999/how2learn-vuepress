## 贝塞尔曲线

贝塞尔曲线由控制点定义



## CSS过渡

CSS 过渡的理念非常简单，我们只需要定义某一个属性以及如何动态地表现其变化。当属性变化时，浏览器将会绘制出相应的过渡动画。

也就是说：我们只需要改变某个属性，然后所有流畅的动画都由浏览器生成。



CSS 提供了四个属性来描述一个过渡：

- `transition-property`
- `transition-duration`
- `transition-timing-function`
- `transition-delay`



之后我们会详细介绍它们，目前我们需要知道，我们可以在 `transition` 中以 `property duration timing-function delay` 的顺序一次性定义它们，并且可以同时为多个属性设置过渡动画。

请看以下例子，点击按钮生成 `color` 和 `font-size` 的过渡动画：

### transition-property

在 `transition-property` 中我们可以列举要设置动画的所有属性，如：`left、margin-left、height 和 color`。

不是所有的 CSS 属性都可以使用过渡动画，但是它们中的[大多数](http://www.w3.org/TR/css3-transitions/#animatable-properties-)都是可以的。`all` 表示应用在所有属性上。

### transition-duration

`transition-duration` 允许我们指定动画持续的时间。时间的格式参照 [CSS 时间格式](http://www.w3.org/TR/css3-values/#time)：单位为秒 `s` 或者毫秒 `ms`。

### transition-delay

`transition-delay` 允许我们设定动画**开始前**的延迟时间。例如，对于 `transition-delay: 1s`，动画将会在属性变化发生 1 秒后开始渲染。

你也可以提供一个负值。那么动画将会从整个过渡的中间时刻开始渲染。例如，对于 `transition-duration: 2s`，同时把 `delay` 设置为 `-1s`，那么这个动画将会持续 1 秒钟，并且从正中间开始渲染。



### 贝塞尔曲线（Bezier curve）



### 阶跃函数（Steps）









## 使用setInterval

从 HTML/CSS 的角度来看，动画是 style 属性的逐渐变化。例如，将 `style.left` 从 `0px` 变化到 `100px` 可以移动元素。

```html
<!DOCTYPE HTML>
<html>

<head>
  <style>
    #train {
      position: relative;
      cursor: pointer;
    }
  </style>
</head>

<body>

  <img id="train" src="https://js.cx/clipart/train.gif">


  <script>
    train.onclick = function() {
      let start = Date.now();

      let timer = setInterval(function() {
        let timePassed = Date.now() - start;

        train.style.left = timePassed / 5 + 'px';

        if (timePassed > 2000) clearInterval(timer);

      }, 20);
    }
  </script>


</body>

</html>

```



## 使用requestAniamtionFrame

模拟小球落地的动画：

```html
<!DOCTYPE HTML>
<html>

<head>
</head>

<body>


  <div id="field">
    <img src="https://js.cx/clipart/ball.svg" width="40" height="40" id="ball">
  </div>

  <script>

	/*
	 * 结构化动画
	 * duration 动画运行的总毫秒数
	 * draw 绘制动画的函数
	 * timing 计算动画进度的函数。获取从0到1的小数时间
	 */
	function animate({duration, draw, timing}) {

	  let start = performance.now();

	  requestAnimationFrame(function animate(time) {
		// 时间百分比从0增加到1
		let timeFraction = (time - start) / duration;
		if (timeFraction > 1) timeFraction = 1;

		// 计算当前动画状态
		let progress = timing(timeFraction)

		draw(progress); // 绘制

		if (timeFraction < 1) {
		  requestAnimationFrame(animate);
		}

	  });
	}

	// 接受时序函数，返回变换后的变体
	function makeEaseOut(timing) {
      return function(timeFraction) {
        return 1 - timing(1 - timeFraction);
      }
    }

    function bounce(timeFraction) {
      for (let a = 0, b = 1, result; 1; a += b, b /= 2) {
        if (timeFraction >= (7 - 4 * a) / 11) {
          return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
        }
      }
    }

    ball.onclick = function() {
		
      // 计算需要移动的距离
	  let to = field.clientHeight - ball.clientHeight;

      // 调用结构化动画
	  animate({
        duration: 2000,
        timing: makeEaseOut(bounce),
        draw(progress) {
          ball.style.top = to * progress + 'px'
        }
      });


    };
  </script>

  <style>
	#field {
	  height: 200px;
	  border-bottom: 3px black groove;
	  position: relative;
	}

	#ball {
	  position: absolute;
	  cursor: pointer;
	}
  </style>

</body>

</html>
```

