# KITAB explore 

A web portal for the [KITAB project](https://kitab-project.org).

The portal gives access to the [OpenITI corpus](https://openiti.org/projects/OpenITI%20Corpus.html) metadata 
and the [KITAB](https://kitab-project.org) text reuse data and visualisations.

The website is live at https://kitab-project.org/explore

![Kitab Logo](public/logo192.png) 

## Features

- **Extensive Collection:** Browse through a vast repository of historical Arabic books from the OpenITI corpus.
- **Metata Search Functionality:** Search for specific works by author, title and other metadata.
- **Explore Text Reuse Data:** visualize the text reuse relations between two books, or between one book and all other books in the corpus.
- **Download:** Download OpenITI text files and KITAB text reuse data.

## Branches:
* **main** is the production branch, and served on GitHub pages (with alias https://kitab-project.org/explore)
* **dev** is the main development branch, from which individual feature branches should be created
* **uat** ("Unit Acceptance Testing") is the staging branch; whenever something is pushed to uat, 
  a [GitHub Actions script](https://github.com/kitab-project-org/explore/blob/uat/.github/workflows/azure-static-web-apps-witty-bay-0dafe9a10.yml) 
  builds the stable website and deploys to a test website on Azure (https://witty-bay-0dafe9a10.4.azurestaticapps.net/)

## Git Workflow for contributors
NB: we use a forking workflow so you can test the GitHub Pages deployment on your own GitHub Pages site

The aim is to create small, short-lived feature branches, and have the main branch continuously updated.

* (only the first time):
  - Fork the repo https://github.com/kitab-project-org/explore/ on GitHub
  - clone your fork to your local machine: `git clone https://github.com/<yourGithubUserName>/explore.git`
  - create the connection to the original repo - call it "upstream": `git remote add upstream https://github.com/kitab-project-org/explore.git` 
    if you run the command `git remote -v` now, it should show the remote branch in addition to "origin" - your fork
* Create a feature branch based on the dev branch of the original repo:
  ```
  git fetch upstream
  git checkout -b <branchName> upstream/dev
  ```
* (do development work, add and commit changes, test locally)
* Push the changes to your fork: `git push origin <branchName>`
* Stage a test instance of the app on your fork's GitHub pages or the Azure staging website (see below)
* Create a pull request ([here](https://github.com/kitab-project-org/explore/compare)) from your feature branch on your fork 
  to the dev branch on kitab-project-org (click "compare across forks" if your fork does not appear)
  - include a link to your staged instance
  - assign a reviewer
* Reviewer thoroughly reviews the pull request and the staged website and communicates with the author about changes needed:
  - test the new feature
  - check whether the main functionality still works (this kind of check should be automated) - see the pull request template
* Reviewer accepts the pull request
* Reviewer pulls the changes to main
* Reviewer deploys the main branch by running the GitHub Actions script (see below)
* Delete your feature branch to keep the repo clean

## Testing whether the app works: 
* Locally (for testing the dynamic app): 
  - In VSCode: run `npm ci` (only the first time), then `npm start` in the terminal; the website should now be served on http://localhost:8080
* On your own branch's GitHub Pages (for testing the static website):
  - NB: this only works if your GitHub username is whitelisted in the API repo (Masoumeh's, Mathew's, Peter's and Sohail's GitHub usernames are all whitelisted)
  - In the fork on your GitHub page, go to Actions, and choose "Deploy to Github Pages from current branch" in the left-hand column
  - Then, click the "Run workflow" button, choose the name of your feature branch, and click the green "Run workflow" button
  - (only the first time: go to the Settings of your GitHub pages fork, choose "Pages", and in the "Branch" section under "Build and deployment", set the branch to "gh-pages" and the folder to "/ (root)".)
  - The website should now be deployed to https://\<yourGithubUserName\>.github.io/explore
* On an azure server:
  - Pull the changes into the **uat** branch; this will automatically build the static pages and deploy them to an azure page: https://witty-bay-0dafe9a10.4.azurestaticapps.net/

## Deploying the app to https://kitab-project.org/explore :
* Test the deployment as described above
* Pull changes to the main branch
* In the kitab-project-org GitHub page, go to [Actions](https://github.com/kitab-project-org/explore/actions), and choose "Deploy to Github Pages from current branch" in the left-hand column
* Click the "Run workflow" button, select the "main" branch from the dropdown, and click the green "Run workflow" button


## Contributing

We welcome contributions to enhance the library and improve its features. If you would like to contribute, contact the KITAB team.

## Issues

If you encounter any issues or have suggestions, please open an issue. We appreciate your feedback!
License - https://github.com/kitab-project-org/explore/issues/new

This project is licensed under the MIT License.

## End
