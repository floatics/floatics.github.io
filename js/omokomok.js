const OMOK = {
  stonesLocations: [],
  history: [],
  iTurnIndex: 0,
  lineCount: 15,
  margin: 20,
  humanize: 0.05,
  users: ['black', 'white'/*, 'pink', 'darkblue', 'darkred'*/],
  canvas: document.getElementById('board'),
  btnHistoryBack: document.getElementById('btnBack'),
  context: null,
  uid: null,
  database: null,
  roomNo: 'testRoom',
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
    OMOK.initStonesHistory();
    OMOK.drawBoard();
    OMOK.bindStoneEvents();
    OMOK.bindHistoryBackEvents();
    OMOK.initFirebase();
    OMOK.listenOtherStone();
    OMOK.resetGame();
  },
  resetGame() {
    firebase.database().ref('omok').on('child_removed', function(data) {
      OMOK.consoleLog('reset!!!');
      document.location.reload();
    });

    document.getElementById('btnRestart').addEventListener('click', (e) => {
      firebase.database().ref('omok').remove();
    });
  },
  listenOtherStone() {
    firebase.database().ref('omok/' + OMOK.roomNo).on('child_added', function(data) {
      var info = data.val();
      if (info.uid !== OMOK.uid) {
        OMOK.drawStone(info.x, info.y, info.index, info.turn, true);
        OMOK.iTurnIndex++;
      }
    });
  },
  initFirebase() {
    // Initialize Firebase
    const config = {
      apiKey: "AIzaSyBb0FbzWouXboRdCORAQnXMs265jmDF3IE",
      authDomain: "ohglemok.firebaseapp.com",
      databaseURL: "https://ohglemok.firebaseio.com",
      projectId: "ohglemok",
      storageBucket: "ohglemok.appspot.com",
      messagingSenderId: "186026909541"
    };
    firebase.initializeApp(config);
    firebase.auth().signInAnonymously();
    firebase.auth().onAuthStateChanged((user) => {
      OMOK.consoleLog('Ready!');
      OMOK.consoleLog('UID : ' + user.uid);
      OMOK.uid = (user) ? user.uid: null;
    });
    OMOK.database = firebase.database();
  },
  bindHistoryBackEvents() {
    OMOK.btnHistoryBack.addEventListener('click', (e) => {
      if (OMOK.history.length) {
        OMOK.history.pop();
        OMOK.iTurnIndex--;
        OMOK.redrawStones();
      }
    });
  },
  redrawStones() {
    let tmp = OMOK.history;
    OMOK.clear();
    OMOK.initStonesLocations();
    OMOK.drawBoard();
    OMOK.initStonesHistory();
    for (i in tmp) {
      OMOK.drawStone(tmp[i].x, tmp[i].y, tmp[i].userIndex, i, true);
    }
  },
  // 히스토리 초기화
  initStonesHistory() {
  	OMOK.history = [];
  },
  // 돌위치 초기화
  initStonesLocations() {
    for (let i = 0; i < OMOK.lineCount; i += 1) {
      OMOK.stonesLocations[i] = new Array(OMOK.lineCount);
    }
  },
  // 이벤트 등록
  bindStoneEvents() {
    const context = OMOK.getContext();
    const elemLeft = OMOK.canvas.offsetLeft;
    const elemTop = OMOK.canvas.offsetTop;
    OMOK.iTurnIndex = 0;
    // 바둑돌 
    OMOK.canvas.addEventListener('click', (e) => {
      const x = event.pageX - elemLeft;
      const y = event.pageY - elemTop;
      const iUserIndex = (OMOK.iTurnIndex % OMOK.users.length);

      if (true === OMOK.drawStone(x, y, iUserIndex, OMOK.iTurnIndex, false)) {
        OMOK.iTurnIndex++;
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

    ctx.beginPath();
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

    ctx.fillStyle = 'black';
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
  drawText(x, y, text) {
    const ctx = OMOK.getContext();
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center'; 
    ctx.fillStyle = 'grey';
    ctx.fillText(text, x, y+5);
    // ctx.strokeStyle = 'white';
    // ctx.lineWidth = 0.1;
    // ctx.strokeText(text, x, y+5);
  },
  // 바둑돌 그리기
  drawStone(x, y, userIndex, turnIndex, bIsRedraw = false) {
    const ctx = OMOK.getContext();
    const space = (OMOK.canvas.width - OMOK.margin * 2) / (OMOK.lineCount - 1);
    let indexOfX, indexOfY;

    if (bIsRedraw === true) {
      indexOfX = x;
      indexOfY = y;
    } else {
      indexOfX = Math.floor(x / space);
      indexOfY = Math.floor(y / space);
    }

    x = indexOfX * space + OMOK.margin;
    y = indexOfY * space + OMOK.margin;

    if (OMOK.setPosition(indexOfX, indexOfY, userIndex) === true) {
      if (bIsRedraw === false) {
        OMOK.sendToServer(indexOfX, indexOfY, userIndex, turnIndex, OMOK.uid);
      }
      xHumunize = (space * OMOK.humanize * Math.random()) - (space * OMOK.humanize * Math.random());
      yHumunize = (space * OMOK.humanize * Math.random()) - (space * OMOK.humanize * Math.random());

      x += xHumunize;
      y += yHumunize;

      ctx.beginPath();
      ctx.fillStyle = OMOK.users[userIndex];
      ctx.arc(x, y, (space / 2 * 0.9), 0, 2 * Math.PI, false);
      ctx.fill();

      OMOK.drawText(x, y, parseInt(turnIndex) + 1);

      OMOK.checkWinner(indexOfX, indexOfY, userIndex);
      return true;
    } else {
      return false;
    }
  },
  sendToServer(x, y, index, turn, uid) {
    let key = firebase.database().ref('omok').child(OMOK.roomNo).push().key;
    firebase.database().ref('omok/' + OMOK.roomNo + '/' + key).set({uid: uid, index: index, turn: turn, x: x, y: y});
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
    OMOK.consoleLog(message);

    if (maxCount === 5) {
      setTimeout(function() {
        alert(OMOK.users[iUserIndex] + ' 승리 !!!');
      }, 0);
    }
  },
  consoleLog(message) {
    var textArea = document.getElementById('console');
    textArea.value += ("\n" + message);
    textArea.scrollTop = textArea.scrollHeight;
    console.log(message);
  },
  // 바둑돌위치 저장
  setPosition(x, y, userIndex) {
    if (OMOK.stonesLocations[x][y] === undefined) {
      OMOK.stonesLocations[x][y] = userIndex;
      OMOK.history.push({x:x, y:y, userIndex:userIndex});
      return true;
    } else {
      return false;
    }
  }
};

OMOK.init();
