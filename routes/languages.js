const express = require("express"),
	    router = express.Router(),
	    knex = require('../db/knex');
	    //knex

router.route('/')
	.get(function(req, res)
	{})
	.post(function(req, res)
	{
		knex('languages')
		.insert(req.body.language)
		.then(()=>{
			res.redirect('/users/'+req.body.language.user_id);
	 })
		.catch(err=>{
			//WRITE TESTS FOR INVALID INPUT
		});
	});

// router.route('/new')
// 	.get(function(req,res)
// 	{});

// router.route('/:id/edit')
// 	.get(function(req, res)
// 	{});

router.route('/:id')
	// .get(function(req, res)
	// {})
	// .put(function(req, res)
	// {})
	.delete(function(req,res)
	{
		knex('languages')
		.where('id', req.params.id)
		.delete()
		.returning('*')
		.then(deleted =>
		{
			eval(require('locus'))
			res.redirect("/users/"+deleted[0].user_id);
		});
	});

module.exports = router;