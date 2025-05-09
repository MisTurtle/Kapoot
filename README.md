# Kapoot - Quizz App

**Kapoot** was created as a small project during our 4th year at the Polytech Angers Enginnering School. It serves as a remake of the first version made in one week a few years back to get rid of user limitations enforced by [Kahoot!](https://kahoot.it/).

A hosted version of this repository is available at [https://kapoot.misturtle.fr](https://kapoot.misturtle.fr).

# Table of contents
<!-- TOC -->

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Improvements](#improvements)

<!-- /TOC -->

## Features

Although not as complete as we'd hoped it to be by the end of the project sessions, we have still managed to implement quite a few interesting features:

- **Secure** (salted) **account system** ([``/src/server/utils/security.ts``](/src/server/utils/security.ts))
- **Intuitive quizz editor** with question reordering, styling coherence, context menus and much more:
![Screenshot of the quizz editor page](/captures/Editor.png)
- **Live quizz rooms** for players to compete in real time on leaderboards (with a chatbox and emotes):
![Screenshot of a game lobby after showing a question's results](/captures/GameRoom.png)
- Support for both **logged** and **anonymous** players, focusing the experience on playability.
- **Stats tracking** for logged-in players (Games played, points earned):
![/captures/Account.png](/captures/Account.png)
- Convenient **rejoining system** to allow players that inadvertently closed the website to join their games back.
- Support for both **SQLite** and **MySQL** database setups, easily switchable from the [``mysql_host.json``](/mysql_host.json) config file.

## Tech Stack

This solution is powered by **NextJS**, a **ReactJS framework** allowing to easily manage pages in the project by simply adding them to the [``/pages``](/pages/) folder. It handles rendering on the client side and communicates with the **Express** backend server. In production, it optimizes pages into blocks to improve server response times. It also automatically forwards public files stored in [``/public``](/public/). Reusable components are written in the [``/components``](/components/) folder, and contexts (providers that stay instantiated between pages) are in the [``/contexts``](/contexts/) directory.

We've decided to use **Express** as the backend instead of NextJS because we weren't sure we would be able to implement **WebSockets** (required for live games) properly otherwise. It enabled us to use express extensions like ``express-session`` to keep users connected using session cookies and ``express-ws`` for websockets. 

Account passwords are secured using a salted hashing method thanks to bcrypt, which basically performs hashes passwords multiple (40) times to enhance security. The system could be improved by introducing a first hash pass on the client side before being sent to the server. 

Finally, our styling is done through **SCSS** to allow for a better stylesheet organization with class extensions, less boilerplate with style nesting, and global variables for style coherence accross the whole website. 

## Installation

To run your own version of Kapoot, you can quickly get started by:

1. **Clone the repository** to your machine
```bash
git clone https://github.com/MisTurtle/Kapoot.git
```

2. **Open a terminal** in the root directory of the newly created folder.
```bash
cd /path/to/this/folder
```

3. **Run it locally**

    a. **Install NodeJS packages**. You need NodeJS and NPM installed. This solution was tested for ``node v23.x.x`` and ``npm v10.9.2``.

    ```bash
    npm i
    ```

    b. **Run** in development or production mode
    ```bash
    npm run dev  # For development
    npm run prod  # For production
    ```

4. **Deploy with docker**

    If you have Docker installed, you can quickly deploy the app in an isolated container with:
    ```bash
    docker-compose -f "docker-compose.dev.yml" up --build  # For development
    docker-compose up --build  # For production
    ```


## Improvements

With the limited time and other projects to work on in parallel, we did not manage to get as far as we'd have liked with **Kapoot**.

Here are the main points that we'd like to address in the future:

1. **WebSockets**
In development mode, there seems to be some conflicts between our websocket system and NextJS's WS server for hot reloads. We have tried extensively to come up with a solution to this problem, but did not manage to find any that solved it.

2. **Mailer**
For the moment being, there's no way for users to recover their account should they loose access to it. This problem could easily be tackled with a NodeJS package like [NodeMailer](https://www.npmjs.com/package/nodemailer).

3. **Points system**
There's currently no option to add weights to questions, or to customize the points decay rate in the quizz editor. It would definitely be a cool feature to have.

4. **Avatars**
Although anonymous users can customize their nicknames, adding a support for randomly generated avatars (a system similar to [Gartic Phone](https://garticphone.com/) for example) would add some fun to the lobbies.

5. **More question types and customizations**
We were aiming to implement a lot more types of questions (Multiple choices, open questions, word clouds, fill the dots, ...), but due to time constraints, we had to focus on simple one choice questions (still with any amount of answers between 1 and 4). We would also like to implement themes, music, sound effects, events, ...
