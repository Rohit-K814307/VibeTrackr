<div id="top">

<div align="center"><img src="https://github.com/Rohit-K814307/VibeTrackr/blob/main/vibetrackr/frontend/public/logo.svg" width="10%"  alt="VibeTrackr Logo"/></div>

<div align="center" style="position: relative; width: 100%; height: 100%; ">

# VIBETRACKR

<em><em>

<!-- BADGES -->
<img src="https://img.shields.io/github/license/Rohit-K814307/VibeTrackr?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
<img src="https://img.shields.io/github/last-commit/Rohit-K814307/VibeTrackr?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/Rohit-K814307/VibeTrackr?style=default&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/Rohit-K814307/VibeTrackr?style=default&color=0080ff" alt="repo-language-count">

</div>
</div>
<br clear="right">

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
	- [Useful Links + Information](#useful-links--information)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

A modern mental health companion built to help you journal, analyze your emotions, get tailored Spotify music recommendations, and receive thoughtful AI guidance—all in one place.

### Useful Links + Information

#### LIVE Link

The fully functional, production project is available at [https://vibetrackr.netlify.app](https://vibetrackr.netlify.app).

#### BERT Model for Emotion Analytics

This project uses several API connections. We fine tune a BERT model + regression head for determining the psychoemotional values of Valence, Emotion, and Dominance in order to run emotion analytics. Access the [HuggingFace Repo](https://huggingface.co/RobroKools/vad-bert) for model information and data. Access the [HuggingFace Space and Gradio API](https://huggingface.co/spaces/RobroKools/vad-emotion) to get emotion analytics for your use case.

#### Emotion Insights Dashboard

Users can see their emotion analytics for journals over time. Take a look at a couple of the analytics users are given:

![image](https://drive.google.com/uc?export=view&id=1VlFXE5AoVDZXlnzs4FH_Z6zCYcS63WXz)
Here are some evaluation metrics of the model on the test set:
<div align="center">

| Metric        | Value   |
|---------------|---------|
| Test RMSE     | 0.2054  |
| Test MAE      | 0.1566  |
| Test R<sup>2</sup> Score | 0.3771  |

</div>

---

## Features

- 🎯 **Emotion-Aware Journaling**: Journal your thoughts and receive real-time emotional analysis using a fine-tuned BERT model.

- 🎵 **Spotify-Powered Music Recommendations**: Get personalized Spotify tracks tailored to your emotional state.

- 🤖 **AI Mentor Support**: Receive insightful, friendly guidance from an AI assistant trained to respond to your moods and journal entries.

- 📊 **Emotional Analytics Dashboard**: Visualize trends over time with clean, interactive graphs for Valence, Arousal, and Dominance metrics.

- 🔒 **Secure Auth with Firebase**: Authenticate and manage users using Firebase Authentication.

- 📁 **Modern Frontend Stack**: Built with React + TypeScript and Vite for a lightning-fast user interface.

- ⚙️ **Robust Backend**: Python-based API endpoints manage journaling, ML inference, and user data.

- 🌐 **Live & Deployed**: Fully hosted on Netlify with backend API integrated for seamless use.

- 🧠 **Open Source ML Integration**: Easily connect with the hosted Hugging Face VAD-BERT model via Gradio API.

---

## Project Structure

```sh
└── VibeTrackr/
    ├── License
    └── vibetrackr
        ├── backend
        │   ├── app.py
        │   ├── database
        │   │   ├── __init__.py
        │   │   └── dbsetup.py
        │   ├── requirements.txt
        │   └── utils
        │       ├── __init__.py
        │       ├── llms
        │       │   ├── __init__.py
        │       │   ├── prompts.py
        │       │   └── query.py
        │       └── ml
        │           ├── __init__.py
        │           ├── emotions.py
        │           ├── fine_tune.ipynb
        │           └── query_api_bert.py
        └── frontend
            ├── .gitignore
            ├── README.md
            ├── components.json
            ├── eslint.config.js
            ├── index.html
            ├── package-lock.json
            ├── package.json
            ├── public
            │   ├── _redirects
            │   ├── logo.svg
            │   ├── logo_text.svg
            │   └── vite.svg
            ├── src
            │   ├── App.css
            │   ├── App.tsx
            │   ├── assets
            │   │   └── react.svg
            │   ├── components
            │   │   ├── AIMentor
            │   │   ├── CTA
            │   │   ├── Dash
            │   │   ├── Features
            │   │   ├── Footer
            │   │   ├── Hero
            │   │   ├── HowItWorks
            │   │   ├── Navbar
            │   │   ├── ProtectedRoute
            │   │   ├── SignOutButton
            │   │   ├── Spinner
            │   │   ├── WhyJournal
            │   │   ├── charts
            │   │   ├── index.ts
            │   │   └── ui
            │   ├── firebase.ts
            │   ├── hooks
            │   │   └── use-mobile.ts
            │   ├── index.css
            │   ├── lib
            │   │   └── utils.ts
            │   ├── main.tsx
            │   ├── pages
            │   │   ├── Insights
            │   │   ├── Landing
            │   │   ├── Overview
            │   │   ├── SignIn
            │   │   ├── SignUp
            │   │   └── index.ts
            │   ├── types
            │   │   └── journal.ts
            │   ├── utils
            │   │   ├── fetchWithRetry.ts
            │   │   └── index.ts
            │   └── vite-env.d.ts
            ├── tsconfig.app.json
            ├── tsconfig.json
            ├── tsconfig.node.json
            └── vite.config.ts
```

## Getting Started

### Prerequisites

This project requires the following dependencies:

- **Programming Language:** TypeScript, Python
- **Package Manager:** Npm, Pip

### Installation

Build VibeTrackr from the source and intsall dependencies:

1. **Clone the repository:**

    ```sh
    ❯ git clone https://github.com/Rohit-K814307/VibeTrackr
    ```

2. **Navigate to the project directory:**

    ```sh
    ❯ cd VibeTrackr
    ```

3. **Install the dependencies:**

	```sh
	❯ cd vibetrackr/frontend && npm install
	```

	```sh
	❯ cd vibetrackr/backend && pip install -r requirements.txt
	```

### Usage

Run the project with:

**Frontend Using [npm](https://www.npmjs.com/):**
```sh
cd vibetrackr/frontend && npm run dev
```
**Backend Using [](None):**
```sh
cd vibetrackr/backend && python app.py
```

---

## Roadmap

- [X] **`Task 1`**: <strike>Complete Backend</strike>
- [X] **`Task 2`**: <strike>Complete Frontend</strike>.
- [X] **`Task 3`**: <strike>Deploy Application</strike>.

---

## Contributing

- **💬 [Join the Discussions](https://github.com/Rohit-K814307/VibeTrackr/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/Rohit-K814307/VibeTrackr/issues)**: Submit bugs found or log feature requests for the `VibeTrackr` project.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/Rohit-K814307/VibeTrackr
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/Rohit-K814307/VibeTrackr/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=Rohit-K814307/VibeTrackr">
   </a>
</p>
</details>

---

## License

Vibetrackr is protected under the [MIT](https://opensource.org/license/mit) License. For more details, refer to the [LICENSE](https://github.com/Rohit-K814307/VibeTrackr/blob/main/License) file.

<div align="right">

[![][back-to-top]](#top)

</div>


[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square


---
