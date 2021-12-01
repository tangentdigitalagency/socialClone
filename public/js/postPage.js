

$(document).ready(() => {

    // @ts-ignore
    $.get("/api/posts/" + postId, results => {
        
       outputPostsWithReplies(results, $('.postsContainer'));
    })
})
