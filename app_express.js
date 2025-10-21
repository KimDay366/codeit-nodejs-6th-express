import express from 'express';
import tasks from './seedData.js';

const PORT = 3000; //  express app을 열 때 사용하는 포트 번호, 서버 접속을 하는 게이트 웨이 같은 존재
const app = express(); //  express app을 만들 수 있게 됨

// get ( 패스 또는 루트 경로 , ()=>{ 콜백함수
// 실제 실행되는 내용 작성
// });
//
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// route handler 추가!
// GET : 데이터 받아오기
app.get('/tasks', (req, res) => {
  // 쿼리 파라미터
  //  - sort : "oldest"인 경우 오래된 태스크를 기준, 나머지 경우 새로운 태스크 기준
  //  - count : 태스크 갯수

  // 클라이언트가 쿼리 파라미터를 보내면, 자동으로 해당하는 쿼리 파라미터 안에 들어오게 됨 -> express에서 해줌
  const sort = req.query.sort;
  const count = Number(req.query.count);

  console.log(sort);
  // tasks.http 파일에서 send request 하면 sort에 걸려있던 "oldest" 값이 걸려서 출력 됨

  const compareFN =
    sort === 'oldest'
      ? (a, b) => a.createdAt - b.createdAt
      : (a, b) => b.createdAt - a.createdAt;

  let newTasks = tasks.sort(compareFN);

  if (count) {
    newTasks = newTasks.slice(0, count);
  }

  res.send(newTasks);
});

// GET : ID값으로 데이터 불러오기 = 상세 페이지 방식
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((task) => task.id === id);
  if (task) {
    res.send(task);
  } else {
    res.status(404).send({ message: 'Cannot find given id' });
  }
});

// POST : 데이터 등록하기
app.use(express.json()); // express가 json 데이터를 읽을 수 있도록

app.post('/tasks', (req, res) => {
  const data = req.body;
  // 새로운 리소스를 생성할때는 body를 통해서 json 구조로 전달

  const ids = tasks.map((task) => task.id); //[1,2,3,4,5] => 다음으로 사용 할 아이디를 알아낼 수 있음

  const nextId = Math.max(...ids) + 1; // id의 최댓값에 +1 함

  const now = new Date(); // 작성 시간 저장

  // POST 할 데이터 정리
  const newTask = {
    ...data,
    id: nextId,
    createdAt: now,
    updatedAt: now,
    isComplete: false,
  };

  // tasks = mock data에 신규 데이터 넣기
  tasks.push(newTask);

  res.status(201).send(newTask);
  // 새로운 데이터를 업로드 하면 응답코드를 201로 사용
});

// PATCH : 데이터 수정 해보기
app.patch('/tasks/:taskid', (req, res) => {
  const id = Number(req.params.taskid);
  const task = tasks.find((task) => task.id === id);
  if (task) {
    Object.keys(req.body).forEach((key) => {
      task[key] = req.body[key];
    });
    task.updatedAt = new Date();
    res.send(task);
  } else {
    res.status(404).send({ message: 'Cannot find given id' });
  }
});

// DELETE : 데이터 삭제하기
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const taskIdx = tasks.findIndex((task) => task.id === id);
  if (taskIdx !== -1) {
    const [deletedTask] = tasks.splice(taskIdx, 1);
    res.send(deletedTask);
  } else {
    res.status(404).send({ message: 'Cannot find given id' });
  }
});

app.listen(PORT, (err) => {
  console.log(`Example app listening on port ${PORT}`);
  // console.log(err);
});

// app.lister() : 특정 포트 기준으로 서버가 대기 상태(외부 요청을 받을 수 있는 상태)가 되고
//                준비 완료가 되면 "Server Started"가 실행됨
// 위에 작성한 포트 번호로 로컬 접속 하면 app.get()에 작성 한 내용이 실행 됨
