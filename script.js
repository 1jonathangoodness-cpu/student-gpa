/* =========================================================
   STUDENT GPA — SCRIPT
   ========================================================= */

"use strict";

/* =========================
   SETTINGS
========================= */

const FREE_COURSE_LIMIT = 5;
const FREE_SEMESTER_LIMIT = 2;

const STORAGE_KEYS = {
    semesters: "studentGpaSemesters",
    premium: "studentGpaPremium",
    trial: "studentGpaTrial"
};


/* =========================
   APP STATE
========================= */

let courses = [];
let currentGPA = 0;
let currentTotalUnits = 0;
let currentTotalPoints = 0;

let savedSemesters = loadSemesters();

let isPremium =
    localStorage.getItem(STORAGE_KEYS.premium) === "true";


/* =========================
   START APP
========================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeApp();

});


function initializeApp() {

    updatePlanDisplay();

    renderCourses();

    renderHistory();

    updateDashboard();

    /*
     * Start with one course so the calculator
     * is immediately usable.
     */
    if (courses.length === 0) {
        addCourse(true);
    }

}


/* =========================
   STORAGE
========================= */

function loadSemesters() {

    try {

        const data =
            localStorage.getItem(STORAGE_KEYS.semesters);

        if (!data) {
            return [];
        }

        const parsed = JSON.parse(data);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {

        console.error(
            "Unable to load saved semesters:",
            error
        );

        return [];

    }

}


function saveSemestersToStorage() {

    localStorage.setItem(
        STORAGE_KEYS.semesters,
        JSON.stringify(savedSemesters)
    );

}


/* =========================
   NAVIGATION
========================= */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(function (page) {

        page.classList.remove("active");

    });


    const selectedPage =
        document.getElementById(pageId);

    if (!selectedPage) {

        console.error(
            "Page not found:",
            pageId
        );

        return;

    }


    selectedPage.classList.add("active");


    /*
     * Update bottom navigation.
     */

    const navButtons =
        document.querySelectorAll(".bottom-nav button");

    navButtons.forEach(function (button) {

        button.classList.remove("nav-active");

    });


    const navButton =
        document.getElementById("nav-" + pageId);

    if (navButton) {

        navButton.classList.add("nav-active");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    updateDashboard();

}


/* =========================
   PLAN DISPLAY
========================= */

function updatePlanDisplay() {

    const plan =
        document.getElementById("dashboardPlan");

    const planText =
        document.getElementById("dashboardPlanText");


    if (!plan || !planText) {
        return;
    }


    if (isPremium) {

        plan.textContent = "PREMIUM ⭐";

        planText.textContent =
            "Full access to all features.";

    } else {

        plan.textContent = "FREE";

        planText.textContent =
            "Limited features.";

    }

}


/* =========================
   ADD COURSE
========================= */

function addCourse(skipLimitCheck = false) {

    if (
        !isPremium &&
        !skipLimitCheck &&
        courses.length >= FREE_COURSE_LIMIT
    ) {

        alert(
            "Free Mode allows a maximum of 5 courses per semester.\n\nUpgrade to Premium for unlimited courses."
        );

        showPremium();

        return;

    }


    courses.push({

        id:
            Date.now() +
            Math.floor(Math.random() * 100000),

        name: "",

        unit: 3,

        grade: ""

    });


    renderCourses();

}


/* =========================
   REMOVE COURSE
========================= */

function removeCourse(id) {

    if (courses.length <= 1) {

        alert(
            "You need at least one course."
        );

        return;

    }


    courses =
        courses.filter(function (course) {

            return course.id !== id;

        });


    renderCourses();

}


/* =========================
   RENDER COURSES
========================= */

function renderCourses() {

    const container =
        document.getElementById("courses");

    if (!container) {
        return;
    }


    container.innerHTML = "";


    courses.forEach(function (course, index) {

        const card =
            document.createElement("div");

        card.className = "course-card";


        card.innerHTML = `

            <div class="course-header">

                <strong>
                    Course ${index + 1}
                </strong>

                <button
                    type="button"
                    class="remove-course"
                    data-id="${course.id}"
                    aria-label="Remove course">
                    ×
                </button>

            </div>


            <div class="course-fields">

                <div class="field-group">

                    <label>
                        Course Name
                    </label>

                    <input
                        type="text"
                        class="course-name"
                        data-id="${course.id}"
                        placeholder="e.g. CSC 101"
                        value="${escapeAttribute(course.name)}"
                        autocomplete="off">

                </div>


                <div class="field-group">

                    <label>
                        Credit Unit
                    </label>

                    <input
                        type="number"
                        class="course-unit"
                        data-id="${course.id}"
                        min="1"
                        max="10"
                        value="${course.unit}">

                </div>


                <div class="field-group">

                    <label>
                        Grade
                    </label>

                    <select
                        class="course-grade"
                        data-id="${course.id}">

                        <option value="">
                            Select grade
                        </option>

                        <option value="A"
                            ${course.grade === "A" ? "selected" : ""}>
                            A - 5 points
                        </option>

                        <option value="B"
                            ${course.grade === "B" ? "selected" : ""}>
                            B - 4 points
                        </option>

                        <option value="C"
                            ${