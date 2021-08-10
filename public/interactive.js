/**
 * This is the javascript file to add user interactivity to the social media website.
 * Use of fetch calls to create Homework Board, a social media site
 * for students where users can view the posts of others and create their own
 * questions. Users have the functionality to filter their search and like other
 * posts as well.
 */

"use strict";
(function() {

  window.addEventListener("load", init);

  /**
   * Initialize all posts on the home screen and the search, home, and post buttons.
   */
  function init() {
    getPosts();
    id("search-term").addEventListener("input", toggleSearch);
    id("search-btn").addEventListener("click", toggleView);
    id("home-btn").addEventListener("click", homeButton);
    qs("form").addEventListener("submit", function(e) {
      e.preventDefault();
      setTimeout(() => {
        homeView();
      }, 2000);
    });
    id("post-btn").addEventListener("click", newPost);
  }

  /**
   * Set individual card event listeners
   */
  function setIndividuals() {
    let allIndividuals = qsa("p.individual");
    let hearts = id("home").children;
    for (let i = 0; i < allIndividuals.length; i++) {
      allIndividuals[i].addEventListener("click", individualView);
      hearts[i].children[2].children[1].children[0].addEventListener("click", updateLikes);
    }
  }

  /**
   * Disable and enable the search button.
   */
  function toggleSearch() {
    let searchTerm = id("search-term").value;
    searchTerm = searchTerm.trim();
    if (searchTerm === "") {
      id("search-btn").disabled = true;
    } else {
      id("search-btn").disabled = false;
    }
  }

  /**
   * Begin call to filter all cards for those containing a specific word/query.
   */
  function toggleView() {
    id("search-btn").disabled = true;
    showHome();
    showAll();
    getPosts();
  }

  /**
   * Show the home view only.
   */
  function showHome() {
    id("home").classList.remove("hidden");
    id("user").classList.add("hidden");
    id("new").classList.add("hidden");
  }

  /**
   * Toggle the home view and reset the search term.
   */
  function homeView() {
    showHome();
    id("search-term").value = "";
    toggleSearch();
  }

  /**
   * Initialize all posts on the page or fitler posts based on a given search term/phrase.
   */
  function getPosts() {
    let searchTerm = id("search-term").value;
    let query = "/HBpost/posts";
    if (searchTerm.trim() !== "") {
      query = "/HBpost/posts?search=" + searchTerm.trim();
    }
    id("search-term").value = "";
    fetch(query)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(processPosts)
      .catch(handleError);
  }

  /**
   * Create cards of post data for each user or with a matching search term/phrase.
   * @param {object} response - The JSON formatted user data.
   */
  function processPosts(response) {
    response = response.posts;
    let postArray = [];
    let searchCards = id("home").children;
    for (let i = 0; i < response.length; i++) {
      postArray.push(String(response[i].id));
    }
    if (searchCards.length < response.length) {
      formCard(response);
    } else {
      for (let i = 0; i < searchCards.length; i++) {
        if (!postArray.includes(searchCards[i].id)) {
          searchCards[i].classList.add("hidden");
        }
      }
    }
    setIndividuals();
  }

  /**
   * Create cards for posts of all users in the database.
   * @param {object} response - given post data from the database.
   */
  function formCard(response) {
    for (let i = 0; i < response.length; i++) {
      let newCard = gen("article");
      newCard.classList.add("card");
      newCard.id = response[i].id;
      id("home").appendChild(newCard);

      let cardImg = gen("img");
      let cardDiv = gen("div");
      let cardMeta = gen("div");
      cardMeta.classList.add("meta");

      addCardImg(response[i], cardImg);
      addCardDiv(response[i], cardDiv);
      addCardMeta(response[i], cardMeta);

      newCard.appendChild(cardImg);
      newCard.appendChild(cardDiv);
      newCard.appendChild(cardMeta);
    }
  }

  /**
   * Add a profile picture to each post card.
   * @param {object} response - data for a specific post card.
   * @param {object} cardImg - profile picture placeholder.
   */
  function addCardImg(response, cardImg) {
    let imgSrc = response.name;
    imgSrc = imgSrc.replace(/\s+/g, '-').toLowerCase();
    cardImg.src = "img/" + imgSrc + ".png";
    cardImg.alt = imgSrc;
  }

  /**
   * Add content to each post card including post and hashtag.
   * @param {object} response - data for a specific post card.
   * @param {object} cardDiv - placeholder for a post and hashtag.
   */
  function addCardDiv(response, cardDiv) {
    let nameP = gen("p");
    nameP.classList.add("individual");
    nameP.textContent = response.name;
    let postP = gen("p");
    postP.textContent = response.post + " #" + response.hashtag;
    cardDiv.appendChild(nameP);
    cardDiv.appendChild(postP);
  }

  /**
   * Add date and likes to each post card.
   * @param {object} response - data for a specific post card.
   * @param {object} cardMeta - placeholder for like count and date.
   */
  function addCardMeta(response, cardMeta) {
    let metaP = gen("p");
    let date = new Date(response.date);
    let result = date.toLocaleString();
    metaP.textContent = result;
    cardMeta.appendChild(metaP);
    let metaDiv = gen("div");

    let metaDivImg = gen("img");
    metaDivImg.src = "img/heart.jpg";
    metaDivImg.alt = "heart";
    metaDiv.appendChild(metaDivImg);
    let metaDivP = gen("p");
    metaDivP.textContent = response.likes;
    metaDiv.appendChild(metaDivP);
    cardMeta.appendChild(metaDiv);
  }

  /**
   * Set the home view and display all post cards.
   */
  function homeButton() {
    homeView();
    showAll();
  }

  /**
   * Show all post cards.
   */
  function showAll() {
    let articleCards = id("home").children;
    for (let i = 0; i < articleCards.length; i++) {
      articleCards[i].classList.remove("hidden");
    }
  }

  /**
   * Reset view of individual post and show all the post of a
   * specific user.
   */
  function individualView() {
    if (id("user").children.length > 0) {
      let removeChildren = id("user").children;
      for (let i = 0; i < removeChildren.length; i++) {
        removeChildren[i].remove();
      }
    }
    id("home").classList.add("hidden");
    id("new").classList.add("hidden");
    id("user").classList.remove("hidden");
    let user = this.textContent;
    fetch("/HBPost/user/" + user)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(processIndividual)
      .catch(handleError);
  }

  /**
   * Process all individual posts from a clicked user and show them on the webpage.
   * @param {object} response - all posts from a specified user.
   */
  function processIndividual(response) {
    let container = gen("article");
    container.classList.add("single");
    let header = gen("h2");
    header.textContent = "Posts shared by " + response[0].name + ":";
    container.appendChild(header);
    for (let i = 0; i < response.length; i++) {
      let postPara = gen("p");
      postPara.textContent = "Post " + (i + 1) + ": " + response[i].post + " #" + response[i].hashtag;
      container.appendChild(postPara);
      id("user").appendChild(container);
    }
  }

  /**
   * Increment the like count of a post card when heart is clicked.
   */
  function updateLikes() {
    let paramId = this.parentElement.parentElement.parentNode.id;
    let likes = this;
    let params = new FormData();
    params.append("id", paramId);
    fetch("/HBPost/likes", {method: "POST", body: params})
      .then(checkStatus)
      .then(resp => resp.text())
      .then(function(response) {
        processLikes(response, likes);
      })
      .catch(handleError);
  }

  /**
   * Update the like count of a post.
   * @param {object} response - The given like count.
   * @param {object} newLikes - heart image placeholder.
   */
  function processLikes(response, newLikes) {
    newLikes.nextSibling.textContent = response;
  }

  /**
   * Add click functionality to the post button and show the create new post view.
   */
  function newPost() {
    id("search-term").value = "";
    id("search-btn").disabled = true;
    showAll();
    id("user").classList.add("hidden");
    id("home").classList.add("hidden");
    id("new").classList.remove("hidden");
    let submit = qs("form").children[4];
    submit.addEventListener("click", createpost);
    id("name").value = "";
    id("post-box").value = "";
  }

  /**
   * Send new name, post, and hashtag to be preserved in the server.
   */
  function createpost() {
    let params = new FormData();
    let name = id("name").value;
    let full = id("post-box").value;
    params.append("name", name);
    params.append("full", full);
    fetch("/HBPost/new", {method: "POST", body: params})
      .then(checkStatus)
      .then(resp => resp.json())
      .then(processNew)
      .catch(handleError);
  }

  /**
   * Create a card for a newly created posts.
   * @param {object} response - new card post data
   */
  function processNew(response) {
    let newCard = gen("article");
    newCard.classList.add("card");
    newCard.id = response.id;
    id("home").appendChild(newCard);

    let cardImg = gen("img");
    let cardDiv = gen("div");
    let cardMeta = gen("div");
    cardMeta.classList.add("meta");
    addCardImg(response, cardImg);
    addCardDiv(response, cardDiv);
    addCardMeta(response, cardMeta);

    newCard.appendChild(cardImg);
    newCard.appendChild(cardDiv);
    newCard.appendChild(cardMeta);
    setIndividuals();
    id("home").prepend(newCard);
  }

  /**
   * This function is called when an error occurs in the fetch call chain.
   * Displays an error message on the page.
   */
  function handleError() {
    id("student-data").classList.add("hidden");
    id("error").classList.remove("hidden");
    id("search-btn").disabled = true;
    id("home-btn").disabled = true;
    id("post-btn").disabled = true;
  }

  /** ------------------------------ Helper Functions  ------------------------------ */
  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} selector - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function checkStatus(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

})();