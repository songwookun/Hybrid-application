const canvas = document.getElementById('game-board'); // 'game-board'라는 ID를 가진 캔버스 엘리먼트를 가져옴
const ctx = canvas.getContext('2d'); // 2D 렌더링 컨텍스트를 가져와서 ctx 변수에 저장  ctx를 통해 2D 그래픽 작업을 수행

let mouseX = 0; //마우스 x좌표 초기화
let mouseY = 0; //마우스 y좌표 초기화
let gameStarted = false; //게임 시작 여부를 나타냄
let gameInterval; //게임 관리하는 변수
let seconds = 0; //게임 시간 저장 
let speedBoostActive = false; //뱀 속도 강화 상태 여부 표시
let initialTailSize = 3; // 초기 꼬리 크기를 2 지정
let obstacles = []; // 장애물을 담을 배열 선언

class Snake { //뱀 관련 클래스
constructor() {
    this.x = 100;  // 뱀의 x 위치
    this.y = 100;  // 뱀의 y 위치
    this.size = 5;  // 뱀의 크기
    this.color = '#4CAF50';  // 뱀의 색상
    this.tail = [];  // 뱀의 꼬리
    this.speed = 5;  // 뱀의 이동 속도
    this.Tail(); // 초기 꼬리 생성 함수 호출
}

draw() {  // 뱀 그리기 함수, 머리와 꼬리가 원으로 그려집니다.
    ctx.beginPath();  // 새 경로 생성
    const offsetY = this.size / 3;  // y 좌표에 더해질 오프셋 값 설정
    ctx.arc(this.x, this.y - offsetY, this.size, 0, 2 * Math.PI);  // 뱀의 머리
    ctx.fillStyle = this.color;  // 뱀의 색상 설정
    ctx.fill();
    for (let i = 0; i < this.tail.length; i++) { // 현재 이 루프는 뱀의 꼬리를 그리기 위한 반복문입니다.
        ctx.beginPath();// 새로운 경로를 만듭니다.
        ctx.arc(this.tail[i].x, this.tail[i].y, this.size, 0, 2 * Math.PI); // 현재 꼬리 블록을 기준으로 원을 그립니다.
        ctx.fill(); // 이전에 정의한 경로를 채우기(fill)를 이용하여 색을 입힙니다.
    }
}

Tail() {// 초기 꼬리 생성, 뱀의 꼬리는 배열로 표현됩니다.
    for (let i = 0; i < this.initialTailSize; i++) {
        this.tail.push({ x: this.x - (i + 1) * this.size, y: this.y });  // 꼬리의 위치 설정
    }
}

update() {  // 뱀의 위치 업데이트 및 이동 관련 작업 수행,  // 마우스 방향으로 뱀을 이동시킵니다.
    const dirX = mouseX - this.x; // 마우스 x 좌표와 뱀의 x 좌표 차이를 계산
    const dirY = mouseY - this.y; // 마우스 y 좌표와 뱀의 y 좌표 차이를 계산
    const scalar = Math.sqrt(dirX * dirX + dirY * dirY); // 마우스와 뱀 사이의 거리에 대한 스칼라를 계산합니다
    //이동 거리는 뱀의 속도에 따라 조절됩니다.
    if (scalar > 20) { // 좌표 값이 20보다 클 때, 일정 거리 이상일 때만 움직입니다.
        this.x += (dirX / scalar) * this.speed;   // x축 이동량 계산
        this.y += (dirY / scalar) * this.speed;  // y축 이동량 계산
    }
    for (let i = this.tail.length - 1; i > 0; i--) {
        this.tail[i] = { x: this.tail[i - 1].x, y: this.tail[i - 1].y };  // 꼬리의 이전 위치로 설정
    }
    if (this.tail.length > 0) {
        this.tail[0] = { x: this.x, y: this.y };  // 꼬리의 첫 번째 부분을 머리 위치로 설정
    }
    if (this.x < 0 || this.y < 0 || this.x >= canvas.width || this.y >= canvas.height) {  // 벽과의 충돌 체크, 게임 종료 함수 호출
        gameOver();
    } 
    const distanceToMouse = Math.sqrt((this.x - mouseX) ** 2 + (this.y - mouseY) ** 2); //뱀의 머리와 마우스 간의 거리(distanceToMouse)가 this.size보다 작다면, 이는 뱀의 머리가 마우스 근처에 있음을 나타냅니다.
    if (distanceToMouse < this.size) {
        gameOver();
    }
}

eatFruit(fruit) { // 먹이를 먹을 때의 로직, 먹이와 뱀의 거리를 계산하고 꼬리와 점수 관리
    const distance = Math.sqrt((this.x - fruit.x) ** 2 + (this.y - fruit.y) ** 2);
    if (distance < this.size + fruit.size) {
        fruit.newLocation();  // 새로운 먹이 위치 설정
        this.tail.push({ x: this.x, y: this.y });  // 꼬리 추가
        this.initialTailSize += 1;  // 꼬리 길이 1 추가
        const scoreSpan = document.getElementById('score');
        const score = parseInt(scoreSpan.textContent) + 1;
        scoreSpan.textContent = score;  // 점수 업데이트
        updateObstacleCount(score);
        document.getElementById('snakeLength').textContent = this.initialTailSize;  // 뱀 길이 업데이트
    }
}
}
class Fruit { //과일 클래스
  constructor() {
    this.size = 5; //과일 크기 5지정
    this.color = 'red'; //과일 색상
    this.newLocation(); // 새로운 과일 위치 생성
  }

  newLocation() {// 캔버스 안에 과일의 위치 랜덤으로 설정
    this.x = Math.floor(Math.random() * (canvas.width - this.size)); //x 위치를 무작위로 설정
    this.y = Math.floor(Math.random() * (canvas.height - this.size)); // y 위치를 무작위로 설정
  }

  draw() {
    ctx.beginPath(); //도형을 그리기 위해 새 경로 시작
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);//과일을 원 모양으로 그림
    ctx.fillStyle = this.color;//과일 색 설정
    ctx.fill();//색으로 도형 채움
  }
}

class Obstacle { //장애물 클래스
  constructor() {
    this.size = 10; //장애물 크기
    this.color = 'black'; //장애물 색상
    this.x = Math.floor(Math.random() * (canvas.width - this.size)); //x 위치 무작위 설정
    this.y = Math.floor(Math.random() * (canvas.height - this.size));//y 위치 무작위 설정
    this.speedX = Math.random() * 2 - 1; // x 방향 속도 무작위 설정
    this.speedY = Math.random() * 2 - 1;// y 방향 속도 무작위 설정
    this.rotation = 0; //회전 값 초기화
    this.rotationSpeed = 0.1;// 회전 속도 초기화
    this.shape = Math.floor(Math.random() * 3); // 모양 무작위 설졍(0, 1, 2)
  }

  draw() {
    ctx.save(); // 현재 캔버스 그래픽 상태 저장
    ctx.translate(this.x, this.y); //위치 이동
    ctx.rotate(this.rotation);// 회전
    ctx.beginPath(); //새 경로 생성
    if (this.shape === 0) { // 모양에 따라 장애물 그리기
      ctx.arc(0, 0, this.size, 0, 2 * Math.PI); // 원 모양의 장애물 그리기
    } else if (this.shape === 1) { //사각형 그리기
      ctx.rect(-this.size, -this.size, this.size * 2, this.size * 2);
    } else {
      ctx.moveTo(0, 0);// 삼각형 모양 그리기 위한 시작점 지정
      ctx.lineTo(this.size * 2, 0); // 삼각형의 변 그리기
      ctx.lineTo(this.size, this.size * 2);// 삼각형의 다른 변을 그리기
      ctx.closePath();// 경로를 닫아 삼각형 완성
    }
    ctx.fillStyle = this.color; //장애물의 색상 설정
    ctx.fill();// 설정된 색상으로 도형을 채움
    ctx.restore(); //초기 저장된 상태로 복원
  }

  update() {
    this.x += this.speedX; // x위치 업데이트
    this.y += this.speedY;// y위치 업데이트
    this.rotation += this.rotationSpeed; //회전 업데이트

    if (this.x <= 0 || this.x >= canvas.width - this.size * 2) {
      this.speedX *= -1; // 장애물의 x 좌표가 캔버스 왼쪽 경계를 벗어나거나 캔버스 오른쪽 경계를 벗어나면 방향을 반대로 바꿉니다.
    }
    if (this.y <= 0 || this.y >= canvas.height - this.size * 2) {
      this.speedY *= -1;// 장애물의 y 좌표가 캔버스 상단 경계를 벗어나거나 캔버스 하단 경계를 벗어나면 방향을 반대로 바꿉니다.
    }
    // 뱀과 장애물의 충돌을 검사합니다
    if (
      snake.x < this.x + this.size * 2 && //뱀의 오른쪽 좌표과 장애물의 왼쪽 좌표보다 작을 때
      snake.x + snake.size > this.x && //뱀의 왼쪽 좌표가 장애물 오른쪽 좌표보다 클 때
      snake.y < this.y + this.size * 2 && // 뱀의 아래쪽 좌표가 장애물의 위쪽 좌표보다 작을 때
      snake.y + snake.size > this.y //// 뱀의 위쪽 좌표가 장애물의 아래쪽 좌표보다 클 때
    ) {
      gameOver();// 뱀과 장애물이 충돌하면 게임 종료 함수를 호출합니다.
    }
    // 뱀의 꼬리와 장애물 간의 모든 충돌을 검사합니다.
    for (let i = 0; i < snake.tail.length; i++) {
      if (
        snake.tail[i].x < this.x + this.size * 2 && // 꼬리 부분의 오른쪽 좌표가 장애물의 왼쪽 좌표보다 작을 때
        snake.tail[i].x + snake.size > this.x &&  // 꼬리 부분의 왼쪽 좌표가 장애물의 오른쪽 좌표보다 클 때
        snake.tail[i].y < this.y + this.size * 2 && // 꼬리 부분의 아래쪽 좌표가 장애물의 위쪽 좌표보다 작을 때
        snake.tail[i].y + snake.size > this.y  // 꼬리 부분의 위쪽 좌표가 장애물의 아래쪽 좌표보다 클 때
      ) {
        gameOver(); // 뱀의 꼬리와 장애물이 충돌하면 게임 종료 함수를 호출합니다
      }
    }
  }
}
const snake = new Snake(); // 새로운 뱀 개체 생성
const fruit = new Fruit(); // 새로운 과일 개체 생성

function startGame() {// 게임 시작 함수
  if (!gameStarted) { // 게임이 시작되지 않았다면 실행
    gameStarted = true; // 게임 시작 상태로 설정
    gameInterval = setInterval(updateGame, 1000 / 60);// 16ms 마다 게임 업데이트 함수 호출
    updateTimeAndLength(); // 시간과 뱀 길이 업데이트
    snake.x = 100;  // 뱀의 x 위치 초기화
    snake.y = 100;  // 뱀의 y 위치 초기화
    snake.initialTailSize = 3;  // 초기 꼬리 크기 2개 초기화
    snake.Tail(); // 새로운 꼬리 생성
    resetObstacles(); // 장애물 초기화 함수 호출
  }
}

function resetObstacles() {// 기존 장애물을 초기화하고 세 개의 새로운 장애물을 생성하여 배열에 추가합니다.
  obstacles = [];
  for (let i = 0; i < 3; i++) {
    obstacles.push(new Obstacle());
  }
}

function stopGame() {// 게임 종료 함수
  gameStarted = false; // 게임 종료 상태로 설정
  clearInterval(gameInterval); // 게임 간격 클리어
}

function updateGame() { // 게임 업데이트 함수
  ctx.clearRect(0, 0, canvas.width, canvas.height);// 캔버스 초기화
  snake.update();  // 뱀 업데이트
  snake.draw(); // 뱀 그리기
  fruit.draw();  // 과일 그리기
  for (let i = 0; i < obstacles.length; i++) {  // 장애물 개수 만큼 각 장애물 업데이트 및 그리기
    obstacles[i].update(); // 장애물의 개수만큼 각 장애물의 위치, 회전, 방향 등을 업데이트합니다.
    obstacles[i].draw(); // 각 장애물을 화면에 그려줍니다
  }
  snake.eatFruit(fruit);  // 뱀이 과일을 먹었는지 확인
}
//마우스 이동 감지해서 발생하면 onMousemove 함수 호출
document.addEventListener('mousemove', onMousemove);

function onMousemove(event) { // 마우스 커서의 좌표를 캔버스 내부의 좌표로 변환합니다.
  mouseX = event.clientX - canvas.getBoundingClientRect().left;// 마우스의 X 좌표 계산
  mouseY = event.clientY - canvas.getBoundingClientRect().top;// 마우스 y 좌표 계산
}

function updateObstacleCount(score) { // 장애물 개수를 업데이트합니다. 5점마다 장애물 개수가 늘어나고 기존보다 3개를 더 추가합니다.
  const obstacleCount = Math.floor(score / 5) + 3; // 점수를 기반으로 장애물 개수를 결정합니다.
  const currentObstacleCount = obstacles.length; // 현재 장애물의 개수를 가져옵니다.
  if (obstacleCount > currentObstacleCount) { // 부족한 만큼 장애물을 배열에 추가합니다.
    const countToAdd = obstacleCount - currentObstacleCount;
    for (let i = 0; i < countToAdd; i++) { 
      obstacles.push(new Obstacle());
    }
  }
}

function updateTimeAndLength() {// 게임이 시작된 경우, 초당 시간과 뱀의 길이를 업데이트합니다.
  setInterval(function () {
    if (gameStarted) {
      seconds++;  //게임이 시작되면 초를 증가시킴
      document.getElementById('time').textContent = seconds; // 시간 업데이트
      document.getElementById('snakeLength').textContent = snake.initialTailSize; // 뱀의 길이 업데이트
    }
  }, 1000);
}

document.addEventListener('mousedown', onMouseDown); // 마우스 클릭 시(onMouseDown) 이벤트를 감지하여 실행

function onMouseDown(event) {
  if (event.button === 0) { // 마우스 왼쪽 버튼 클릭 확인
    if (!speedBoostActive) {
      const currentSpeed = snake.speed; // 현재 속도 기록
      snake.speed *= 2; // 뱀의 속도를 두 배로 증가
      speedBoostActive = true;  // 속도 증가 상태 활성화
      setTimeout(() => { 
      snake.speed = currentSpeed; // 이전 속도로 복원
      speedBoostActive = false; // 1초 뒤에 속도 증가 기능 종료
  }, 1000); // 1000 밀리초 = 1초
}
}
}

function gameOver() {
  alert('Game Over! Score: ' + document.getElementById('score').textContent);
  snake.tail = []; // 꼬리 배열 초기화
  document.getElementById('score').textContent = '0'; // 점수 초기화
  seconds = 0; // 시간 초기화
  snake.initialTailSize = 3; // 뱀의 초기 꼬리 크기 초기화
  document.getElementById('time').textContent = '0'; // 시간을 0으로 초기화
  document.getElementById('snakeLength').textContent = '3'; // 뱀의 길이를 0으로 초기화
  stopGame(); // 게임 정지
  }
// 'startBtn'과 'stopBtn' 버튼에 대한 클릭 이벤트 처리 함수 등록
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('stopBtn').addEventListener('click', stopGame);