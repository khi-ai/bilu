#!/bin/bash

# Địa chỉ của API
API_URL="http://localhost:52993/comments" # Thay đổi cổng nếu cần

# Giá trị mặc định
DEFAULT_URL="https://example.com/bai-viet-1"
DEFAULT_USER="user1"
DEFAULT_COMMENT="This is a test comment"

# Hàm gửi yêu cầu GET để lấy tất cả comment
get_all_comments() {
  echo "Fetching all comments..."
  http GET "$API_URL"
}

# Hàm gửi yêu cầu GET để lấy comment theo URL
get_comments_by_url() {
  echo "Fetching comments for URL: $DEFAULT_URL"
  http GET "$API_URL?url=$DEFAULT_URL"
}

# Hàm gửi yêu cầu POST để thêm comment
add_comment() {
  echo "Adding comment..."
  http POST "$API_URL?url=$DEFAULT_URL" user="$DEFAULT_USER" comment="$DEFAULT_COMMENT"
}

# Chạy các hàm mock
echo "=== Mock Comments API ==="
get_all_comments
# get_comments_by_url
# add_comment
# get_all_comments
