// ---------- 초기 강좌 데이터 ----------
let courseData = JSON.parse(localStorage.getItem("courseData") || '[]');
if(courseData.length === 0){
    courseData = [
        {id:1, title:"음악 감상", desc:"다양한 음악 감상 활동", limit:5, grades:["1","2"], students:[], startTime:"2025-11-25 09:00", endTime:"2025-11-25 18:00"},
        {id:2, title:"과학 탐구", desc:"실험 중심의 과학 프로그램", limit:3, grades:["3","4"], students:[], startTime:"2025-11-20 09:00", endTime:"2025-11-20 18:00"}
    ];
    localStorage.setItem("courseData", JSON.stringify(courseData));
}

// ---------- 공용 저장 ----------
function saveCourses() {
    localStorage.setItem("courseData", JSON.stringify(courseData));
}

// ---------- 학생용 기능 ----------
function showCourses() {
    const grade = document.getElementById("studentGrade").value.trim();
    const cls = document.getElementById("studentClass").value.trim();
    const name = document.getElementById("studentName").value.trim();

    if(!grade || !cls || !name){
        alert("학년/반/학생명 입력 필요");
        return;
    }

    const container = document.getElementById("courseList");
    container.innerHTML = "";
    const now = new Date();

    courseData.forEach(course => {
        if(!course.grades.includes(grade)) return;

        const start = new Date(course.startTime);
        const end = new Date(course.endTime);
        let status = "";
        if(now < start) status = "신청 전";
        else if(now > end) status = "마감";
        else status = "신청 가능";

        const box = document.createElement("div");
        box.className = "course-box";
        box.innerHTML = `
            <h3>${course.title}</h3>
            <p>${course.desc}</p>
            <p>정원: ${course.limit}</p>
            <p>신청자: ${course.students.length}</p>
            <p>상태: ${status}</p>
            <button class="btn-blue" ${status!=="신청 가능"?"disabled":""} onclick="applyCourse(${course.id},'${grade}','${cls}','${name}')">수강신청</button>
        `;
        container.appendChild(box);
    });
}

function applyCourse(courseId, grade, cls, name) {
    const course = courseData.find(c => c.id === courseId);
    if(course.students.length >= course.limit) {
        alert("정원 마감");
        return;
    }
    if(course.students.some(s => s.grade===grade && s.className===cls && s.name===name)) {
        alert("이미 신청했습니다");
        return;
    }
    course.students.push({grade, className:cls, name, time:new Date().toLocaleString()});
    saveCourses();
    alert("신청 완료!");
    showCourses(); // 신청 후 목록 갱신
}

// ---------- 관리자 로그인 ----------
function adminLogin() {
    const pw = document.getElementById("adminPassword").value;
    const saved = localStorage.getItem("adminPw") || "1234";
    if(pw === saved) location.href = "admin.html";
    else alert("비밀번호 틀림");
}

// ---------- 관리자 페이지 ----------
let currentAdminCourse = null;

function renderAdminList() {
    const container = document.getElementById("adminCourseList");
    if(!container) return;
    container.innerHTML = "";
    courseData.forEach(course => {
        const box = document.createElement("div");
        box.className = "course-box";
        box.innerHTML = `
            <h3>${course.title}</h3>
            <p>정원: ${course.limit}</p>
            <p>신청자 수: ${course.students.length}</p>
            <button class="btn-blue" onclick="viewCourse(${course.id})">상세보기</button>
        `;
        container.appendChild(box);
    });
}

function viewCourse(id) {
    currentAdminCourse = courseData.find(c => c.id === id);
    document.getElementById("adminCourseDetails").style.display = "block";
    document.getElementById("adminCourseTitle").innerText = currentAdminCourse.title;
    document.getElementById("adminCourseDesc").innerText = currentAdminCourse.desc;
    document.getElementById("adminCourseLimit").innerText = currentAdminCourse.limit;
    document.getElementById("adminCourseCount").innerText = currentAdminCourse.students.length;
    renderStudentList();
    document.getElementById("startTime").value = currentAdminCourse.startTime.replace(" ","T");
    document.getElementById("endTime").value = currentAdminCourse.endTime.replace(" ","T");
}

function renderStudentList() {
    const list = document.getElementById("adminStudentList");
    if(!list) return;
    list.innerHTML = "";
    currentAdminCourse.students.forEach(s => {
        const li = document.createElement("li");
        li.innerText = `${s.grade}-${s.className} ${s.name} (${s.time})`;
        list.appendChild(li);
    });
}

function addCourse() {
    const title = document.getElementById("newCourseTitle").value.trim();
    const desc = document.getElementById("newCourseDesc").value.trim();
    const limit = parseInt(document.getElementById("newCourseLimit").value.trim());
    const grades = document.getElementById("newCourseGrades").value.trim().split(",").map(g=>g.trim());
    if(!title || !desc || !limit || grades.length===0){ alert("모든 필드 입력 필요"); return; }
    const newId = courseData.length ? Math.max(...courseData.map(c=>c.id)) + 1 : 1;
    courseData.push({id:newId, title, desc, limit, grades, students:[], startTime:"2025-01-01 09:00", endTime:"2025-12-31 18:00"});
    saveCourses();
    renderAdminList();
    alert("강좌 추가 완료!");
}

function deleteCourse() {
    if(!currentAdminCourse){ alert("삭제할 강좌 선택"); return; }
    if(confirm(`${currentAdminCourse.title} 삭제?`)){
        courseData = courseData.filter(c => c.id !== currentAdminCourse.id);
        saveCourses();
        document.getElementById("adminCourseDetails").style.display = "none";
        renderAdminList();
    }
}

function saveCourseTime() {
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;
    if(!start || !end){ alert("날짜/시간 입력 필요"); return; }
    currentAdminCourse.startTime = start.replace("T"," ");
    currentAdminCourse.endTime = end.replace("T"," ");
    saveCourses();
    alert("기간 저장 완료");
}

function addStudentManual() {
    const grade = document.getElementById("addGrade").value.trim();
    const cls = document.getElementById("addClass").value.trim();
    const name = document.getElementById("addName").value.trim();
    if(!grade || !cls || !name){ alert("학년/반/학생명 입력 필요"); return; }
    if(currentAdminCourse.students.some(s=>s.grade===grade && s.className===cls && s.name===name)){
        alert("이미 신청된 학생"); return;
    }
    currentAdminCourse.students.push({grade, className:cls, name, time:new Date().toLocaleString()});
    saveCourses();
    renderStudentList();
    alert("학생 추가 완료!");
}

// ---------- 관리자 공용 ----------
function logoutAdmin() { location.href = "admin-login.html"; }
function goStudentPage() { location.href = "index.html"; }

function changePw() {
    const oldPw = document.getElementById("oldPw").value;
    const newPw = document.getElementById("newPw").value;
    const saved = localStorage.getItem("adminPw") || "1234";
    if(oldPw !== saved){ alert("기존 비밀번호 틀림"); return; }
    localStorage.setItem("adminPw", newPw);
    alert("비밀번호 변경 완료!");
}

// ---------- 초기 실행 (학생용) ----------
function initCourseData() {
    if(!localStorage.getItem("courseData") || JSON.parse(localStorage.getItem("courseData")).length===0){
        localStorage.setItem("courseData", JSON.stringify(courseData));
    }
}
