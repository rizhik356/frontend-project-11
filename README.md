### Hexlet tests and linter status:
[![Actions Status](https://github.com/rizhik356/frontend-project-11/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/rizhik356/frontend-project-11/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/9acd4977297137b9f106/maintainability)](https://codeclimate.com/github/rizhik356/frontend-project-11/maintainability)
[![build-check](https://github.com/rizhik356/frontend-project-11/actions/workflows/build-check.yml/badge.svg)](https://github.com/rizhik356/frontend-project-11/actions/workflows/build-check.yml)

## RSSReader

* [Description](#Description)
* [Install](#Install)
* [Develop](#Develop)
* [Product](#Product)
* [Demonstration](#Demonstration)
* [Used stack](#Stack)

<a name="Description"><h2>Description</h2></a>
This web application is a service for aggregating RSS feeds, which makes it convenient to read various sources, such as blogs. It allows adding an unlimited number of RSS feeds, updates them automatically, and adds new entries to the general stream. In case of loss of internet connection with any of the feeds, the application continues to function and loads missing and new RSS feeds upon resumption. If there are any problems with adding a new RSS feed, the application will indicate an error. If there are issues with accessing previously added feeds, the application will highlight them in red and add a spinner to indicate attempts to establish a connection with the feed.

 <a name="Install"><h2>Installation</h2></a>
 ```bash
make install
```
 <a name="Develop"><h2>Development</h2></a>
 ```bash
make develop
```

 <a name="Product"><h2>Production</h2></a>
 ```bash
make build
```

 <a name="Demonstration"><h2>Demonstration</h2></a> 
https://frontend-project-11-alpha-ten.vercel.app


 <a name="Stack"><h2>Used stack</h2></a> 
* JavaScript
* HTML
* Axios
* On-change
* GitHub Actions (CI)
* ESLint
* Bootstrap
* I18next
* Yup
* Webpack

