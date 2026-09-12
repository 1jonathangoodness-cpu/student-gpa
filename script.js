"use strict";

/* ================================
   STUDENT GPA APP
   DARK MODE ONLY
================================ */

const FREE_COURSE_LIMIT = 5;
const FREE_SEMESTER_LIMIT = 2;

const STORAGE_KEYS = {
  results: "studentGpaResults",
  premium: "studentGpaPremium"
};

let courses = [];
let currentGPA = 0;
let isPremium = false;

/* ================================
   SAFE ELEMENT HELPERS
================================ */

function getElement(id) {
  return document.getElementById(id);
}

function showMessage(id, message, color) {
  const element = getElement(id);

  if (!element) {
    return;
  }

  element.textContent = message;

  if (color) {
    element.style.color = color;
  }
}

/* ================================
   STORAGE
================================ */

function getSavedResults() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.results);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read saved results:", error);
    return [];
  }
}

function saveResultsToStorage(results) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.results,
      JSON.stringify(results)
    );
  } catch (error) {
    console.error("Could not save results:", error);
  }
}

function loadPremiumStatus() {
  try {
    isPremium = localStorage.getItem(STORAGE_KEYS.premium) === "true";
  } catch (error) {
    isPremium = false;
  }

  updatePlanDisplay();
}

function updatePlanDisplay() {
  const planName = getElement("planName");
  const planDescription = getElement("planDescription");

  if (planName) {
    planName.textContent = isPremium ? "PREMIUM" : "FREE";
  }

  if (planDescription) {
    planDescription.textContent = isPremium
      ? "All features unlocked"
      : "Limited features";
  }
}

/* ================================
   NAVIGATION
================================ */

function showSection(sectionId) {
  const sections = document.querySelectorAll(".page-section");
  const navButtons = document.querySelectorAll(".nav-button");

  sections.forEach(function (section) {
    section.classList.remove("active");
  });

  navButtons.forEach(function (button) {
    button.classList.remove("active");
  });

  const selectedSection = getElement(sectionId);

  if (selectedSection) {
    selectedSection.classList.add("active");
  }

  navButtons.forEach(function (button) {
    if (button.dataset.section === sectionId) {
      button.classList.add("active");
    }
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* ================================
   COURSE MANAGEMENT
================================ */

function addCourse() {
  if (!isPremium && courses.length >= FREE_COURSE_LIMIT) {
    showMessage(
      "gpaMessage",
      "Free users can add up to 5 courses. Upgrade for unlimited courses.",
      "#fca5a5"
    );

    return;
  }

  const newCourse = {
    id: Date.now() + Math.random(),
    name: "",
    unit: 1,
    grade: ""
  };

  courses.push(newCourse);

  renderCourses();

  showMessage("gpaMessage", "");
}

function removeCourse(courseId) {
  courses = courses.filter(function (course) {
    return String(course.id) !== String(courseId);
  });

  renderCourses();
}

function updateCourse(courseId, field, value) {
  courses.forEach(function (course) {
    if (String(course.id) === String(courseId)) {
      if (field === "unit") {
        const numberValue = Number(value);

        course.unit = numberValue > 0 ? numberValue : 1;
      } else {
        course[field] = value;
      }
    }
  });
}

function renderCourses() {
  const container = getElement("coursesContainer");
  const courseCount = getElement("courseCount");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (courseCount) {
    courseCount.textContent =
      courses.length + (courses.length === 1 ? " course" : " courses");
  }

  if (courses.length === 0) {
    const empty = document.createElement("p");

    empty.className = "empty-message";
    empty.textContent = "No courses added. Tap Add Course to begin.";

    container.appendChild(empty);

    return;
  }

  courses.forEach(function (course, index) {
    const card = document.createElement("div");

    card.className = "course-card";

    const header = document.createElement("div");
    header.className = "course-header";

    const title = document.createElement("strong");
    title.textContent = "Course " + (index + 1);

    const removeButton = document.createElement("button");

    removeButton.type = "button";
    removeButton.className = "remove-course";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", "Remove course");

    removeButton.addEventListener("click", function () {
      removeCourse(course.id);
    });

    header.appendChild(title);
    header.appendChild(removeButton);

    const fields = document.createElement("div");
    fields.className = "course-fields";

    const nameGroup = document.createElement("div");
    nameGroup.className = "field-group";

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Course Name";

    const nameInput = document.createElement("input");

    nameInput.type = "text";
    nameInput.placeholder = "e.g. CSC 101";
    nameInput.value = course.name;

    nameInput.addEventListener("input", function () {
      updateCourse(course.id, "name", nameInput.value);
    });

    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);

    const unitGroup = document.createElement("div");
    unitGroup.className = "field-group";

    const unitLabel = document.createElement("label");
    unitLabel.textContent = "Units";

    const unitInput = document.createElement("input");

    unitInput.type = "number";
    unitInput.min = "1";
    unitInput.max = "10";
    unitInput.value = course.unit;

    unitInput.addEventListener("input", function () {
      updateCourse(course.id, "unit", unitInput.value);
    });

    unitGroup.appendChild(unitLabel);
    unitGroup.appendChild(unitInput);

    fields.appendChild(nameGroup);
    fields.appendChild(unitGroup);

    const gradeGroup = document.createElement("div");
    gradeGroup.className = "field-group";
    gradeGroup.style.marginTop = "12px";

    const gradeLabel = document.createElement("label");
    gradeLabel.textContent = "Grade";

    const gradeSelect = document.createElement("select");

    const gradeOptions = [
      { value: "", text: "Select grade" },
      { value: "A", text: "A - 5 points" },
      { value: "B", text: "B - 4 points" },
      { value: "C", text: "C - 3 points" },
      { value: "D", text: "D - 2 points" },
      { value: "E", text: "E - 1 point" },
      { value: "F", text: "F - 0 points" }
    ];

    gradeOptions.forEach(function (optionData) {
      const option = document.createElement("option");

      option.value = optionData.value;
      option.textContent = optionData.text;

      if (course.grade === optionData.value) {
        option.selected = true;
      }

      gradeSelect.appendChild(option);
    });

    gradeSelect.addEventListener("change", function () {
      updateCourse(course.id, "grade", gradeSelect.value);
    });

    gradeGroup.appendChild(gradeLabel);
    gradeGroup.appendChild(gradeSelect);

    card.appendChild(header);
    card.appendChild(fields);
    card.appendChild(gradeGroup);

    container.appendChild(card);
  });
}

/* ================================
   GPA CALCULATION
================================ */

function getGradePoint(grade) {
  const gradePoints = {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
    F: 0
  };

  return gradePoints[grade];
}

function calculateGPA() {
  if (courses.length === 0) {
    showMessage(
      "gpaMessage",
      "Please add at least one course.",
      "#fca5a5"
    );

    return;
  }

  let totalQualityPoints = 0;
  let totalUnits = 0;

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];

    if (!course.grade) {
      showMessage(
        "gpaMessage",
        "Please select a grade for every course.",
        "#fca5a5"
      );

      return;
    }

    const units = Number(course.unit);
    const gradePoint = getGradePoint(course.grade);

    if (!units || units < 1 || gradePoint === undefined) {
      showMessage(
        "gpaMessage",
        "Please enter valid course units and grades.",
        "#fca5a5"
      );

      return;
    }

    totalUnits += units;
    totalQualityPoints += units * gradePoint;
  }

  if (totalUnits === 0) {
    showMessage(
      "gpaMessage",
      "Total course units cannot be zero.",
      "#fca5a5"
    );

    return;
  }

  currentGPA = totalQualityPoints / totalUnits;

  const formattedGPA = currentGPA.toFixed(2);

  const gpaResult = getElement("gpaResult");
  const currentGPAElement = getElement("currentGPA");

  if (gpaResult) {
    gpaResult.textContent = formattedGPA;
  }

  if (currentGPAElement) {
    currentGPAElement.textContent = formattedGPA;
  }

  showMessage(
    "gpaMessage",
    "GPA calculated successfully.",
    "#86efac"
  );
}

/* ================================
   SAVE SEMESTER
================================ */

function saveSemester() {
  if (courses.length === 0) {
    showMessage(
      "saveMessage",
      "Please add courses before saving.",
      "#fca5a5"
    );

    return;
  }

  if (currentGPA === 0) {
    calculateGPA();

    if (currentGPA === 0) {
      return;
    }
  }

  const semesterInput = getElement("semesterName");

  if (!semesterInput) {
    return;
  }

  const semesterName = semesterInput.value.trim();

  if (!semesterName) {
    showMessage(
      "saveMessage",
      "Please enter a semester or session name.",
      "#fca5a5"
    );

    return;
  }

  const savedResults = getSavedResults();

  if (!isPremium && savedResults.length >= FREE_SEMESTER_LIMIT) {
    showMessage(
      "saveMessage",
      "Free users can save 2 semesters. Upgrade for unlimited semesters.",
      "#fca5a5"
    );

    return;
  }

  const result = {
    id: Date.now(),
    semester: semesterName,
    gpa: Number(currentGPA.toFixed(2)),
    courses: courses.length,
    date: new Date().toLocaleDateString()
  };

  savedResults.push(result);

  saveResultsToStorage(savedResults);

  semesterInput.value = "";

  renderResults();
  updateDashboard();

  showMessage(
    "saveMessage",
    "Semester result saved successfully.",
    "#86efac"
  );
}

/* ================================
   HISTORY
================================ */

function renderResults() {
  const resultsList = getElement("resultsList");

  if (!resultsList) {
    return;
  }

  const results = getSavedResults();

  resultsList.innerHTML = "";

  if (results.length === 0) {
    const empty = document.createElement("p");

    empty.className = "empty-message";
    empty.textContent = "No saved results yet.";

    resultsList.appendChild(empty);

    return;
  }

  results.forEach(function (result) {
    const card = document.createElement("div");

    card.className = "result-card";

    const top = document.createElement("div");
    top.className = "result-card-top";

    const information = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = result.semester;

    const date = document.createElement("p");
    date.textContent = "Saved: " + result.date;

    const coursesText = document.createElement("p");
    coursesText.textContent = "Courses: " + result.courses;

    information.appendChild(title);
    information.appendChild(date);
    information.appendChild(coursesText);

    const gpa = document.createElement("strong");

    gpa.className = "result-gpa";
    gpa.textContent = Number(result.gpa).toFixed(2);

    top.appendChild(information);
    top.appendChild(gpa);

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete-result";
    deleteButton.textContent = "Delete Result";

    deleteButton.addEventListener("click", function () {
      deleteResult(result.id);
    });

    card.appendChild(top);
    card.appendChild(deleteButton);

    resultsList.appendChild(card);
  });
}

function deleteResult(resultId) {
  const results = getSavedResults();

  const filteredResults = results.filter(function (result) {
    return String(result.id) !== String(resultId);
  });

  saveResultsToStorage(filteredResults);

  renderResults();
  updateDashboard();
}

function clearAllResults() {
  const results = getSavedResults();

  if (results.length === 0) {
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete all saved results?"
  );

  if (!confirmed) {
    return;
  }

  saveResultsToStorage([]);

  renderResults();
  updateDashboard();
}

/* ================================
   DASHBOARD
================================ */

function calculateCGPA() {
  const results = getSavedResults();

  if (results.length === 0) {
    return "0.00";
  }

  let total = 0;

  results.forEach(function (result) {
    total += Number(result.gpa);
  });

  return (total / results.length).toFixed(2);
}

function updateDashboard() {
  const results = getSavedResults();

  const cgpaValue = getElement("cgpaValue");
  const semesterCount = getElement("semesterCount");

  if (cgpaValue) {
    cgpaValue.textContent = calculateCGPA();
  }

  if (semesterCount) {
    semesterCount.textContent = results.length;
  }
}

/* ================================
   PREMIUM MODAL
================================ */

function openPremiumModal() {
  const modal = getElement("premiumModal");

  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closePremiumModal() {
  const modal = getElement("premiumModal");

  if (modal) {
    modal.classList.add("hidden");
  }
}

function startPayment() {
  const paymentMessage = getElement("paymentMessage");

  if (paymentMessage) {
    paymentMessage.textContent =
      "Flutterwave payment will be connected here next.";
    paymentMessage.style.color = "#fcd34d";
  }
}

/* ================================
   EVENT LISTENERS
================================ */

function setupEventListeners() {
  document.querySelectorAll(".nav-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const sectionId = button.dataset.section;

      if (sectionId) {
        showSection(sectionId);
      }
    });
  });

  const homeCalculateButton = getElement("homeCalculateButton");

  if (homeCalculateButton) {
    homeCalculateButton.addEventListener("click", function () {
      showSection("gpaSection");

      if (courses.length === 0) {
        addCourse();
      }
    });
  }

  const addCourseButton = getElement("addCourseButton");

  if (addCourseButton) {
    addCourseButton.addEventListener("click", addCourse);
  }

  const calculateButton = getElement("calculateButton");

  if (calculateButton) {
    calculateButton.addEventListener("click", calculateGPA);
  }

  const saveButton = getElement("saveButton");

  if (saveButton) {
    saveButton.addEventListener("click", saveSemester);
  }

  const clearResultsButton = getElement("clearResultsButton");

  if (clearResultsButton) {
    clearResultsButton.addEventListener("click", clearAllResults);
  }

  const upgradeButton = getElement("upgradeButton");

  if (upgradeButton) {
    upgradeButton.addEventListener("click", openPremiumModal);
  }

  const premiumButton = getElement("premiumButton");

  if (premiumButton) {
    premiumButton.addEventListener("click", openPremiumModal);
  }

  const closePremiumButton = getElement("closePremiumButton");

  if (closePremiumButton) {
    closePremiumButton.addEventListener("click", closePremiumModal);
  }

  const paymentButton = getElement("paymentButton");

  if (paymentButton) {
    paymentButton.addEventListener("click", startPayment);
  }

  const modal = getElement("premiumModal");

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closePremiumModal();
      }
    });
  }
}

/* ================================
   START APP
================================ */

function initializeApp() {
  loadPremiumStatus();
  renderCourses();
  renderResults();
  updateDashboard();
  setupEventListeners();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}