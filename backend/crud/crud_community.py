from sqlalchemy.orm import Session, joinedload, subqueryload
from sqlalchemy import func, desc, or_
from datetime import timedelta
from models.community import Post, Comment, PostLike, PostScrap
from models.user import User
from schemas.community import PostCreate, CommentCreate

# ---------------------------------------------------------
# 공통 옵션
# ---------------------------------------------------------
def get_post_options():
    return [
        joinedload(Post.author).joinedload(User.university),
    ]

def map_post_info(post):
    if post.author:
        post.author_university = post.author.university.name if post.author.university else None
        post.author_nickname = post.author.nickname or post.author.email.split("@")[0]
    else:
        post.author_university = None
        post.author_nickname = "알수없음"
    return post

def map_comment_info(comment):
    if comment.author:
        comment.author_university = comment.author.university.name if comment.author.university else None
        comment.author_nickname = comment.author.nickname or comment.author.email.split("@")[0]
    else:
        comment.author_university = None
        comment.author_nickname = "알수없음"

    comment.reply_count = len(comment.replies)
    
    return comment

# ---------------------------------------------------------
# 게시글 작성
# ---------------------------------------------------------
def create_post(db: Session, post: PostCreate, user_id: int):
    db_post = Post(
        title=post.title,
        content=post.content,
        category=post.category,
        image=post.image,    
        author_id=user_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return map_post_info(db_post) # 매핑 후 반환

# ---------------------------------------------------------
# 게시글 삭제 (기존 동일)
# ---------------------------------------------------------
def delete_post(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: return "not_found"
    if post.author_id != user_id: return "not_authorized"
    db.delete(post)
    db.commit()
    return "success"

# ---------------------------------------------------------
# 인기글 조회
# ---------------------------------------------------------
def get_best_posts(db: Session, skip: int = 0, limit: int = 5):
    candidates = db.query(Post)\
        .options(*get_post_options())\
        .filter(Post.created_at >= func.now() - timedelta(days=7))\
        .all()

    def calculate_score(post):
        return post.view_count + (post.like_count * 3) + (post.comment_count * 5)

    sorted_posts = sorted(candidates, key=calculate_score, reverse=True)
    final_posts = sorted_posts[skip : skip + limit]
    
    for post in final_posts:
        post.is_liked = False
        post.is_scrapped = False
        map_post_info(post) # 🔥 매핑 적용

    return final_posts

# ---------------------------------------------------------
# 게시글 목록 조회
# ---------------------------------------------------------
def get_posts(
    db: Session, 
    skip: int = 0, 
    limit: int = 10, 
    category: str = None, 
    search: str = None,
):
    query = db.query(Post).options(*get_post_options())
    query = query.outerjoin(Comment, Post.id == Comment.post_id)
    
    if category and category != "ALL":
        query = query.filter(Post.category == category)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Post.title.ilike(search_pattern),
                Post.content.ilike(search_pattern),
                Comment.content.ilike(search_pattern)
            )
        )
        
    query = query.distinct()
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    
    for post in posts:
        post.is_liked = False
        post.is_scrapped = False
        map_post_info(post) # 🔥 매핑 적용
            
    return posts

# ---------------------------------------------------------
# 조회수 증가 (기존 동일)
# ---------------------------------------------------------
def increase_view_count(db: Session, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        post.view_count += 1
        db.commit()

# ---------------------------------------------------------
# 게시글 상세 조회
# ---------------------------------------------------------
def get_post(db: Session, post_id: int, user_id: int | None = None):
    post = db.query(Post).options(*get_post_options()).filter(Post.id == post_id).first()
    
    if not post:
        return None

    map_post_info(post) # 🔥 매핑 적용

    if user_id:
        like_record = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == user_id).first()
        scrap_record = db.query(PostScrap).filter(PostScrap.post_id == post_id, PostScrap.user_id == user_id).first()
        post.is_liked = True if like_record else False
        post.is_scrapped = True if scrap_record else False
    else:
        post.is_liked = False
        post.is_scrapped = False
    
    return post

# ---------------------------------------------------------
# 댓글 작성
# ---------------------------------------------------------
def create_comment(db: Session, comment: CommentCreate, user_id: int):
    db_comment = Comment(
        content=comment.content,
        post_id=comment.post_id,
        parent_id=comment.parent_id, 
        author_id=user_id
    )
    db.add(db_comment)

    post = db.query(Post).filter(Post.id == comment.post_id).first()
    if post:
        post.comment_count += 1
        
    db.commit()
    db.refresh(db_comment)
    
    # 🔥 작성 직후 응답을 위해 매핑
    # (refresh를 했지만 author 관계가 즉시 로딩되지 않을 수 있으므로 조회 후 매핑이 안전)
    map_comment_info(db_comment)
        
    return db_comment

# ---------------------------------------------------------
# 댓글 삭제 (기존 동일)
# ---------------------------------------------------------
def delete_comment(db: Session, comment_id: int, user_id: int):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment: return "not_found"
    if comment.author_id != user_id: return "not_authorized"
    
    if comment.replies:
        comment.is_deleted = True
        comment.content = "삭제된 댓글입니다." 
        db.commit()
    else:
        if comment.post: comment.post.comment_count = max(0, comment.post.comment_count - 1)
        db.delete(comment)
        db.commit()
    return "success"

# ---------------------------------------------------------
# 댓글 목록 조회 
# ---------------------------------------------------------
def get_comments_by_post(db: Session, post_id: int, skip: int = 0, limit: int = 50):
    comments = db.query(Comment)\
        .options(
            joinedload(Comment.author).joinedload(User.university),
            subqueryload(Comment.parent).subqueryload(Comment.replies) 
        )\
        .filter(Comment.post_id == post_id)\
        .order_by(Comment.created_at.asc())\
        .offset(skip).limit(limit).all()
        
    for comment in comments:
        map_comment_info(comment)
            
    return comments

# ---------------------------------------------------------
# 내가 쓴 댓글 조회
# ---------------------------------------------------------
def get_comments_by_author(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    comments = db.query(Comment)\
        .options(
            joinedload(Comment.post),
            subqueryload(Comment.replies) 
        ) \
        .filter(Comment.author_id == user_id)\
        .order_by(Comment.created_at.desc())\
        .offset(skip).limit(limit).all()
        
    for comment in comments:
        if comment.post:
            comment.post_title = comment.post.title
        else:
            comment.post_title = "삭제된 게시글입니다."
        
        map_comment_info(comment)
            
    return comments

# ---------------------------------------------------------
# 좋아요/스크랩 토글 (기존 동일)
# ---------------------------------------------------------
def toggle_like(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: return None
    existing_like = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == user_id).first()
    if existing_like:
        db.delete(existing_like)
        post.like_count -= 1
        action = "unliked"
    else:
        new_like = PostLike(post_id=post_id, user_id=user_id)
        db.add(new_like)
        post.like_count += 1
        action = "liked"
    db.commit()
    return {"action": action, "count": post.like_count}

def toggle_scrap(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post: return None
    existing_scrap = db.query(PostScrap).filter(PostScrap.post_id == post_id, PostScrap.user_id == user_id).first()
    if existing_scrap:
        db.delete(existing_scrap)
        post.scrap_count -= 1
        action = "unscrapped"
    else:
        new_scrap = PostScrap(post_id=post_id, user_id=user_id)
        db.add(new_scrap)
        post.scrap_count += 1
        action = "scrapped"
    db.commit()
    return {"action": action, "count": post.scrap_count}

# ---------------------------------------------------------
# 내가 쓴 글 조회
# ---------------------------------------------------------
def get_my_posts(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    posts = db.query(Post).options(*get_post_options()).filter(Post.author_id == user_id).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    for post in posts: map_post_info(post)
    return posts

# ---------------------------------------------------------
# 내가 스크랩한 글 조회
# ---------------------------------------------------------
def get_my_scraps(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    posts = db.query(Post).join(PostScrap, Post.id == PostScrap.post_id).options(*get_post_options()).filter(PostScrap.user_id == user_id).order_by(PostScrap.user_id.desc()).offset(skip).limit(limit).all()
    for post in posts: map_post_info(post)
    return posts