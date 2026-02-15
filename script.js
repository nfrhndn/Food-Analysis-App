document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const fileInput = document.getElementById("file-input");
  const uploadArea = document.getElementById("upload-area");
  const imagePreview = document.getElementById("image-preview");
  const cameraIcon = document.querySelector(".camera-icon-wrapper");
  const analyzeBtn = document.getElementById("analyze-btn");
  const cameraBtn = document.getElementById("camera-btn");
  const galleryBtn = document.getElementById("gallery-btn");
  const backBtn = document.getElementById("back-btn");

  // Views
  const uploadView = document.getElementById("upload-view");
  const loadingView = document.getElementById("loading-view");
  const resultView = document.getElementById("result-view");
  const bottomActions = document.getElementById("bottom-actions");
  const resultImage = document.getElementById("result-image");

  // Result Fields
  const foodNameEl = document.getElementById("food-name");
  const halalStatusEl = document.getElementById("halal-status");
  const nutritionGridEl = document.getElementById("nutrition-grid");

  // API Key Modal Elements
  const apiKeyModal = document.getElementById("api-key-modal");
  const apiKeyInput = document.getElementById("api-key-input");
  const saveApiKeyBtn = document.getElementById("save-api-key-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const toggleKeyVisibility = document.getElementById("toggle-key-visibility");

  // --- Constants ---
  const API_KEY_STORAGE_KEY = "gemini_api_key";

  // --- State ---
  let currentImageFile = null;

  // --- API Key Functions ---

  function getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
  }

  function saveApiKey(key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  }

  function showApiKeyModal() {
    apiKeyInput.value = getApiKey();
    apiKeyModal.classList.remove("hidden");
    setTimeout(() => apiKeyModal.classList.add("active"), 10);
  }

  function hideApiKeyModal() {
    apiKeyModal.classList.remove("active");
    setTimeout(() => apiKeyModal.classList.add("hidden"), 300);
  }

  // Show modal on first visit if no key saved
  if (!getApiKey()) {
    showApiKeyModal();
  }

  // Settings button opens modal
  settingsBtn.addEventListener("click", () => {
    showApiKeyModal();
  });

  // Close modal
  modalCloseBtn.addEventListener("click", () => {
    hideApiKeyModal();
  });

  // Close modal on overlay click
  apiKeyModal.addEventListener("click", (e) => {
    if (e.target === apiKeyModal) {
      hideApiKeyModal();
    }
  });

  // Toggle API Key visibility
  toggleKeyVisibility.addEventListener("click", () => {
    const icon = toggleKeyVisibility.querySelector("ion-icon");
    if (apiKeyInput.type === "password") {
      apiKeyInput.type = "text";
      icon.setAttribute("name", "eye-outline");
    } else {
      apiKeyInput.type = "password";
      icon.setAttribute("name", "eye-off-outline");
    }
  });

  // Save API Key
  saveApiKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      alert("API Key tidak boleh kosong!");
      return;
    }
    saveApiKey(key);
    hideApiKeyModal();
  });

  // --- Event Listeners ---

  // Trigger file input
  cameraBtn.addEventListener("click", () => {
    fileInput.setAttribute("capture", "environment"); // Prefer camera
    fileInput.click();
  });

  galleryBtn.addEventListener("click", () => {
    fileInput.removeAttribute("capture");
    fileInput.click();
  });

  uploadArea.addEventListener("click", () => {
    fileInput.click();
  });

  // Handle File Selection
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  // Drag and Drop support
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("highlight");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("highlight");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("highlight");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // Analyze Button
  analyzeBtn.addEventListener("click", () => {
    if (!currentImageFile) return;
    startAnalysis();
  });

  // Back Button
  backBtn.addEventListener("click", () => {
    showView(uploadView);
    bottomActions.style.display = "flex";
  });

  // --- Functions ---

  function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    currentImageFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.classList.remove("hidden");
      cameraIcon.classList.add("hidden");
      analyzeBtn.disabled = false;
    };

    reader.readAsDataURL(file);
  }

  function showView(view) {
    [uploadView, loadingView, resultView].forEach((v) =>
      v.classList.add("hidden"),
    );
    view.classList.remove("hidden");

    if (view === resultView) {
      setTimeout(() => {
        view.style.opacity = 1;
      }, 10);
    } else {
      view.style.opacity = 1;
    }
  }

  async function startAnalysis() {
    if (!currentImageFile) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      showApiKeyModal();
      return;
    }

    showView(loadingView);
    bottomActions.style.display = "none";

    try {
      // Convert image to Base64
      const base64Image = await fileToBase64(currentImageFile);

      const payload = {
        contents: [
          {
            parts: [
              {
                text: 'Analisis gambar makanan ini. Identifikasi nama makanan, tentukan status kehalalan (Halal/Haram/Syubhat beserta alasannya singkat), dan perkirakan kandungan nutrisinya (Karbohidrat, Protein, Lemak, Serat, Vitamin, dan Kalori). Format respon HARUS berupa JSON valid dengan struktur: { "name": "...", "halal": "...", "nutrition": [{"label": "Karbohidrat", "value": "...", "icon": "🌾"}, ...] }.',
              },
              {
                inline_data: {
                  mime_type: currentImageFile.type,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Failed to fetch from Gemini API",
        );
      }

      // Parse text response to JSON
      const textResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) throw new Error("No text returned from API");

      // Clean markdown tokens if present (```json ... ```)
      const cleanJsonText = textResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsedData = JSON.parse(cleanJsonText);

      showResult(parsedData);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Terjadi kesalahan saat menganalisis: " + error.message);
      showView(uploadView);
      bottomActions.style.display = "flex";
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove data url prefix (e.g. "data:image/jpeg;base64,")
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  function showResult(data) {
    resultImage.src = imagePreview.src;
    foodNameEl.textContent = data.name || "Tidak dikenali";
    halalStatusEl.textContent = data.halal || "Belum dipastikan";

    nutritionGridEl.innerHTML = "";
    if (data.nutrition && Array.isArray(data.nutrition)) {
      data.nutrition.forEach((item) => {
        const div = document.createElement("div");
        div.className = "nutrition-item";
        div.innerHTML = `
                    <div class="nutrition-icon">${item.icon || "🍽️"}</div>
                    <div class="nutrition-label">${item.label || ""}</div>
                    <div class="nutrition-value">${item.value || "-"}</div>
                `;
        nutritionGridEl.appendChild(div);
      });
    }

    showView(resultView);
  }
});

