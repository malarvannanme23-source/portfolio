// Toggle mobile navigation menu
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");
    navToggle.setAttribute("aria-expanded", isOpen);
  });
}

// ============================================================
// Simple Content Sync (for elements with data-key)
// ============================================================

const STORAGE_KEY = "profileContentV1";
const RESUME_STORAGE_KEY = "profileResumeV1";
const SITE_DATA_KEY = "siteDataV1";

const isAdminPage = document.body.dataset.page === "admin";

// Collect all elements marked with data-key and save their HTML
function collectContent() {
  const data = {};
  document.querySelectorAll("[data-key]").forEach((el) => {
    data[el.dataset.key] = el.innerHTML;
  });
  return data;
}

// Save data-key content to localStorage
function saveContent() {
  const data = collectContent();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Load data-key content from localStorage
function loadContent() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return;
  }

  Object.keys(data).forEach((key) => {
    const el = document.querySelector(`[data-key="${key}"]`);
    if (el) el.innerHTML = data[key];
  });
}

// Remove editable attributes for public visitors
function stripEditableAttributes(root) {
  root.querySelectorAll("[contenteditable]").forEach((el) => {
    el.removeAttribute("contenteditable");
  });
  root.querySelectorAll("[data-editable]").forEach((el) => {
    el.removeAttribute("data-editable");
  });
}

// Add admin-only class to editable text when edit mode is active
function applyAdminEditableClass() {
  if (!isAdminPage) return;
  document.querySelectorAll('[data-editable="true"]').forEach((el) => {
    const isEditable = el.getAttribute("contenteditable") === "true";
    el.classList.toggle("admin-editable", isEditable);
  });
}

// Simple debounce to avoid saving too often
function debounce(fn, delay = 400) {
  let timer = null;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}

// ============================================================
// Site Data (Admin -> Public) using localStorage
// ============================================================

const DEFAULT_SITE_DATA = {
  about: "I am a Mechanical / Mechatronics Engineering student who enjoys turning ideas into functional prototypes. I like working on mechanisms, sensors, and automation projects that solve practical problems.",
  education: [
    {
      id: "edu-1",
      degree: "B.E. Mechanical / Mechatronics Engineering",
      college: "Your College Name",
      year: "2022 - 2026",
    },
  ],
  career: [
    { id: "car-1", text: "Mechanical Design" },
    { id: "car-2", text: "Robotics and Automation" },
  ],
  skills: [
    {
      id: "skill-1",
      title: "Mechanical Design",
      description: "CAD modeling, assemblies, and technical drawings.",
    },
    {
      id: "skill-2",
      title: "Manufacturing Engineering",
      description: "Fabrication basics, process planning, and tolerances.",
    },
    {
      id: "skill-3",
      title: "SolidWorks & AutoCAD",
      description: "2D drafting and 3D modeling for mechanical parts.",
    },
    {
      id: "skill-4",
      title: "Basic Programming",
      description: "C and Python for logic, data, and automation tasks.",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Automated Conveyor Sorting",
      description: "Built a prototype conveyor that sorts objects using sensors.",
      technologies: "IR sensors, DC motors, Arduino",
      status: "Completed",
      extra: "My role: Mechanical layout and sensor mounting.",
    },
    {
      id: "proj-2",
      name: "Robotic Arm Gripper",
      description: "Designed a compact gripper mechanism for a small robotic arm.",
      technologies: "SolidWorks, 3D printing",
      status: "Completed",
      extra: "My role: CAD design and prototype assembly.",
    },
    {
      id: "proj-3",
      name: "Smart Irrigation System",
      description: "Created a basic automation system to control water flow.",
      technologies: "Soil sensor, relay module, C",
      status: "Ongoing",
      extra: "My role: System integration and testing.",
    },
  ],
  contact: {
    email: "malarvannan@example.com",
    phone: "+91 00000 00000",
    github: "github.com/your-username",
    linkedin: "linkedin.com/in/your-username",
  },
};

function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_SITE_DATA));
}

function loadSiteData() {
  const raw = localStorage.getItem(SITE_DATA_KEY);
  if (!raw) return cloneDefaults();

  try {
    const parsed = JSON.parse(raw);
    const data = { ...cloneDefaults(), ...parsed };

    data.education = Array.isArray(parsed.education) ? parsed.education : DEFAULT_SITE_DATA.education;
    data.career = Array.isArray(parsed.career) ? parsed.career : DEFAULT_SITE_DATA.career;
    data.skills = Array.isArray(parsed.skills) ? parsed.skills : DEFAULT_SITE_DATA.skills;
    data.projects = Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_SITE_DATA.projects;
    data.contact = { ...DEFAULT_SITE_DATA.contact, ...(parsed.contact || {}) };

    return data;
  } catch {
    return cloneDefaults();
  }
}

let siteData = loadSiteData();

function saveSiteData() {
  localStorage.setItem(SITE_DATA_KEY, JSON.stringify(siteData));
}

// ============================================================
// Render helpers
// ============================================================

function setEditable(el) {
  if (!isAdminPage || !el) return;
  el.dataset.editable = "true";
}

function createActionButtons() {
  const actions = document.createElement("div");
  actions.className = "item-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.textContent = "Edit";
  editBtn.dataset.action = "edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "danger";
  deleteBtn.dataset.action = "delete";

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  return actions;
}

function setCardEditable(card, isEditable) {
  card.dataset.editing = isEditable ? "true" : "false";
  card.classList.toggle("is-editing", isEditable);

  card.querySelectorAll("[data-field]").forEach((el) => {
    if (isEditable) {
      el.setAttribute("contenteditable", "true");
    } else {
      el.removeAttribute("contenteditable");
    }
  });

  applyAdminEditableClass();
}

function getFieldValue(card, field) {
  const el = card.querySelector(`[data-field="${field}"]`);
  return (el?.textContent || "").trim();
}

function renderAbout() {
  const aboutEl = document.querySelector('[data-section="about"][data-field="text"]');
  if (aboutEl) {
    aboutEl.textContent = siteData.about;
  }
}

function renderEducation() {
  const container = document.querySelector('[data-list="education"]');
  if (!container) return;
  container.innerHTML = "";

  siteData.education.forEach((item) => {
    const card = document.createElement("div");
    card.className = "list-card";
    card.dataset.id = item.id;

    const header = document.createElement("div");
    header.className = "list-card-header";

    const title = document.createElement("h3");
    title.textContent = item.degree;
    title.dataset.field = "degree";
    setEditable(title);

    header.appendChild(title);

    if (isAdminPage) {
      header.appendChild(createActionButtons());
    }

    const college = document.createElement("p");
    college.textContent = item.college;
    college.dataset.field = "college";
    setEditable(college);

    const year = document.createElement("p");
    year.textContent = item.year;
    year.dataset.field = "year";
    setEditable(year);

    card.appendChild(header);
    card.appendChild(college);
    card.appendChild(year);

    container.appendChild(card);
  });
}

function renderCareer() {
  const container = document.querySelector('[data-list="career"]');
  if (!container) return;
  container.innerHTML = "";

  siteData.career.forEach((item) => {
    const card = document.createElement("div");
    card.className = "list-card";
    card.dataset.id = item.id;

    const header = document.createElement("div");
    header.className = "list-card-header";

    const text = document.createElement("p");
    text.textContent = item.text;
    text.dataset.field = "text";
    setEditable(text);

    header.appendChild(text);

    if (isAdminPage) {
      header.appendChild(createActionButtons());
    }

    card.appendChild(header);
    container.appendChild(card);
  });
}

function renderSkills() {
  const container = document.querySelector('[data-list="skills"]');
  if (!container) return;
  container.innerHTML = "";

  siteData.skills.forEach((item) => {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.dataset.id = item.id;

    const header = document.createElement("div");
    header.className = "list-card-header";

    const title = document.createElement("h3");
    title.textContent = item.title;
    title.dataset.field = "title";
    setEditable(title);

    header.appendChild(title);

    if (isAdminPage) {
      header.appendChild(createActionButtons());
    }

    const desc = document.createElement("p");
    desc.textContent = item.description;
    desc.dataset.field = "description";
    setEditable(desc);

    card.appendChild(header);
    card.appendChild(desc);

    container.appendChild(card);
  });
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.dataset.id = project.id;

  const header = document.createElement("div");
  header.className = "project-card-header";

  const title = document.createElement("h3");
  title.className = "project-title";
  title.textContent = project.name;
  title.dataset.field = "name";
  setEditable(title);

  header.appendChild(title);

  if (isAdminPage) {
    const actions = document.createElement("div");
    actions.className = "project-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.dataset.action = "edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "danger";
    deleteBtn.dataset.action = "delete";

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    header.appendChild(actions);
  }

  card.appendChild(header);

  const desc = document.createElement("p");
  desc.className = "project-description";
  desc.textContent = project.description;
  desc.dataset.field = "description";
  setEditable(desc);
  card.appendChild(desc);

  const tech = document.createElement("p");
  tech.className = "project-tech";
  const techLabel = document.createElement("span");
  techLabel.className = "project-label";
  techLabel.textContent = "Technologies: ";
  const techValue = document.createElement("span");
  techValue.className = "project-value";
  techValue.textContent = project.technologies;
  techValue.dataset.field = "technologies";
  setEditable(techValue);
  tech.appendChild(techLabel);
  tech.appendChild(techValue);
  card.appendChild(tech);

  const status = document.createElement("p");
  status.className = "project-status";
  const statusLabel = document.createElement("span");
  statusLabel.className = "project-label";
  statusLabel.textContent = "Status: ";
  const statusValue = document.createElement("span");
  statusValue.className = "project-value";
  statusValue.textContent = project.status;
  statusValue.dataset.field = "status";
  setEditable(statusValue);
  status.appendChild(statusLabel);
  status.appendChild(statusValue);
  card.appendChild(status);

  if (isAdminPage || project.extra) {
    const extra = document.createElement("p");
    extra.className = "project-extra";
    const extraLabel = document.createElement("span");
    extraLabel.className = "project-label";
    extraLabel.textContent = "Extra: ";
    const extraValue = document.createElement("span");
    extraValue.className = "project-value";
    extraValue.textContent = project.extra || "";
    extraValue.dataset.field = "extra";
    setEditable(extraValue);
    extra.appendChild(extraLabel);
    extra.appendChild(extraValue);
    card.appendChild(extra);
  }

  return card;
}

function renderProjects() {
  const container = document.querySelector('[data-list="projects"]');
  if (!container) return;
  container.innerHTML = "";

  siteData.projects.forEach((project) => {
    container.appendChild(createProjectCard(project));
  });
}

function renderContact() {
  const contactSection = document.querySelector('[data-section="contact"]');
  if (!contactSection) return;

  const fields = contactSection.querySelectorAll("[data-field]");
  fields.forEach((field) => {
    const key = field.dataset.field;
    if (siteData.contact[key] !== undefined) {
      field.textContent = siteData.contact[key];
    }
  });

  if (isAdminPage) {
    const emailInput = document.querySelector("#contact-email");
    const phoneInput = document.querySelector("#contact-phone");
    const githubInput = document.querySelector("#contact-github");
    const linkedinInput = document.querySelector("#contact-linkedin");

    if (emailInput) emailInput.value = siteData.contact.email;
    if (phoneInput) phoneInput.value = siteData.contact.phone;
    if (githubInput) githubInput.value = siteData.contact.github;
    if (linkedinInput) linkedinInput.value = siteData.contact.linkedin;
  }
}

function renderAll() {
  renderAbout();
  renderEducation();
  renderCareer();
  renderSkills();
  renderProjects();
  renderContact();
  applyAdminEditableClass();
}

// ============================================================
// Admin list actions + forms
// ============================================================

const LIST_DEFAULTS = {
  education: { degree: "Education", college: "College Name", year: "Year" },
  career: { text: "Career Interest" },
  skills: { title: "Skill", description: "Skill description" },
  projects: {
    name: "Project Name",
    description: "Project description",
    technologies: "Tools and technologies",
    status: "Ongoing",
    extra: "",
  },
};

function updateListItem(listName, card, fields) {
  const id = card.dataset.id;
  const defaults = LIST_DEFAULTS[listName] || {};
  const updated = {};

  fields.forEach((field) => {
    const value = getFieldValue(card, field);
    updated[field] = value || defaults[field] || "";
  });

  siteData[listName] = siteData[listName].map((item) =>
    item.id === id ? { ...item, ...updated } : item
  );

  saveSiteData();
  renderAll();
}

function deleteListItem(listName, id) {
  siteData[listName] = siteData[listName].filter((item) => item.id !== id);
  saveSiteData();
  renderAll();
}

function handleListActions(listName, fields) {
  const container = document.querySelector(`[data-list="${listName}"]`);
  if (!container) return;

  container.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const card = event.target.closest("[data-id]");
    if (!card) return;

    const action = button.dataset.action;

    if (action === "delete") {
      if (!window.confirm("Delete this item?")) return;
      deleteListItem(listName, card.dataset.id);
      return;
    }

    if (action === "edit") {
      const isEditing = card.dataset.editing === "true";
      if (!isEditing) {
        setCardEditable(card, true);
        button.textContent = "Save";
      } else {
        updateListItem(listName, card, fields);
      }
    }
  });
}

function handleAboutEdit() {
  const aboutEl = document.querySelector('[data-section="about"][data-field="text"]');
  if (!aboutEl || !isAdminPage) return;

  const debouncedSave = debounce(() => {
    siteData.about = aboutEl.textContent.trim();
    saveSiteData();
  }, 300);

  aboutEl.addEventListener("input", debouncedSave);
}

function handleEducationForm() {
  const form = document.querySelector("#education-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const degree = document.querySelector("#education-degree").value.trim();
    const college = document.querySelector("#education-college").value.trim();
    const year = document.querySelector("#education-year").value.trim();

    if (!degree || !college || !year) return;

    siteData.education.unshift({
      id: `edu-${Date.now()}`,
      degree,
      college,
      year,
    });

    saveSiteData();
    renderAll();
    form.reset();
  });
}

function handleCareerForm() {
  const form = document.querySelector("#career-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = document.querySelector("#career-text").value.trim();
    if (!text) return;

    siteData.career.unshift({
      id: `car-${Date.now()}`,
      text,
    });

    saveSiteData();
    renderAll();
    form.reset();
  });
}

function handleSkillForm() {
  const form = document.querySelector("#skill-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.querySelector("#skill-title").value.trim();
    const description = document.querySelector("#skill-description").value.trim();

    if (!title || !description) return;

    siteData.skills.unshift({
      id: `skill-${Date.now()}`,
      title,
      description,
    });

    saveSiteData();
    renderAll();
    form.reset();
  });
}

function handleProjectForm() {
  const form = document.querySelector("#project-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.querySelector("#project-name").value.trim();
    const description = document.querySelector("#project-description").value.trim();
    const technologies = document.querySelector("#project-tech").value.trim();
    const status = document.querySelector("#project-status").value.trim();
    const extra = document.querySelector("#project-extra").value.trim();

    if (!name || !description || !technologies) return;

    siteData.projects.unshift({
      id: `proj-${Date.now()}`,
      name,
      description,
      technologies,
      status,
      extra,
    });

    saveSiteData();
    renderAll();
    form.reset();
  });
}

function handleContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    siteData.contact = {
      email: document.querySelector("#contact-email").value.trim(),
      phone: document.querySelector("#contact-phone").value.trim(),
      github: document.querySelector("#contact-github").value.trim(),
      linkedin: document.querySelector("#contact-linkedin").value.trim(),
    };

    saveSiteData();
    renderContact();
  });
}

// ============================================================
// Resume Upload (Admin) + Resume Load (Public)
// ============================================================

function applyResumePayload(payload, options = {}) {
  const { updateLink = true, showMeta = false } = options;
  const resumeLink = document.querySelector("[data-resume]");
  const resumeMeta = document.querySelector("[data-resume-meta]");

  if (updateLink && resumeLink && payload && payload.dataUrl) {
    resumeLink.href = payload.dataUrl;
    resumeLink.setAttribute("download", payload.fileName || "resume.pdf");
  }

  if (resumeMeta) {
    if (showMeta && payload && payload.fileName && payload.updatedAt) {
      resumeMeta.textContent = `Last updated: ${payload.updatedAt} • File: ${payload.fileName}`;
    } else {
      resumeMeta.textContent = "";
    }
  }
}

function loadResumeFromStorage({ showMeta = false, updateLink = true } = {}) {
  const raw = localStorage.getItem(RESUME_STORAGE_KEY);
  if (!raw) return;

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return;
  }

  applyResumePayload(payload, { showMeta, updateLink });
}

function handleResumeUpload() {
  const input = document.querySelector("#resume-upload");
  if (!input) return;

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      window.alert("Please upload a PDF file only.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const payload = {
        dataUrl: reader.result,
        fileName: file.name,
        updatedAt: new Date().toLocaleString(),
      };

      try {
        localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        window.alert("Resume file is too large to store in localStorage. Please use a smaller PDF.");
        return;
      }

      applyResumePayload(payload, { showMeta: true, updateLink: true });
    };

    reader.readAsDataURL(file);
  });
}

// ============================================================
// Init
// ============================================================

// Load saved content for data-key elements
loadContent();

// Load saved site data for lists/sections
renderAll();
handleAboutEdit();

if (isAdminPage) {
  handleEducationForm();
  handleCareerForm();
  handleSkillForm();
  handleProjectForm();
  handleContactForm();

  handleListActions("education", ["degree", "college", "year"]);
  handleListActions("career", ["text"]);
  handleListActions("skills", ["title", "description"]);
  handleListActions("projects", ["name", "description", "technologies", "status", "extra"]);

  handleResumeUpload();
} else {
  // Public page: remove any editable attributes that might exist
  stripEditableAttributes(document.body);
}

// Resume for both pages
if (isAdminPage) {
  loadResumeFromStorage({ showMeta: true, updateLink: true });
} else {
  loadResumeFromStorage({ showMeta: false, updateLink: true });
}

// Auto-save data-key content on admin edits
if (isAdminPage) {
  const debouncedSave = debounce(saveContent, 400);

  document.addEventListener("input", (event) => {
    if (event.target.closest("[data-key]")) {
      debouncedSave();
      applyAdminEditableClass();
    }
  });

  window.addEventListener("beforeunload", saveContent);
}

