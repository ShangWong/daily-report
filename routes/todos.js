'use strict';
var request = require('request');
var router = require('express').Router();
var AV = require('leanengine');

var Todo = AV.Object.extend('Todo');
var Task = AV.Object.extend('Task');

var token = '';

// 查询 Todo 列表
router.get('/', function(req, res, next) {
  var query = new AV.Query(Todo);
  query.descending('createdAt');
  query.find().then(function(results) {
    res.render('todos', {
      title: 'TODO 列表',
      todos: results
    });
  }, function(err) {
    if (err.code === 101) {
      // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
      // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
      res.render('todos', {
        title: 'TODO 列表',
        todos: []
      });
    } else {
      next(err);
    }
  }).catch(next);
});

router.post('/key', function(req, res, next) {
  var project_id = req.body.project;
  var headers = {
    'Authorization': 'Bearer 3dda56fbadbdb3e44d8038d0296517c7199b57a9'
  }
  var options = {
    url: 'https://beta.todoist.com/API/v8/tasks?project_id=' + project_id,
    method: 'GET',
    headers: headers,
    json: true
  }
  
  request(options, function (error, response, body) {
    for (const onetask of body) {
        var task = new Task();
        task.set('project_id', onetask.project_id);
        task.set('content', onetask.content);
        task.set('completed', onetask.completed);
        task.set('priority', onetask.priority);
        task.set('url', onetask.url);
        task.save().then(function(task) {
        }).catch(next);
    }
    res.redirect('/todos')
  });
});
// 新增 Todo 项目
router.post('/', function(req, res, next) {
  token = req.body.content;
  var headers = {
    'Authorization': 'Bearer ' + token
  }
  var options = {
    url: 'https://beta.todoist.com/API/v8/projects',
    method: 'GET',
    headers: headers,
    json: true
  }

  request(options, function (error, response, body) {
    for (const project of body) {
        var todo = new Todo();
        todo.set('content', project.name);
        todo.set('key', project.id);
        todo.save().then(function(todo) {
        }).catch(next);
    }

    res.redirect('/todos')
  });

});

module.exports = router;
