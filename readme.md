npm run start-dev
===================================================================================================================
===================================================================================================================

The purpose of this project is to build an API, in this case a music store, where all users can Read and search data, but some routes are protected so that staff can log in and Create, Update and Delete content. Authoirzation is dealth with via Auth0. Postman to Create, Update and Delete. Staff can access a secret staff zone and view their profile.

===================================================================================================================
===================================================================================================================

Tier 1 — MVP Application - CRUD and REST
    As a User, I want to read entries from the database ✔️
    As a User, I want to add entries to the database✔️
    As a User, I want to delete entries from the database✔️
    As a User, I want to edit entries in the database✔️
    As a User, I expect to do all of the above by accessing RESTful routes✔️
    As a User, I want to log in to a deployed app. Reference the Deployment section for instructions. 

===================================================================================================================

Tier 2 - Login, Hashing
    As a User, I want to be able to log in to my API ✔️
    As a User, I want any passwords saved to be hashed and salted before saved to the database (note: If you use OAuth, you might not even store passwords at all!) ✔️

===================================================================================================================

Tier 3 - Register
    As a potential User, I want to be able to sign up for the API ✔️
    As a signed-up User, I want to be granted authorization to access the API ✔️

===================================================================================================================

Tier 4 - Authorization
    As a User, I want my API protected from unauthorized Users ✔️
    As an unauthorized User, I want a helpful message telling me I do not have access to the API
    (optional, but recommended):
    As a user, I want to receive a helpful error message anytime there is a problem with the request (i.e. error handling middleware) 
    As a User, I expect not to be able to create new entities without first logging in / authenticating in some way (token/session) ✔️
    As a User, I want my data to only be accessible by myself ✔️
    As a User, I want my data to only be editable/deletable by myself ✔️

===================================================================================================================

Tier 5 - Associated Data
    In addition to the Tier 1 MVP criteria…
    As a User, I want to be able to read a single entry ✔️
    As a User requesting a single entry, I want to see the associated user info and other associated data. For example, if your API is a concert, instead of just the concert, I want to see who created the concert entry, as well as the associated location data, artist info, and attendees coming to the event.

===================================================================================================================

Tier 6 - Admin vs User
    As an Admin, I want to have a special super-user account type that allows access to content Users don’t have access to
    As a basic User, when requesting a list of all entries, I expect to only see my own entries (not entries of other users)
    As an Admin, when requesting a list of all entries, I expect to be able to see all entries, regardless of user/owner
    As an Admin, I want to be able to edit other users’ information via the API
    As an Admin, I want to be able to delete or edit any entity, regardless of user/owner

===================================================================================================================
===================================================================================================================