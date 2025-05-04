
const container = document.getElementById("categories-container");
const initialCardsContainer = null;
const initialZone = null;
const addCategoryButton = document.getElementById("add-category-button");

let freecatTitle = null;
let freeform = null;

function renderCategories() {
    console.log(categorias);
    container.innerHTML = "";
  
    for (let i = 0; i < categorias.length; i += 2) {
      const categoryGroup = document.createElement("div");
      categoryGroup.classList.add("category-group");
      console.log(categorias);
  
      createCategoryElement(categorias[i], i, categoryGroup);
  
      if (i + 1 < categorias.length) {
        createCategoryElement(categorias[i + 1], i + 1, categoryGroup);
      }
  
      container.appendChild(categoryGroup);
    }
  
    // Apply styles if freeform mode is enabled
    if (freeform) {
      document.querySelectorAll(".category").forEach((category) => {
        if (category.getAttribute("data-category") === freecatTitle) {
          category.classList.add("freeform");
        }
      });
    }
  }
  
  function addCategory() {
    if (freeform) {
      categorias.push(freecatTitle);
  
      // Buscar el último grupo de categorías dentro del contenedor
      let categoryGroups = document.querySelectorAll(".category-group");
      let lastGroup = categoryGroups[categoryGroups.length - 1];
  
      // Si el último grupo tiene menos de 2 categorías, agregar ahí.
      if (lastGroup && lastGroup.children.length < 2) {
        createCategoryElement("", categorias.length - 1, lastGroup);
      } else {
        // Si ya hay dos categorías en el último grupo, crear uno nuevo
        const newGroup = document.createElement("div");
        newGroup.classList.add("category-group");
        createCategoryElement("", categorias.length - 1, newGroup);
        container.appendChild(newGroup);
      }
    }
  }
  function createCategoryElement(categoria, index, parentContainer) {
    const div = document.createElement("div");
    div.classList.add("category");
  
    div.innerHTML = `<input type="text" placeholder="${freecatTitle}" value="${categoria ? categoria : ""
      }" 
  ${categoria === "" ? "" : "readonly"}>
  <div class='cards-container' id='category-${index}'></div>`;
  
    div.addEventListener("dragover", (e) => e.preventDefault());
    div.addEventListener("drop", (e) =>
      handleDrop(e, div.querySelector(".cards-container"))
    );
  
    // Apply freeform styles if needed
    if (freeform && categoria === freecatTitle) {
      div.classList.add("freeform");
    }
  
    parentContainer.appendChild(div);
  }
categorias = ["Matemáticas", "Inglés", "Pociones", "Historia", "Astronomía", "Transformaciones"];
renderCategories();
function decodeResponseFromURL() {
const urlParams = new URLSearchParams(window.location.search);
const encodedData = urlParams.get("data"); // Extract encoded data

if (!encodedData) {
console.warn("No encoded data found in URL.");
return null;
}

try {
const decodedString = atob(encodedData); // Decode Base64
const responseData = JSON.parse(decodedString); // Parse JSON
console.log("Decoded Response:", responseData);
return responseData;
} catch (error) {
console.error("Error decoding response:", error);
return null;
}
}

// Usage
const decodedResponse = decodeResponseFromURL();
if (decodedResponse) {
// Process the decoded response, e.g., render categories and assignments
console.log(decodedResponse.assignments);
}


// const container = document.getElementById("id-container");

function getStoredIDs() {
    return JSON.parse(localStorage.getItem("storedIDs")) || [];
}

function saveID(id) {
    let storedIDs = getStoredIDs();
    if (!storedIDs.includes(id)) {
        storedIDs.push(id);
        localStorage.setItem("storedIDs", JSON.stringify(storedIDs));
    }
}

function addCard(id) {
    const card = document.createElement("div");
    card.className = "card";
    
    const text = document.createElement("span");
    text.textContent = id;
    
    const button = document.createElement("button");
    button.className = "share-btn";
    button.innerHTML = "Copy URL";
    
    button.onclick = () => copyToClipboard(id, button);
    
    card.appendChild(text);
    card.appendChild(button);
    container.appendChild(card);
}

function copyToClipboard(id, button) {
const baseUrl = window.location.origin + window.location.pathname; // Current URL without parameters
const shareableUrl = `${baseUrl}?${id}`; // Append ID as a parameter

navigator.clipboard.writeText(shareableUrl).then(() => {
button.innerHTML = "✔";
setTimeout(() => button.innerHTML = "Copy URL", 1500);
});
}


function verResultados() {
    alert("Mostrando resultados...");
}

function decodeURLData(encodedString) {
if (!encodedString) {
console.warn("No data provided.");
return null;
}

try {
let decodedData = decodeURIComponent(encodedString); // Decode URL encoding

while (decodedData.length % 4 !== 0) {
    decodedData += "="; // Fix missing Base64 padding if needed
}

const decodedString = atob(decodedData); // Base64 decoding
const responseData = JSON.parse(decodedString); // Parse JSON

console.log("Decoded Data:", responseData);
return responseData;
} catch (error) {
console.error("Error decoding the provided data:", error);
return null;
}
}

// Example usage:
let testString = "eyJhc3NpZ25tZW50cyI6eyJNdXkgaW1wb3J0YW50ZV8wIjpbIjEiXSwiSW1wb3J0YW50ZV8xIjpbIjYiLCIyIiwiNSJdLCJQb2NvIGltcG9ydGFudGVfMiI6WyI0IiwiMyJdLCJfNCI6WyIwIl19fQ%3D%3D";
decodeURLData(testString);


// function checkForNewID() {
//     const urlParams = new URLSearchParams(window.location.search);
//     for (let param of urlParams.keys()) {
//         if (param.startsWith("ID")) {
//             saveID(param);
//         }
//     }
// }

// function renderStoredIDs() {
//     const storedIDs = getStoredIDs();
//     storedIDs.forEach(id => addCard(id));
// }

// checkForNewID();
// renderStoredIDs();
