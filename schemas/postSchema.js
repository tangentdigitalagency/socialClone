
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({

    content: {
        type: String,
        trim: true
    },
    
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    pineed: Boolean,
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    repostUsers:  [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    repostData:  {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },

    replyTo:  {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
 
}, { timestamps: true });

var Post = mongoose.model('Post', PostSchema);

module.exports = Post;


