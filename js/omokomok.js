const OMOK = {
  CONFIG: {
    isDebug: true,
  },
  lastKey: null,
  stonesLocations: [],
  history: [],
  iTurnIndex: 0,
  lineCount: 15,
  margin: 20,
  isPlaying: false,
  humanize: 0.05,
  userColors: ['black', 'white', 'pink', 'darkblue', 'darkred'],
  users: ['black', 'white'/*, 'pink'/*, 'darkblue', 'darkred'*/],
  myStone: null,
  comUsers: [2],
  canvas: document.getElementById('board'),
  debugLayer: document.getElementById('debugLayer'),
  touchLayer: document.getElementById('touchLayer'),
  btnHistoryBack: document.getElementById('btnBack'),
  context: null,
  layerContext: null,
  uid: null,
  database: null,
  roomNo: 'testRoom',
  getContext: () => {
    if (!OMOK.context) {
      OMOK.context = OMOK.canvas.getContext('2d');
    }
    return OMOK.context;
  },
  getLayerContext: () => {
    if (!OMOK.layerContext) {
      OMOK.layerContext = OMOK.debugLayer.getContext('2d');
    }
    return OMOK.layerContext;
  },
  // 초기화 함수
  init() {
    OMOK.setChannel();
    OMOK.bindChannelMoveEvent();
    if (OMOK.getQueryVariable('channel') === OMOK.roomNo) {
      OMOK.showGameLayer();
      OMOK.setPlayerSettings();
      OMOK.initGame();
    }
  },
  getPlayerSettings() {
    return Object.values(document.querySelectorAll('input.player:checked')).map((dom) => dom.value).join('');
  },
  setPlayerSettings() {
    let player = OMOK.getQueryVariable('player');
    if (typeof player === 'string' && player.length === 5) {
      OMOK.users = [];
      let players = player.split('');
      Object.keys(players).forEach((idx) => {
        if (players[idx] === '1') {
          OMOK.users.push(OMOK.userColors[idx]);
        } else if (players[idx] === '2') {
          // OMOK.users.push(OMOK.userColors[idx]);
        }
      })
    }
  },
  showGameLayer() {
    document.getElementById('main').style.display = "block";
    document.getElementById('channel').style.display = "none";
    document.getElementById('player').style.display = "none";
    document.getElementById('gameMode').style.display = "none";
  },
  moveToWaitingRoom() {
    document.getElementById('moveToWaitingRoom').addEventListener('click', function(e) {
        let url = document.location.protocol + '//' + document.location.hostname + document.location.pathname;
        document.location.href = url;
    });
  },
  getNetworkMode() {
    return document.querySelector('.gameMode:checked').value;
  },
  bindChannelMoveEvent() {
    document.getElementById('moveChannel').addEventListener('click', function(e) {
      let channel = document.getElementById('channelSelector').value.trim();
      if (channel && channel !== "") {
        let url = document.location.protocol + '//' + document.location.hostname + document.location.pathname;
            url += '?channel=' + channel;
            url += '&player=' + OMOK.getPlayerSettings();
            url += '&mode=' + OMOK.getNetworkMode();
        document.location.href = url;
      }
    });
  },
  setChannel() {
    let channel = OMOK.getQueryVariable('channel');
    if (!channel && localStorage.channel && localStorage.channel) {
      channel = localStorage.channel;
    }
    if (channel) {
      OMOK.roomNo = channel;
      document.getElementById('channelSelector').value = channel;
      if (localStorage) {
        localStorage.channel = channel;
      }
    }
    OMOK.consoleLog('CH : ' + OMOK.roomNo);
  },
  getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1]);
      }
    }
  },
  initGame() {
    OMOK.clear();
    OMOK.moveToWaitingRoom();
    OMOK.initStonesLocations();
    OMOK.initStonesHistory();
    OMOK.drawBoard();
    OMOK.setTouchLayer();
    OMOK.bindStoneEvents();
    OMOK.bindHistoryBackEvents();
    OMOK.updateDisplay();
    OMOK.initFirebase();
    OMOK.listenOtherStone();
    OMOK.resetGame();
    OMOK.bindChatEvent();
    OMOK.toggleDebug();
  },
  checkMyTurn() {
    if (OMOK.getQueryVariable('mode').trim() === 'S') {
      return true;
    }
    const playerNo = OMOK.iTurnIndex % OMOK.users.length;
    if (OMOK.myStone === null) {
      OMOK.myStone = playerNo;
    }
    return (OMOK.myStone === playerNo);
  },
  toggleDebug() {
    console.log(OMOK.debugLayer.hidden);
    if (localStorage && localStorage.isHideDebug === "true") {
      OMOK.debugLayer.hidden = true;
    }
    document.getElementById('toggleDebug').addEventListener('click', function(e) {
      OMOK.debugLayer.hidden = !OMOK.debugLayer.hidden;
      localStorage.isHideDebug = OMOK.debugLayer.hidden;
    });
  },
  setTouchLayer() {
    OMOK.touchLayer.style.top = 0;
    OMOK.touchLayer.style.left = 0;
    OMOK.touchLayer.style.position = "absolute";
    OMOK.debugLayer.style.top = 0;
    OMOK.debugLayer.style.left = 0;
    OMOK.debugLayer.style.position = "absolute";
  },
  updateDisplay() {
    document.getElementById('display').value =(OMOK.iTurnIndex+1) + ' / ' + OMOK.users[OMOK.iTurnIndex % OMOK.users.length];
  },
  bindChatEvent() {
    firebase.database().ref('chat/' + OMOK.roomNo).limitToLast(10).on('child_added', function(data) {
      OMOK.addText(data.val().uid, data.val().message);
    });

    document.getElementById('chatInput').addEventListener('keyup', function(e) {
      if (e.key == 'Enter' && this.value != '') {
        OMOK.pushMessage(OMOK.uid, this.value);
        this.value = '';
      }
    });
  },
  addText(uid, message) {
    var chatbox = document.getElementById('chatBox');
    var pName = (uid === OMOK.uid) ? 'me' : 'others';
    chatbox.value += ("\n" + pName + ' : ' + message);
    chatbox.scrollTop = chatbox.scrollHeight;
  },
  pushMessage(uid, message) {
    console.log('push');
    let key = firebase.database().ref('chat').child(OMOK.roomNo).push().key;
    firebase.database().ref('chat/' + OMOK.roomNo + '/' + key).set({uid: uid, message: message});
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
      if (data.key !== OMOK.lastKey) {
        OMOK.drawStone(info.x, info.y, info.index, info.turn, true);
        OMOK.iTurnIndex++;
        OMOK.updateDisplay();
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
      OMOK.isPlaying = true;
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
    OMOK.touchLayer.addEventListener('click', (e) => {
      if (OMOK.isPlaying === false) {
        return false;
      }

      if (OMOK.checkMyTurn() === false) {
        return false;
      }

      const x = event.pageX - elemLeft;
      const y = event.pageY - elemTop;
      const iUserIndex = (OMOK.iTurnIndex % OMOK.users.length);

      if (true === OMOK.drawStone(x, y, iUserIndex, OMOK.iTurnIndex, false)) {
        OMOK.iTurnIndex++;
        OMOK.updateDisplay();
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
  drawText(x, y, text, color='grey') {
    const ctx = OMOK.getContext();
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center'; 
    ctx.fillStyle = color;
    ctx.fillText(text, x, y+5);
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
      OMOK.calculatePoint(userIndex);
      return true;
    } else {
      return false;
    }
  },
  sendToServer(x, y, index, turn, uid) {
    let key = firebase.database().ref('omok').child(OMOK.roomNo).push().key;
    OMOK.lastKey = key;
    firebase.database().ref('omok/' + OMOK.roomNo + '/' + key).set({uid: uid, index: index, turn: turn, x: x, y: y});
  },
  clearCanvas(ctx) {
    ctx.clearRect(0, 0, OMOK.canvas.width, OMOK.canvas.height);
  },
  drawRecommendPoint(totalPoints, color, size) {
    // console.log(totalPoints);
    const ctx = OMOK.getLayerContext();
    const space = (OMOK.canvas.width - OMOK.margin * 2) / (OMOK.lineCount - 1);
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center'; 
    ctx.fillStyle = color;

    for (x in totalPoints) {
      for (y in totalPoints[x]) {
        if (totalPoints[x][y] != 0) {
          ctx.font = 5 + (totalPoints[x][y] * size) + 'px sans-serif';
          ctx.fillText(totalPoints[x][y], x * space + OMOK.margin, y * space + OMOK.margin + 5);
        }
      }
    }
  },
  getRecommentPoint(totalPoints) {
    let maxNum = 0;
    let recommendPoints = [];
    for (i in totalPoints) {
      maxNum = Math.max(maxNum, Math.max(...totalPoints[i]));
    }

    for (x in totalPoints) {
      for (y in totalPoints[x]) {
        if (totalPoints[x][y] === maxNum) {
          recommendPoints.push({x: x, y: y, num: maxNum});
        }
      }
    }
    let index = Math.floor(Math.random() * recommendPoints.length);
    // console.log(recommendPoints[index]);
    return recommendPoints[index];
  },
  // 
  calculatePoint(iUserIndex) {
    let arrMyPoints = [];
    let arrOthersPoints = [];
    let arrTotalPoints = [];
    let message = "\n";

    for (let i = 0; i < OMOK.lineCount; i += 1) {
      arrMyPoints[i] = new Array(OMOK.lineCount);
      arrOthersPoints[i] = new Array(OMOK.lineCount);
      arrTotalPoints[i] = new Array(OMOK.lineCount);
      arrMyPoints[i].fill(0);
      arrOthersPoints[i].fill(0);
      arrTotalPoints[i].fill(0);
    }

    for (let tmpY = 0; tmpY < OMOK.lineCount; tmpY += 1) {
      for (let tmpX = 0; tmpX < OMOK.lineCount; tmpX += 1) {
        if (OMOK.stonesLocations[tmpX][tmpY] === undefined) {
          // 내 점수
          arrMyPoints[tmpX][tmpY] += OMOK.getWinningPoint(tmpX, tmpY, iUserIndex);
          Object.keys(OMOK.users).forEach((userIndex) => {
            // 전체 점수
            arrTotalPoints[tmpX][tmpY] += OMOK.getWinningPoint(tmpX, tmpY, parseInt(userIndex));
            if (parseInt(userIndex) !== iUserIndex) {
              // 다른 플레이어 점수
              arrOthersPoints[tmpX][tmpY] = Math.max(arrOthersPoints[tmpX][tmpY], OMOK.getWinningPoint(tmpX, tmpY, parseInt(userIndex)));
            }
          });
        }
        message += (arrTotalPoints[tmpX][tmpY] + "").padStart(4);
      }
      message += "\n";
    }
    // console.log(myIndex);
    OMOK.getLayerContext().clearRect(0, 0, OMOK.canvas.width, OMOK.canvas.height);
    OMOK.drawRecommendPoint(arrTotalPoints, "rgba(0, 255, 0, 0.5)", 4);
    OMOK.drawRecommendPoint(arrOthersPoints, "rgba(0, 0, 255, 0.5)", 7);
    OMOK.drawRecommendPoint(arrMyPoints, "rgba(255, 0, 0, 0.5)", 7);
    // console.log(message);

    // let recommendPoint = OMOK.getRecommentPoint(arrTotalPoints);
  },
  // 연속된돌의 점수
  getWinningPoint(x, y, iUserIndex) {
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

    return Math.max(countN + countS, countW + countE, countNE + countSW, countNW + countSE) + 1;
  },
  // 승패 체크
  checkWinner(x, y, iUserIndex) {
    let maxCount = OMOK.getWinningPoint(x, y, iUserIndex);

    let message = OMOK.users[iUserIndex] + '돌 ' + (maxCount) + '연속';
    // OMOK.consoleLog(message);

    if (maxCount === 5) {
      OMOK.isPlaying = false;
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
