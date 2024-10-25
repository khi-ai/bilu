export const embed = `
(function() {
  const bilu = {
    init: function(config) {
      const commentDiv = document.getElementById('bilu-comment-section');
      if (!commentDiv) {
        console.error("Div with id 'bilu-comment-section' not found!");
        return;
      }

      const loaderHtml = \`
        <div class="loader-spinner flex justify-center items-center">
          <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      \`;

      const showLoader = function() {
        commentDiv.querySelector('.comments-list').innerHTML = loaderHtml;
      };

      const hideLoader = function() {
        const loader = commentDiv.querySelector('.loader-spinner');
        if (loader) loader.remove();
      };

      const loadComments = function() {
        showLoader();
        const timestamp = new Date().getTime();
        
        fetch(config.api + "/comments?url=" + encodeURIComponent(config.url) + "&t=" + timestamp)
          .then(response => response.json())
          .then(data => {
            hideLoader();
            const commentsHtml = data.map(comment => 
              \`<div class="p-2 border-b font-inconsolata text-sm">
                 <p id=\${comment.id}><strong class="text-gray-800">\${comment.user}</strong></p>
                 <p class="text-sm text-gray-600">\${comment.comment}</p>
                 <span class="text-xs text-gray-500">\${new Date(comment.timestamp).toLocaleString()}</span>
               </div>\`
            ).join('');
            commentDiv.querySelector('.comments-list').innerHTML = commentsHtml;
          });
      };

      const showToast = function(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white rounded-lg py-2 px-4 shadow-lg transition-opacity duration-300 opacity-100 text-sm font-inconsolata';
        toast.innerText = message;
        document.body.appendChild(toast);
  
        setTimeout(() => {
          toast.classList.remove('opacity-100');
          toast.classList.add('opacity-0');
          toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
      };

      if (!commentDiv.querySelector('form')) {
        const formContainer = document.createElement('div');
        formContainer.classList.add('flex', 'mx-auto', 'items-center', 'justify-center', 'shadow-lg', 'mt-20', 'mx-8', 'mb-4', 'max-w-lg');
        
        const form = document.createElement('form');
        form.classList.add('w-full', 'max-w-md', 'rounded-lg', 'px-2', 'pt-2');
        
        form.innerHTML = \`
          <div class="flex flex-wrap -mx-2 mb-4 font-inconsolata">
            <h2 class="px-2 pt-2 pb-1 text-gray-800 text-sm">Add a new comment</h2>
            <div class="w-full md:w-full px-2 mb-2 mt-2">
              <input type="text" class="h-7 text-sm bg-transparent rounded border border-gray-400 leading-normal w-full py-1 px-2 font-medium placeholder-gray-700 focus:outline-none" id="name" placeholder="Your Name" required />
            </div>
            <div class="w-full md:w-full px-2 mb-2 mt-2">
              <textarea class="bg-transparent text-sm rounded border border-gray-400 leading-normal resize-none w-full h-16 py-1 px-2 font-medium placeholder-gray-700 focus:outline-none" name="body" id="content" placeholder="Type Your Comment" required></textarea>
            </div>
            <div class="w-full md:w-full flex items-start md:w-full px-2">
              <div class="flex items-start w-1/2 text-gray-700 px-2 mr-auto">
                <svg fill="none" class="w-4 h-4 text-gray-600 mr-1" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="-mr-1">
                <input type='submit' class="bg-transparent cursor-pointer text-gray-700 font-medium py-1 px-3 border border-gray-400 rounded-lg tracking-wide mr-1 hover:bg-gray-100 text-xs" value='Post Comment'>
              </div>
            </div>
          </div>
          <div class="comments-list"></div>
        \`;

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const name = form.querySelector('#name').value;
          const content = form.querySelector('#content').value;

          fetch(config.api + "/comments?url=" + encodeURIComponent(config.url), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: name, comment: content })
          }).then(() => {
            showToast('Your comment is under review and will be displayed shortly.');
            loadComments();
          });
        });

        formContainer.appendChild(form);
        commentDiv.appendChild(formContainer);
      }

      loadComments();
    }
  };

  window.bilu = bilu;
})();
`;

export const demo = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comment System Demo</title>
  <link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap" rel="stylesheet">
  <style>
    .font-inconsolata {
      font-family: 'Inconsolata', monospace;
    }
  </style>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <h1 class="text-xl font-inconsolata text-center mt-6">Bilu Comment System</h1>
  <div id="bilu-comment-section" class="max-w-md mx-auto mt-8"></div>

  <script src="/embed.js"></script>
  <script>
    bilu.init({
      api: location.origin,
      url: location.origin + '/demo'
    });
  </script>
</body>
</html>
`;
