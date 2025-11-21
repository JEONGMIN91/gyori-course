// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

/* =====================
   학생용 기능
===================== */

// 학생 로그인 후 localStorage 저장
function studentLogin(grade, classNum, name){
    localStorage.setItem("studentInfo", JSON.stringify({grade, classNum, name}));
    window.location.href = "courses.html";
}

// 학생용: 해당 학년 과목 표시
function showCourses(){
    const studentInfo = JSON.parse(localStorage.getItem("studentInfo"));
    if(!studentInfo){ alert("로그인 정보 없음"); window.location.href="index.html"; return; }
    
    const listDiv = document.getElementById("courseList");
    listDiv.innerHTML = "";

    db.ref("courses").once("value").then(snapshot=>{
        const courses = snapshot.val();
        for(const courseId in courses){
            const course = courses[courseId];
            if(course.grade.includes(Number(studentInfo.grade))){
                const btn = document.createElement("button");
                btn.textContent = `${course.name} (${course.currentStudents}/${course.maxStudents})`;
                btn.onclick = () => applyCourse(courseId);
                listDiv.appendChild(btn);
                listDiv.appendChild(document.createElement("br"));
            }
        }
    });
}

// 학생용: 수강신청
function applyCourse(courseId){
    const studentInfo = JSON.parse(localStorage.getItem("studentInfo"));
    const courseRef = db.ref("courses/" + courseId);
    courseRef.once("value").then(snap=>{
        const course = snap.val();
        if(course.currentStudents >= course.maxStudents){
            alert("정원 초과. 대기자로 등록됩니다.");
        }
        const newAppRef = db.ref("applications").push();
        newAppRef.set({
            grade: studentInfo.grade,
            class: studentInfo.classNum,
            name: studentInfo.name,
            courseId: courseId,
            timestamp: Date.now()
        });
        courseRef.update({currentStudents: course.currentStudents + 1});
        alert("수강신청 완료!");
    });
}

/* =====================
   관리자 로그인
===================== */
function adminLogin(email, pw){
    auth.signInWithEmailAndPassword(email, pw)
        .then(()=>window.location.href="admin.html")
        .catch(err=>alert(err.message));
}

function logout(){
    auth.signOut().then(()=>window.location.href='admin-login.html');
}

/* =====================
   관리자 기능
===================== */
function addCourse(name, max, gradeArr){
    if(!name || !max || gradeArr.length==0){ alert("모두 입력해주세요"); return; }
    db.ref("courses").push({
        name,
        maxStudents: max,
        grade: gradeArr.map(Number),
        currentStudents:0
    });
    alert("과목 추가 완료");
}

// 월별 출석부 생성
function generateMonthlyReport(month){
    db.ref("applications").once("value").then(snap=>{
        const apps = snap.val();
        const reportDiv = document.getElementById("report");
        reportDiv.innerHTML = "<table border='1'><tr><th>학년</th><th>반</th><th>이름</th><th>과목</th><th>비고</th></tr>";
        for(const appId in apps){
            const app = apps[appId];
            const date = new Date(app.timestamp);
            if(date.getMonth()+1 == month){
                db.ref("courses/"+app.courseId).once("value").then(csnap=>{
                    const course = csnap.val();
                    reportDiv.innerHTML += `<tr>
                        <td>${app.grade}</td>
                        <td>${app.class}</td>
                        <td>${app.name}</td>
                        <td>${course.name}</td>
                        <td contenteditable="true"></td>
                    </tr>`;
                });
            }
        }
        reportDiv.innerHTML += "</table>";
    });
}

// 관리자 비밀번호 변경
function changeAdminPw(newPw){
    const user = auth.currentUser;
    if(user){
        user.updatePassword(newPw).then(()=>alert("비밀번호 변경 완료")).catch(err=>alert(err.message));
    } else alert("로그인 후 이용해주세요.");
}
