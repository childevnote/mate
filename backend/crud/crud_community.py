# backend/crud/crud_community.py

from sqlalchemy.orm import Session, joinedload
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
        # 게시글 작성자와 그 작성자의 대학교 정보까지 한 번에 JOIN
        joinedload(Post.author).joinedload(User.university),
    ]

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
    return db_post

# ---------------------------------------------------------
# 게시글 삭제
# ---------------------------------------------------------
def delete_post(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    
    if not post:
        return "not_found"
    
    if post.author_id != user_id:
        return "not_authorized"
    
    db.delete(post)
    db.commit()
    return "success"

def get_best_posts(db: Session, skip: int = 0, limit: int = 5):
    # 지난 7일간의 게시글만 조회
    candidates = db.query(Post)\
        .options(*get_post_options())\
        .filter(Post.created_at >= func.now() - timedelta(days=7))\
        .all()

    # 파이썬 레벨에서 점수 계산 (데이터가 많아지면 DB 쿼리로 옮겨야 함)
    def calculate_score(post):
        return post.view_count + (post.like_count * 3) + (post.comment_count * 5)

    sorted_posts = sorted(candidates, key=calculate_score, reverse=True)
    final_posts = sorted_posts[skip : skip + limit]
    
    for post in final_posts:
        post.is_liked = False
        post.is_scrapped = False

    return final_posts

def get_posts(db: Session, skip: int = 0, limit: int = 10, category: str = None, user_id: int | None = None):
    query = db.query(Post).options(*get_post_options())
    
    if category and category != "ALL":
        query = query.filter(Post.category == category)
        
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    
    for post in posts:
        post.is_liked = False
        post.is_scrapped = False
            
    return posts

def increase_view_count(db: Session, post_id: int):
    # 별도 트랜잭션으로 처리
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        post.view_count += 1
        db.commit()

# 게시글 상세 조회
def get_post(db: Session, post_id: int, user_id: int | None = None):
    # 1. 게시글과 작성자 정보를 한 번에 가져옴
    post = db.query(Post).options(*get_post_options()).filter(Post.id == post_id).first()
    
    if not post:
        return None

    # 3. 좋아요/스크랩 여부 확인
    if user_id:
        like_record = db.query(PostLike).filter(
            PostLike.post_id == post_id, 
            PostLike.user_id == user_id
        ).first()
        
        scrap_record = db.query(PostScrap).filter(
            PostScrap.post_id == post_id, 
            PostScrap.user_id == user_id
        ).first()
        
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
    return db_comment

# ---------------------------------------------------------
# 댓글 삭제
# ---------------------------------------------------------
def delete_comment(db: Session, comment_id: int, user_id: int):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        return "not_found"
        
    if comment.author_id != user_id:
        return "not_authorized"
        
    if comment.replies:
        comment.is_deleted = True
        comment.content = "삭제된 댓글입니다." 
        db.commit()
        return "success"
    else:
        if comment.post:
             comment.post.comment_count = max(0, comment.post.comment_count - 1)
             
        db.delete(comment)
        db.commit()
        return "success"

# ---------------------------------------------------------
# 댓글 목록 조회 
# ---------------------------------------------------------
def get_comments_by_post(db: Session, post_id: int, skip: int = 0, limit: int = 50):
    return db.query(Comment)\
        .options(
            # 댓글 작성자의 '대학교' 정보까지 미리 로딩 (N+1 문제 해결)
            joinedload(Comment.author).joinedload(User.university)
        )\
        .filter(Comment.post_id == post_id)\
        .order_by(Comment.created_at.asc())\
        .offset(skip).limit(limit).all()

# ---------------------------------------------------------
# 내가 쓴 댓글 조회
# ---------------------------------------------------------
def get_comments_by_author(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    comments = db.query(Comment)\
        .options(joinedload(Comment.post)) \
        .filter(Comment.author_id == user_id)\
        .order_by(Comment.created_at.desc())\
        .offset(skip).limit(limit).all()
        
    for comment in comments:
        if comment.post:
            comment.post_title = comment.post.title
        else:
            comment.post_title = "삭제된 게시글입니다."
            
    return comments

# ---------------------------------------------------------
# 좋아요 토글
# ---------------------------------------------------------
def toggle_like(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None

    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id, 
        PostLike.user_id == user_id
    ).first()
    
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

# ---------------------------------------------------------
# 스크랩 토글
# ---------------------------------------------------------
def toggle_scrap(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
        
    existing_scrap = db.query(PostScrap).filter(
        PostScrap.post_id == post_id,
        PostScrap.user_id == user_id
    ).first()
    
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
    return db.query(Post)\
        .options(*get_post_options())\
        .filter(Post.author_id == user_id)\
        .order_by(Post.created_at.desc())\
        .offset(skip).limit(limit).all()

# ---------------------------------------------------------
# 내가 스크랩한 글 조회
# ---------------------------------------------------------
def get_my_scraps(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    return db.query(Post)\
        .join(PostScrap, Post.id == PostScrap.post_id)\
        .options(*get_post_options())\
        .filter(PostScrap.user_id == user_id)\
        .order_by(PostScrap.user_id.desc()) \
        .offset(skip).limit(limit).all()