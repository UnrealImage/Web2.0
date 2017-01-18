// 游戏开始时位置的数字序列，其中空块用15表示，其他为0到14
// 序号为序列中序号位置处的值，即seqNum = sequence[seqPos]
var sequence = [];

// 拼图块与空块
var piecesArray;
var blank;

// 游戏是否正在进行
var isPlaying = false;
// 游戏是否正在自动完成中
var isGoingBack = false;

// 移动拼图块次数
var moveNum = 0;
// 提示使用次数
var hintNum = 0;

/*------------------------------获取相关属性所用函数------------------------------*/
// 根据对象，找到css中定义的对象的位置类
function getPositionClass(object) {
	return object.className.substring(object.className.indexOf("position"));
}

// 根据对象序号，找到该对象序号在指定序列中的位置
function getSequencePosition(seqNum, seq) {
	for (var i = 0; i < seq.length; ++i)
		if (seq[i] == seqNum)
			return i;
	return -1;
}
// 根据对象序号位置，找到与该对象相邻的所有序号位置
function getAdjacentSequencePosition(seqPos) {
	var adjacentSeqPos = [];
	if (seqPos > 3)
		adjacentSeqPos.push(seqPos - 4);
	if (seqPos < 12)
		adjacentSeqPos.push(seqPos + 4);
	if (seqPos % 4 > 0)
		adjacentSeqPos.push(seqPos - 1);
	if (seqPos % 4 < 3)
		adjacentSeqPos.push(seqPos + 1);
	return adjacentSeqPos;
}

// 根据对象序号，获得该对象
function getObjectBySequenceNumber(seqNum) {
	var pieceAndBlank = document.getElementsByTagName("input");
	for (var i = 0; i < pieceAndBlank.length; ++i) {
		if (pieceAndBlank[i].sequenceNumber == seqNum)
			return pieceAndBlank[i];
	}
	return null;
}

/*------------------------------拼图基本功能部分------------------------------*/
// 移动某拼图块，将其与空块交换位置
function movePiece(piece) {
	// 交换实际位置
	var tempPosition = blank.position;
	blank.position = piece.position;
	piece.position = tempPosition;

	// 通过修改拼图块对应到css中的哪一个位置类，从而修改实际位置
	blank.className = blank.className.replace(tempPosition, blank.position);
	piece.className = piece.className.replace(blank.position, tempPosition);

	// 交换数字序列中的位置
	var blankSeqPos = getSequencePosition(blank.sequenceNumber, sequence);
	var pieceSeqPos = getSequencePosition(piece.sequenceNumber, sequence);

	var tempSeqNum = sequence[blankSeqPos];
	sequence[blankSeqPos] = sequence[pieceSeqPos];
	sequence[pieceSeqPos] = tempSeqNum;
}

// 判断该拼图块是否可移动，即周围有没有空块
function isMoveable(piece) {
	var seqPos = getSequencePosition(piece.sequenceNumber, sequence);
	var adjacentSeqPos = getAdjacentSequencePosition(seqPos);

	for (var i = 0; i < adjacentSeqPos.length; ++i)
		if (sequence[adjacentSeqPos[i]] == 15)
			return true;
	return false;
}

// 判断游戏是否结束
function gameOver(seq) {
	for (var i = 0; i < seq.length; ++i)
		if (seq[i] != i)
			return false;
	return true;
}

// 拼图块点击事件
function pieceClickEvent() {
	if (isMoveable(this) && isPlaying && !isGoingBack) {
		++moveNum;
		movePiece(this);
		if (gameOver(sequence)) {
			isPlaying = false;
			alert("恭喜成功!\n移动次数：" + moveNum + "\n提示使用次数：" + hintNum);
		}
	}
}

// 初始化拼图
function initialFifteenPuzzle() {
	// 初始化拼图位置及其序号
	var fifteenPuzzle = document.getElementById("puzzle");

	piecesArray = document.getElementsByTagName("input");
	for (var i = 0; i < 15; ++i) {
		var inputButton = piecesArray[i];

		inputButton.classList.add("puzzle-piece", "position-" + i);

		inputButton.addEventListener("click", pieceClickEvent);

		// 两个新属性，表示位置类和序号
		inputButton.position = "position-" + i;
		inputButton.sequenceNumber = i;
	}

	// 初始化空块位置及其序号
	blank = document.getElementById("blank");
	blank.classList.add("blank", "position-15");
	// 两个新属性，表示位置类和序号
	blank.position = "position-15";
	blank.sequenceNumber = 15;
}

/*------------------------------重新开始功能部分------------------------------*/
// 初始化重新开始按钮
function initialRestartButton() {
	var restartButton = document.getElementById("restart");
	restartButton.addEventListener("click", function() {
		// 自动完成中，重新开始按钮失效
		if (isGoingBack)
			return;

		// 初始化移动次数和提示使用次数
		moveNum = 0;
		hintNum = 0;

		// 初始化数字序列
		for (var i = 0; i < 16; ++i)
			sequence[i] = i;

		// 随机移动一定步数
		for (var i = 0; i < 100; ++i) {
			// 获得当前空块位置
			var blankSeqPos = getSequencePosition(blank.sequenceNumber, sequence);

			// 随机获取空块的下个位置
			var choices = getAdjacentSequencePosition(blankSeqPos);
			var next = choices[Math.floor(Math.random() * choices.length)];

			// 在序号数组中交换空块与下个位置
			sequence[blankSeqPos] = sequence[next];
			sequence[next] = blank.sequenceNumber;
		}

		// 将打乱得到的序号应用到各个拼图块上
		var pieceAndBlank = document.getElementsByTagName("input");
		for (var i = 0; i < sequence.length; ++i) {
			var object = pieceAndBlank[sequence[i]];
			object.position = "position-" + i;
			object.className = object.className.replace(getPositionClass(object), object.position);
		}

		// 开始游戏
		isPlaying = true;
	});
}

/*------------------------------自动完成功能部分------------------------------*/
// 计算总曼哈顿距离
function calculateManhattanDistance(currentSeq) {
	var sum = 0;
	for (var i = 0; i < currentSeq.length; ++i) {
		var manhattanDisX = Math.abs(currentSeq[i] % 4 - i % 4);
		var manhattanDisY = Math.abs(Math.floor(currentSeq[i] / 4) - Math.floor(i / 4));
		sum += manhattanDisX + manhattanDisY;
	}
	return sum;
}

// 使用曼哈顿距离作为评估函数，根据评估函数值，将下一个节点插入搜索队列
function insertByManhattanDistance(nodeQueue, node) {
	for (var i = 0; i < nodeQueue.length; ++i) {
		if (calculateManhattanDistance(nodeQueue[i].seq)
			> calculateManhattanDistance(node.seq)) {
			nodeQueue.splice(i, 0, node);
			return;
		}
	}
	nodeQueue.push(node);
}

// 深复制节点，相当于深复制下的node1 = node2
function deepCopyNode(node1, node2) {
	node1.seq = node2.seq.slice(0);
	node1.step = node2.step.slice(0);
	node1.stepNum = node2.stepNum;
}
 
// A*搜索
function AStarSearch(currentSeq) {
	// 节点构造子
	var AStarNodeConstructor = function(seq, step, stepNum) {
		this.seq = seq;
		this.step = step;
		this.stepNum = stepNum;
	};

	// 初始化第一个节点
	var currentStep = [];
	var currentStepNum = 0;
	var initNode = new AStarNodeConstructor(currentSeq, currentStep, currentStepNum);

	// 初始化节点队列
	var nodeQueue = [];
	nodeQueue.push(initNode);

	// 是否访问过
	var isVis = [];

	for (var calNum = 0; nodeQueue.length != 0; ++calNum) {
		var node = nodeQueue.shift();

		if (isVis[node.seq.toString()] == true)
			continue;
		isVis[node.seq.toString()] = true;

		console.log(node.seq);

		// 如果已成功
		if (gameOver(node.seq)) {
			return node.step;
		}

		if (calNum > 7000)
			return null;
		// 空块位置和可以移动的拼图块的序号位置
		var blankSeqPos = getSequencePosition(blank.sequenceNumber, node.seq);
		var nextChoicesPos = getAdjacentSequencePosition(blankSeqPos);

		// 将所有选择按评估值顺序加入队列
		for (var i = 0; i < nextChoicesPos.length; ++i) {
			var next = new AStarNodeConstructor([], [], 0);
			deepCopyNode(next, node);
			// 记录当前操作的是哪一个节点
			next.step.push(next.seq[nextChoicesPos[i]]);
			// 记录已走步数
			++next.stepNum;
			// 交换序列中的值
			next.seq[blankSeqPos] = next.seq[nextChoicesPos[i]];
			next.seq[nextChoicesPos[i]] = blank.sequenceNumber;

			if (isVis[next.seq.toString()] != true)
				insertByManhattanDistance(nodeQueue, next);
		}
	}
	return null;
}

// 自动移回，每隔一段时间移动一格
function moveBack() {
	if (i >= step.length) {
		clearTimeout(timer);
		isGoingBack = false;
		return;
	}
	movePiece(getObjectBySequenceNumber(step[i++]));
	var timer = setTimeout("moveBack()", 300);
}

// 初始化自动完成按钮点击事件
function initialAutoCompleteButton() {
	var autoCompleteButton = document.getElementById("auto-complete");
	autoCompleteButton.addEventListener("click", function() {
		if (isPlaying == 1) {
			isPlaying = false;
			isGoingBack = true;
			step = AStarSearch(sequence);
			i = 0;
			if (step != null)
				moveBack();
			else {
				isGoingBack = false;
				alert("完成所需步数过多，无法自动完成！");
			}
		}
	});
}

/*------------------------------提示功能部分------------------------------*/
// 获得可移动拼图块中移动会使曼哈顿距离最小的那一块
function getMinManhattanDisObj() {
	var blankSeqPos = getSequencePosition(blank.sequenceNumber, sequence);
	var choicesPos = getAdjacentSequencePosition(blankSeqPos);

	var minManhattanDis;
	var resultObject;
	for (var i = 0; i < choicesPos.length; ++i) {
		// 初始化下个位置
		var nextSeq = [];
		for (var j = 0; j < sequence.length; ++j)
			nextSeq[j] = sequence[j];

		// 设置下个位置序列
		nextSeq[blankSeqPos] = nextSeq[choicesPos[i]];
		nextSeq[choicesPos[i]] = blank.sequenceNumber;

		// 计算这个序列下曼哈顿距离
		var nextSeqManhattanDis = calculateManhattanDistance(nextSeq);
		
		//选取最小曼哈顿距离
		if (minManhattanDis == undefined || minManhattanDis > nextSeqManhattanDis) {
			minManhattanDis = nextSeqManhattanDis;
			resultObject = getObjectBySequenceNumber(sequence[choicesPos[i]]);
		}
	}

	return resultObject;
}

// 初始化提示按钮点击事件
function initialHintButton() {
	var hintButton = document.getElementById("hint");
	hintButton.addEventListener("click", function() {
		if (isPlaying) {
			// 增加提示使用次数
			++hintNum;

			// 获取提示选择的拼图块
			hintObject = getMinManhattanDisObj();
			
			// 设置提示动画类
			hintObject.className = "hint-animation " + hintObject.className;

			// 保持一段时间的提示
			timer = setTimeout(function () {
				hintObject.className = hintObject.className.substring(15);
			}, 500);
		}
	});
}


window.onload = function() {
	initialFifteenPuzzle();
	initialRestartButton();
	initialAutoCompleteButton();
	initialHintButton();
};