const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (isAuth) {
    const userId = req.user.id;
    knex("tasks")
      .select("*")
      .where({user_id: userId})
      .then(function (results) {
        // 日付ごとにタスクをまとめる
        const calendarTasks = {};
        results.forEach(task => {
          const date = task.due_date ? task.due_date.toISOString().slice(0, 10) : '未設定';
          if (!calendarTasks[date]) calendarTasks[date] = [];
          calendarTasks[date].push(task);
        });
        res.render('index', {
          title: 'ToDo App',
          todos: results,
          calendarTasks: calendarTasks, // 追加
          isAuth: isAuth,
        });
      })
      .catch(function (err) {
        console.error(err);
        res.render('index', {
          title: 'ToDo App',
          isAuth: isAuth,
          errorMessage: [err.sqlMessage],
        });
      });
  } else {
    res.render('index', {
      title: 'ToDo App',
      isAuth: isAuth,
    });
  }
});

router.post('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const userId = req.user.id;
  const todo = req.body.add;
  const dueDate = req.body.due_date; // 追加
  knex("tasks")
    .insert({user_id: userId, content: todo, due_date: dueDate}) // 追加
    .then(function () {
      res.redirect('/')
    })
    .catch(function (err) {
      console.error(err);
      res.render('index', {
        title: 'ToDo App',
        isAuth: isAuth,
        errorMessage: [err.sqlMessage],
      });
    });
});

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));

module.exports = router;