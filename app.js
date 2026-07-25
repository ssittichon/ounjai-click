const screens = [...document.querySelectorAll(".screen")];
const state = {
  current: "welcome",
  previous: "welcome",
  activity: null,
  question: 0,
  hints: 0,
  completed: 0,
  stopped: false,
  startedAt: null,
  support: "ผู้ดูแลอยู่ใกล้",
  tried: new Set(),
  totalHints: 0,
  lastStatus: "ยังไม่มีข้อมูล",
  history: [],
  currentObservation: ["ดูสบายใจ"]
};

const activities = {
  memory: {
    title: "จำภาพใกล้ตัว",
    icon: "🧺",
    instruction: "ดูภาพ แล้วเลือกภาพที่เคยเห็นเมื่อสักครู่",
    practice: () => `
      <div class="prompt">
        <p class="lead">ลองจำภาพนี้ไว้</p>
        <div class="big-object">🍌</div>
        <p>จากนั้นกด “เริ่มกิจกรรมจริง”</p>
      </div>`,
    questions: [
      {show:"☂️", ask:"ภาพไหนที่เห็นเมื่อสักครู่", options:["👟","☂️","🥄"], answer:"☂️"},
      {show:"🌷", ask:"ภาพไหนที่เห็นเมื่อสักครู่", options:["🌷","🍌","🧢"], answer:"🌷"},
      {show:"🥄", ask:"ภาพไหนที่เห็นเมื่อสักครู่", options:["☕","🥄","🧦"], answer:"🥄"}
    ]
  },
  language: {
    title: "ภาพนี้คืออะไร",
    icon: "🍌",
    instruction: "ดูภาพ แล้วเลือกคำที่ตรงกับภาพ",
    practice: () => `
      <div class="prompt">
        <p class="lead">ภาพนี้ตรงกับคำใด</p>
        <div class="big-object">🍌</div>
        <div class="options"><button class="option">กล้วย</button><button class="option">ช้อน</button></div>
      </div>`,
    questions: [
      {show:"☂️", ask:"ภาพนี้ตรงกับคำใด", options:["ร่ม","รองเท้า","ถ้วย"], answer:"ร่ม"},
      {show:"🥄", ask:"ภาพนี้ตรงกับคำใด", options:["ดอกไม้","ช้อน","หมวก"], answer:"ช้อน"},
      {show:"🌷", ask:"ภาพนี้ตรงกับคำใด", options:["ดอกไม้","กล้วย","แก้วน้ำ"], answer:"ดอกไม้"}
    ]
  },
  sequence: {
    title: "แตะตามลำดับ",
    icon: "1️⃣",
    instruction: "แตะตัวเลขจาก 1 ไป 3 ตามลำดับ",
    practice: () => `
      <div class="prompt">
        <p class="lead">ลองแตะเลข 1 ก่อน</p>
        <div class="options"><button class="option">2</button><button class="option">1</button></div>
      </div>`,
    questions: [
      {positions:[[12,18],[65,14],[38,64]]},
      {positions:[[68,60],[12,56],[40,12]]},
      {positions:[[16,12],[62,54],[18,64]]}
    ]
  },
  matching: {
    title: "จับคู่สิ่งของ",
    icon: "🧩",
    instruction: "เลือกสิ่งของที่มักใช้คู่กันในชีวิตประจำวัน",
    practice: () => `
      <div class="prompt">
        <p class="lead">สิ่งใดใช้คู่กับถ้วย</p>
        <div class="big-object">☕</div>
        <div class="options"><button class="option emoji">🥄</button><button class="option emoji">👟</button></div>
      </div>`,
    questions: [
      {show:"☕", ask:"สิ่งใดมักใช้คู่กับถ้วย", options:["🥄","👟","🌂"], answer:"🥄"},
      {show:"👟", ask:"สิ่งใดมักใช้คู่กับรองเท้า", options:["🧦","🍌","☕"], answer:"🧦"},
      {show:"🪥", ask:"สิ่งใดมักใช้คู่กับแปรงสีฟัน", options:["🧴","🧻","🧼"], answer:"🧴"}
    ]
  },
  category: {
    title: "จัดหมวดหมู่ภาพ",
    icon: "🗂️",
    instruction: "ดูภาพ แล้วเลือกหมวดที่เหมาะสม",
    practice: () => `
      <div class="prompt">
        <p class="lead">กล้วยอยู่ในหมวดใด</p>
        <div class="big-object">🍌</div>
        <div class="options"><button class="option">อาหาร</button><button class="option">เสื้อผ้า</button></div>
      </div>`,
    questions: [
      {show:"🍌", ask:"ภาพนี้อยู่ในหมวดใด", options:["อาหาร","เสื้อผ้า","ของใช้"], answer:"อาหาร"},
      {show:"👟", ask:"ภาพนี้อยู่ในหมวดใด", options:["ดอกไม้","เสื้อผ้า","อาหาร"], answer:"เสื้อผ้า"},
      {show:"🥄", ask:"ภาพนี้อยู่ในหมวดใด", options:["ของใช้","ผลไม้","ต้นไม้"], answer:"ของใช้"}
    ]
  }
};


const hintSequences = {
  memory: [
    "ลองนึกถึงภาพที่เห็นเมื่อสักครู่",
    "ลดตัวเลือกให้เหลือ 2 ตัวเลือก",
    "ผู้ดูแลอ่านคำสั่งซ้ำ",
    "ผู้ดูแลชี้บริเวณตัวเลือกโดยไม่บอกคำตอบ"
  ],
  language: [
    "อ่านคำถามซ้ำด้วยเสียงช้า",
    "อ่านตัวเลือกทีละคำ",
    "ลดตัวเลือกให้เหลือ 2 คำ",
    "ผู้ดูแลอธิบายว่าให้เลือกคำที่เป็นชื่อของภาพ"
  ],
  sequence: [
    "บอกให้เริ่มจากเลข 1",
    "เน้นกรอบของหมายเลขถัดไป",
    "ผู้ดูแลชี้ตำแหน่งโดยไม่แตะแทน",
    "ผู้ดูแลช่วยแตะบางส่วนหากจำเป็น"
  ],
  matching: [
    "อธิบายว่าให้เลือกสิ่งของที่มักใช้ร่วมกัน",
    "ยกตัวอย่างสิ่งของ 1 คู่",
    "ลดตัวเลือกให้เหลือ 2 ภาพ",
    "ผู้ดูแลชี้บริเวณตัวเลือก"
  ],
  category: [
    "อ่านชื่อภาพและชื่อหมวดซ้ำ",
    "ยกตัวอย่างสิ่งของในแต่ละหมวด",
    "ลดตัวเลือกให้เหลือ 2 หมวด",
    "ผู้ดูแลอธิบายความหมายของหมวด"
  ]
};

function go(name){
  state.previous = state.current;
  state.current = name;
  screens.forEach(s => s.classList.toggle("active", s.id === `screen-${name}`));
  window.scrollTo({top:0,behavior:"smooth"});
  if(name === "summary") updateSummary();
  if(name === "report") updateReport();
}
document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
document.getElementById("homeBtn").addEventListener("click", () => go("welcome"));

document.getElementById("saveSettings").addEventListener("click", () => {
  const font = document.getElementById("fontSize").value;
  document.body.classList.remove("font-large","font-xlarge");
  if(font === "large") document.body.classList.add("font-large");
  if(font === "xlarge") document.body.classList.add("font-xlarge");
  document.body.classList.toggle("high-contrast", document.getElementById("contrast").value === "สูง");
  state.support = document.getElementById("support").value;
  toast("บันทึกการตั้งค่าแล้ว");
  go("activities");
});

document.querySelectorAll(".activity-start").forEach(btn => {
  btn.addEventListener("click", () => {
    state.activity = btn.dataset.activity;
    state.question = 0;
    state.hints = 0;
    state.hintIndex = 0;
    state.completed = 0;
    state.stopped = false;
    state.startedAt = null;
    state.tried.add(state.activity);
    const a = activities[state.activity];
    document.getElementById("instructionIcon").textContent = a.icon;
    document.getElementById("instructionTitle").textContent = a.title;
    document.getElementById("instructionText").textContent = a.instruction;
    go("instruction");
  });
});

document.getElementById("practiceBtn").addEventListener("click", () => {
  document.getElementById("practiceArea").innerHTML = activities[state.activity].practice();
  go("practice");
});
document.getElementById("practiceHint").addEventListener("click", () => toast("ลองดูภาพหรือคำสั่งอีกครั้ง ผู้ดูแลช่วยอ่านได้ค่ะ"));
document.getElementById("beginMain").addEventListener("click", () => {
  state.startedAt = Date.now();
  go("activity");
  renderQuestion();
});

function renderQuestion(){
  const a = activities[state.activity];
  document.getElementById("activityTitle").textContent = a.title;
  document.getElementById("activityLabel").textContent = "Mockup Activity";
  document.getElementById("progressText").textContent = `ข้อ ${state.question+1} จาก 3`;
  const area = document.getElementById("activityArea");
  const q = a.questions[state.question];

  if(state.activity === "memory"){
    area.innerHTML = `
      <div class="prompt" id="memoryReveal">
        <p class="lead">จำภาพนี้ไว้</p><div class="big-object">${q.show}</div>
        <button class="primary" id="memoryContinue">พร้อมแล้ว</button>
      </div>`;
    document.getElementById("memoryContinue").onclick = () => {
      area.innerHTML = `
        <div class="prompt" style="width:100%">
          <p class="lead">${q.ask}</p>
          <div class="options">${q.options.map(x=>`<button class="option emoji" data-answer="${x}">${x}</button>`).join("")}</div>
        </div>`;
      bindAnswers(q.answer);
    };
  } else if(state.activity === "language" || state.activity === "matching" || state.activity === "category"){
    area.innerHTML = `
      <div class="prompt" style="width:100%">
        <p class="lead">${q.ask}</p><div class="big-object">${q.show}</div>
        <div class="options">${q.options.map(x=>`<button class="option" data-answer="${x}">${x}</button>`).join("")}</div>
      </div>`;
    bindAnswers(q.answer);
  } else {
    area.innerHTML = `
      <div class="prompt" style="width:100%">
        <p class="lead">แตะเลข 1 แล้วแตะเลข 2 และเลข 3</p>
        <div class="sequence-board">${q.positions.map((p,i)=>`<button class="number-dot" data-n="${i+1}" style="left:${p[0]}%;top:${p[1]}%">${i+1}</button>`).join("")}</div>
      </div>`;
    let next = 1;
    const dots = [...area.querySelectorAll(".number-dot")];
    dots.forEach(dot => dot.onclick = () => {
      if(+dot.dataset.n === next){
        dot.disabled = true;
        dot.textContent = "✓";
        next++;
        if(next === 4) nextQuestion();
      }else{
        toast("ค่อย ๆ เริ่มจากเลขที่น้อยกว่านะ");
      }
    });
  }
}

function bindAnswers(answer){
  document.querySelectorAll("[data-answer]").forEach(btn => {
    btn.onclick = () => {
      if(btn.dataset.answer === answer){
        toast("ขอบคุณค่ะ ไปข้อต่อไปกันนะ");
        nextQuestion();
      }else{
        toast("ลองดูอีกครั้ง หรือขอคำใบ้ได้ค่ะ");
      }
    };
  });
}

function nextQuestion(){
  state.completed++;
  if(state.question >= 2){
    go("complete");
  }else{
    state.question++;
    setTimeout(renderQuestion, 350);
  }
}

document.getElementById("hintBtn").addEventListener("click", () => {
  state.hints++;
  state.totalHints++;
  const hints = hintSequences[state.activity] || ["ผู้ดูแลอ่านคำสั่งซ้ำ"];
  const index = Math.min(state.hintIndex || 0, hints.length - 1);
  const message = hints[index];
  state.hintIndex = index + 1;

  if(state.activity === "sequence" && index >= 1){
    const targets = [...document.querySelectorAll(".number-dot:not(:disabled)")];
    if(targets.length) targets[0].classList.add("next");
  }
  toast(`คำใบ้ ${index + 1}: ${message}`);
});

document.getElementById("resumeBtn").addEventListener("click", () => {
  if(state.activity && state.startedAt) go("activity");
  else go("readiness");
});
document.getElementById("stopConfirm").addEventListener("click", () => {
  state.stopped = true;
  go("summary");
});

function updateSummary(){
  const elapsed = state.startedAt ? Math.max(1, Math.round((Date.now()-state.startedAt)/60000)) : 0;
  const activity = state.activity ? activities[state.activity] : null;
  const status = state.stopped ? "หยุดก่อนจบ" : "ทำจบ";
  const percent = Math.min(100, Math.round((state.completed/3)*100));
  state.lastStatus = status;

  document.getElementById("summaryActivity").textContent = activity ? activity.title : "ยังไม่ได้เริ่มกิจกรรม";
  document.getElementById("summaryIcon").textContent = activity ? activity.icon : "🌼";
  document.getElementById("summaryTime").textContent = `${elapsed || 1} นาที`;
  document.getElementById("summaryHints").textContent = state.hints;
  document.getElementById("summarySupport").textContent = state.support;
  document.getElementById("summaryCompleted").textContent = `${state.completed} จาก 3`;
  document.getElementById("summaryPercent").textContent = `${percent}%`;
  document.getElementById("summaryProgressBar").style.width = `${percent}%`;

  const pill = document.getElementById("summaryStatusPill");
  pill.textContent = status;
  pill.classList.toggle("stopped", state.stopped);
}



document.getElementById("saveCaregiverNote").addEventListener("click", () => {
  if(!state.activity){
    toast("ยังไม่มีกิจกรรมให้บันทึก");
    return;
  }
  const activity = activities[state.activity];
  const elapsed = state.startedAt ? Math.max(1, Math.round((Date.now()-state.startedAt)/60000)) : 1;
  const note = document.getElementById("caregiverNote").value.trim();
  const record = {
    activity: activity.title,
    icon: activity.icon,
    status: state.stopped ? "หยุดก่อนจบ" : "ทำจบ",
    minutes: elapsed,
    hints: state.hints,
    support: state.support,
    completed: `${state.completed} จาก 3`,
    observations: state.currentObservation.length ? [...state.currentObservation] : [],
    note: note || "ไม่มีบันทึกเพิ่มเติม"
  };
  state.history.unshift(record);
  document.getElementById("caregiverNote").value = "";
  toast("บันทึกกิจกรรมนี้ใน Caregiver Report แล้ว");
});

function updateReport(){
  document.getElementById("reportTried").textContent = state.tried.size;
  document.getElementById("reportHints").textContent = state.totalHints;
  document.getElementById("reportLastStatus").textContent = state.lastStatus;

  const container = document.getElementById("activityHistory");
  if(!state.history.length){
    container.innerHTML = '<div class="empty-state">ยังไม่มีบันทึกกิจกรรม</div>';
    return;
  }

  container.innerHTML = state.history.map(item => `
    <article class="history-card">
      <div class="history-head">
        <div class="history-title">
          <div class="history-icon">${item.icon}</div>
          <div>
            <strong>${item.activity}</strong>
            <div class="support-text">${item.status}</div>
          </div>
        </div>
        <div class="status-pill ${item.status === "หยุดก่อนจบ" ? "stopped" : ""}">${item.status}</div>
      </div>
      <div class="history-meta">
        <div><small>เวลา</small><strong>${item.minutes} นาที</strong></div>
        <div><small>คำใบ้</small><strong>${item.hints} ครั้ง</strong></div>
        <div><small>ทำจบ</small><strong>${item.completed}</strong></div>
        <div><small>การช่วยเหลือ</small><strong>${item.support}</strong></div>
      </div>
      <div class="history-note">
        <strong>ข้อสังเกต:</strong> ${item.observations.join(", ") || "ไม่มี"}<br>
        <strong>บันทึก:</strong> ${item.note}
      </div>
    </article>
  `).join("");
}

document.querySelectorAll(".observation-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    state.currentObservation = [...document.querySelectorAll(".observation-chip.active")].map(x => x.textContent.trim());
  });
});

function toast(message){
  const t = document.getElementById("toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(()=>t.classList.remove("show"),2200);
}
