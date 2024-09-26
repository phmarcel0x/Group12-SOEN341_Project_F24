![GitHub issues](https://img.shields.io/github/issues/phmarcel0x/Group12-SOEN341_Project_F24)

# Group12-SOEN341_Project_F24
### SOEN 341 Software Process - Team Project Fall 2024 
### A Peer Assessment Application

#### Project Description
This project introduces students to hands-on software development using Agile Scrum methodology. Over a 10-week period, participants will go through four sprints to develop a middle-fidelity prototype, following GitHub for version control and project management. The project focuses on creating a Peer Assessment System for university team projects, allowing students to evaluate their peers based on cooperation, conceptual and practical contributions, and work ethic. The system supports both students and instructors, promoting accountability through anonymous evaluations, score sharing, and an instructor dashboard. The project emphasizes innovation and encourages teams to explore additional users and features.

#### Key Points:
- Project Duration: 10 weeks, divided into 4 Agile Scrum sprints
Objective: Develop a middle-fidelity prototype of a Peer Assessment System
- Users: Students and instructors

#### Features:
- Anonymous student peer evaluation on four dimensions (cooperation, conceptual and practical contributions, work ethic)
- Automated score aggregation and anonymous feedback sharing
- Instructor dashboard for creating teams, viewing peer assessment results, and exporting data

#### Team Members
- Marcelo Pedroza Hernandez - 40200901
- Evelyne Redjebian - 40250996
- Christopher Tan - 40275695
- Yash Dilipkumar Nathani - 40248536
- Tristan Lepage - 40287610
- Fabio Binu Koshy - 40231803


Adding React to an Existing Project

This guide explains how to install and set up React in an existing project. React is a JavaScript library for building user interfaces, and this guide assumes you already have a project with a package manager like npm or yarn.


Prerequisites

Before adding React, ensure you have the following:

1. Node.js installed on your system. You can check by running:
node -v

If not installed, download and install it from Node.js.
2. Package Manager (npm or yarn). You can check npm by running:
npm -v

Alternatively, if you prefer using Yarn, install it by following instructions at Yarn's website.

Step-by-Step Instructions

1. Navigate to Your Project Directory
First, open your terminal and navigate to the root folder of your project:
cd /path/to/your/project

2. Install React and ReactDOM
React requires two packages: react for building components and react-dom for rendering those components to the DOM. Install both by running:

Using npm:
npm install react react-dom

Using yarn:
yarn add react react-dom

3. Create Your First React Component
Now, let’s create a React component to ensure everything is working. Inside your project, create a new file, for example, App.js, and add the following code:

import React from 'react';

const App = () => {
  return (
    <div>
      <h1>Hello, React!</h1>
    </div>
  );
};

export default App;

4. Integrate React with Your Existing Project
Vanilla HTML/JS Setup

If your project is based on vanilla JavaScript (without a build tool like Webpack), you can integrate React using a CDN.

1. Add the following lines to your HTML file within the <head> section:
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>

2. In your HTML file, create a <div> where React will render the component:
<div id="root"></div>

3.In your existing JS file (e.g., index.js), render your React component:
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

With Webpack/Bundlers

If you’re using a build tool like Webpack, Babel, or another bundler, ensure you have the appropriate loader configurations for JSX and JavaScript.

For example, with Babel, install the necessary dependencies:
npm install @babel/core @babel/preset-react babel-loader --save-dev

And add the following to your .babelrc:
{
  "presets": ["@babel/preset-react"]
}

Then, in your entry JS file (e.g., index.js):
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

5. Start the Project
Finally, depending on your project setup, start or build your project to see React in action. If using a bundler like Webpack, run:
npm start

Or if using a simple HTML setup, open your HTML file in the browser, and you should see your React component rendered!


