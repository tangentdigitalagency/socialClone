const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const User = require('../../schemas/userSchema');
const Post = require('../../schemas/postSchema');

app.use(bodyParser.urlencoded({ extended: false }));

// @ts-ignore
router.get("/", async (req, res, next) => {

    var results = await getPosts({});
    res.status(200).send(results)

})


router.get("/:id", async (req, res, next) => {

    var postId = req.params.id;
    var postData = await getPosts({ _id: postId });

    postData = postData[0];

    var results = {
        postData: postData
    }

    if (postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo;
    }

    results.replies = await getPosts({ replyTo: postId })
    res.status(200).send(results)

})


// @ts-ignore
router.post("/", async (req, res, next) => {


    if (!req.body.content) {
        console.log("Content param not sent with request");
        return res.sendStatus(400);
    }

    var postData = {
        content: req.body.content,
        // @ts-ignore
        postedBy: req.session.user
    }

    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }

    Post.create(postData)
        .then(async newPost => {
            newPost = await User.populate(newPost, { path: "postedBy" })

            res.status(201).send(newPost);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
})

// @ts-ignore
router.put('/:id/like', async (req, res, next) => {

    // console.log(req.params.id)
    var postId = req.params.id;
    // @ts-ignore
    var userId = req.session.user._id;

    // @ts-ignore
    var isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    var option = isLiked ? '$pull' : '$addToSet';

    // console.log('is liked: ' + isLiked);

    // Insert User Like
    // @ts-ignore
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })

    // Insert Post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })

    res.status(200).send(post)
})

router.post('/:id/repost', async (req, res, next) => {

    // console.log(req.params.id)
    var postId = req.params.id;
    // @ts-ignore
    var userId = req.session.user._id;

    // @ts-ignore
    var deletedPost = await Post.findOneAndDelete({ postedBy: userId, repostData: postId })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })

    var option = deletedPost ? '$pull' : '$addToSet';

    var repost = deletedPost;

    if (repost == null) {
        repost = await Post.create({ postedBy: userId, repostData: postId })
            .catch(err => {
                console.log(err)
                res.sendStatus(400)
            })
    }
    // @ts-ignore
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { repost: repost._id } }, { new: true })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })

    // Insert Post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { repostUsers: userId } }, { new: true })
        .catch(err => {
            console.log(err)
            res.sendStatus(400)
        })

    res.status(200).send(post)
})

async function getPosts(filter) {

    var results = await Post.find(filter)
        .populate('postedBy')
        .populate('repostData')
        .populate('replyTo')
        .sort({ 'createdAt': -1 })

        .catch(err => console.log(err))

    results = await User.populate(results, { path: 'replyTo.postedBy' });

    return await User.populate(results, { path: 'repostData.postedBy' });
}

module.exports = router;