
marked_checkboxes_dict = {} // dictionary to store the checkboxes and their values

function renderResponses(responses, container) {
  container.innerHTML = "";

  for (let i = 0; i < responses.length; i += 2) {
    const categoryGroup = document.createElement("div");
    categoryGroup.classList.add("category-group");

    createResponseElement(responses[i], i, categoryGroup);
    if (i + 1 < responses.length) {
      createResponseElement(responses[i + 1], i + 1, categoryGroup);
    }

    container.appendChild(categoryGroup);
  }

  if (freeform) {
    document.querySelectorAll(".category").forEach((category) => {
      if (category.getAttribute("data-category") === freecatTitle) {
        category.classList.add("freeform");
      }
    });
  }
}

function clearAllSelections() {
  document.querySelectorAll(".response-checkbox:checked").forEach(cb => {
    cb.checked = false;
    cb.dispatchEvent(new Event("click")); // ensures UI updates and dictionary is cleaned
  });
}


function createResponsesSection(defaultTitle,sectionTitle) {


  const div = document.createElement("div");
  // add a data attribute to the div with the section title
  div.setAttribute("data-section", sectionTitle);
  sectionTitle = defaultTitle + " " + sectionTitle;
  div.className = "survey-section";


  // another div to group the title and buttons
  const titleContainer = document.createElement("div");
  // make it a flex container that separates horizontally the title and buttons
  titleContainer.style.display = "flex";
  titleContainer.style.justifyContent = "space-between";
  titleContainer.style.alignItems = "center";
  titleContainer.style.width = "100%";
  titleContainer.style.marginBottom = "10px"; // add some space between title and buttons
  
  titleContainer.className = "title-container";

  const title = document.createElement("h2");
  title.innerHTML = sectionTitle;

  const markAllButton = document.createElement("button");
  markAllButton.textContent = "Toggle All";
  markAllButton.className = "toggle-all-btn";
  //  add another class
  markAllButton.classList.add("floating-btn");



  // This container will hold the responses of this section
  const container = document.createElement("div");
  container.className = "container";
  container.id = `${sectionTitle.replace(/\s+/g, "-")}-container`;

  // Toggle all functionality for this section
  markAllButton.onclick = () => {
    const checkboxes = container.querySelectorAll(".response-checkbox");
    const allChecked = [...checkboxes].every(cb => cb.checked);
    checkboxes.forEach(cb => {
      cb.checked = !allChecked;
      cb.dispatchEvent(new Event("click")); // trigger individual toggle
    });
  };

  // div.appendChild(title);
  // div.appendChild(markAllButton);
  titleContainer.appendChild(title);
  titleContainer.appendChild(markAllButton);

  div.appendChild(titleContainer);
  div.appendChild(container);

  const responsesDashboard = document.querySelector(".responses-dashboard");
  responsesDashboard.appendChild(div);

  return container;
}

function getSelectedResponses() {
  const selected = [];
  document.querySelectorAll(".response-checkbox:checked").forEach(cb => {
    selected.push({
      id: cb.id,
      section: cb.getAttribute("data-section"),
      response: marked_checkboxes_dict[cb.id] || null
    });
  });
  return selected;
}

// not used currently
function getSelectedResponsesGroupedBySection() {
  const grouped = {};
  getSelectedResponses().forEach(({ section, response }) => {
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(response);
  });
  return grouped;
}


function createResponseElement(response, index, parentContainer) {
  const div = document.createElement("div");
  div.className = "response";
  // div.innerHTML = response;
  // parse object to store in the HTML
  div.innerHTML = parseDictionariesIntoText(response);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "response-checkbox";
  checkbox.id = `response-${index}`;

  // set data-section attribute based on container's id or parent
  const sectionContainer = parentContainer
  if (sectionContainer) {
    checkbox.setAttribute("data-section", sectionContainer);
  }

  checkbox.onclick = () => {
    div.classList.toggle("selected", checkbox.checked);
    if (checkbox.checked) {
      marked_checkboxes_dict[checkbox.id] = response;
    } else {
      delete marked_checkboxes_dict[checkbox.id];
    }
  };

  div.appendChild(checkbox);
  parentContainer.appendChild(div);
  return div;
}

function newRenderCategories(category){
// each category is a dictionary with a key that servers as title and contents which can be tough as cards




}
function decodeData(encodedData, fix_lenght = false) {
    console.log("trying to decode data...");
    while (encodedData.length % 4 !== 0 && fix_lenght) {
      decodedData += "="; // Fix missing Base64 padding if needed
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

function decodeResponseFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedData = urlParams.get("data"); // Extract encoded data

  if (!encodedData) {
    console.warn("No encoded data found in URL.");
    return null;
  }
  const decodedData = decodeData(encodedData, true); // Decode and parse the data
  return decodedData;
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


function storeResponseDictionary(responseDictionary){
  // save in local storage the dictionary of responses
  // add timestamp to the dictionary so duplicates are saved
  const timestamp = new Date().toISOString();
  // responseDictionary.timestamp = timestamp;
  // save the dictionary in local storage
  name_of_file = "responseDictionary_" + timestamp + ".json";
  localStorage.setItem(name_of_file, JSON.stringify(responseDictionary));
  console.log("Response dictionary saved in local storage:", responseDictionary);
  
}

function loadDictionaries(){
  // load all the response dictionaries from local storage
  const responseDictionaries = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("responseDictionary_")) {
      const responseDictionary = JSON.parse(localStorage.getItem(key));
      responseDictionaries[key] = responseDictionary;
    }
  }
  if (Object.keys(responseDictionaries).length === 0) {
    console.warn("No response dictionaries found in local storage.");
    return null;
  } else {
    console.log("Response dictionaries loaded from local storage:", responseDictionaries);
    return responseDictionaries;
  }
}
function parseDictionariesIntoText(responseDictionary){
  // look for the property "assignments" in the response dictionary and parse it into a string
  // if the property "assignments" is not found, return an empty string
  
  //  check if dictionary is null for some reason (happens when a fake dictionary is stored in local storage)
  if (responseDictionary === null) return "";
  if (responseDictionary.hasOwnProperty("assignments")) {
    const assignments = responseDictionary.assignments;
    let parsedText = "";
    for (const key in assignments) {
      if (assignments.hasOwnProperty(key)) {
        parsedText += `${key}: ${assignments[key]}\n`;
      }
    }
    return parsedText.trim(); // Remove trailing newline
  } else {
    console.warn("No 'assignments' property found in the response dictionary.");
    return "";
  }
}

function deleteCache() {
  // Clear local storage
  //  do an alert asking for confirmation
  final_message = "Warning: you are about to delete all responses from the dashboard.\n" +
  "This will clear the cache and all responses will be lost.\n\n" +
  "If you added a response by accident we recommend you instead untoggle it before doing the analysis.\n\n" +
  " Remember that to readd a response you need to click on the original link shared by the surveyed person.\n\n" +
  "Do you understand?" 
  
  if (!confirm(final_message)) {
    return; // User canceled the action
  }
  last_confirmation = "Are you sure you want to delete the cache? This action cannot be undone.";
  if (!confirm(last_confirmation)) {
    return; // User canceled the action
  }
  localStorage.clear();
  console.log("Local storage cleared.");
  // do an alert saying that the cache was cleared
  alert("Cache cleared. All responses have been removed from the dashboard.");
}

let freecatTitle = null;
let freeform = null;
const decodedResponse = decodeResponseFromURL();
if (decodedResponse) {
  // Process the decoded response, e.g., render categories and assignments
  console.log(decodedResponse.assignments);
}
if (decodedResponse) {
  // Process the decoded response, e.g., render categories and assignments
  console.log(decodedResponse.assignments);
  // Store the decoded response in local storage
  storeResponseDictionary(decodedResponse); // Store the decoded response in local storage
}
else {
  console.warn("Loaded default dashboard no new response stored.");
}
// Load dictionaries from local storage
const responseDictionaries = loadDictionaries();
// parse dictionaries into strings and store them in responses using parseDictionariesIntoText
const surveyGroups = {}; // Maps serialized assignment sets => array of survey keys
// Step 1: Iterate over all survey dictionaries
for (const key in responseDictionaries) {
  if (responseDictionaries.hasOwnProperty(key)) {
    const responseDictionary = responseDictionaries[key];
    const valueSet = new Set();
    // Step 2: Union all assignment values into valueSet
    if (responseDictionary.assignments) {
      for (const values of Object.values(responseDictionary.assignments)) {
        const responseSet = new Set(values);
        responseSet.forEach(v => valueSet.add(v));
      }
    }
    // Step 3: Serialize the set to create a unique signature
    const serialized = [...valueSet].sort().join('|');
    // Step 4: Add the current survey key to the appropriate group
    if (!surveyGroups[serialized]) {
      surveyGroups[serialized] = [];
    }
    surveyGroups[serialized].push(key); // Save the original key for lookup
  }
}
for (const [serializedSet, keys] of Object.entries(surveyGroups)) {
  const responses = [];
  for (const key of keys) {
    const responseDictionary = responseDictionaries[key];
    // const parsedText = parseDictionariesIntoText(responseDictionary);
    // responses.push(parsedText);
    responses.push(responseDictionary);
  }
  
  const container = createResponsesSection("Card sorting:", serializedSet); 
  renderResponses(responses, container); // <- Now we pass a real DOM element
}


// createa a simple function that goes trough the local storage and prints the data in there
function printLocalStorage() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}: ${value}`);
  }
}
// {"assignments":{"Muy importante_0":["5","2"],"Importante_1":["1","3"],"Poco importante_2":["4"],"No es una razón para mí_3":["0"],"Abajo el veganismo_4":["6"]}}
// mapper = {"0":"Etica","1":"Medio ambiente","2":"Salud","3":"Economía","4":"Influencia social","5":"Experimentación","6":"Religión / Espiritualidad"}
// function modiftyAssigmentsInLocalStorage() {
//   // get the dictionary from local storage
//   const responseDictionaries = loadDictionaries();
//   // iterate over the dictionaries and modify the assignments property
//   for (const key in responseDictionaries) {
//     if (responseDictionaries.hasOwnProperty(key)) {
//       const responseDictionary = responseDictionaries[key];
//       // check if the property "assignments" exists
//       if (responseDictionary.hasOwnProperty("assignments")) {
//         // iterate over the assignments and modify them
//         for (const assignment in responseDictionary.assignments) {
//           if (responseDictionary.assignments.hasOwnProperty(assignment)) {
//             const values = responseDictionary.assignments[assignment];
//             for (let i = 0; i < values.length; i++) {
//               // use mapper to fix the values
//               if (values[i] in mapper) {
//                 values[i] = mapper[values[i]];
//               } else {
//                 console.warn(`Value ${values[i]} not found in mapper.`);
//               }

//             }
//         }
//         // save the modified dictionary back to local storage
//         localStorage.setItem(key, JSON.stringify(responseDictionary));
//       }
//     }
//   }
// }
// }
// print local storage folder address

function groupingsToClusterVector(assignments, categoryList) {
  let dictOfAssignments = {};
  
  // Map group keys to group IDs based on their index in categoryList
  for (const groupKey in assignments) {
    const groupId = categoryList.indexOf(groupKey);
    if (groupId === -1) continue;
    
    const items = assignments[groupKey];
    for (const item of items) {
      dictOfAssignments[item] = groupKey;
    }
  }

  // Sort keys alphabetically and build final vector
  const sortedKeys = Object.keys(dictOfAssignments).sort();
  // store sorted keys in local storage
  localStorage.setItem("sortedKeys", JSON.stringify(sortedKeys));
  const finalVector = sortedKeys.map(key => dictOfAssignments[key]);

  return finalVector;
}


function getCategoryList(assignments) {
//  categoryList is simply all the keys
  const categoryList = Object.keys(assignments);
  return categoryList;
}

function getAllVectors(assigmentList, isSingleSection){
  console.log(assigmentList);
  let categoryList = null;
  const assignments = assigmentList.map(section => getCategoryList(section.response.assignments));
  const unionSet = new Set();
  for (const section of assignments) {
    for (const item of section) {
      unionSet.add(item);
    }
  }
  // convert the set to an array and sort it
  categoryList = Array.from(unionSet).sort();
  console.log("Union of assignments:", categoryList);
  

  // now append each section to the list of vectors
  const allVectors = [];
  for (const section of assigmentList) {
    const assignments = section.response.assignments;
    const groupVector = groupingsToClusterVector(assignments, categoryList);
    allVectors.push(groupVector);
  }
  return allVectors;

}

function getCardsDummy(selectedResponses) {

  // load last sortedKeys from local storage
  const sortedKeys = JSON.parse(localStorage.getItem("sortedKeys"));
  return sortedKeys
}

function verResultados() {

  // use getSelectedResponses to get the selected responses
  const selectedResponses = getSelectedResponses();
  if (selectedResponses.length === 0) {
    alert("No responses selected.");
    return;
  }

  // use getAllVectors to get the vectors of the selected responses
  const selectedVectors = getAllVectors(selectedResponses, true);
  // iterate over the selected vectors and print them in the console
  array = []
  for (let i = 0; i < selectedVectors.length; i++) {
    const vector = selectedVectors[i];
    console.log(`Vector ${i + 1}:`, vector);
    array.push(vector);
  }

  // store array in local storage
  localStorage.setItem("selectedVectors", JSON.stringify(array));
  console.log("Selected vectors stored in local storage:", array);
  cards = getCardsDummy(selectedResponses);
  localStorage.setItem("cards", JSON.stringify(cards));
  console.log("Cards:", cards);
  //  load surveySummary/
  const url = "surveySummary/index.html";
  // open the url in a new tab
  full_url = window.location.origin + "/" + url;
  window.open(full_url, "_blank");

}