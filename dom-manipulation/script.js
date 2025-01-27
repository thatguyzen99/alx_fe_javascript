const quotes = [
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Happiness" },
  // Add more quotes here
];

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerText = quote.text;
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
showRandomQuote();

function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value;
  const newQuoteCategory = document.getElementById("newQuoteCategory").value;
  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    showRandomQuote();   // Update the DOM
    saveQuotes();        // Persist data
    populateCategories(); // Update categories
  }
}

function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.innerText = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

function populateCategories() {
  const categories = [...new Set(quotes.map(quote => quote.category))];
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(quote => quote.category === selectedCategory);
  document.getElementById("quoteDisplay").innerText = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)].text;
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes.push(...JSON.parse(storedQuotes));
  }
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'quotes.json';
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  return response.json();
}

function mergeQuotes(serverQuotes, localQuotes) {
  // Simple conflict resolution: server data takes precedence
  const allQuotes = [...serverQuotes];
  const localQuoteMap = new Map(localQuotes.map(quote => [quote.text, quote]));
  serverQuotes.forEach(quote => {
    if (!localQuoteMap.has(quote.text)) {
      allQuotes.push(quote);
    }
  });
  return allQuotes;
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    const mergedQuotes = mergeQuotes(serverQuotes, quotes);
    quotes.length = 0; // Clear current quotes
    quotes.push(...mergedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes synced with server.');
  } catch (error) {
    console.error('Error syncing data with server:', error);
    alert('Failed to sync quotes with server.');
  }
}

function postQuoteToServer(newQuote) {
  // Example function to post a new quote to the server
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newQuote)
  })
  .then(response => response.json())
  .then(data => console.log('Quote posted to server:', data))
  .catch(error => console.error('Error posting quote to server:', error));
}

window.addEventListener("load", () => {
  loadQuotes();
  populateCategories();
  createAddQuoteForm(); // Call the function to create the add quote form
  syncQuotes(); // Sync quotes with server on load
});

setInterval(syncQuotes, 60000); // Sync every 60 seconds
