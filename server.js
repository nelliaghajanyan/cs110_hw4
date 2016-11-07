'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

const todos = [
    {
        id : Math.random(),
        message : 'Finish the code',
        completed: false
    },{
        id : Math.random(),
        message : 'Review Calc',
        completed: false
    },{
        id : Math.random(),
        message : 'Eat lunch',
        completed: false
    }
];

const server = http.createServer((req, res) => {
    
    const reqURL = req.url;
    const query = url.parse(reqURL, true).query;
    
    //console.info(reqURL);
    
    if (reqURL === '' || reqURL === '/') {
        res.writeHead(302,  {Location: '/public/index.html'});
        res.end();

    } else if (reqURL.includes('getTODOs')) {
        let searchString = query.searchString;
        let todos_ = todos;
        if (searchString) {
            searchString = searchString.toLowerCase();
            todos_ = todos.filter(function(todo) {
                return (todo.message.toLowerCase().indexOf(searchString) >= 0);
            });
        }
        sendJsonData(res, todos_);

    } else if (reqURL.includes('removeTODO')) {
        let id = query.id;
        for (let i = 0; i < todos.length; i++) {
            let todo = todos[i];
            if (todo.id == id) {
                todos.splice(i, 1);
                break;
            }
        }
        sendJsonData(res, {id: id});

    } else if (reqURL.includes('addTODO')) {
        let message = query.message;
        let todoExist = false;
        for (let i = 0; i < todos.length; i++) {
            let todo = todos[i];
            if (todo.message.toLowerCase() === message.toLowerCase()) {
                todoExist = true;
                break;
            }
        }
        if (!todoExist) {
            let todo = {id: Math.random(), message: message, completed: false};
            todos.push(todo);
            sendJsonData(res, todo);
        } else {
            sendJsonData(res, {exist: true});
        }
        
    } else if (reqURL.includes('markTODO')) {
        let id = query.id;
        let completed = (query.completed === 'true');
        for (let i = 0; i < todos.length; i++) {
            let todo = todos[i];
            if (todo.id == id) {
                todo.completed = completed;
                break;
            }
        }
        sendJsonData(res, {id: id, completed: completed});
        
    } else {
        sendFileData(res, reqURL);
    }
});

const sendJsonData = function(res, data) {
    let dataString = (data ? JSON.stringify(data) : {});
    res.writeHead(200, {'Content-Type': 'application/json', 'Content-Length': dataString.length});
    res.write(dataString);
    res.end();
}

const sendFileData = function(res, path) {
    fs.readFile(('.'+path), function(err, data) {
        if (err) {
            res.writeHead(404);
        } else {
            res.writeHead(200, {'Content-Type': getContentType(path), 'Content-Length': data.length});
            res.write(data);
        }
        res.end();
    });
}

const getContentType = function(path) {
    const k = path.lastIndexOf('.');
    if (k > 0) {
        const extension = path.substring(k+1);
        if (extension === 'js') {
            return 'text/javascript';
        } else if (extension === 'css') {
            return 'text/css';
        } else if (extension === 'png') {
            return 'image/png';
        } else if (extension === 'html') {
            return 'text/html';
        } else if (extension === 'json') {
            return 'application/json';
        }
    }
    return 'text/plain';
}

server.listen(port, hostname, () => {
    console.log(`Server running at http:// ${hostname}:${port}/`);
});