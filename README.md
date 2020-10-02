# Snowmakery - Recipe Editor for Snowfakery

[Snowfakery](https://github.com/SFDO-Tooling/Snowfakery) is a tool for generatoring relational data sets. It was created by the Salesforce.org team as [a partial response to a need for better test data](https://www.attain.com/blog/salesforce-open-source-commons) for Salesforce projects. Snowfakery is great, but creating recipe files is a bit hard when you are first learning. This project is meant to help bridge that gap, while experts will probably want to handcraft the files [until better tools come around](https://github.com/SFDO-Community-Sprints/DataGenerationToolkit), this will hopefully help people understand the options as they are getting started.

Snowfakery does not require Salesforce at all, it's a totally free-standing data generator capable to produce large amounts of carefully shaped data quickly. Snowmakery a free-standing Electron app that is simple meant to generate files for Snowfakery.

# Table Of Contents
- [Running](#running)
  - [Setup](#setup)
  - [NPM](#npm)
  - [Electron](#about-electron)
- [Contribute](#contribute)
- [LICENSE](#license)

## Running

Currently this project is in the very initial stages of development and is not fully functional – please feel free to contribute if you think it would be useful. It does not currently have an app builder setup (although that may change).

### Setup
1. Fork the repository by using the button provided on top of the Github repository
2. Clone the repo by using the following command in command prompt/terminal 
```
git clone https://github.com/acrosman/snowmakery.git
```
3. Initialize npm by using the follwoing command and keep pressing enter 
```
npm init
```
4. Run this command from the project root.
```
npm i
```

### NPM
Once NPM has installed all the required packages,load the project.  There is a simple sample Snowfakery recipe in the sample_data directory.
You can load and have a look at the project simply by typing the given command!
```
npm start
```

### About Electron
Electron is an open source library developed by GitHub for building cross-platform desktop applications with HTML, CSS, and JavaScript. Electron accomplishes this by combining Chromium and Node.js into a single runtime and apps can be packaged for Mac, Windows, and Linux.

Find out more at https://www.electronjs.org/docs

## Contribute
After taking a look at the code and the project, you are welcome to make a new Pull Requests or generate an issue in case of any new ideas, bugs or code contribution that you want and is relevant to the project. Just save the file and type the following commands stepwise

### Creating a PR

1. Create a branch
```
git branch new-branch
```
2.Checkout new branch:
```
git checkout new-branch
```
3.Add and commit your changes to the new branch
```
git add .
git commit -m "changes"
```
4. Push these changes 

```git push origin new-branch```

5.Go to your forked repository and press the “New pull request” button.

## Licence
[MIT](./LICENSE)

