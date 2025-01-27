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
    showRandomQuote();
    saveQuotes();
    populateCategories();
  }
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

window.addEventListener("load", () => {
  loadQuotes();
  populateCategories();
});

async function syncDataWithServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverQuotes = await response.json();
    const mergedQuotes = mergeQuotes(serverQuotes, quotes);
    quotes.length = 0; // Clear current quotes
    quotes.push(...mergedQuotes);
    saveQuotes();
  } catch (error) {
    console.error('Error syncing data with server:', error);
  }
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

setInterval(syncDataWithServer, 60000); // Sync every 60 seconds
