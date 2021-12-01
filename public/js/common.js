$("#postTextArea, #replyTextArea").keyup(event => {
    var textbox = $(event.target);
    var value = textbox.val().trim();

    var isModal = textbox.parents('.modal').length == 1;
    
    var submitButton = isModal ? $('#submitReplyButton') : $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

$("#submitPostButton, #submitReplyButton").click(() => {
    var button = $(event.target);

    var isModal = button.parents('.modal').length == 1;

    var textbox = isModal ? $('#replyTextArea') : $("#postTextArea");

    

    var data = {
        content: textbox.val()
    }

    if(isModal) {

        var id = button.data().id;

        if(id == null) return alert('Button id is null');

        data.replyTo = id;

    }

    $.post("/api/posts", data, postData => {

        if(postData.replyTo){
            location.reload();
        }
        else {
            var html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            textbox.val("");
            button.prop("disabled", true);
        }
    })
})

// Fire even for modal being opened

$('#replyModal').on('show.bs.modal', (event) => {

    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);

    $('#submitReplyButton').data('id', postId)

    $.get("/api/posts/" +  postId, results => {
        
        outputPosts(results.postData, $('#originalPostContainer'))
     })


})

$('#replyModal').on('hidden.bs.modal', (event) => {

    $('#originalPostContainer').html('');

})


$('#deletePostModal').on('show.bs.modal', (event) => {

    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);

    $('#submitReplyButton').data('id', postId)

    $.get("/api/posts/" +  postId, results => {
        
        outputPosts(results.postData, $('#originalPostContainer'))
     })


})




$(document).on("click", '.likeButton', (event) => {

    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if(postId === undefined) {
        return;
    }

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: 'PUT',
        success: (postData) => {
            button.find('span').text(postData.likes.length || '');

            if(postData.likes.includes(userLoggedIn._id)){
                button.addClass('active');
            }
            else {
                button.removeClass('active');
            }
        }
    })
})


$(document).on("click", '.repostButton', (event) => {

    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if(postId === undefined) {
        return;
    }

    $.ajax({
        url: `/api/posts/${postId}/repost`,
        type: 'POST',
        success: (postData) => {
            button.find('span').text(postData.repostUsers.length || '');

            if(postData.repostUsers.includes(userLoggedIn._id)){
                button.addClass('active');
            }
            else {
                button.removeClass('active');
            }
        }
    })
})

$(document).on("click", '.post', (event) => {

    var element = $(event.target);
    var postId = getPostIdFromElement(element);

    if(postId !== undefined && !element.is('button')){
        window.location.href = '/posts/' + postId;
    }

   
})

function getPostIdFromElement(element){

    var isRoot = element.hasClass('post')
    var rootElement = isRoot ? element : element.closest('.post')
    var postId = rootElement.data().id;

    if(postId === undefined) return alert('Post Id is undefined');

    return postId;
}

function createPostHtml(postData, largeFont = false) {

    if(postData == null){
        return alert('postData object is null')
    }
    
    var buttons = "";
    if(postData.postedBy._id === userLoggedIn._id){
        buttons = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-trash" /></button>`;

    }



    var isRepost = postData.repostData !== undefined;
    var repostedBy = isRepost ? postData.postedBy.username : null;

    postData = isRepost ? postData.repostData : postData;

    var postedBy = postData.postedBy;

    if(postedBy._id === undefined){
        return alert('user object not populated')
    }

    var displayName = postedBy.firstName + ' ' + postedBy.lastName;
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? 'active' : ''
    var repostButtonActiveClass = postData.repostUsers.includes(userLoggedIn._id) ? 'active' : '';
    var largeFontClass = largeFont ? 'largeFont' : '';

    var repostText = '';

    if(isRepost){
        repostText = `<span>
        <i class='fas fa-retweet'></i>

        Reposted By: <a href='/profile/${repostedBy}'>@${repostedBy}</a>
        </span>`
    }

    var replyFlag = '';
    
    if(postData.replyTo && postData.replyTo._id){

        if(!postData.replyTo._id){
            return alert('Reply to is not populated')
        }
        else if(!postData.replyTo.postedBy._id){
            return alert('Posted By is not populated');
        }

        var replyToUsername = postData.replyTo.postedBy.username;
        console.log(postData.username)

        replyFlag = `<div class='replyFlag'>
            Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
        </div>`
    }


    return `
    <div class='post ${largeFontClass}' data-id='${postData._id}'>
        <div class='postActionContainer' >
            ${repostText}
        </div>
        <div class='mainContentContainer'>
            <div class='userImageContainer'>
                <img src='${postedBy.profilePic}'>
            </div>

            <div class='postContentContainer'>
                <div class='header'>
                    <a class='displayName' href='/profile/${postedBy.username}'>${displayName}</a>
                    <span class='username'>@${postedBy.username}</span>
                    <span class='date'>${timestamp}</span>
                    <span>89${buttons}</span>
                    
                </div>
                ${replyFlag}
                <div class='postBody'>
                    <span>${postData.content}</span>
                </div>
                <div class='postFooter'>
                    <div class='postButtonContainer'>
                        <button data-toggle='modal' data-target='#replyModal'>
                            <i class='far fa-comment'></i>
                        </button>
                    </div>
                    <div class='postButtonContainer repostPost'>
                        <button class='repostButton  ${repostButtonActiveClass}'>
                            <i class='fas fa-retweet'></i>
                            <span>${postData.repostUsers.length || '' }</span>
                        </button>
                    </div>
                    <div class='postButtonContainer likedPost'>
                        <button class='likeButton ${likeButtonActiveClass}'>
                            <i class='far fa-heart'></i>
                            <span>${postData.likes.length || '' }</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
}

// Time stamp scr

function timeDifference(current, previous){

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {

        if(elapsed/1000 < 30) return 'Just Now';

        return Math.round(elapsed/1000) + ' seconds ago'
   }

   else if (elapsed < msPerHour) {
        return Math.round(elapsed/msPerMinute) + ' minutes ago';   
   }

   else if (elapsed < msPerDay ) {
        return Math.round(elapsed/msPerHour ) + ' hours ago';   
   }

   else if (elapsed < msPerMonth) {
       return Math.round(elapsed/msPerDay) + ' days ago';   
   }

   else if (elapsed < msPerYear) {
       return Math.round(elapsed/msPerMonth) + ' months ago';   
   }

   else {
       return Math.round(elapsed/msPerYear ) + ' years ago';   
   }
}


function outputPosts(results, container){

    container.html('');

    if(!Array.isArray(results)){
        results = [results]
    }

    results.forEach((result) =>{
        var html = createPostHtml(result)
        container.append(html)
    })

    if(results.length == 0){
        container.append('<span class="noResults">Follow someone to get started!</span>')
    }

}

function outputPostsWithReplies(results, container) {

    container.html('');

    if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
        var html = createPostHtml(results.replyTo)
        container.append(html)
    }

    var mainPostHtml = createPostHtml(results.postData, true)
    container.append(mainPostHtml)

    results.replies.forEach((result) =>{
        var html = createPostHtml(result)
        container.append(html)
    })
}
