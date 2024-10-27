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
        <div role="status" class="flex justify-center p-6">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-100 animate-spin dark:text-gray-400 fill-emerald-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Loading...</span>
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
  <style>.font-inconsolata {font-family: 'Inconsolata', monospace;}</style>
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
