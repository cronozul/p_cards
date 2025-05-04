let scrollContainer = document.querySelector(".container");
const indicator = document.querySelector(".scroll-indicator");


console.log(scrollContainer);
let isDragging = false;

function hideIndicator() {
  indicator.style.opacity = "0";
  setTimeout(() => (indicator.style.display = "none"), 500);
}

function detectDrag(event) {
  if (isDragging) {
    hideIndicator();
  }
}

function checkScrollability() {
  const isScrollable =
    scrollContainer.scrollLeftMax > 0 ||
    scrollContainer.scrollWidth > scrollContainer.clientWidth;
  indicator.style.display = isScrollable ? "block" : "none";
}
scrollContainer.addEventListener("scroll", hideIndicator);
scrollContainer.addEventListener(
  "pointerdown",
  () => (isDragging = true)
);
scrollContainer.addEventListener("pointerup", () => (isDragging = false));
scrollContainer.addEventListener("pointermove", detectDrag);
function isDragAndDropSupported() {
  is_chrome = navigator.userAgent.indexOf("Chrome") > -1;
  return window.innerWidth > 1000 || is_chrome;
}

window.addEventListener("load", checkScrollability);
window.addEventListener("resize", checkScrollability);

if (isDragAndDropSupported()) {
  document.getElementById("description").innerText +=
    " Tu navegador también puede admitir la función de arrastrar y soltar.";
}

let selectedCard = null;

const urlParams = new URLSearchParams(window.location.search);
let freeform = urlParams.get("freeform") === "1";
// TODO consider this boolean filter when sending the survey
let categorias =
  urlParams.get("categorias")?.split(",").filter(Boolean) || [];
let tarjetas =
  urlParams.get("tarjetas")?.split(",").filter(Boolean) || [];

if (!urlParams.has("categorias") && !urlParams.has("tarjetas")) {
  alert("⚠️ No URL parameters found. Using default test setup.");
  categorias = ["Category 1", "Category 2"];
  sufix = "Card ";
  tarjetas = Array(7)
    .fill()
    .map((_, i) => `${sufix}${i + 1}`);
  // freeform = true;
  // randomly pick freeform or not
  freeform = Math.random() > 0.5;
}

const container = document.getElementById("categories-container");
const initialCardsContainer = document.getElementById("cards-container");
const initialZone = document.getElementById("initial-zone");
const addCategoryButton = document.getElementById("add-category-button");
let freecatTitle = "_ _ _ _ _ _";

// overwrites properties to change style
if (freeform) {
  addCategoryButton.style.display = "block";
  addCategoryButton.addEventListener("click", addCategory);
  // categorias += Array(9).fill(freecatTitle);
  // complete 9 categories with placeholder
  categorias = categorias.concat(Array(9 - categorias.length).fill(""));

  document.querySelectorAll(".category").forEach((category) => {
    //  check if title is freecatTitle
    if (category.getAttribute("data-category") === freecatTitle) {
      category.classList.add("freeform");
    }
  });
}

function handleDrop(e, div) {
  e.preventDefault();
  const cardId = e.dataTransfer.getData("text/plain");
  const card = document.getElementById(cardId);
  if (card) {
    div.appendChild(card);
  }
}

function addDragAndDropListeners(element) {
  element.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", e.target.id);
    e.target.classList.add("dragging");
  });
  element.addEventListener("dragend", (e) => {
    e.target.classList.remove("dragging");
  });
}

// function renderCategories() {
//   container.innerHTML = "";
//   categorias.forEach((categoria, index) => {
//     createCategoryElement(categoria, index);
//   });

//   // Apply styles if freeform mode is enabled
//   if (freeform) {
//     document.querySelectorAll(".category").forEach((category) => {
//       //  check if title is freecatTitle
//       if (category.getAttribute("data-category") === freecatTitle) {
//       category.classList.add("freeform");
//       }});
//   }
// }

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
function renderCards() {
  title = "Tarjetas:";
  const titleElement = document.createElement("h4");
  titleElement.style.margin = "5px";
  titleElement.style.height = "fit-content";
  initialCardsContainer.innerHTML = "";
  titleElement.innerText = title;
  initialCardsContainer.appendChild(titleElement);

  tarjetas.forEach((tarjeta, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("draggable", "true");
    card.setAttribute("id", `card-${index}`);
    card.innerText = tarjeta;

    addDragAndDropListeners(card);

    initialCardsContainer.appendChild(card);
  });
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

initialZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  // make selected card null
  selectedCard = null;
});
initialZone.addEventListener("drop", (e) =>
  handleDrop(e, initialCardsContainer)
);

renderCategories(categorias, freeform, freecatTitle);
renderCards();

function generateCompressedCode() {
  let categories = Array.from(document.querySelectorAll(".category"));

  // Extract and sort category names
  let categoryNames = categories.map((category) => category.id).sort();

  // Create dictionary for card assignments using index-based references
  let cardAssignments = {};

  categories.forEach((category, index) => {
    // let categoryIndex = categoryNames.indexOf(category.id); // Index from sorted list
    // create categoryIndex simply as the name the content of its input box
    let categoryIndex = category.querySelector("input").value;
    // add index to allow duplicate names
    categoryIndex = categoryIndex + "_" + index;
    let cards = Array.from(category.querySelectorAll(".card"));
    let cardIds = cards.map((card) => card.id.replace("card-", ""));

    if (cardIds.length) {
      cardAssignments[categoryIndex] = cardIds;
    }
  });

  // Encode data as a JSON string and then Base64
  let dataString = JSON.stringify({
    // categories: categoryNames,
    assignments: cardAssignments,
  });
  console.log(dataString);
  let compressedData = btoa(dataString); // Base64 encoding
  console.log(compressedData);

  return compressedData;
}

function checkAllCardsSorted() {
  let initialCardsContainer = document.getElementById("cards-container");
  return initialCardsContainer.children.length === 1;
}

function finalizarEncuesta(respuestas) {
const quiereCopiar = confirm("📋 Para completar la encuesta, debes enviar tus respuestas manualmente al encuestador.\n\n" +
                             "¿Quieres copiarlas ahora para pegarlas fácilmente en tu app de mensajería?");

if (quiereCopiar) {
    navigator.clipboard.writeText(respuestas).then(() => {
        alert("✅ Tus respuestas han sido copiadas. Ahora pégalas y envíalas al encuestador.\n\n" +
              "📲 También puedes usar el botón de WhatsApp para enviarlas más rápido.");
    }).catch(err => {
        alert("❌ Error al copiar las respuestas: puede que necesites aceptar el permiso al portapapeles en tu navegador.\n\n" +
              "🔗 También puedes usar el botón de Whatsapp o copiarlas manualmente de aquí:\n" + respuestas);
    });
} else {
    alert("⚠️ Recuerda que debes enviar las respuestas manualmente. Si necesitas copiarlas, vuelve a presionar el botón.\n\n" +
          "📲 También puedes usar el botón de WhatsApp para enviarlas más rápido.");
}
}


document
  .getElementById("copy-button")
  .addEventListener("click", function () {
    if (!checkAllCardsSorted()) {
      alert(
        "⚠️ Por favor, categoriza todas las cartas antes de copiar el link!"
      );
      return;
    }

    let compressedCode = generateCompressedCode();
    let shareLink = `${window.location.origin
      }/responsesDashboard/index.html?data=${encodeURIComponent(compressedCode)}`;

    // navigator.clipboard
    //   .writeText(shareLink)
    //   .then(() => {
    //     alert("✅ Tus respuestas han sido copiadas al portapapeles. Para este prototipo es necesario las peges y envies al encuestador por tu medio de preferencia. También para mayor facilidad usa el botón de Whatsapp para enviarlas directamente al número que decidas.");
    //   })
    //   .catch((err) => {
    //     console.error("Failed to copy:", err);
    //     alert(
    //       "❌ Hubo un error al copiar el link. Asegurate de que todas las cartas han sido clasificadas, para más ayuda puedes subir un ticket en https://github.com/cronozul/p_cards "
    //     );
      finalizarEncuesta(shareLink);
      });
document
  .getElementById("whatsapp-button")
  .addEventListener("click", function () {
    if (!checkAllCardsSorted()) {
      alert(
        "⚠️ Por favor, categoriza todas las cartas antes de terminar!"
      );
      return;
    }

    let compressedCode = generateCompressedCode();
    let shareLink = `${window.location.protocol + "//" + window.location.hostname
      }/responsesDashboard/index.html?data=${encodeURIComponent(compressedCode)}`;

    let whatsappMessage = `Esta son las respuestas del card sorting: ${shareLink}`;

    let whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappURL, "_blank");
  });
const cards = document.querySelectorAll(".card"); // Replace '.card' with your card selector

document.addEventListener("click", (e) => {
  const card = e.target.closest(".card"); // Ensure we always get the `.card` element
  let category = e.target.closest(".category"); // Ensure we get the `.category` element
  // check also the initial zone
  category = category || e.target.closest(".initial-zone");

  if (card) {
    e.preventDefault();
    if (selectedCard) {
      selectedCard.classList.remove("selected");
    }
    selectedCard = card;
    selectedCard.classList.add("selected");
  } else if (category) {
    e.preventDefault();
    const child = category.querySelector(".cards-container");

    if (selectedCard && child) {
      child.appendChild(selectedCard);
      selectedCard.classList.remove("selected");
      selectedCard = null;
    }
  }
});