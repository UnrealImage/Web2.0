// 用于判断是否在计算过程中还是处于计算完成状态
var isCalculating = false;

// 数字或操作符的onclick函数，将该数字或操作符加入显示屏的表达式中
function addThingsIntoExpression(numOrOp) {
	if (isCalculating == true) {
		// 若在计算过程中，将数字添加到已有表达式结尾
		document.getElementById("display").value = document.getElementById("display").value + numOrOp;
	} else {
		// 否则将显示屏值重置并进入计算过程中
		isCalculating = true;
		document.getElementById("display").value = numOrOp;
	}
}

// 后退键的onclick事件函数
function backspaceOnClick() {
	var show = document.getElementById("display").value;
	if (isCalculating && show != "") {
		document.getElementById("display").value = show.substring(0, show.length - 1);
		if (document.getElementById("display").value == "") {
			isCalculating = false;
		}
	}
}

// 清空键的onclick事件
function clearOnClick() {
	document.getElementById("display").value = "";
	isCalculating = false;
}

// 等于号的onclick运算事件
function calculate() {
	if (isCalculating) {
		try {
			var result = eval(document.getElementById("display").value);
			if (result == "Infinity") {
				alert("除数不能为0！");
			} else {
				document.getElementById("display").value = result;
				isCalculating = false;
			}
		} catch(exception) {
			alert("表达式有误！")
		}
	} else {
		alert("请先输入表达式！");
	}
}

// 选择函数，根据不同按键选择不同的onclick事件处理函数
function selection(val) {
	switch(val) {
		case "←": backspaceOnClick(); break;
		case "CE": clearOnClick(); break;
		case "=": calculate(); break;
		default: addThingsIntoExpression(val); break;
	}
}

// 设定所有按键的onclick事件均为选择函数
window.onload = function() {
	var allButton = document.getElementsByTagName("input");
	for (var i = 0; i < allButton.length; ++i) {
		allButton[i].onclick = function() {
			selection(this.value);
		}
	}

}