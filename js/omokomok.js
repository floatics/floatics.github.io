const OMOK = {
  stonesLocations: [],
  lineCount: 15,
  margin: 20,
  humanize: 0.05,
  users: ['black', 'white', 'pink'/*, 'darkblue', 'darkred'*/],
  canvas: document.getElementById('board'),
  context: null,
  getContext: () => {
    if (!OMOK.context) {
      OMOK.context = OMOK.canvas.getContext('2d');
    }
    return OMOK.context;
  },
  // 초기화 함수
  init(){
    OMOK.clear();
    OMOK.initStonesLocations();
    OMOK.drawBoard();
    OMOK.bindEvents();
  },
  // 돌위치 초기화
  initStonesLocations() {
    for (let i = 0; i < OMOK.lineCount; i += 1) {
      OMOK.stonesLocations[i] = new Array(OMOK.lineCount);
    }
  },
  // 이벤트 등록
  bindEvents() {
    const context = OMOK.getContext();
    const elemLeft = OMOK.canvas.offsetLeft;
    const elemTop = OMOK.canvas.offsetTop;
    iTurnCount = 0;
    // 바둑돌 
    OMOK.canvas.addEventListener('click', (e) => {
      const x = event.pageX - elemLeft;
      const y = event.pageY - elemTop;
      const iUserIndex = (iTurnCount % OMOK.users.length);

      if (true === OMOK.drawStone(x, y, iUserIndex)) {
        iTurnCount++;
      }

      e.preventDefault();
      e.stopPropagation();
    });
  },
  // 캔버스 초기화
  clear() {
    OMOK.getContext().clearRect(0, 0, OMOK.canvas.width, OMOK.canvas.height);
  },
  // 바둑판 그리기
  drawBoard() {
    const ctx = OMOK.getContext();
    const space = (OMOK.canvas.width - OMOK.margin * 2) / (OMOK.lineCount - 1);

    for (let index = 0; index < OMOK.lineCount; index += 1) {
      const startPoint = index * space + OMOK.margin;
      ctx.moveTo(startPoint, OMOK.margin);
      ctx.lineTo(startPoint, OMOK.canvas.height - OMOK.margin);
      ctx.moveTo(OMOK.margin, startPoint);
      ctx.lineTo(OMOK.canvas.height - OMOK.margin, startPoint);
    }
    ctx.stroke();
    OMOK.drawFlowerPoint();
  },
  // 화점 그리기
  drawFlowerPoint() {
    const ctx = OMOK.getContext();
    const space = (OMOK.canvas.width - OMOK.margin * 2) / (OMOK.lineCount - 1);

    const centerX = OMOK.canvas.width / 2;
    const centerY = OMOK.canvas.height / 2;
    const flowerPoint = space * 3 + OMOK.margin;

    // 상단
    OMOK.drawCircle(flowerPoint, flowerPoint, 3);
    OMOK.drawCircle(centerX, flowerPoint, 3);
    OMOK.drawCircle(OMOK.canvas.width - flowerPoint, flowerPoint, 3);
    // 중앙
    OMOK.drawCircle(flowerPoint, centerY, 3);
    OMOK.drawCircle(centerX, centerY, 3);
    OMOK.drawCircle(OMOK.canvas.width - flowerPoint, centerY, 3);
    // 하단
    OMOK.drawCircle(flowerPoint, OMOK.canvas.height - flowerPoint, 3);
    OMOK.drawCircle(centerX, OMOK.canvas.height - flowerPoint, 3);
    OMOK.drawCircle(OMOK.canvas.width - flowerPoint, OMOK.canvas.height - flowerPoint, 3);
  },
  // 원 그리기 wrapper
  drawCircle(x, y, size) {
    const ctx = OMOK.getContext();
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.fill();
  },
  // 바둑돌 그리기
  drawStone(x, y, userIndex) {
    const ctx = OMOK.getContext();
    const space = (OMOK.canvas.width - OMOK.margin * 2) / (OMOK.lineCount - 1);

    const indexOfX = Math.floor(x / space);
    const indexOfY = Math.floor(y / space);

    x = indexOfX * space + OMOK.margin;
    y = indexOfY * space + OMOK.margin;

    if (OMOK.setPosition(indexOfX, indexOfY, userIndex) === true) {
      xHumunize = (space * OMOK.humanize * Math.random()) - (space * OMOK.humanize * Math.random());
      yHumunize = (space * OMOK.humanize * Math.random()) - (space * OMOK.humanize * Math.random());

      x += xHumunize;
      y += yHumunize;

      ctx.beginPath();
      ctx.fillStyle = OMOK.users[userIndex];
      ctx.arc(x, y, (space / 2 * 0.9), 0, 2 * Math.PI, false);
      ctx.fill();

      OMOK.checkWinner(indexOfX, indexOfY, userIndex);
      return true;
    } else {
      return false;
    }
  },
  // 승패 체크
  checkWinner(x, y, iUserIndex) {
    let countN = 0,
        countS = 0,
        countW = 0,
        countE = 0,
        countNE = 0,
        countNW = 0,
        countSE = 0,
        countSW = 0;

    // 북쪽 체크
    for (let i = 1; i < 5; i += 1) {
      if (OMOK.stonesLocations[x] && OMOK.stonesLocations[x][y-i] === iUserIndex) {
        countN++;
      } else {
        break;
      }
    }
    // 남쪽 체크
    for (let i = 1; i < 5; i += 1) {
      if (OMOK.stonesLocations[x] && OMOK.stonesLocations[x][y+i] === iUserIndex) {
        countS++;
      } else {
        break;
      }
    }
    // 동쪽 체크
    for (let i = 1; i < 5; i += 1) {
      if (OMOK.stonesLocations[x+i] && OMOK.stonesLocations[x+i][y] === iUserIndex) {
        countE++;
      } else {
        break;
      }
    }
    // 서쪽 체크
    for (let i = 1; i < 5; i += 1) {
      if (OMOK.stonesLocations[x-i] && OMOK.stonesLocations[x-i][y] === iUserIndex) {
        countW++;
      } else {
        break;
      }
    }
    // 북동쪽 체크
    for (let i = 1; i < 5; i += 1) {
      if (OMOK.stonesLocations[x+i] && OMOK.stonesLocations[x+i][y-i] === iUserIndex) {
        countNE++;
      } else {
        break;
      }
    }
    // 남서쪽 체크
    for (let i = 1; i < 5; i += 1) {
      if (OMOK.stonesLocations[x-i] && OMOK.stonesLocations[x-i][y+i] === iUserIndex) {
        countSW++;
      } else {
        break;
      }
    }
    // 북서쪽 체크
    for (let i = 1; i < 5; i += 1) {
      if (OMOK.stonesLocations[x-i] && OMOK.stonesLocations[x-i][y-i] === iUserIndex) {
        countNW++;
      } else {
        break;
      }
    }
    // 남동쪽 체크
    for (let i = 1; i < 5; i += 1) {
      if (OMOK.stonesLocations[x+i] && OMOK.stonesLocations[x+i][y+i] === iUserIndex) {
        countSE++;
      } else {
        break;
      }
    }

    let maxCount = Math.max(countN + countS, countW + countE, countNE + countSW, countNW + countSE) + 1;

    let message = OMOK.users[iUserIndex] + '돌 ' + (maxCount) + '연속';
    console.log(message);

    if (maxCount === 5) {
      setTimeout(function() {
        alert(OMOK.users[iUserIndex] + ' 승리 !!!');
      }, 0);
    }
  },
  // 바둑돌위치 저장
  setPosition(x, y, userIndex) {
    if (OMOK.stonesLocations[x][y] === undefined) {
      OMOK.stonesLocations[x][y] = userIndex;
      return true;
    } else {
      return false;
    }
  }
};

OMOK.init();

