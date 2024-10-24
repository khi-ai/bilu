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
              \`<p id=\${comment.id}><strong>\${comment.user}</strong>: \${comment.comment} (\${new Date(comment.timestamp).toLocaleString()})</p>\`
            ).join('');
            commentDiv.querySelector('.comments-list').innerHTML = commentsHtml;
          });
      };

      // Kiểm tra xem có form chưa, nếu chưa thì tạo form mới
      if (!commentDiv.querySelector('form')) {
        const form = document.createElement('form');
        form.innerHTML = \`
          <input type="text" id="name" placeholder="Your Name" required />
          <textarea id="content" placeholder="Your Comment" required></textarea>
          <button type="submit">Submit</button>
          <div class="comments-list"></div>
        \`;

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const name = form.querySelector('#name').value;
          const content = form.querySelector('#content').value;

          // Gửi comment mới tới API
          fetch(config.api + "/comments?url=" + encodeURIComponent(config.url), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: name, comment: content })
          }).then(() => {
            loadComments(); // Reload comments sau khi submit mà không xóa form
          });
        });

        commentDiv.appendChild(form);
      }

      // Nạp danh sách comment khi trang được load
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
</head>
<body>
  <h1>Demo Comment System</h1>
  <div id="bilu-comment-section"></div>

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
