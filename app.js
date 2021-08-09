/**
 * This is the app.js file for server side data in the Homework Board website.
 * The APIs in the file return all posts or specific posts based on user input.
 * The user can also create new posts and view all the posts of a certain
 * user.
 *
 * All API Definitions
 *
 * *** Endpoint Documentation ***
 * Endpoint: /HBpost/posts
 * Description: Provides all rows from posts in the database file including
 * id, name, post, hashtag, likes, and date.
 * Request Type: GET
 * Response Type: JSON
 * Example Request: /HBpost/posts
 * Example Response:
 * {
 * "posts":[
 *   {
 *     "id": 1,
 *     "name": "Andrew",
 *     "post": "How to do this one?",
 *     "hashtag": "1.2",
 *     "likes": 6,
 *     "date": "2020-07-07 03:48:28"
 *   },
 *   {
 *     "id": 2,
 *     "name": "Matteo Conrin",
 *     "post": "Could you please explain why you used (π/12) as the b-value?",
 *     "hashtag": "2.1",
 *     "likes": 6,
 *     "date": "2020-07-06 00:55:08"
 *   },
 *   ...
 * ]
 *}
 *
 * Error Handling:
 * If the response cannot be returned, responds in text with 500 status:
 * "An error occurred on the server. Try again later".
 *
 * *************************************
 * Endpoint: /HBpost/posts
 * Description: Provides all ids of posts containin a given searched phrase.
 * Request Type: GET
 * Response Type: JSON
 * Example Request: /HBpost/postss?search=if
 * Example Response:
 * {
 * "posts" : [
 *   {
 *     "id": 8
 *   },
 *   {
 *     "id": 24
 *   }
 *  ]
 * }
 * Error Handling:
 * If the response cannot be returned, responds in text with 500 status:
 * "An error occurred on the server. Try again later".
 *
 * *************************************
 * Endpoint: /HBpost/posts/:user
 * Description: Responds with all post data from a specific user.
 * Request Type: GET
 * Response Type: JSON
 * Example Request: /HBpost/posts/Andrew
 * Example Response:
 * [
 *  {
 *   "name": "Andrew",
 *   "post": "How to do this one?",
 *   "hashtag": "1.2",
 *   "date": "2020-07-09 22:26:38",
 * },
 * {
 *   "name": "Andrew",
 *   "post": " Hi y’all, can you please give me feedback on my work,
 *           because I’m kind of still iffy with Taylor polynomials?",
 *   "hashtag": "1.2",
 *   "date": "2019-06-28 23:22:21"
 *  }
 * ]
 *
 * Error Handling:
 * If there are no posts for the given user, responds in text with 400 status:
 * User does not exist.".
 *
 * If the response cannot be returned, responds in text with 500 status:
 * "An error occurred on the server. Try again later".
 *
 * *************************************
 * Endpoint: /HBPost/likes
 * Description: Given a user id, update the likes for a specified user.
 * Request Type: POST
 * Response Type: plain text
 * Example Request: /HBPost/likes
 * Example Response:
 *
 * 8
 *
 * Error Handling:
 * If there is no id for the given user, responds in text with 400 status:
 * "Yikes. ID does not exist.".
 *
 * If a parameter is missing, responds in text with 400 status:
 * "Missing one or more of the required params."
 *
 * If the response cannot be returned, responds in text with 500 status:
 * "An error occurred on the server. Try again later"
 *
 * *************************************
 * Endpoint: /HBPost/new
 * Description: Given the name, post, and hashtag of a newly created post,
 * add the post to the database and respond with the new post data.
 * Request Type: POST
 * Response Type: JSON
 * Example Request: /HBPost/new
 * Example Response:
 *
 * {
 * "id": 528,
 * "name": "Andrew",
 * "post": "I got the absolute max right, but my absolute min was wrong.",
 * "hashtag": "6",
 * "likes": 0,
 * "date": "2021-10-09 17:16:18"
 * }
 *
 * Error Handling:
 * If the name for the given user, is not in the database, responds in text with 400 status:
 * User does not exist.".
 *
 * If a parameter is missing, responds in text with 400 status:
 * "Missing one or more of the required params."
 *
 * If the response cannot be returned, responds in text with 500 status:
 * "An error occurred on the server. Try again later"
 */

 'use strict';
 const express = require('express');
 const multer = require('multer');
 const sqlite3 = require('sqlite3');
 const sqlite = require('sqlite');
 const app = express();

 app.use(express.urlencoded({extended: true})); // for application/x-www-form-urlencoded
 app.use(express.json()); // for application/json
 app.use(multer().none()); // for multipart/form-data (required with FormData)

 /**
  * Respond with all post data from all users or certain users based on a specified search.
  */
 app.get('/HBpost/posts', async function(req, res) {
   let query = req.query["search"];
   const db = await getDBConnection();
   if (!query) {
     try {
       let allpost = await db.all("SELECT id, name, post, hashtag, likes, " +
       "date FROM posts ORDER BY DATETIME(date) DESC;");
       let resultpost = {
         "posts": allpost
       };
       res.json(resultpost);
     } catch (error) {
       res.type("text");
       res.status(500).send("An error occurred on the server. Try again later");
     }
   } else {
     let chooseQuery = await db.all("SELECT id FROM posts WHERE post LIKE '%" + query +
     "%' COLLATE NOCASE;");
     let resultpost = {
       "posts": chooseQuery
     };
     res.json(resultpost);
   }
   await db.close();
 });

 /**
  * Get all post data for a requested user and respond with this information.
  */
 app.get("/HBPost/user/:user", async function(req, res) {
   let selectUser = req.params["user"];
   const db = await getDBConnection();
   let checkUser = await checkExists(selectUser);
   if (checkUser) {
     try {
       let userposts = await db.all("SELECT name, post, hashtag, date FROM posts WHERE name LIKE '%" +
       selectUser + "%' ORDER BY DATETIME(date) DESC;");
       res.json(userposts);
     } catch (error) {
       res.type("text");
       res.status(500).send("An error occurred on the server. Try again later");
     }
   } else {
     res.type("text");
     res.status(400).send("User does not exist.");
   }
   await db.close();
 });

 /**
  * Update amount of likes based on a requested id and respond with the
  * new amount of likes.
  */
 app.post("/HBPost/likes", async function(req, res) {
   let id = parseInt(req.body.id);
   const db = await getDBConnection();
   let checkId = await checkExistsId(id);
   if (!id) {
     res.status(400).send("Missing one or more of the required params.");
   }
   if (checkId) {
     try {
       let currentLikes = await db.all("SELECT likes FROM posts WHERE id = " + id + ";");
       let newLikes = currentLikes[0].likes + 1;
       await db.run("UPDATE posts SET likes = ? WHERE id = ?", newLikes, id);
       let sendLikes = String(newLikes);
       res.type("text").send(sendLikes);
     } catch (error) {
       res.type("text");
       res.status(500).send("An error occurred on the server. Try again later");
     }
   } else {
     res.type("text");
     res.status(400).send("ID does not exist.");
   }
   await db.close();
 });

 /**
  * Post a new post given name and post parameters. Save new post to the database
  * and respond with the new data for the post post.
  */
 app.post("/HBPost/new", async function(req, res) {
   let name = req.body.name;
   let full = req.body.full;
   let splitFull = full.split("#");
   let post = splitFull[0].trim();
   let hashtag = splitFull[1].trim();
   let likes = 0;
   const db = await getDBConnection();
   let checkUser = await checkExists(name);
   if (!name || !full) {
     return res.status(400).send("Missing one or more of the required params.");
   }
   if (checkUser) {
     try {
       const qry = 'INSERT into posts ("name", "post", "hashtag", "likes")' +
        ' VALUES ($name, $post, $hashtag, $likes);';
       let newPost = await db.run(qry, {$name: name, $post: post, $hashtag: hashtag, $likes: likes});
       let test = await processpost(newPost);
       res.json(test);
     } catch (error) {
       res.type("text");
       res.status(500).send("An error occurred on the server. Try again later");
     }
   } else {
     res.type("text");
     res.status(400).send("User does not exist.");
   }
   await db.close();
 });

 /**
  * Takes the lastID and creates a new post post.
  * @param {object} newPost - contains lastID of a new post.
  * @returns {object} - JSON fromatted new post post.
  */
 async function processpost(newPost) {
   const db = await getDBConnection();
   try {
     let currentPost = await db.all("SELECT id, name, post, hashtag, " +
     "likes, date FROM posts WHERE id = ?", newPost.lastID);
     let result = {
       "id": newPost.lastID,
       "name": currentPost[0].name,
       "post": currentPost[0].post,
       "hashtag": currentPost[0]['hashtag'],
       "likes": currentPost[0].likes,
       "date": currentPost[0]['date']
     };
     await db.close();
     return result;
   } catch (error) {
     await db.close();
     return "An error occurred on the server. Try again later";
   }
 }

 /**
  * Given a name, check if the user exists.
  * @param {String} selected - a given name.
  * @return {boolean} true if a user exists, false if not.
  */
 async function checkExists(selected) {
   const db = await getDBConnection();
   let checkExist = await db.all("SELECT EXISTS(SELECT 1 FROM posts WHERE name = '" +
   selected + "')[exist];");
   let checkUser = checkExist[0].exist;
   await db.close();
   if (checkUser === 1) {
     return true;
   }
   return false;
 }

 /**
  * Given an id, check if the user exists.
  * @param {Number} selected - a given id.
  * @return {boolean} true if a user exists, false if not.
  */
 async function checkExistsId(selected) {
   const db = await getDBConnection();
   let checkExist = await db.all("SELECT EXISTS(SELECT 1 FROM posts WHERE id = " +
   selected + ")[exist];");
   let checkUser = checkExist[0].exist;
   await db.close();
   if (checkUser === 1) {
     return true;
   }
   return false;
 }

 /**
  * Establishes a database connection to the website database and returns the database object.
  * Any errors that occurs should be caught in the function that calls this one.
  * @returns {Object} - The database object for the connection.
  */
 async function getDBConnection() {
   const db = await sqlite.open({
     filename: 'HB.db',
     driver: sqlite3.Database
   });
   return db;
 }

 app.use(express.static('public'));
 const PORT = process.env.PORT || 8080;
 app.listen(PORT);