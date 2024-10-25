export const embed = `
(function() {
  const bilu = {
    init: function(config) {
      const commentDiv = document.getElementById('bilu-comment-section');
      if (!commentDiv) {
        console.error("Div with id 'bilu-comment-section' not found!");
        return;
      }

      const loadComments = function() {
        fetch(config.api + "/comments?url=" + encodeURIComponent(config.url))
          .then(response => response.json())
          .then(data => {
            const commentsHtml = data.map(comment => 
              \`<div class="p-2 border-b">
                 <p id=\${comment.id}><strong class="text-gray-800">\${comment.user}</strong></p>
                 <p class="text-sm text-gray-600">\${comment.comment}</p>
                 <span class="text-xs text-gray-500">\${new Date(comment.timestamp).toLocaleString()}</span>
               </div>\`
            ).join('');
            commentDiv.querySelector('.comments-list').innerHTML = commentsHtml;
          });
      };

      // Check if form exists, if not, create a new one
      if (!commentDiv.querySelector('form')) {
        const formContainer = document.createElement('div');
        formContainer.classList.add('flex', 'mx-auto', 'items-center', 'justify-center', 'shadow-lg', 'mt-56', 'mx-8', 'mb-4', 'max-w-lg');
        
        const form = document.createElement('form');
        form.classList.add('w-full', 'max-w-xl', 'bg-white', 'rounded-lg', 'px-4', 'pt-2');
        
        form.innerHTML = \`
          <div class="flex flex-wrap -mx-3 mb-6">
            <h2 class="px-4 pt-3 pb-2 text-gray-800 text-lg">Add a new comment</h2>
            <div class="w-full md:w-full px-3 mb-2 mt-2">
              <input type="text" class="bg-gray-100 rounded border border-gray-400 leading-normal w-full py-2 px-3 font-medium placeholder-gray-700 focus:outline-none focus:bg-white" id="name" placeholder="Your Name" required />
            </div>
            <div class="w-full md:w-full px-3 mb-2 mt-2">
              <textarea class="bg-gray-100 rounded border border-gray-400 leading-normal resize-none w-full h-20 py-2 px-3 font-medium placeholder-gray-700 focus:outline-none focus:bg-white" name="body" id="content" placeholder="Type Your Comment" required></textarea>
            </div>
            <div class="w-full md:w-full flex items-start md:w-full px-3">
              <div class="flex items-start w-1/2 text-gray-700 px-2 mr-auto">
                <svg fill="none" class="w-5 h-5 text-gray-600 mr-1" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-xs md:text-sm pt-px">Some HTML is okay.</p>
              </div>
              <div class="-mr-1">
                <input type='submit' class="bg-white text-gray-700 font-medium py-1 px-4 border border-gray-400 rounded-lg tracking-wide mr-1 hover:bg-gray-100" value='Post Comment'>
              </div>
            </div>
          </div>
          <div class="comments-list"></div>
        \`;

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const name = form.querySelector('#name').value;
          const content = form.querySelector('#content').value;

          // Send new comment to API
          fetch(config.api + "/comments?url=" + encodeURIComponent(config.url), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: name, comment: content })
          }).then(() => {
            loadComments(); // Reload comments after submitting without clearing form
          });
        });

        formContainer.appendChild(form);
        commentDiv.appendChild(formContainer);
      }

      // Load comments on page load
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
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 p-4">
  <div id="bilu-comment-section" class=""></div>
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
